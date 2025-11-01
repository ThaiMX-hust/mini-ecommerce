const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getProductById(product_id){
    const product = await prisma.product.findUniqueOrThrow({
        where: {
            product_id: product_id
        }
    })
    return product
}

async function getProductVariantById(product_variant_id){
     const productVariant = await prisma.productVariant.findUniqueOrThrow({
        where: {
            product_id: product_id
        },
        select: {
            product_id: true,
            sku: true,
            raw_price: true,
            stock_quantity: true,
            image_urls: true,
            created_at: true,
            updated_at: true
        },
        include : {
            product: {select: {product_id: true, name: true, description: true}}
        }
    })
    return productVariant
}

module.exports = {
    getProductById,
    getProductVariantById
}