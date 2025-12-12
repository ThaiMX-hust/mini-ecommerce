const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository')
const userService = require('../services/userService');
const CacheManager = require('../utils/cacheManager');
const { BadRequestError } = require('../errors/BadRequestError');

async function getProducts(query, isAdmin) {
    const cached = await CacheManager.getProducts(query);
    if (cached) return cached;

    const { name, categories, min_price, max_price, page, limit } = query;
    const { total_items, products } = await productRepository.getProducts({ name, categories, min_price, max_price, page, limit }, isAdmin, isAdmin);
    const total_pages = Math.ceil(total_items / limit);
    const items = products.map(product => ({
        product_id: product.product_id,
        name: product.name,
        description: product.description,
        categories: product.ProductCategories.map( c => {
            return {
                category_id: c.Category.category_id,
                category_name: c.Category.category_name,
                category_code: c.Category.category_code,
                category_description: c.Category.category_description
            }
        }),
        min_price: Math.min(...product.ProductVariant.map(v => v.raw_price)),
        max_price: Math.max(...product.ProductVariant.map(v => v.raw_price)),
        image_url: product.image_urls[0] || null,
    }));

    const result =  {
        page,
        limit,
        total_pages,
        total_items,
        items
    };

    await CacheManager.setProducts(query, result)

    return result
}

async function getProductById(product_id, isAdmin) {
    const cached = await CacheManager.getProduct(product_id)
    if(cached) return cached

    const product = await productRepository.getProductById(product_id, isAdmin, isAdmin);
    if (!product)
        return null;

    const categories = product.ProductCategories.map( c => {
        return {
            category_id: c.Category.category_id,
            category_name: c.Category.category_name,
            category_code: c.Category.category_code,
            category_description: c.Category.category_description
        }
    })

    // lookup map: option_value_id -> option_name
    const optionValueMap = {};

    // options with their values
    const options = product.ProductOption.map(opt => ({
        product_option_id: opt.product_option_id,
        option_name: opt.option_name,
        values: opt.ProductOptionValue.map(v => {
            optionValueMap[v.option_value_id] = opt.option_name; // build the lookup map
            return { option_value_id: v.option_value_id, value: v.value };
        })
    }));

    // variants with their options
    const variants = product.ProductVariant.map(variant => ({
        product_variant_id: variant.product_variant_id,
        sku: variant.sku,
        price: Number(variant.raw_price),
        stock: variant.stock_quantity,
        is_disabled: variant.is_disabled,
        images: variant.image_urls,
        options: variant.ProductVariantOption.map(pvo => ({
            product_option_id: pvo.ProductOptionValue.product_option_id,
            option_name: optionValueMap[pvo.ProductOptionValue.option_value_id],
            value: { option_value_id: pvo.ProductOptionValue.option_value_id, value: pvo.ProductOptionValue.value }
        }))
    }));

    const res = {
        product_id: product.product_id,
        name: product.name,
        description: product.description,
        categories,
        is_disabled: product.is_disabled,
        options,
        variants
    };

    await CacheManager.setProduct(product_id, res)

    return res
}

async function getProductVariantById(product_variant_id){
    const cached = await CacheManager.getProductVariant(product_variant_id)
    if(cached) return cached

    const prisma = productRepository.getPrismaClientInstance()
    const productVariant = await productRepository.getProductVariantById(prisma, product_variant_id)

    await CacheManager.setProductVariant(product_variant_id, productVariant)

    return productVariant
}

