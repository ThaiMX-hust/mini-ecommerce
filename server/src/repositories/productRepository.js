
async function getProducts(client, query) {
    const { name, categories, min_price, max_price, page, limit } = query;
    const where = {
        AND: [
            name ? { name: { contains: name } } : {},
            categories && categories.length > 0 ? { ProductCategories: { some: { category_id: { in: categories } } } } : {},
            min_price ? { ProductVariant: { some: { raw_price: { gte: min_price } } } } : {},
            max_price ? { ProductVariant: { some: { raw_price: { lte: max_price } } } } : {}
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
            ProductCategories: { select: { category_id: true } },
            ProductVariant: { select: { raw_price: true } }
        }
    });
    return { total_items: count, products };
}

async function getProductById(client, productId) {
    const product = await client.product.findUnique({
        where: { product_id: productId },
        include: {
            ProductCategories: true,
            ProductOption: { include: { ProductOptionValue: true } },
            ProductVariant: {
                include: { ProductVariantOption: { include: { ProductOptionValue: true } } }
            }
        }
    });
    return product;
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

async function createProductCategories(client, productId, categoryIds) {
    return await client.productCategories.createMany({
        data: categoryIds.map(category_id => ({ product_id: productId, category_id })),
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

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    createProductCategories,
    createProductOptionsWithValues,
    createProductVariantsWithOptions
};