const express = require('express');
const router = express.Router();
const { register, updateUserByID, registerAdmin } = require('../controllers/userController');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/validators/jwtTokenValidator');
const { verifyRole } = require('../middleware/validators/roleValidator');
const { changePassword } = require('../controllers/authController');

router.get('/:user_id', verifyToken, verifyRole('customer'), changePassword);

router.post('/', upload.single('avatar'), register);

router.post('/admin', upload.single('avatar'), registerAdmin);

router.patch('/:user_id', verifyToken, verifyRole('customer'), updateUserByID)

module.exports = router;