const cartRepository = require("../repositories/cartRepository");

/**
 * Thêm sản phẩm vào giỏ hàng theo cart_id, product_variant_id
 */
async function addItemToCart(cart_id, product_variant_id, quantity = 1) {
  try {
    const productVariantExistInCart = await cartRepository.checkProductVariantExistenceInCart(cart_id, product_variant_id);

    if (!productVariantExistInCart) {
      const createdItem = await cartRepository.addItemToCartById(cart_id, product_variant_id, quantity);
      return {
        item: createdItem,
        method: 'add'
      };
    }

    const cart_item_id = productVariantExistInCart.cart_item_id;
    const updatedItem = await cartRepository.updateItemToCartById(cart_id, cart_item_id, quantity);
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
async function getCartFromUserId(user_id){
  try{
    const cart = await cartRepository.getCartFromUserId(user_id)

    if(!cart){
      return cart 
    } else {
      throw new Error("Error while query cart from user")
    }
  } catch (err){
    throw err
  }
}


module.exports = {
    addItemToCart,
    getCartFromUserId
}