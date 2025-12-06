const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const { authenticate, requireAdmin } = require('../middleware/authenticate');

router.post('/', authenticate, refundController.requestRefund);
router.get('/', authenticate, refundController.getUserRefundList);
router.get('/all', authenticate, requireAdmin, refundController.getAllRefundsForAdmin);
router.post('/:refund_id/approve', authenticate, requireAdmin, refundController.approveRefund);
router.post('/:refund_id/reject', authenticate, requireAdmin, refundController.rejectRefund);

module.exports = router;
