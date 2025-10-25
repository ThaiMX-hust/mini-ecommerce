const express = require('express');
const router = express.Router();
const { register } = require('../controllers/userController');
const upload = require('../middleware/upload');

router.post('/', upload.single('avatar'), register);

module.exports = router;