const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const {authenticate} = require('../middleware/authenticate');

// Tạo URL thanh toán
router.post('/vnpay',authenticate, paymentController.createPayment);

// VNPay gọi để xác nhận thanh toán (IPN)
router.get('/vnpay/ipn', paymentController.vnpayIpn);

// VNPay trả về kết quả thanh toán (Return)
router.get('/vnpay/return', paymentController.vnpayReturn);



// Stripe routes
router.post('/stripe', authenticate, paymentController.createStripePayment);

// Stripe webhook - KHÔNG dùng authenticate middleware
// Cần rawBody middleware đặc biệt
router.post('/stripe/webhook', 
    express.raw({ type: 'application/json' }),
    paymentController.stripeWebhook
);

module.exports = router;