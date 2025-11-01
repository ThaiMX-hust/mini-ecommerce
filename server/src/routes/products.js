const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

router.get('/', productController.getProducts);
router.get('/:productId', productController.getProductById);
router.post('/', upload.array('variants_images'), productController.addProduct);
router.patch('/:productId', upload.array('variants_images'), productController.updateProduct);
router.delete('/:productId', productController.deleteProduct);

module.exports = router;