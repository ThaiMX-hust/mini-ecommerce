const productRepository = require('../repositories/productRepository');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getProducts(query) {
    const { name, categories, min_price, max_price, page, limit } = query;
    const { total_items, products } = await productRepository.getProducts(prisma, { name, categories, min_price, max_price, page, limit });
    const total_pages = Math.ceil(total_items / limit);
    const items = products.map(product => ({
        product_id: product.product_id,
        name: product.name,
        description: product.description,
        categories: product.ProductCategories.map(c => c.category_id),
        min_price: Math.min(...product.ProductVariant.map(v => v.raw_price)),
        max_price: Math.max(...product.ProductVariant.map(v => v.raw_price)),
        image_url: product.image_urls[0] || null,
    }));

    return {
        page,
        limit,
        total_pages,
        total_items,
        items
    }
}

async function getProductById(productId) {
    const product = await productRepository.getProductById(prisma, productId);
    if (!product)
        return null;

    const categories = product.ProductCategories.map(pc => pc.category_id);

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
        price: variant.raw_price,
        stock: variant.stock_quantity,
        is_disabled: variant.is_disabled,
        images: variant.image_urls,
        options: variant.ProductVariantOption.map(pvo => ({
            product_option_id: pvo.ProductOptionValue.product_option_id,
            option_name: optionValueMap[pvo.ProductOptionValue.option_value_id],
            value: { option_value_id: pvo.ProductOptionValue.option_value_id, value: pvo.ProductOptionValue.value }
        }))
    }));

    return {
        product_id: product.product_id,
        name: product.name,
        description: product.description,
        categories,
        is_disabled: product.is_disabled,
        options,
        variants
    };
}

async function addProduct(productData) {
    const { name, description, categories, is_disabled = false, options, variants, variant_images } = productData;

    // TODO: upload images and get URLs
    const image_urls = [];

    return await prisma.$transaction(async (tx) => {
        // Create product
        const createdProduct = await productRepository.createProduct(tx, name, description, image_urls, is_disabled === true || is_disabled === 'true');

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
}

async function updateProduct(productId, productData) {
    const { name, description, categories, is_disabled, variant_images } = productData;

    const image_urls = [];
    const updatedProduct = await prisma.$transaction(async (tx) => {
        return await productRepository.updateProduct(tx, productId, { name, description, categories, is_disabled, image_urls });
    });

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

async function deleteProduct(productId) {
    return await productRepository.deleteProduct(prisma, productId);
}

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};