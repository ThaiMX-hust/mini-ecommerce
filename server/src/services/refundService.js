const refundRepository = require('../repositories/refundRepository');
const orderRepository = require('../repositories/ordersRepository');
const userRepository = require('../repositories/userRepository');

const { NotFoundError } = require('../errors/NotFoundError');
const { BadRequestError } = require('../errors/BadRequestError');
const { ConflictError } = require('../errors/ConflictError');

async function addRefundRequest(order_id, reason) {
    const order = await orderRepository.getWithStatus(order_id);
    if (!order) {
        throw new NotFoundError("Order not found");
    }

    const refunds = await refundRepository.getByOrderId(order_id);
    if (refunds.find(r => r.status !== 'REJECTED')) {
        throw new ConflictError("Duplicated refund request");
    }

    const status = order.history.reduce((latest, o) => o.changed_at > latest.changed_at ? o : latest);
    switch (status.status.order_status_code) {
        case "CREATED":
        case "CANCELLED":
        case "REFUNDED":
            throw new BadRequestError("Invalid operation");
    }

    const amount = order.final_total_price;

    const refund = await refundRepository.add({ order_id, reason, amount });
    return {
        refund_id: refund.refund_id,
        order_id: refund.order_id,
        reason: refund.reason,
        amount: refund.amount,
        status: refund.status,
        created_at: refund.created_at
    };
}

async function getUserRefundList(user_id) {
    const user = await userRepository.getUserById(user_id);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    const refunds = await refundRepository.getByUserId(user_id);
    return refunds.map(r => ({
        refund_id: r.refund_id,
        order_id: r.order_id,
        reason: r.reason,
        amount: r.amount,
        status: r.status,
        created_at: r.created_at,
        processed_at: r.processed_at,
        note: r.note
    }));
}

async function getAllRefundsForAdmin() {
    const refunds = await refundRepository.getAll();
    return refunds.map(r => ({
        refund_id: r.refund_id,
        order_id: r.order_id,
        reason: r.reason,
        amount: r.amount,
        status: r.status,
        created_at: r.created_at,
        processed_at: r.processed_at,
        admin_id: r.admin_id,
        note: r.note
    }));
}

async function approveRefund(refund_id, admin_id, note) {
    const refund = await refundRepository.getById(refund_id);
    if (!refund)
        throw new NotFoundError("Refund request not found");

    if (refund.status !== 'PENDING')
        throw new BadRequestError("Invalid operation");

    refund.status = 'APPROVED';
    refund.processed_at = new Date();
    refund.admin_id = admin_id;
    refund.note = note;
    await refundRepository.update(refund_id, refund);

    return {
        refund_id: refund.refund_id,
        order_id: refund.order_id,
        reason: refund.reason,
        amount: refund.amount,
        status: refund.status,
        created_at: refund.created_at,
        processed_at: refund.processed_at,
        admin_id: refund.admin_id,
        note: refund.note
    };
}

async function rejectRefund(refund_id, admin_id, note) {
    const refund = await refundRepository.getById(refund_id);
    if (!refund)
        throw new NotFoundError("Refund request not found");

    if (refund.status !== 'PENDING')
        throw new BadRequestError("Invalid operation");

    refund.status = 'REJECTED';
    refund.processed_at = new Date();
    refund.admin_id = admin_id;
    refund.note = note;
    await refundRepository.update(refund_id, refund);

    return {
        refund_id: refund.refund_id,
        order_id: refund.order_id,
        reason: refund.reason,
        amount: refund.amount,
        status: refund.status,
        created_at: refund.created_at,
        processed_at: refund.processed_at,
        admin_id: refund.admin_id,
        note: refund.note
    };
}

module.exports = {
    addRefundRequest,
    getUserRefundList,
    getAllRefundsForAdmin,
    approveRefund,
    rejectRefund
};
