const prisma = require("../infrastructure/prisma");

function getPrismaClientInstance() {
    return prisma;
}

async function getProducts(query, getDisabled = false, getDeleted = false, client = prisma) {
    const { name, categories, min_price, max_price, page, limit } = query;
    const where = {
        AND: [
            name ? { name: { contains: name } } : {},
            categories && categories.length > 0
                ? {
                    ProductCategories: {
                        some: {
                            Category: {
                                category_code: { in: categories },
                            }
                        }
                    }
                }
                : {},
            min_price ? { ProductVariant: { some: { raw_price: { gte: min_price } } } } : {},
            max_price ? { ProductVariant: { some: { raw_price: { lte: max_price } } } } : {},
            !getDisabled ? { is_disabled: false } : {},
            !getDeleted ? { deleted_at: null } : {}
        ]
    };

    const count = await client.product.count({ where });
    const products = await client.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
            product_id: true,
            name: true,
            description: true,
            image_urls: true,
            ProductCategories: { select: { Category: {} } },
            ProductVariant: { select: { raw_price: true } }
        }
    });
    return { total_items: count, products };
}

async function getProductById(productId, getDisabled = false, getDeleted = false, client = prisma) {
    const product = await client.product.findFirst({
        where: {
            AND: [
                { product_id: productId },
                !getDisabled ? { is_disabled: false } : {},
                !getDeleted ? { deleted_at: null } : {}
            ]
        },
        include: {
            ProductCategories: {
                include: {
                    Category: true
                }
            },
            ProductOption: { include: { ProductOptionValue: true } },
            ProductVariant: {
                where: !getDisabled ? { is_disabled: false } : {},
                include: { ProductVariantOption: { include: { ProductOptionValue: true } } }
            }
        }
    });
    return product;
}

