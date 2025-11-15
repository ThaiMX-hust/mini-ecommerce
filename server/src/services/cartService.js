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

async function getCartIdFromUserId(user_id){
  if(user_id == null){
    throw new NotFoundError("User not found", 400)
  }
  return await cartRepository.getCartFromUserId(user_id)
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
        total_price: 0,
        total_price_after_discount: 0
      };
    }

    const prisma = productRepository.getPrismaClientInstance();
    let totalPrice = 0;
    let totalPriceAfterDiscount = 0;

    const itemsWithDetail = await Promise.all(
      cartItems.map(async (item) => {
        const productPrisma = productRepository.getPrismaClientInstance();
        const productVariant = await productRepository.getProductVariantById(
          productPrisma,
          item.product_variant_id
        );

        if (!productVariant || !productVariant.Product) {
          throw new NotFoundError(`Variant or product not found for item ${item.cart_item_id}`, 404);
        }

        const productWithCategories = await prisma.product.findUnique({
          where: { product_id: productVariant.Product.product_id },
          include: {
            ProductCategories: {
              include: {
                Category: { select: { category_code: true } },
              },
            },
          },
        });

        const options =
          productVariant.ProductVariantOption?.map((opt) => ({
            option_name: opt.ProductOptionValue.ProductOption.option_name,
            value: opt.ProductOptionValue.value,
          })) ?? [];

        const categoryCodes = productWithCategories.ProductCategories.map(
          (pc) => pc.Category.category_code
        );


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