async function addProduct(productData) {
    try{
        const { name, description, categories, is_disabled = false, options, variants, variant_images } = productData;

        // TODO: upload images and get URLs
        const image_urls = [];

        return await productRepository.getPrismaClientInstance().$transaction(async (tx) => {
            // Create product
            const createdProduct = await productRepository.createProduct(tx, name, description, image_urls, is_disabled === true || is_disabled === 'true');

            // Ensure product codes are valid
            for (const category_code of categories) {
                const exist = await categoryRepository.getCategoryIdByCode(category_code);

                if (!exist) {
                    throw new BadRequestError(
                        `Category code ${category_code} does not exist or has been removed`, 400);
                }
            }

            // Link categories
            await productRepository.createProductCategories(tx, createdProduct.product_id, categories);

            // Create options
            const createdOptions = await productRepository.createProductOptionsWithValues(tx, createdProduct.product_id, options);
            const optionList = createdOptions.map(({ createdOption, createdValues }) => ({
                product_option_id: createdOption.product_option_id,
                option_name: createdOption.option_name,
                values: createdValues.map(value => ({ option_value_id: value.option_value_id, value: value.value }))
            }));

            // lookup map: option_name -> value -> option_value_id
            const optionValueMap = {};
            optionList.forEach(option => {
                optionValueMap[option.option_name] = { product_option_id: option.product_option_id, values: {} };
                option.values.forEach(value => {
                    optionValueMap[option.option_name].values[value.value] = value.option_value_id;
                });
            });

            // Create variants
            const _variants = variants.map(variant => {
                const variantImagesUrls = [];
                return {
                    ...variant,
                    stock_quantity: parseInt(variant.stock_quantity),
                    is_disabled: variant.is_disabled === 'true',
                    image_urls: variantImagesUrls,
                    options: variant.options.map(({ option_name, value }) => {
                        const option = optionValueMap[option_name];
                        return option ? {
                            product_option_id: option.product_option_id,
                            option_name,
                            value,
                            option_value_id: option.values[value]
                        } : null;
                    }).filter(o => o !== null)
                };
            });

            const createdVariants = await productRepository.createProductVariantsWithOptions(tx, createdProduct.product_id, _variants);
            const variantList = createdVariants.map(variant => ({
                product_variant_id: variant.product_variant_id,
                sku: variant.sku,
                raw_price: variant.raw_price,
                stock_quantity: variant.stock_quantity,
                is_disabled: variant.is_disabled,
                images_urls: variant.image_urls,
                options: variant.options.map(option => ({
                    product_option_id: option.product_option_id,
                    option_name: option.option_name,
                    value: option.value
                })),
                created_at: variant.created_at
            }));

            return {
                product_id: createdProduct.product_id,
                name: createdProduct.name,
                description: createdProduct.description,
                categories,
                options: optionList.map(option => ({
                    product_option_id: option.product_option_id,
                    option_name: option.option_name,
                    values: option.values.map(({ value }) => value)
                })),
                variants: variantList,
                created_at: createdProduct.created_at
            };
        });
    } catch (error){
        throw error
    }
}

async function updateProduct(product_id, productData) {
    const { name, description, categories, is_disabled, variant_images } = productData;

    const image_urls = [];
    const updatedProduct = await productRepository.getPrismaClientInstance().$transaction(async (tx) => 
        await productRepository.updateProduct(tx, product_id, { name, description, categories, is_disabled, image_urls })
    );

    await CacheManager.clearProduct(product_id);

    await CacheManager.clearByPrefix("products:list:");

    if (categories) {
        for (const cat of categories) {
            await CacheManager.clearByPrefix(`products:list:category:${cat}`);
        }
    }

    return {
        product_id: updatedProduct.product_id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        categories: updatedProduct.ProductCategories.map(c => c.category_id),
        is_disabled: updatedProduct.is_disabled,
        created_at: updatedProduct.created_at,
        updated_at: updatedProduct.updated_at,
        image_urls: updatedProduct.image_urls,
    }
}

async function updateProductOption(product_id, product_option_id, optionData) {
    const { option_name, value } = optionData;

    const prismaClient = productRepository.getPrismaClientInstance();

    const product = await productRepository.getProductById(product_id);
    if (!product)
        return null;
    
    const productOption = await productRepository.getProductOptionById(product_option_id);
    if (!productOption || productOption.product_id !== product_id)
        return null;

    const updatedProductOption = await prismaClient.$transaction(async (tx) => {
        return await productRepository.updateProductOption(tx, product_option_id, option_name, value);
    });

    await CacheManager.clearProduct(product_id);

    return {
        product_id: updatedProductOption.product_id,
        option_name: updatedProductOption.option_name,
        value: updatedProductOption.ProductOptionValue.map(pov => pov.value),
        created_at: updatedProductOption.created_at,
        updated_at: updatedProductOption.updated_at
    };
}

