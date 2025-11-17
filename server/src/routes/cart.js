const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController')
const { authenticate } = require('../middleware/authenticate');

router.get('/', authenticate, cartController.getCart);

router.post('/', authenticate, cartController.addToCart)

router.patch('/:cart_item_id', authenticate, cartController.updateItemQuantityFromCart)

router.delete('/:cart_item_id', authenticate, cartController.deleteItemFromCart)

module.exports = router;