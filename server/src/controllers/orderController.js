const { EmptyCartError, BadRequestError, OutOfStockError } = require('../errors/BadRequestError');
const { NotFoundError } = require('../errors/NotFoundError');
const { AppError } = require('../errors/AppError');

const { cleanText } = require('../utils/sanitizer');

const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    const userId = req.user.user_id;
    if (!userId) return res.status(404).json({ error: "No user found" });

    const cartId = req.user.cart_id;
    if (!cartId) return res.status(404).json({ error: "No cart found" });

    let { receiver_name, phone, address } = req.body;

    if (!receiver_name || !phone || !address) {
        return res.status(400).json({ error: "Missing or invalid fields" });
    }

    receiver_name = cleanText(receiver_name);
    address = cleanText(address);

    try {
        const newOrder = await orderService.createOrder(userId, cartId, receiver_name, phone, address);

        return res.status(201).json(newOrder);
    } catch (e) {
        console.log(e);
        if (e instanceof EmptyCartError) {
            return res.status(e.statusCode).json({ error: "Empty cart" });
        } else if (e instanceof OutOfStockError) {
            return res.status(e.statusCode).json({ error: e.message });
        } else if (e instanceof BadRequestError) {
            return res.status(e.statusCode).json({ error: "Bad request" });
        } else {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};

const getOrdersHistory = async (req, res) => {
    const userId = req.user.user_id;
    if (!userId) return res.status(404).json({ error: "No user found" });

    try {
        const orders = await orderService.getOrders(userId);

        return res.status(200).json(orders);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.order_id;
        const adminId = req.user.user_id;
        const statusCode = req.body.status_code;
        const note = req.body.note;

        const updated = await orderService.updateOrderStatus(orderId, statusCode, adminId, note);

        return res.status(200).json(updated);
    } catch (err) {
        console.log(err);
        if (err instanceof BadRequestError) {
            return res.status(err.statusCode).json({ error: err.message });
        } else if (err instanceof NotFoundError) {
            return res.status(err.statusCode).json({ error: err.message });
        } else {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};

const getAllOrders = async (req, res) => {
    try {
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
    } catch (err) {
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ error: err.message });
        } else {
            console.error("Error getting all orders", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const order_id = req.params.order_id;
        const result = await orderService.getOrderDetail(order_id);
        return res.status(200).json(result);
    } catch (err) {
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ error: err.message });
        } else {
            console.error("Error getting order detail", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};

module.exports = {
    createOrder,
    getOrdersHistory,
    updateOrderStatus,
    getAllOrders,
    getOrderDetail
};
