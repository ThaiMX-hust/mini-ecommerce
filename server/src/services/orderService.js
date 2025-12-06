const { EmptyCartError, BadRequestError, OutOfStockError } = require('../errors/BadRequestError');
const { NotFoundError } = require('../errors/NotFoundError');
const orderRepository = require('../repositories/ordersRepository');
const cacheManager = require('../utils/cacheManager');
const cartService = require('./cartService');
const CacheManager = require('../utils/cacheManager');

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

                const currentQuantity = await tx.productVariant.findUnique({
                    where: { product_variant_id: variant.product_variant_id }
                });

                if (quantity > currentQuantity) {
                    throw new OutOfStockError(`Product id ${variant.product_variant_id} out of stock`, 400);
                }

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

            const createStatus = await orderRepository.getStatusByCode("CREATED");
            const createdStatusHistory = await orderRepository.createNewStatusToHistory(tx, order.order_id, "CREATED", user_id, "Đơn hàng được tạo");

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

            if (order) {
                await tx.cartItems.deleteMany({
                    where: { cart_id }
                });

                await CacheManager.clearCart(cart_id);
            }

            return {
                order: order,
                create_status: createStatus,
                create_status_history: createdStatusHistory
            };
        });

        return formatOrderResponse(result.order, cartItems, result.create_status, result.create_status_history);
    } catch (err) {
        console.error("Create order failed:", err);
        throw err;
    }
}

async function getOrders(user_id) {
    const prisma = orderRepository.getPrismaClientInstance();

    const orders = await prisma.order.findMany({
        where: { user_id: user_id },
        orderBy: { created_at: "desc" },
        include: {
            items: {
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
            },
            history: {
                include: {
                    status: {}
                }
            }
        }
    });

    const formattedOrder = orders.map((order) => {
        return {
            order_id: order.order_id,
            items: order.items.map((item) => {
                return {
                    order_item_id: item.order_item_id,
                    quantity: item.quantity,
                    product: {
                        product_id: item.product_variant.Product.product_id,
                        name: item.product_variant.Product.name,
                        description: item.product_variant.Product.description ?? null,
                    },
                    variant: {
                        product_variant_id: item.product_variant_id,
                        sku: item.product_variant.sku,
                        raw_price: item.unit_price.toString(),
                        final_price: item.final_price.toString(),
                        image_urls: item.product_variant.image_urls ?? [],
                        options: item.product_variant.ProductVariantOption.map(option => {
                            return {
                                option_name: option.ProductOptionValue.ProductOption.option_name,
                                value: option.ProductOptionValue.value
                            };
                        }) ?? [],
                    },
                    subtotal_before_discount: Number(item.unit_price * item.quantity),
                    subtotal_after_discount: Number(item.final_price * item.quantity)
                };
            }),
            total_price: order.raw_total_price,
            total_price_after_discount: order.final_total_price,
            receiver_name: order.receiver_name,
            phone: order.phone,
            address: order.address,
            status_history: order.history.map(history => {
                return {
                    status_code: history.status.order_status_code,
                    status_name: history.status.order_status_name,
                    changed_by: history.changed_by,
                    changed_at: history.changed_at,
                    note: history.note ?? ""
                };
            }),
            created_at: order.created_at
        };
    });

    return formattedOrder;
}

async function getOrderFromId(order_id) {
    const prisma = orderRepository.getPrismaClientInstance();
    const order = await prisma.order.findUnique({
        where: { order_id: order_id },
        include: {
            items: {
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
            },
            history: {
                include: {
                    status: {}
                }
            }
        }
    });

    return {
        order_id: order.order_id,
        items: order.items.map((item) => {
            return {
                order_item_id: item.order_item_id,
                quantity: item.quantity,
                product: {
                    product_id: item.product_variant.Product.product_id,
                    name: item.product_variant.Product.name,
                    description: item.product_variant.Product.description ?? null,
                },
                variant: {
                    product_variant_id: item.product_variant_id,
                    sku: item.product_variant.sku,
                    raw_price: item.unit_price.toString(),
                    final_price: item.final_price.toString(),
                    image_urls: item.product_variant.image_urls ?? [],
                    options: item.product_variant.ProductVariantOption.map(option => {
                        return {
                            option_name: option.ProductOptionValue.ProductOption.option_name,
                            value: option.ProductOptionValue.value
                        };
                    }) ?? [],
                },
                subtotal_before_discount: Number(item.unit_price * item.quantity),
                subtotal_after_discount: Number(item.final_price * item.quantity)
            };
        }),
        total_price: order.raw_total_price,
        total_price_after_discount: order.final_total_price,
        receiver_name: order.receiver_name,
        phone: order.phone,
        address: order.address,
        status_history: order.history.map(history => {
            return {
                status_code: history.status.order_status_code,
                status_name: history.status.order_status_name,
                changed_by: history.changed_by,
                changed_at: history.changed_at,
                note: history.note ?? ""
            };
        }),
        created_at: order.created_at
    };
}

