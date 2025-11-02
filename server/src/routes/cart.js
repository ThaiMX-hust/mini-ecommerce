const express = require('express');
const router = express.Router();

const cartControler = require('../controllers/cartController')
const { authenticate, authenticateOptional } = require('../middleware/authenticate');

router.get('/', authenticateOptional, cartControler.cartTest);

router.post('/', authenticate, cartControler.addToCart)

router.patch('/:cart_item_id', authenticate, cartControler.updateItemQuantityFromCart)

router.delete('/:cart_item_id', authenticate, cartControler.deleteItemFromCart)

module.exports = router;