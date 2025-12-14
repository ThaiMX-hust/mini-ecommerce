const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const { authenticate, authenticateOptional, requireAdmin } = require('../middleware/authenticate');


router.post('/', authenticate, orderController.createOrder);

router.get('/', authenticate, orderController.getOrdersHistory);

router.patch('/:order_id', authenticate, requireAdmin, orderController.updateOrderStatus);

router.get('/all', authenticate, requireAdmin, orderController.getAllOrders);

router.get('/:order_id/detail', authenticate, requireAdmin, orderController.getOrderDetail);

router.post('/:order_id/cancel', authenticate, orderController.cancelOrder);

module.exports = router;
