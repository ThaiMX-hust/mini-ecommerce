const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateItemQuantityFromCart, deleteItemFromCart } = require('../controllers/cartController')
const { verifyToken } = require('../middleware/validators/jwtTokenValidator');
const { verifyRole } = require('../middleware/validators/roleValidator');
const { cartTest } = require('../controllers/cartController');

router.get('/', verifyToken, verifyRole('customer'), cartTest);

router.post('/', verifyToken, verifyRole('customer'), addToCart)

router.patch('/:cart_item_id', verifyToken, verifyRole('customer'), updateItemQuantityFromCart)

router.delete('/:cart_item_id', verifyToken, verifyRole('customer'), deleteItemFromCart)

module.exports = router;