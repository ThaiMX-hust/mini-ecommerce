const paymentService = require('../services/paymentService');

const createPayment = async (req, res) => {
    const { orderId } = req.body;

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
    try{
        const result = await paymentService.handleVnpayReturn(req.query);

        // Redirect user về frontend với kết quả thanh toán
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl =
            `${frontendUrl}/payment-result?success=${result.isSuccess}&message=${encodeURIComponent(result.message)}&orderId=${result.orderId}`;
        console.log('Redirecting to:', redirectUrl);
        // Redirect thay vì trả JSON
        res.redirect(redirectUrl);
    }
    catch(error){
        console.error('Error in vnpayReturn:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/payment-result?success=false&message=${encodeURIComponent('System error')}`);
    }
    
};


// ============= STRIPE CONTROLLERS =============

const createStripePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const result = await paymentService.createStripePaymentIntent({ orderId });
        
        res.status(200).json({
            clientSecret: result.clientSecret,
            paymentIntentId: result.paymentIntentId
        });
    } catch (error) {
        console.error('Error creating Stripe payment:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

const stripeWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    try {
        // rawBody được xử lý bởi middleware đặc biệt cho webhook
        const result = await paymentService.handleStripeWebhook(signature, req.body);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error handling Stripe webhook:', error);
        res.status(400).json({ error: 'Webhook error' });
    }
};

module.exports = {
    createPayment,
    vnpayIpn,
    vnpayReturn,
    // Stripe exports
    createStripePayment,
    stripeWebhook
};