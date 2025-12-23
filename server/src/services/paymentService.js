const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const userRepository = require('../repositories/userRepository');
const orderRepository = require('../repositories/ordersRepository');
const emailService = require('../services/emailService');

// sortObject: Sắp xếp theo key alphabet và trả về object đã sort
function sortObject(obj) {
        var sorted = {};
        var str = [];
        var key;
        for (key in obj){
            if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }

const createPaymentUrl = async ({ orderId, ipAddr }) => {
    if (!process.env.VNP_TMNCODE || !process.env.VNP_HASHSECRET) {
        throw new Error('VNPay configuration is missing in environment variables');
    }
    
    // LẤY THÔNG TIN ĐơN HÀNG TỪ DATABASE
    const prisma = orderRepository.getPrismaClientInstance();
    const order = await prisma.order.findUnique({
        where: { order_id: orderId },
        include: {
            history: {
                include: {
                    status: true
                },
                orderBy: {
                    changed_at: 'desc'
                }
            }
        }
    });

    if (!order) {
        throw new Error('Order not found');
    }
    //kiểm tra order status
    const currentStatus = order.history[0]?.status.order_status_code;
    if (currentStatus !== 'CREATED') {
        throw new Error('Order has already been paid or cancelled');
    }

    // LẤY AMOUNT VÀ ORDER INFO TỪ DATABASE
    const amount = Math.round(Number(order.final_total_price) * 100);
    const cleanUuid = orderId.replace(/-/g, "");
    const orderInfo = `Thanh toan don hang ${cleanUuid}`;

    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

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
    vnpParams['vnp_Amount'] = amount;
    vnpParams['vnp_ReturnUrl'] = returnUrl;
    vnpParams['vnp_IpAddr'] = finalIp;
    vnpParams['vnp_CreateDate'] = createDate;
    vnpParams['vnp_ExpireDate'] = expireDate;

    vnpParams = sortObject(vnpParams);

    const signData = qs.stringify(vnpParams, { encode: false });

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    vnpParams['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnpParams, { encode: false });

    return vnpUrl;
};




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
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (vnp_SecureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const amount = vnp_Params['vnp_Amount'] / 100;
        const transactionNo = vnp_Params['vnp_TransactionNo'];

        try {
            const prisma = orderRepository.getPrismaClientInstance();

            const order = await prisma.order.findUnique({
                where: { order_id: orderId },
                include: {
                    history: {
                        include: { status: true },
                        orderBy: { changed_at: 'desc' },
                        take: 1
                    }
                }
            });

            if (!order) {
                console.error(`Order ${orderId} not found`);
                return { RspCode: '01', Message: 'Order not found' };
            }

            if (Number(order.final_total_price) != amount) {
                console.error(`Amount mismatch`);
                return { RspCode: '04', Message: 'Invalid amount' };
            }

            const currentStatus = order.history[0]?.status.order_status_code;
            if (currentStatus === 'CONFIRMED' || currentStatus === 'CANCELLED') {
                console.log(`Order ${orderId} already updated. Status: ${currentStatus}`);
                return { RspCode: '02', Message: 'Order already confirmed' };
            }

            if (rspCode == '00') {
                // thanh toan thanh cong
                const confirmedStatus = await orderRepository.getStatusByCode("CONFIRMED");
                if (!confirmedStatus) {
                    console.error("CONFIRM status not found in database");
                    return { RspCode: '99', Message: 'System error' };
                }

                console.log(confirmedStatus);
                await prisma.orderStatusHistory.create({
                    data: {
                        order_id: orderId,
                        order_status_id: confirmedStatus.order_status_id,
                        changed_by: null,
                        note: `Payment successful via VNPay. Transaction: ${transactionNo}`
                    }
                });
                await prisma.order.update({
                    where: { order_id: orderId },
                    data: { updated_at: new Date() }
                });


                const order = await orderRepository.getDetail(orderId);
                const userEmail = await userRepository.getUserById(order.user_id, prisma);

                await emailService.sendPurchaseSuccessfullyEmail(userEmail, order);

                console.log(`Payment for order ${orderId} is successfull`);
                return { RspCode: '00', Message: 'Success' };
            }
            else {
                // thanh toan that bai
                const cancelledStatus = await orderRepository.getStatusByCode("CANCELLED");
                if (!cancelledStatus) {
                    console.error('CANCELLED status not found in database');
                    return { RspCode: '99', Message: 'System error' };
                }
                await prisma.orderStatusHistory.create({
                    data: {
                        order_id: orderId,
                        order_status_id: cancelledStatus.order_status_id,
                        changed_by: null,
                        note: `Payment failed via VNPay. Response code: ${rspCode}`
                    }
                });

                // Hoàn lại stock
                const orderWithItems = await prisma.order.findUnique({
                    where: { order_id: orderId },
                    include: { items: true }
                });

                for (const item of orderWithItems.items) {
                    await prisma.productVariant.updateMany({
                        where: { product_variant_id: item.product_variant_id },
                        data: {
                            stock_quantity: { increment: item.quantity },
                            version: { increment: 1 }
                        }
                    });
                }

                await prisma.order.update({
                    where: { order_id: orderId },
                    data: { updated_at: new Date() }
                });

                console.log(`Payment for order ${orderId} failed with code ${rspCode}`);
                return { RspCode: '00', Message: 'Success' };
            }
        }
        catch (error) {
            console.error(' Error handling VNPay IPN:', error);
            return { RspCode: '99', Message: 'System error' };
        }
    } else {
        // Trường hợp sai chữ ký, trả về mã lỗi 97
        return { RspCode: '97', Message: 'Checksum failed' };
    }
};





const handleVnpayReturn = async (vnp_Params) => {
    let vnp_SecureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];


    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASHSECRET;
    const tmnCode = process.env.VNP_TMNCODE;
    const signData = qs.stringify(vnp_Params, { encode: false });

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    const orderId = vnp_Params['vnp_TxnRef'];


    console.log('VNPay Return - Signature Verification:', {
        orderId,
        receivedHash: vnp_SecureHash,
        calculatedHash: signed,
        isValid: vnp_SecureHash === signed
    });

    if (vnp_SecureHash === signed) {
    
        if (vnp_Params['vnp_ResponseCode'] === '00') {

            return { isSuccess: true, message: 'Payment successful', orderId };
        } else {
            return { isSuccess: false, message: 'Payment failed',orderId };
        }
    } else {
        return { isSuccess: false, message: 'Invalid signature', orderId };
    }
};
// ============= STRIPE PAYMENT FUNCTIONS =============

