const {PrismaClient} = require('@prisma/client');
const { getProductVariantById } = require('./productRepository');
const { deleteItemFromCart, updateItemFromCart } = require('../controllers/cartController');

const prisma = new PrismaClient();

async function getAllCartItems(cart_id) {
  const cart_items = await prisma.cartItems.findMany({
    where: { cart_id },
    select: {
      cart_item_id: true,
      quantity: true,
      productVariant: {
        select: {
          product_variant_id: true,
          sku: true,
          raw_price: true,
          final_price: true,
          stock_quantity: true,
          image_urls: true,
          product: {
            select: {
              product_id: true,
              name: true,
              description: true,
            },
          },
          variantOptions: {
            select: {
              option_name: true,
              value: true,
            },
          },
        },
      },
    },
  });

  return cart_items;
}

async function getCartItemFromCartId(cart_id, cart_item_id){
    const cartItem = await prisma.cartItems.findUnique({
        where: {
            cart_id,
            cart_item_id
        },
        select: {
            product_variant_id: true,
            quantity: true,
            raw_unit_price: true,
            final_unit_price: true,
            raw_subtotal: true,
            final_subtotal: true,
            added_at: true
        },
        include: {
            product_variant: {
                select: {
                    sku: true,
                    raw_price: true,
                    stock_quantity: true,
                }
            }
        }
    })

    return cartItem
}

async function checkProductVariantExistenceInCart(cart_id, product_variant_id) {
    const cartItems = await getAllCartItems(cart_id);

    if (!cartItems || cartItems.length === 0) {
        throw new Error(`Cart id ${cart_id} does not exist or is empty`);
    }

    const existingItem = cartItems.find(
        (item) => item.product_variant_id === product_variant_id
    );

    return existingItem || null;
}


async function updateItemToCartById(cart_id, cart_item_id, quantity = 1) {
    const currentItem = await getCartItemFromCartId(cart_id, cart_item_id);
    if (!currentItem) throw new Error('Cart item not found');

    const newQuantity = currentItem.quantity + quantity;
    if (newQuantity <= 0) {
        deleteItemFromCart(cart_id, cart_item_id)
        return null
    }

    const raw_subtotal = currentItem.raw_unit_price * newQuantity;
    const final_subtotal = currentItem.final_unit_price * newQuantity;

    const updatedItem = await prisma.cartItems.update({
        where: { cart_item_id },
        data: {
        quantity: newQuantity,
        raw_subtotal,
        final_subtotal,
        },
    });

    return updatedItem;
}


async function addItemToCartById(cart_id, product_variant_id, quantity = 1) {
    const productVariant = await getProductVariantById(product_variant_id);
    if (!productVariant) throw new Error("Product variant not found");

    const rawUnitPrice = productVariant.raw_price;
    const finalUnitPrice = productVariant.final_price ?? rawUnitPrice;
    const rawSubtotal = rawUnitPrice * quantity;
    const finalSubtotal = finalUnitPrice * quantity;

    const createdItem = await prisma.cartItem.create({
        data: {
        cart_id,
        product_variant_id,  
        quantity,
        raw_unit_price: rawUnitPrice,
        final_unit_price: finalUnitPrice,
        raw_subtotal: rawSubtotal,
        final_subtotal: finalSubtotal,
        added_at: new Date(),
        },
    });

    return createdItem;
}

async function deleteItemFromCartById(cart_id, cart_item_id) {
    const item = await prisma.cartItems.findFirst({
        where: { cart_id, cart_item_id },
    });

    if (!item) {
        throw new Error('Cart item not found or does not belong to this cart');
    }

    const deletedItem = await prisma.cartItems.delete({
        where: { cart_item_id },
    });

    return deletedItem;
}


module.exports = {
    getAllCartItems,
    getCartItemFromCartId,
    checkProductVariantExistenceInCart,
    updateItemToCartById,
    addItemToCartById,
    deleteItemFromCartById
}
