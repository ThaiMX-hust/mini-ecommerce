const router = require('express').Router();
const { authenticate, requireAdmin, authenticateOptional } = require('../middleware/authenticate');
const statsController = require('../controllers/statsController');

router.get('/revenue', authenticate, requireAdmin, statsController.getRevenueStats);

module.exports = router;