/**
 * Tạo Stripe Payment Intent
 */
const createStripePaymentIntent = async ({ orderId }) => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe configuration is missing in environment variables');
    }

    const prisma = orderRepository.getPrismaClientInstance();
    const order = await prisma.order.findUnique({
        where: { order_id: orderId },
        include: {
            history: {
                include: { status: true },
                orderBy: { changed_at: 'desc' }
            },
            user: true
        }
    });

    if (!order) {
        throw new Error('Order not found');
    }

    const currentStatus = order.history[0]?.status.order_status_code;
    if (currentStatus !== 'CREATED') {
        throw new Error('Order has already been paid or cancelled');
    }

    // Stripe yêu cầu amount tính bằng cents (VNĐ không có decimal)
    const amount = Math.round(Number(order.final_total_price));

    // Tạo Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'vnd',
        metadata: {
            order_id: orderId,
            user_id: order.user_id
        },
        description: `Payment for order ${orderId}`,
        receipt_email: order.user.email,
        automatic_payment_methods: {
            enabled: true,
        }
    });

    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
    };
};

/**
 * Xử lý Stripe Webhook
 */
const handleStripeWebhook = async (signature, rawBody) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    try {
        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        );

        const prisma = orderRepository.getPrismaClientInstance();

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata.order_id;

                // Kiểm tra order tồn tại
                const order = await prisma.order.findUnique({
                    where: { order_id: orderId },
                    include: {
                        history: {
                            include: { status: true },
                            orderBy: { changed_at: 'desc' },
                            take: 1
                        }
                    }
                });

                if (!order) {
                    console.error(`Order ${orderId} not found`);
                    return { received: false, error: 'Order not found' };
                }

                const currentStatus = order.history[0]?.status.order_status_code;
                if (currentStatus === 'CONFIRMED' || currentStatus === 'CANCELLED') {
                    console.log(`Order ${orderId} already processed`);
                    return { received: true };
                }

                // Cập nhật trạng thái thành CONFIRMED
                const confirmedStatus = await orderRepository.getStatusByCode('CONFIRMED');
                if (!confirmedStatus) {
                    console.error('CONFIRMED status not found');
                    return { received: false, error: 'Status not found' };
                }

                await prisma.orderStatusHistory.create({
                    data: {
                        order_id: orderId,
                        order_status_id: confirmedStatus.order_status_id,
                        changed_by: null,
                        note: `Payment successful via Stripe. Payment Intent: ${paymentIntent.id}`
                    }
                });

                await prisma.order.update({
                    where: { order_id: orderId },
                    data: { updated_at: new Date() }
                });

                // Gửi email xác nhận
                const orderDetail = await orderRepository.getDetail(orderId);
                const userEmail = order.user.email;
                await emailService.sendPurchaseSuccessfullyEmail(userEmail, orderDetail);

                console.log(`Stripe payment successful for order ${orderId}`);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                const failedOrderId = failedPayment.metadata.order_id;

                const failedOrder = await prisma.order.findUnique({
                    where: { order_id: failedOrderId },
                    include: { items: true }
                });

                if (!failedOrder) {
                    console.error(`Order ${failedOrderId} not found`);
                    return { received: false };
                }

                // Cập nhật trạng thái thành CANCELLED
                const cancelledStatus = await orderRepository.getStatusByCode('CANCELLED');
                if (!cancelledStatus) {
                    console.error('CANCELLED status not found');
                    return { received: false };
                }

                await prisma.orderStatusHistory.create({
                    data: {
                        order_id: failedOrderId,
                        order_status_id: cancelledStatus.order_status_id,
                        changed_by: null,
                        note: `Payment failed via Stripe. Payment Intent: ${failedPayment.id}`
                    }
                });

                // Hoàn lại stock
                for (const item of failedOrder.items) {
                    await prisma.productVariant.updateMany({
                        where: { product_variant_id: item.product_variant_id },
                        data: {
                            stock_quantity: { increment: item.quantity },
                            version: { increment: 1 }
                        }
                    });
                }

                await prisma.order.update({
                    where: { order_id: failedOrderId },
                    data: { updated_at: new Date() }
                });

                console.log(`Stripe payment failed for order ${failedOrderId}`);
                break;

            default:
                console.log(`Unhandled Stripe event type: ${event.type}`);
        }

        return { received: true };

    } catch (error) {
        console.error('Stripe webhook error:', error);
        throw error;
    }
};

module.exports = {
    createPayment: createPaymentUrl,
    handleVnpayIpn: handleVnpayIpn,
    handleVnpayReturn: handleVnpayReturn,
    // Stripe functions
    createStripePaymentIntent,
    handleStripeWebhook
};