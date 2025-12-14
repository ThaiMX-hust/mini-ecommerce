const paymentService = require('../services/paymentService');

const createPayment = async (req, res) => {
    const { amount, orderInfo, orderId } = req.body;

    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        '127.0.0.1';

    // Xử lý IPv6 localhost
    if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
        ipAddr = '127.0.0.1';
    }

    // Lấy IP đầu tiên nếu qua proxy
    if (ipAddr.includes(',')) {
        ipAddr = ipAddr.split(',')[0].trim();
    }

    const paymentUrl = await paymentService.createPayment({
        amount,
        orderInfo,
        orderId,
        ipAddr
    });

    res.status(200).json({ url: paymentUrl });
};

const vnpayIpn = async (req, res) => {
    try {
        const result = await paymentService.handleVnpayIpn(req.query);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error handling vnpay ipn:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const vnpayReturn = async (req, res) => {
    const result = await paymentService.handleVnpayReturn(req.query);

    // Redirect user về frontend với kết quả thanh toán
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl =
        `${frontendUrl}/payment-result?success=${result.isSuccess}&message=${encodeURIComponent(result.message)}&orderId=${result.orderId}`;

    // Redirect thay vì trả JSON
    res.redirect(redirectUrl);
};

module.exports = {
    createPayment,
    vnpayIpn,
    vnpayReturn,
};
