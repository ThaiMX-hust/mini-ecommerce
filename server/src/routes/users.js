const express = require('express');
const router = express.Router();
const { register, updateUserByID } = require('../controllers/userController');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/validators/jwtTokenValidator');
const { verifyRole } = require('../middleware/validators/roleValidator');
const { changePassword } = require('../controllers/authController');

router.get('/users/:user_id', verifyToken, verifyRole('customer'), changePassword);

router.post('/', upload.single('avatar'), register);

router.patch('/users/:user_id', verifyToken, verifyRole('customer'), updateUserByID)

module.exports = router;