const productRepository = require('../repositories/productRepository')
const cartRepository = require("../repositories/cartRepository");

/**
 * Thêm sản phẩm vào giỏ hàng theo cart_id, product_variant_id
 */
async function addItemToCart(cart_id, product_variant_id, quantity = 1) {
  try {
    const productVariantExistInCart = await cartRepository.checkProductVariantExistenceInCart(cart_id, product_variant_id);

    if (!productVariantExistInCart) {
      const createdItem = await cartRepository.addNewItemToCartById(cart_id, product_variant_id, quantity);
      return {
        item: createdItem,
        method: 'add'
      };
    }

    const cart_item_id = productVariantExistInCart.cart_item_id;
    const updatedItem = await cartRepository.addExistingItemToCartById(cart_id, cart_item_id, quantity);
    return {
      item: updatedItem,
      method: 'update'
    };

  } catch (err) {
    throw err; 
  }
}

/**
 * Lấy cart của user
 */
async function getCart(cart_id) {
  try {
    const cartItems = await cartRepository.getCartItems(cart_id);

    if (!cartItems || cartItems.length === 0) {
      return {
        items: [],
        total_price: 0
      };
    }

    const prisma = productRepository.getPrismaClientInstance();
    let totalPrice = 0;

    const itemsWithDetail = await Promise.all(
      cartItems.map(async (item) => {
        const productPrisma = productRepository.getPrismaClientInstance()
        const productVariant = await productRepository.getProductVariantById(productPrisma, item.product_variant_id);


        const productWithCategories = await prisma.product.findUnique({
          where: { product_id: productVariant.Product.product_id },
          include: {
            ProductCategories: {
              include: {
                Category: {
                  select: { category_code: true }
                }
              }
            }
          }
        });

    
        const options = productVariant.ProductVariantOption?.map((opt) => ({
          option_name: opt.ProductOptionValue.ProductOption.option_name,
          value: opt.ProductOptionValue.value,
        })) ?? [];

        const categoryCodes = productWithCategories.ProductCategories.map(
          (pc) => pc.Category.category_code
        );

  
        const itemTotal = productVariant.raw_price * item.quantity;
        totalPrice += itemTotal;

        return {
          cart_item_id: item.cart_item_id,
          quantity: item.quantity,
          product: {
            product_id: productVariant.Product.product_id,
            name: productVariant.Product.name,
            categories: categoryCodes
          },
          variant: {
            product_variant_id: productVariant.product_variant_id,
            sku: productVariant.sku,
            raw_price: productVariant.raw_price,
            final_price: productVariant.final_price ?? productVariant.raw_price,
            image_urls: productVariant.image_urls,
            options: options
          },
          subtotal: itemTotal
        };
      })
    );

    return {
      items: itemsWithDetail,
      total_price: totalPrice
    };

  } catch (err) {
    console.error("Error in getCart:", err);
    throw err;
  }
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */

async function updateItemQuantityFromCart(cart_id, cart_item_id, quantity = 1){
  try {
    const updatedItem = await cartRepository.updateItemQuantityFromCartById(cart_id, cart_item_id, quantity);
    return updatedItem;
  } catch (err) {
    throw err; 
  }
}

/**
 * Xóa sản phẩm trong giỏ hàng
 */
async function deleteItemFromCart(cart_id, cart_item_id){
  try{
    const deleteItem = await cartRepository.deleteItemFromCartById(cart_id, cart_item_id)
    return deleteItem
  } catch(err){
    throw err
  }
}

module.exports = {
    addItemToCart,
    getCart,
    updateItemQuantityFromCart,
    deleteItemFromCart
}