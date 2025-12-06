const refundService = require('../services/refundService');

const { AppError } = require('../errors/AppError');
const { BadRequestError } = require('../errors/BadRequestError');

const requestRefund = async (req, res) => {
    try {
        const { order_id, reason } = req.body;
        if (order_id == null || reason == null) {
            throw new BadRequestError('Missing field(s)');
        }

        const result = await refundService.addRefundRequest(order_id, reason);

        return res.status(201).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        } else {
            console.error('Error requesting refund:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

const getUserRefundList = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const result = await refundService.getUserRefundList(user_id);
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        } else {
            console.error('Error getting user refund request list:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

const getAllRefundsForAdmin = async (req, res) => {
    try {
        const result = await refundService.getAllRefundsForAdmin();
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        } else {
            console.error('Error getting all refund requests:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

const approveRefund = async (req, res) => {
    try {
        const refund_id = req.params.refund_id;
        const admin_id = req.user.user_id;
        const note = req.body.note;

        const result = await refundService.approveRefund(refund_id, admin_id, note);
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        } else {
            console.error('Error approving refund request:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

const rejectRefund = async (req, res) => {
    try {
        const refund_id = req.params.refund_id;
        const admin_id = req.user.user_id;
        const note = req.body.note;

        const result = await refundService.rejectRefund(refund_id, admin_id, note);
        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        } else {
            console.error('Error rejecting refund request:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = {
    requestRefund,
    getUserRefundList,
    getAllRefundsForAdmin,
    approveRefund,
    rejectRefund
};