async function updateOrderStatus(order_id, status_code, changed_by, note = null) {
    if (!status_code) {
        throw new BadRequestError("Invalid status", 400);
    }

    const status = await orderRepository.getStatusByCode(status_code);
    if (!status) {
        throw new NotFoundError(`Status code ${status_code} not found. Please add this code before you can use it`, 404);
    }

    const order = await getOrderFromId(order_id);
    if (!order) {
        throw new NotFoundError(`Order not found`, 404);
    }

    const prisma = orderRepository.getPrismaClientInstance();
    const currentStatus = order.status_history[0];
    const newStatus = await orderRepository.createNewStatusToHistory(prisma, order_id, status_code, changed_by, note);
    const newDate = new Date();

    await prisma.order.update({
        where: { order_id: order.order_id },
        data: {
            updated_at: newDate
        }
    });

    return {
        order_id: order.order_id,
        status_code: newStatus.order_status_code,
        note: newStatus.note ?? "",
        previous_status_code: currentStatus?.status_code ?? "",
        previous_note: currentStatus.note ?? "",
        updated_at: newDate,
        status_history: order.status_history
    };
}


function formatOrderResponse(result, cartItems, createdStatus, createdStatusHistory) {
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
                status_code: createdStatus.order_status_code,
                status_name: createdStatus.order_status_name,
                changed_by: createdStatusHistory.changed_by,
                changed_at: createdStatusHistory.changed_at,
                note: createdStatusHistory.note ?? ""
            },
        ],
        created_at: result.created_at.toISOString(),
    };
}

async function getAllOrders(query) {
    const { page, limit, status_code, sort_by, sort_order } = query;
    const offset = (page - 1) * limit;

    if (status_code != null) {
        const status = await orderRepository.getStatusByCode(status_code);
        if (!status) {
            throw new NotFoundError("Status not found");
        }
    }

    const sort = { [sort_by]: sort_order };

    const { count, orders } = await orderRepository.getAll({ offset, limit, status_code }, sort);

    return {
        page: page,
        limit: limit,
        total_items: count,
        total_pages: Math.ceil(count / limit),
        orders: orders.map(order => ({
            order_id: order.order_id,
            user_id: order.user_id,
            receiver_name: order.receiver_name,
            raw_total_price: order.raw_total_price,
            final_total_price: order.final_total_price,
            created_at: order.created_at,
            status: order.history[0].status.order_status_name
        }))
    };
}

async function getOrderDetail(order_id) {
    const order = await orderRepository.getDetail(order_id);
    if (!order) {
        throw new NotFoundError("Order not found");
    }

    return {
        order_id: order.order_id,
        user_id: order.user_id,
        receiver_name: order.receiver_name,
        phone: order.phone,
        address: order.address,
        raw_total_price: order.raw_total_price,
        final_total_price: order.final_total_price,
        created_at: order.created_at,
        status_history: order.history.map(h => ({
            status: {
                code: h.status.order_status_code,
                name: h.status.order_status_name
            },
            changed_at: h.changed_at,
            changed_by: h.changed_by,
            note: h.note
        })),
        items: order.items.map(i => ({
            name: i.product_variant.Product.name,
            description: i.product_variant.Product.description,
            sku: i.product_variant.sku,
            image_urls: i.product_variant.image_urls,
            options: i.product_variant.ProductVariantOption.map(pvo => ({
                name: pvo.ProductOptionValue.ProductOption.option_name,
                value: pvo.ProductOptionValue.value
            })),
            quantity: i.quantity,
            unit_price: i.unit_price,
            promotion: i.promotion,
            final_price: i.final_price,
            subtotal: i.subtotal
        }))
    };
}

module.exports = {
    createOrder,
    getOrders,
    updateOrderStatus,
    getAllOrders,
    getOrderDetail
};
