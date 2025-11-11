const paymentService = require('../services/paymentService');

const createPayment = async (req, res) => {
    try{
        const {amount, orderInfo, orderId} = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        const paymentUrl = await paymentService.createPayment({amount, orderInfo, orderId, ipAddress});
        res.status(200).json({url: paymentUrl});
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};

const vnpayIpn = async (req, res) => {
    try{
        const result = await paymentService.handleVnpayIpn(req.query);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error handling vnpay ipn:', error);
        res.status(500).json({error: 'Internal server error'});
    }
};
const vnpayReturn = async (req, res) => {
    try{
        const result = await paymentService.handleVnpayReturn(req.query);
        const redirecUrl =`http://localhost:3000/payment-result?success=${result.isSuccess}&message=${result.message}`
        res.status(200).json(result);
    } catch (error) {
        console.error('Error handling vnpay return:', error);
        const redirecUrl =`http://localhost:3000/payment-result?success=false&message=Error`
        res.status(200).json({redirectUrl});
    }
};

module.exports = {
    createPayment,
    vnpayIpn,    
    vnpayReturn,
    }
