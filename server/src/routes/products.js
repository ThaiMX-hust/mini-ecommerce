const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/validators/jwtTokenValidator');
const { verifyRole } = require('../middleware/validators/roleValidator');

router.get('/', verifyToken, verifyRole('admin') ,productController.getProducts);
router.get('/:productId', verifyToken, verifyRole('admin'), productController.getProductById);
router.post('/', verifyToken, verifyRole('admin'), upload.array('variant_images'), productController.addProduct);

module.exports = router;
