const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

const { authenticate, requireAdmin, authenticateOptional } = require('../middleware/authenticate');
const upload = require('../middleware/upload');


router.get('/', authenticateOptional, productController.getProducts);
router.get('/:productId', authenticateOptional, productController.getProductById);
router.post('/', authenticate, requireAdmin, upload.array('variants_images'), productController.addProduct);
router.patch('/:productId', authenticate, requireAdmin, upload.array('variants_images'), productController.updateProduct);
router.delete('/:productId', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;
