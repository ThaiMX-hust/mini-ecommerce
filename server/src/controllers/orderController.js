const orderService = require('../services/orderService');
const { cleanText } = require('../utils/sanitizer');

const { BadRequestError } = require('../errors/BadRequestError');

const createOrder = async (req, res) => {
    const userId = req.user.user_id;
    if (!userId)
        throw new BadRequestError("Missing user id");

    const cartId = req.user.cart_id;
    if (!cartId)
        throw new BadRequestError("Missing cart id");

    let { receiver_name, phone, address } = req.body;
    if (!receiver_name || !phone || !address) {
        throw new BadRequestError("Missing or invalid fields");
    }

    receiver_name = cleanText(receiver_name);
    address = cleanText(address);

    const newOrder = await orderService.createOrder(userId, cartId, receiver_name, phone, address);
    return res.status(201).json(newOrder);
};

const getOrdersHistory = async (req, res) => {
    const userId = req.user.user_id;
    if (!userId)
        throw new BadRequestError("Missing user id");

    const orders = await orderService.getOrders(userId);
    return res.status(200).json(orders);
};

const updateOrderStatus = async (req, res) => {
    const orderId = req.params.order_id;
    const adminId = req.user.user_id;
    const statusCode = req.body.status_code;
    const note = req.body.note;

    if (!statusCode) {
        throw new BadRequestError("Invalid status");
    }

    const updated = await orderService.updateOrderStatus(orderId, statusCode, adminId, note);
    return res.status(200).json(updated);
};

const getAllOrders = async (req, res) => {
    let { page, limit, status_code, sort_by = "created_at", sort_order = "desc" } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;

    if (page <= 0 || limit <= 0) {
        throw new BadRequestError("Invalid pagination");
    }

    const validSortByValues = ["created_at", "final_total_price", "raw_total_price"];
    if (!validSortByValues.includes(sort_by)) {
        throw new BadRequestError(`Invalid sort_by value: ${sort_by}`);
    }

    const validSortOrderValues = ["asc", "desc"];
    if (!validSortOrderValues.includes(sort_order)) {
        throw new BadRequestError(`Invalid sort_order value: "${sort_order}"`);
    }

    const result = await orderService.getAllOrders({ page, limit, status_code, sort_by, sort_order });
    return res.status(200).json(result);
};

const getOrderDetail = async (req, res) => {
    const order_id = req.params.order_id;
    const result = await orderService.getOrderDetail(order_id);
    return res.status(200).json(result);
};

const cancelOrder = async (req, res) => {
    const order_id = req.params.order_id;
    const user_id = req.user.user_id;
    let reason = req.body.reason;

    if (!reason)
        throw new BadRequestError("Missing fields");

    reason = cleanText(reason);

    await orderService.cancelOrder(user_id, order_id, reason);
    return res.status(200).send("Ok");
};

module.exports = {
    createOrder,
    getOrdersHistory,
    updateOrderStatus,
    getAllOrders,
    getOrderDetail,
    cancelOrder
};
