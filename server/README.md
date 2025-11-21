Flow thanh toán
1. User checkout → Backend tạo Order
   ↓
2. Backend tạo VNPay URL với:
   - vnp_ReturnUrl = http://localhost:3636/api/v1/payments/vnpay/return
   - vnp_IpnUrl = https://ngrok-url/api/v1/payments/vnpay/ipn
   ↓
3. User thanh toán trên VNPay
   ↓
4a. VNPay gọi IPN (ngrok URL) → Cập nhật DB
   ↓
4b. VNPay redirect user về Return URL → Hiển thị kết quả

Thông tin truy cập Merchant Admin để quản lý giao dịch:
Địa chỉ: https://sandbox.vnpayment.vn/merchantv2/
Kiểm tra (test case) – IPN URL:
Kịch bản test (SIT): https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login