const { checkProductVariantExistenceInCart, addItemToCartById, updateItemToCartById } = require("../repository/cartRepository");

/**
 * Thêm sản phẩm vào giỏ hàng theo cart_id, product_variant_id
 */
async function addItemToCart(cart_id, product_variant_id, quantity = 1) {
  try {
    const productVariantExistInCart = await checkProductVariantExistenceInCart(cart_id, product_variant_id);

    if (!productVariantExistInCart) {
      const createdItem = await addItemToCartById(cart_id, product_variant_id, quantity);
      return createdItem;
    }

    const cart_item_id = productVariantExistInCart.cart_item_id;
    const updatedItem = await updateItemToCartById(cart_id, cart_item_id, quantity);
    return updatedItem;

  } catch (err) {
    throw err; 
  }
}


module.exports = {
    addItemToCart
}