async function updateProductVariant(product_id, product_variant_id, variantData) {
    const { sku, raw_price, stock_quantity, image_indexes, options, variant_images } = variantData;

    const prismaClient = productRepository.getPrismaClientInstance();

    const product = await productRepository.getProductById(product_id);
    if (!product)
        return null;
    
    const productVariant = await productRepository.getProductVariantById(product_variant_id);
    if (!productVariant || productVariant.product_id !== product_id)
        return null;

    const image_urls = [];  // TODO: upload images
    const newData = { sku, raw_price, stock_quantity, image_urls, options };

    const updatedProductVariant = await prismaClient.$transaction(async (tx) => {
        return await productRepository.updateProductVariant(tx, product_variant_id, newData);
    });

    await CacheManager.clearProduct(product_id);

    await CacheManager.del(`product_varaint: ${product_variant_id}`)

    return {
        product_variant_id: updatedProductVariant.product_variant_id,
        product_id: updatedProductVariant.product_id,
        sku: updatedProductVariant.sku,
        raw_price: updatedProductVariant.raw_price,
        stock_quantity: updatedProductVariant.stock_quantity,
        image_urls: updatedProductVariant.image_urls,
        options: updatedProductVariant.ProductVariantOption.map(pvo => ({
            product_option_id: pvo.ProductOptionValue.ProductOption.product_option_id,
            option_name: pvo.ProductOptionValue.ProductOption.option_name,
            value: pvo.ProductOptionValue.value
        })),
        created_at: updatedProductVariant.created_at,
        updated_at: updatedProductVariant.updated_at
    };
}

async function deleteProduct(product_id) {
    return await productRepository.deleteProduct(product_id);
}

async function deleteProductVariant(product_id, product_variant_id) {
    // const prisma = productRepository.getPrismaClientInstance();
    const productVariant = await productRepository.getProductVariantById(product_variant_id);

    if (productVariant.product_id !== product_id)
        return null;

    return await productRepository.deleteProductVariant(product_variant_id);
}

async function addReview(product_id, review) {
    const product = productRepository.getProductById(product_id);
    if (!product)
        return null;

    const user = await userService.getUserById(review.by_user_id);
    if (!user)
        return null;

    const result = await productRepository.addReview(product_id, review);

    return {
        review_id: result.review_id,
        product_id: result.product_id,
        user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url
        },
        rating: result.rating,
        comment: result.comment,
        created_at: result.created_at
    };
}

async function getReviews(product_id) {
    const product = await productRepository.getProductById(product_id);
    if (!product)
        return null;

    const reviews = await productRepository.getReviewsWithUserInfo(product_id);

    return {
        reviews: reviews.map(r => ({
            review_id: r.review_id,
            product_id: r.product_id,
            user: {
                user_id: r.user.user_id,
                first_name: r.user.first_name,
                last_name: r.user.last_name,
                avatar_url: r.user.avatar_url
            },
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at
        }))
    };
}

async function softDelete(product_id) {
    const product = await productRepository.softDelete(product_id);
    if (!product)
        return null;

    return {
        product_id: product.product_id,
        is_deleted: true,
        deleted_at: product.deleted_at
    };
}

async function restore(product_id) {
    const product = await productRepository.restore(product_id);
    if (!product)
        return null;

    return {
        product_id: product.product_id,
        is_deleted: false,
        restored_at: product.restored_at
    };
}

module.exports = {
    getProducts,
    getProductById,
    getProductVariantById,
    addProduct,
    updateProduct,
    updateProductOption,
    updateProductVariant,
    deleteProduct,
    deleteProductVariant,
    addReview,
    getReviews,
    softDelete,
    restore
};