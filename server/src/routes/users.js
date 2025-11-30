const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const { authenticate, requireAdmin } = require('../middleware/authenticate');

router.get('/:user_id', authenticate, userController.getUser);

router.post('/', upload.single('avatar'), userController.register);

router.post('/admin', authenticate, requireAdmin, upload.single('avatar'), userController.registerAdmin);

router.patch('/:user_id', authenticate, upload.single('avatar'), userController.updateUser);

router.get('/', authenticate, requireAdmin, userController.getUserList);

router.patch('/:user_id/lock', authenticate, requireAdmin, userController.updateLockedState);

module.exports = router;