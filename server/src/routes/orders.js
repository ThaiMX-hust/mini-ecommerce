const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController')
const { authenticate, authenticateOptional } = require('../middleware/authenticate');


router.post('/', authenticate, orderController.createOrder)

router.get('/', authenticate, orderController.getOrdersHistory)


module.exports = router