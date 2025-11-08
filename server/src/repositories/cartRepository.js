const {PrismaClient} = require('@prisma/client');
const productRepository = require("./productRepository")

const prisma = new PrismaClient();

function getPrismaClientInstance() {
  return prisma;
}

async function getAllCartItems(cart_id) {
  const cart_items = await prisma.cartItems.findMany({
    where: { cart_id },
    select: {
      cart_item_id: true,
      quantity: true,
      product_variant: {
        select: {
          product_variant_id: true,
          sku: true,
          raw_price: true,
          stock_quantity: true,
          image_urls: true,
          Product: {
            select: {
              product_id: true,
              name: true,
              description: true,
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
        where: { cart_item_id },
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

    if (!cartItems) {
        throw new Error(`Cart id ${cart_id} does not exist or is empty`);
    }

    const existingItem = cartItems.find(
        (item) => item.product_variant.product_variant_id === product_variant_id
    );

    return existingItem || null;
}


async function addExistingItemToCartById(cart_id, cart_item_id, quantity = 1) {
    const currentItem = await getCartItemFromCartId(cart_id, cart_item_id);
    if (!currentItem) throw new Error('Cart item not found');

    const newQuantity = currentItem.quantity + quantity;
    if (newQuantity <= 0) {
        deleteItemFromCartById(cart_id, cart_item_id)
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

async function updateItemQuantityFromCartById(cart_id, cart_item_id, quantity){
    const currentItem = await getCartItemFromCartId(cart_id, cart_item_id);

    if (quantity <= 0) {
        deleteItemFromCartById(cart_id, cart_item_id) 
        return null
    }

    const raw_subtotal = currentItem.raw_unit_price * quantity;
    const final_subtotal = currentItem.final_unit_price * quantity;

    const updatedItem = await prisma.cartItems.update({
        where: { cart_item_id },
        data: {
        quantity: quantity,
        raw_subtotal,
        final_subtotal,
        },
    });

    return updatedItem;
}


async function addNewItemToCartById(cart_id, product_variant_id, quantity = 1) {
  const productVariant = await productRepository.getProductVariantById(prisma, product_variant_id);

  const rawUnitPrice = Number(productVariant.raw_price);
  const finalUnitPrice = Number(productVariant.final_price ?? rawUnitPrice);
  const rawSubtotal = rawUnitPrice * quantity;
  const finalSubtotal = finalUnitPrice * quantity;

  const createdItem = await prisma.cartItems.create({
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
    include: {
      product_variant: {
        include: {
          Product: {
            select: {
              product_id: true,
              name: true,
              description: true,
            },
          },
          ProductVariantOption: {
            include: {
              ProductOptionValue: {
                include: {
                  ProductOption: {
                    select: { option_name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const variant = createdItem.product_variant;

  const options =
    variant.ProductVariantOption?.map((opt) => ({
      option_name: opt.ProductOptionValue.ProductOption.option_name,
      value: opt.ProductOptionValue.value,
    })) ?? [];

  const response = {
      cart_item_id: createdItem.cart_item_id,
      quantity: createdItem.quantity,
      product: {
      product_id: variant.Product.product_id,
      name: variant.Product.name,
      description: variant.Product.description,
    },
    variant: {
      product_variant_id: variant.product_variant_id,
      sku: variant.sku,
      raw_price: Number(variant.raw_price),
      final_price: Number(variant.final_price ?? variant.raw_price),
      stock_quantity: variant.stock_quantity,
      image_urls: variant.image_urls,
      options,
    },
  };

  return response;
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

async function getCartFromUserId(user_id){
    const cart = prisma.cart.findUniqueOrThrow({
        where: {user_id}
    })

    return cart
}

async function getCartItem(cart_id, cart_item_id){
  const cartItem = await prisma.cartItems.findFirst({
    where: {
      cart_id: cart_id,
      cart_item_id: cart_item_id
    }
  })

  return cartItem
}

async function getCartItems(cart_id){
  const cartItems = await prisma.cartItems.findMany({
    where: {cart_id: cart_id}
  })

  if(!cartItems) {
    throw new Error("This cart_id does not exist or has been deleted")
  }

  return cartItems
}


module.exports = {
    getPrismaClientInstance,
    getAllCartItems,
    getCartItemFromCartId,
    checkProductVariantExistenceInCart,
    addExistingItemToCartById,
    addNewItemToCartById,
    updateItemQuantityFromCartById,
    deleteItemFromCartById,
    getCartFromUserId,
    getCartItem,
    getCartItems
}
