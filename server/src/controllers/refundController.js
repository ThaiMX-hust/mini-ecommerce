const refundService = require('../services/refundService');
const { cleanText } = require('../utils/sanitizer');

const { AppError } = require('../errors/AppError');
const { BadRequestError } = require('../errors/BadRequestError');

const requestRefund = async (req, res) => {
    let { order_id, reason } = req.body;
    if (order_id == null || reason == null) {
        throw new BadRequestError('Missing field(s)');
    }

    reason = cleanText(reason);

    const result = await refundService.addRefundRequest(order_id, reason);
    return res.status(201).json(result);
};

const getUserRefundList = async (req, res) => {
    const user_id = req.user.user_id;

    const result = await refundService.getUserRefundList(user_id);
    return res.status(200).json(result);
};

const getAllRefundsForAdmin = async (req, res) => {
    const result = await refundService.getAllRefundsForAdmin();
    return res.status(200).json(result);
};

const approveRefund = async (req, res) => {
    const refund_id = req.params.refund_id;
    const admin_id = req.user.user_id;
    const note = req.body.note;

    const result = await refundService.approveRefund(refund_id, admin_id, note);
    return res.status(200).json(result);
};

const rejectRefund = async (req, res) => {
    const refund_id = req.params.refund_id;
    const admin_id = req.user.user_id;
    const note = req.body.note;

    const result = await refundService.rejectRefund(refund_id, admin_id, note);
    return res.status(200).json(result);
};

module.exports = {
    requestRefund,
    getUserRefundList,
    getAllRefundsForAdmin,
    approveRefund,
    rejectRefund
};
