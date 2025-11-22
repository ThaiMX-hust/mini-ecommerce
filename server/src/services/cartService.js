const productService = require('../services/productService')
const productRepository = require('../repositories/productRepository')
const cartRepository = require("../repositories/cartRepository");
const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequestError } = require('../errors/BadRequestError');
const CacheManager = require('../utils/cacheManager');

/**
 * Thêm sản phẩm vào giỏ hàng theo cart_id, product_variant_id
 */
async function addItemToCart(cart_id, product_variant_id, quantity = 1) {
  try {
    const exists = await cartRepository.checkProductVariantExistenceInCart(
      cart_id,
      product_variant_id
    );

    let result;
    
    if (!exists) {
      const createdItem = await cartRepository.addNewItemToCartById(
        cart_id, 
        product_variant_id, 
        quantity
      );
      result = { item: createdItem, method: "add" };
    } else {
      const updatedItem = await cartRepository.addExistingItemToCartById(
        cart_id,
        exists.cart_item_id,
        quantity
      );
      result = { item: updatedItem, method: "update" };
    }

    await CacheManager.clearCart(cart_id);

    return result;

  } catch (err) {
    throw err;
  }
}


async function getCartIdFromUserId(user_id){
  if(user_id == null){
    throw new BadRequestError("User not found", 400)
  }

  const cart = await cartRepository.getCartFromUserId(user_id)
}

async function getCartItems(cart_id){
  const cached = await CacheManager.getCart(cart_id)
  if(cached) return cached

  const cartItems = await cartRepository.getCartItems(cart_id);

  await CacheManager.setCart(cart_id, cartItems) 

  return cartItems
}

/**
 * Lấy cart của user
 */
async function getCart(cart_id) {
  try {
    const cartItems = await getCartItems(cart_id);

    if (!cartItems || cartItems.length === 0) {
      return {
        items: [],
        total_price: 0,
        total_price_after_discount: 0
      };
    }

    const prisma = productRepository.getPrismaClientInstance();
    let totalPrice = 0;
    let totalPriceAfterDiscount = 0;

    const itemsWithDetail = await Promise.all(
      cartItems.map(async (item) => { 
        const productVariant = await productService.getProductVariantById(item.product_variant_id)

        if (!productVariant || !productVariant.Product) {
          throw new NotFoundError(`Variant or product not found for item ${item.cart_item_id}`, 404);
        }

        const product = await productService.getProductById(productVariant.Product.product_id)

        const options = product.options
        const categoryCodes = product.categories

        const quantity = Number(item.quantity);
        const rawUnitPrice = Number(productVariant.raw_price);
        const finalUnitPrice = Number(productVariant.final_price ?? productVariant.raw_price);
        const itemRawSubtotal = rawUnitPrice * quantity;
        let itemFinalSubtotal = finalUnitPrice * quantity;

        const now = new Date();
        const activePromotion = await prisma.productPromotions.findFirst({
          where: {
            product_id: productVariant.Product.product_id,
            promotion_status: "RUNNING",
            start_at: { lte: now },
            end_at: { gte: now },
          },
          orderBy: { start_at: "desc" },
        });

        let promotionValue = 0;
        if (activePromotion) {
          if (activePromotion.promotion_type === "PERCENT") {
            promotionValue =
              (Number(finalUnitPrice) * Number(activePromotion.value)) / 100;
          } else if (activePromotion.promotion_type === "AMOUNT") {
            promotionValue = Number(activePromotion.value);
          }

          const discountedUnitPrice = Math.max(finalUnitPrice - promotionValue, 0);
          itemFinalSubtotal = discountedUnitPrice * quantity;
        }


        totalPrice += itemRawSubtotal;
        totalPriceAfterDiscount += itemFinalSubtotal;

        return {
          cart_item_id: item.cart_item_id,
          quantity,
          promotion: promotionValue,
          product: {
            product_id: productVariant.Product.product_id,
            name: productVariant.Product.name,
            categories: categoryCodes,
          },
          variant: {
            product_variant_id: productVariant.product_variant_id,
            sku: productVariant.sku,
            raw_price: rawUnitPrice,
            final_price: finalUnitPrice,
            image_urls: productVariant.image_urls,
            options,
            version: productVariant.version,
          },
          subtotal_before_discount: itemRawSubtotal,
          subtotal_after_discount: itemFinalSubtotal,
        };
      })
    );

    return {
      items: itemsWithDetail,
      total_price: totalPrice,
      total_price_after_discount: totalPriceAfterDiscount,
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

    await CacheManager.clearCart(cart_id)

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
    getCartIdFromUserId,
    getCart,
    updateItemQuantityFromCart,
    deleteItemFromCart
}