async function getProductVariantById(client, product_variant_id) {
    const productVariant = await client.productVariant.findUnique({
        where: { product_variant_id },
        include: {
            Product: {
                select: {
                    product_id: true,
                    name: true,
                    description: true,
                    image_urls: true,
                    is_disabled: true,
                },
            },
            ProductVariantOption: {
                include: {
                    ProductOptionValue: {
                        select: {
                            option_value_id: true,
                            value: true,
                            ProductOption: {
                                select: {
                                    product_option_id: true,
                                    option_name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    return productVariant;
}

async function getProductOptionById(client, product_option_id) {
    return await client.productOption.findUnique({
        where: { product_option_id },
        include: {
            ProductOptionValue: {
                select: {
                    option_value_id: true,
                    value: true
                }
            }
        }
    });
}

async function getProductOptions(client, product_id) {
    const product = await client.product.findUnique({
        where: { product_id },
        include: { ProductOption: { include: { ProductOptionValue: true } } }
    });

    return product?.ProductOption;
}

// Need transaction
async function updateProductVariant(client, product_variant_id, variantData) {
    const { sku, raw_price, stock_quantity, image_urls, options } = variantData;
    const productVariant = await client.productVariant.update({
        where: { product_variant_id },
        data: {
            ...(sku && { sku }),
            ...(raw_price && { raw_price }),
            ...(stock_quantity && { stock_quantity }),
            ...(image_urls && { image_urls })
        }
    });

    if (Array.isArray(options) && options.length > 0) {
        const productOptions = await getProductOptions(client, productVariant.product_id);

        // Delete options
        await client.productVariantOption.deleteMany({
            where: { product_variant_id }
        });

        // Add options
        const optionValueIds = options.map(option =>
            productOptions.find(po => po.product_option_id === option.product_option_id)
                .ProductOptionValue.find(pov => pov.value === option.value)
                .option_value_id
        );

        await client.productVariantOption.createMany({
            data: optionValueIds.map(option_value_id => ({ product_variant_id, option_value_id }))
        });
    }

    return await getProductVariantById(client, product_variant_id);
}

// Need transaction
async function updateProductOption(client, product_option_id, option_name, values) {
    await client.productOption.update({
        where: { product_option_id },
        data: option_name ? { option_name } : {}
    });

    if (Array.isArray(values) && values.length > 0) {
        const existingValues = await client.productOptionValue.findMany({
            where: { product_option_id },
        });
        const existingValueStrings = existingValues.map(v => v.value);

        // Add new value
        const valuesToAdd = values.filter(v => !existingValueStrings.includes(v));
        await client.productOptionValue.createMany({
            data: valuesToAdd.map(v => ({ product_option_id, value: v })),
            skipDuplicates: true
        });

        // Delete unused values
        const valuesToDelete = existingValues.filter(v => !values.includes(v.value)).map(v => v.option_value_id);
        if (valuesToDelete.length > 0) {
            const usedIds = await client.productVariantOption.findMany({
                where: { option_value_id: { in: valuesToDelete } },
                select: { option_value_id: true },
            }).then(res => res.map(r => r.option_value_id));

            const safeToDelete = valuesToDelete.filter(id => !usedIds.includes(id));

            if (safeToDelete.length > 0) {
                await client.productOptionValue.deleteMany({
                    where: { option_value_id: { in: safeToDelete } }
                });
            }
        }
    }

    return await getProductOptionById(client, product_option_id);
}

async function createProduct(client, name, description, image_urls, is_disabled) {
    return await client.product.create({
        data: {
            name,
            description,
            image_urls,
            is_disabled
        },
        select: {
            product_id: true,
            name: true,
            description: true,
            image_urls: true,
            is_disabled: true,
            created_at: true
        }
    });
}

async function createProductCategories(client, productId, categoryCodes) {
    const categories = await client.category.findMany({
        where: {
            category_code: { in: categoryCodes }
        }
    });

    return await client.productCategories.createMany({
        data: categories.map(category => ({ product_id: productId, category_id: category.category_id })),
        skipDuplicates: true
    });
}

async function createProductOptionsWithValues(client, productId, options) {
    return await Promise.all(options.map(async (option) => {
        const { option_name, values } = option;

        const createdOption = await client.productOption.create({
            data: {
                product_id: productId,
                option_name
            },
            select: {
                product_option_id: true,
                option_name: true
            }
        });

        await client.productOptionValue.createMany({
            data: values.map(value => ({
                product_option_id: createdOption.product_option_id,
                value
            })),
            skipDuplicates: true
        });

        const createdValues = await client.productOptionValue.findMany({
            where: { product_option_id: createdOption.product_option_id },
            select: { option_value_id: true, value: true }
        });

        return { createdOption, createdValues };
    }));
}

async function createProductVariantsWithOptions(client, productId, variants) {
    const createdVariants = await Promise.all(variants.map(async (variant) => {
        const { sku, raw_price, stock_quantity, image_urls, is_disabled, options } = variant;
        const createdVariant = await client.productVariant.create({
            data: {
                product_id: productId,
                sku,
                raw_price,
                stock_quantity,
                image_urls,
                is_disabled
            },
            select: {
                product_variant_id: true,
                sku: true,
                raw_price: true,
                stock_quantity: true,
                image_urls: true,
                is_disabled: true,
                created_at: true
            }
        });

        return { createdVariant, options };
    }));

    await client.productVariantOption.createMany({
        data: createdVariants.flatMap(({ createdVariant, options }) => (
            options.map(option => ({
                product_variant_id: createdVariant.product_variant_id,
                option_value_id: option.option_value_id
            }))
        )),
        skipDuplicates: true
    });

    return createdVariants.map(({ createdVariant, options }) => ({ ...createdVariant, options }));
}

// Need transaction
async function updateProduct(client, product_id, productData) {
    const { name, description, categories, is_disabled, image_urls } = productData;
    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (is_disabled !== undefined) data.is_disabled = is_disabled;
    if (image_urls) data.image_urls = image_urls;

    if (categories) {
        await client.productCategories.deleteMany({ where: { product_id: product_id } });
        await createProductCategories(client, product_id, categories);
    }

    return await client.product.update({
        where: { product_id: product_id },
        data,
        select: {
            product_id: true,
            name: true,
            description: true,
            ProductCategories: { select: { Category: { select: { category_code: true } } } },
            is_disabled: true,
            created_at: true,
            updated_at: true,
            image_urls: true
        }
    });
}

async function deleteProduct(product_id) {
    return await prisma.product.delete({
        where: { product_id: product_id }
    });
}

async function deleteProductVariant(client, product_variant_id) {
    return await client.productVariant.delete({
        where: { product_variant_id }
    });
}

async function addReview(product_id, review, client = prisma) {
    const { rating, comment, by_user_id } = review;
    return await client.review.create({
        data: { product_id, rating, comment, by_user_id }
    });
}

async function getReviewsWithUserInfo(product_id, client = prisma) {
    return await client.review.findMany({
        where: { product_id },
        orderBy: { created_at: 'desc' },
        include: {
            user: {
                select: {
                    user_id: true,
                    first_name: true,
                    last_name: true,
                    avatar_url: true
                }
            }
        }
    });
}

async function softDelete(product_id, client = prisma) {
    return await client.product.update({
        where: { product_id },
        data: {
            deleted_at: new Date()
        }
    });
}

async function restore(product_id, client = prisma) {
    return await client.product.update({
        where: { product_id },
        data: {
            deleted_at: null,
            restored_at: new Date()
        }
    });
}

module.exports = {
    getPrismaClientInstance,
    getProducts,
    getProductById,
    getProductVariantById,
    getProductOptionById,
    createProduct,
    createProductCategories,
    createProductOptionsWithValues,
    createProductVariantsWithOptions,
    updateProduct,
    deleteProduct,
    updateProductOption,
    updateProductVariant,
    deleteProductVariant,
    addReview,
    getReviewsWithUserInfo,
    softDelete,
    restore
};
