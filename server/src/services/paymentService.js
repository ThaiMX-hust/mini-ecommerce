const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const orderRepository = require('../repositories/ordersRepository'); 

// Hàm sortObject chuẩn: Sắp xếp theo key alphabet và trả về object đã sort
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    // Lấy key gốc
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(key);
        }
    }
    // Sort key gốc
    str.sort();
    // Gán giá trị vào object mới theo thứ tự key đã sort
    for (key = 0; key < str.length; key++) {
        // Encode giá trị theo chuẩn VNPay (space thành dấu +)
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const createPaymentUrl = async ({ amount, orderInfo, orderId, ipAddr }) => {
    try {
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

        // Đảm bảo IP hợp lệ (nếu chạy localhost ::1 có thể gây lỗi bên VNPay, nên fallback về 127.0.0.1)
        const finalIp = ipAddr === '::1' ? '127.0.0.1' : ipAddr;

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
        vnpParams['vnp_IpAddr'] = finalIp;
        vnpParams['vnp_CreateDate'] = createDate;

        vnpParams = sortObject(vnpParams);

        // Sử dụng qs với encode: false vì sortObject đã encode rồi
        const signData = qs.stringify(vnpParams, { encode: false });
        
        const hmac = crypto.createHmac("sha512", secretKey);
        // SỬA LỖI: Dùng Buffer.from thay vì new Buffer.from
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        vnpParams['vnp_SecureHash'] = signed;
        vnpUrl += '?' + qs.stringify(vnpParams, { encode: false });

        return vnpUrl;
    } catch (error) {
        console.error('Error creating payment URL: ', error);
        throw error;
    }
}

const handleVnpayIpn = async (vnp_Params) => {
    // Encode lại các giá trị nhận được từ URL (vì express thường tự decode)
    // Logic xác thực chữ ký
    let vnp_SecureHash = vnp_Params['vnp_SecureHash'];
    let vnp_SecureHashType = vnp_Params['vnp_SecureHashType'];

    // Xóa 2 tham số hash ra khỏi object trước khi tính toán
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp lại params
    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASHSECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    
    const hmac = crypto.createHmac("sha512", secretKey);
    // SỬA LỖI: Dùng Buffer.from
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (vnp_SecureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const amount = vnp_Params['vnp_Amount']/100;
        const transactionNo= vnp_Params['vnp_TransactionNo'];

        try{
            const prisma = orderRepository.getPrismaClientInstance();

            const order = await prisma.order.findUnique({
                where: {order_id: orderId}
            });
            if(!order){
                console.error(`Order ${orderId} not found`);
                return {RspCode: '01', Message:'Order not found'};
            }
            
            if(Number(order.final_total_price) != amount){
                console.error(`Amount mismatch`);
                return {RspCode:'04', Message: 'Invalid amount'};
            }

            if(rspCode == '00'){
                // thanh toan thanh cong
                const confirmedStatus = await orderRepository.getStatusByCode("CONFIRMED");
                if(!confirmedStatus){
                    console.error("CONFIRM status not found in database");
                    return {RspCode:'99', Message:'System error'};
                }
                await prisma.orderStatusHistory.create({
                    data: {
                        order_id: orderId,
                        order_status_id: confirmedStatus.order_status_id,
                        changed_by:null,
                        note: `Payment successful via VNPay. Transaction: ${transactionNo}`
                    }
                });
                console.log(`Payment for order ${orderId} is successfull`);
                return {RspCode: '00', Message:'Success'};
            }
            else{
                // thanh toan that bai
                const cancelledStatus = await orderRepository.getStatusByCode("CANCELLED");
                if(!cancelledStatus){
                    console.error('CANCELLED status not found in database');
                    return {RspCode: '99', Message:'System error'};
                }
                await prisma.orderStatusHistory.create({
                    data: {
                        order_id: orderId,
                        order_status_id: cancelledStatus.order_status_id,
                        changed_by: null,
                        note: `Payment failed via VNPay. Response code: ${rspCode}`
                    }
                });
                console.log(`Payment for order ${orderId} failed with code ${rspCode}`);
                return {RspCode: '00', Message:'Success'};
            }
        }
        catch (error){
            console.error(' Error handling VNPay IPN:', error);
            return { RspCode: '99', Message: 'System error' };
        }
    } else {
        // Trường hợp sai chữ ký, trả về mã lỗi 97
        return { RspCode: '97', Message: 'Checksum failed' };
    }
}

const handleVnpayReturn = async (vnp_Params) => {
    let vnp_SecureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASHSECRET;
    const signData = qs.stringify(vnp_Params, { encode: false });
    
    const hmac = crypto.createHmac("sha512", secretKey);
    // SỬA LỖI: Dùng Buffer.from
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (vnp_SecureHash === signed) {
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            return { isSuccess: true, message: 'Payment successful' };
        } else {
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