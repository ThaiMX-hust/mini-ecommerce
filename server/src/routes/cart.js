const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController')
const { authenticate, authenticateOptional } = require('../middleware/authenticate');

router.get('/', authenticateOptional, cartController.getCart);

router.post('/', authenticate, cartController.addToCart)

router.patch('/:cart_item_id', authenticate, cartController.updateItemQuantityFromCart)

router.delete('/:cart_item_id', authenticate, cartController.deleteItemFromCart)

module.exports = router;