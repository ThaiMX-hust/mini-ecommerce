const express = require('express');
const router = express.Router();
const { login, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');

router.post('/login', login);
router.post('/change-password', authenticate, changePassword);

module.exports = router;