Flow thanh toán

    User->>Frontend: Checkout & chọn thanh toán VNPay
    Frontend->>Backend: POST /api/v1/orders (tạo đơn hàng)
    Backend->>Database: Lưu order với status CREATED
    Backend-->>Frontend: Trả về order_id
    
    Frontend->>Backend: POST /api/v1/payments/vnpay
    Backend->>Backend: Tạo payment URL với chữ ký
    Backend-->>Frontend: Trả về VNPay URL
    Frontend->>VNPay: Redirect user đến trang thanh toán
    
    User->>VNPay: Nhập thông tin & thanh toán
    
    VNPay->>Backend: GET /api/v1/payments/vnpay/ipn (xác nhận)
    Backend->>Database: Cập nhật order status
    Backend->>Backend: Gửi email xác nhận
    Backend-->>VNPay: Response {RspCode: '00'}
    
    VNPay->>Backend: GET /api/v1/payments/vnpay/return
    Backend-->>Frontend: Redirect với kết quả
    Frontend->>User: Hiển thị kết quả thanh toán
    
Thông tin truy cập Merchant Admin để quản lý giao dịch:
Địa chỉ: https://sandbox.vnpayment.vn/merchantv2/
Kiểm tra (test case) – IPN URL:
Kịch bản test (SIT): https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login

# Payment function
`ngrok http 3636`

Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ:NGUYEN VAN A
Ngày phát hành:07/15
Mật khẩu OTP:123456

npx prisma studio