const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');

function sortObject (obj) {
    let sorted = {};
    let str = [];
    for (let key in obj) {
        if (Object.hasOwn(obj, key)) {
            str.push(encodeURIComponent(key));
        }


    }
    str.sort();
    for (let i = 0; i < str.length; i++) {
        sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, "+");
    }
    return sorted;
}

const createPaymentUrl = async ({amount, orderInfo, orderId, ipAddr}) =>{
    try{
        if (!process.env.VNP_TMNCODE || !process.env.VNP_HASHSECRET) {
            throw new Error('VNPay configuration is missing in environment variables');
        }
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');

    let vnpParams = {};
    vnpParams['vnp_Version'] = '2.1.0';
    vnpParams['vnp_Command'] = 'pay';
    vnpParams['vnp_TmnCode'] = tmnCode;
    vnpParams['vnp_Locale'] = 'vn';
    vnpParams['vnp_CurrCode'] = 'VND';
    vnpParams['vnp_TxnRef'] = orderId;
    vnpParams['vnp_OrderInfo'] = orderInfo;
    vnpParams['vnp_OrderType'] = 'other';
    vnpParams['vnp_Amount'] = amount * 100;
    vnpParams['vnp_ReturnUrl'] = returnUrl;
    vnpParams['vnp_IpAddr'] = ipAddr;
    vnpParams['vnp_CreateDate'] = createDate;
    vnpParams = sortObject(vnpParams);
    const signData = qs.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnpParams['vnp_SecureHash'] = signed;

    vnpUrl += '?' + qs.stringify(vnpParams, { encode: false });
    return vnpUrl;
    }
    catch (error){
        console.error('Error creating payment URL: ', error);
        throw error;

    }
    
} 

const handleVnpayIpn =async (vnp_Params) =>{
    let vnp_SecureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASHSECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    if (vnp_SecureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];

        // TODO: Kiểm tra CSDL xem đơn hàng có tồn tại không
        // TODO: Kiểm tra số tiền của đơn hàng có khớp với vnp_Amount không
        if (rspCode === '00') {
            // TODO: Cập nhật trạng thái đơn hàng là "Đã thanh toán"
            console.log(`Payment for order ${orderId} is successful`);
            return { RspCode: '00', Message: 'Success' };
        } else {
             // TODO: Cập nhật trạng thái đơn hàng là "Thanh toán thất bại"
            console.log(`Payment for order ${orderId} failed`);
            return { RspCode: '00', Message: 'Success' }; // Vẫn trả về success để VNPay không gửi lại IPN
        }
    } else {

        throw new Error('Invalid signature');
    }
}

const handleVnpayReturn = async (vnp_Params) =>{
    let vnp_SecureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASHSECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (vnp_SecureHash === signed) {
        if(vnp_Params['vnp_ResponseCode'] === '00'){
            return { isSuccess: true, message: 'Payment successful' };
        }
        else{            
            return { isSuccess: false, message: 'Payment failed' };
        }
    } else {
        return { isSuccess: false, message: 'Invalid signature' };
    }
}
module.exports = {
    createPayment: createPaymentUrl,
    handleVnpayIpn: handleVnpayIpn,
    handleVnpayReturn: handleVnpayReturn,
}
