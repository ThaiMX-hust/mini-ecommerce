const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

const { authenticate, requireAdmin, authenticateOptional } = require('../middleware/authenticate');
const upload = require('../middleware/upload');


router.get('/', authenticateOptional, productController.getProducts);
router.get('/:product_id', authenticateOptional, productController.getProductById);
router.post('/', authenticate, requireAdmin, upload.array('variants_images'), productController.addProduct);
router.patch('/:product_id', authenticate, requireAdmin, upload.array('variants_images'), productController.updateProduct);
router.patch('/:product_id/options/:product_option_id', authenticate, requireAdmin, productController.updateProductOption);
router.patch('/:product_id/variants/:product_variant_id', authenticate, requireAdmin, upload.array('variants_images'), productController.updateProductVariant);
router.delete('/:product_id', authenticate, requireAdmin, productController.deleteProduct);
router.delete('/:product_id/variants/:product_variant_id', authenticate, requireAdmin, productController.deleteProductVariant);
router.post('/:product_id/reviews', authenticate, productController.addReview);
router.get('/:product_id/reviews', productController.getReviews);
router.get('/:product_id/soft-delete', authenticate, requireAdmin, productController.softDelete);
router.get('/:product_id/restore', authenticate, requireAdmin, productController.restore);

module.exports = router;
