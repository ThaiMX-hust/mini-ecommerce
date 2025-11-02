const express = require('express');
const router = express.Router();
const { register, updateUser, registerAdmin, getUser } = require('../controllers/userController');
const upload = require('../middleware/upload');
const { authenticate, requireAdmin } = require('../middleware/authenticate');

router.get('/:user_id', authenticate, getUser);

router.post('/', upload.single('avatar'), register);

router.post('/admin', authenticate, requireAdmin, upload.single('avatar'), registerAdmin);

router.patch('/:user_id', authenticate, updateUser)

module.exports = router;