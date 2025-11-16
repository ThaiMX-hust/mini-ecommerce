const { EmptyCartError, BadRequestError } = require('../errors/BadRequestError');
const orderRepository = require('../repositories/ordersRepository');
const cartService = require('./cartService');

async function createOrder(user_id, cart_id, receiver_name, phone, address) {
    const cart = await cartService.getCart(cart_id);
    const cartItems = cart.items;
    try {
        const result = await orderRepository.getPrismaClientInstance().$transaction(async (tx) => {
        if (!cart || cartItems.length === 0) {
            throw new EmptyCartError("Cart is empty!", 400);
        }

        let rawTotal = 0;
        let finalTotal = 0;
        const adjustmentRecords = [];

        for (const item of cartItems) {
            const variant = item.variant;
            const quantity = item.quantity;

            //Using optimistic lock
            const updated = await tx.productVariant.updateMany({
            where: {
                product_variant_id: variant.product_variant_id,
                version: variant.version,
                stock_quantity: { gte: quantity },
            },
            data: {
                stock_quantity: { decrement: quantity },
                version: { increment: 1 },
            },
            });

            if (updated.count === 0) {
             throw new BadRequestError(`Stock conflict or outdated version for ${variant.product_variant_id}`, 400);
            }
        }


        const activeAdjustments = await orderRepository.getAdjustmentsByCartId(tx, cart_id);
        for (const adj of activeAdjustments) {
            let discountValue = 0;
            if (adj.value_type === "PERCENT") {
                discountValue = (finalTotal * Number(adj.value)) / 100;
            } else if (adj.value_type === "AMOUNT") {
                discountValue = Number(adj.value);
            }
            finalTotal = Math.max(finalTotal - discountValue, 0);
            adjustmentRecords.push({
            adjustment_type: adj.adjustment_type,
            value_type: adj.value_type,
            value: adj.value,
            applied_amount: discountValue,
            reason: adj.reason || "Auto-applied",
            });
        }

        //Create order
        const order = await tx.order.create({
            data: {
            receiver_name,
            phone,
            address,
            raw_total_price: cart.total_price,
            final_total_price: cart.total_price_after_discount,
            user_id: user_id,
            items: {
                create: cart.items.map((item) => ({
                    product_variant_id: item.variant.product_variant_id,
                    quantity: item.quantity,
                    unit_price: item.variant.raw_price,
                    promotion: item.variant.final_price - item.variant.raw_price,
                    final_price: item.variant.final_price,
                    subtotal: item.subtotal_before_discount,
                })),
            },
            },
            include: { items: true },
        });

        if (adjustmentRecords.length > 0) {
            await Promise.all(
            adjustmentRecords.map((adj) =>
                tx.adjustment.updateMany({
                where: { cart_id },
                data: {
                    order_id: order.order_id,
                    adjustment_type: adj.adjustment_type,
                    value_type: adj.value_type,
                    value: adj.value,
                    applied_amount: adj.applied_amount,
                    reason: adj.reason,
                },
                })
            )
            );
        }

        if(order){
            await tx.cartItems.deleteMany({
                where: {cart_id}
            })
        }

        return order;
        });

        return formatOrderResponse(result, cartItems);
    } catch (err) {
        console.error("Create order failed:", err);
        throw err;
    }
}

function formatOrderResponse(result, cartItems) {
  const formattedItems = result.items.map((item, index) => {
    const cartItem = cartItems[index]; 
    return {
      cart_item_id: cartItem.cart_item_id,
      quantity: item.quantity,
      product: {
        product_id: cartItem.product.product_id,
        name: cartItem.product.name,
        description: cartItem.product.description ?? null,
        categories: cartItem.product.categories ?? [],
      },
      variant: {
        product_variant_id: item.product_variant_id,
        sku: cartItem.variant.sku,
        raw_price: item.unit_price.toString(),
        final_price: item.final_price.toString(),
        image_urls: cartItem.variant.image_urls ?? [],
        options: cartItem.variant.options ?? [],
      },
      subtotal_before_discount: Number(item.subtotal_before_discount),
      subtotal_after_discount: Number(item.subtotal_after_discount)
    };
  });

  return {
    order_id: result.order_id,
    items: formattedItems,
    total_price: Number(result.raw_total_price),
    total_price_after_discount: Number(result.final_total_price),
    receiver_name: result.receiver_name,
    phone: result.phone,
    address: result.address,
    status_history: [
      {
        status: "CREATED", 
        updated_at: result.created_at.toISOString(),
      },
    ],
    created_at: result.created_at.toISOString(),
  };
}


module.exports = {
  createOrder,
};
