const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController')
const { authenticate, authenticateOptional, requireAdmin } = require('../middleware/authenticate');


router.post('/', authenticate, orderController.createOrder)

router.get('/', authenticate, orderController.getOrdersHistory)

router.patch('/:order_id', authenticate, requireAdmin, orderController.updateOrderStatus)

module.exports = router