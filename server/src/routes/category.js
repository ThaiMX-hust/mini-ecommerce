const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController')
const { authenticate, requireAdmin } = require('../middleware/authenticate');

router.post('/', authenticate, requireAdmin, categoryController.createCategories)
router.patch("/:category_id", authenticate, requireAdmin, categoryController.updateCategory);
router.delete("/:category_id", authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router