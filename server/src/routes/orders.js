const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController')
const { authenticate, authenticateOptional } = require('../middleware/authenticate');


router.post('/', authenticate, orderController.createOrder)


module.exports = router