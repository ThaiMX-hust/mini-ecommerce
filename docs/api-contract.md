# API Contract – Website Bán sản phẩm
Phiên bản: 1.0
Ngày cập nhật: 19/10/2025

## Tổng quan
Các API chính: Tài khoản, Danh mục, Sản phẩm, Giỏ hàng, Thanh toán & Đơn hàng

## 1. Tài khoản
### 1.1. Đăng ký tài khoản
- Method: POST
- URL: /api/v1/users
- Content-Type: multipart/form-data
- Request body:
  - first_name: string
  - last_name: string
  - email: string
  - password: string (required)
  - avatar: file
- Response:
  - 201 Created:
    ```json
    {
      "user_id": "string",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "avatar_url": "string"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 409 Conflict: { "error": "Email already exists" }

### 1.2. Đăng nhập
- Method: POST
- URL: /api/v1/auth/login
- Content-Type: application/json
- Request body:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- Response:
  - 200 OK:
    ```json
    {
      "token": "string",
      "user": {
        "user_id": "string",
        "first_name": "string",
        "last_name": "string",
        "email": "string",
        "avatar_url": "string"
      }
    }
    ```
  - 401 Unauthorized: { "error": "Invalid email or password" }

### 1.3. Quên mật khẩu
#### 1.3.1. Yêu cầu đặt lại mật khẩu
- Method: POST
- URL: /api/v1/auth/forgot-password
- Content-Type: application/json
- Request body:
  ```json
  {
    "email": "string"
  }
  ```
- Response:
  - 200 OK: { "message": "Password reset link sent to email" } (Gửi email url có token đặt lại mật khẩu)
  - 404 Not Found: { "error": "Email not found" }
#### 1.3.2. Đặt lại mật khẩu
- Method: POST
- URL: /api/v1/auth/reset-password
- Content-Type: application/json
- Request body:
  ```json
  {
    "token": "string",
    "new_password": "string"
  }
  ```
- Response:
  - 200 OK: { "message": "Password reset successfully" }
  - 400 Bad Request: { "error": "Invalid or expired token" }

### 1.4. Thay đổi mật khẩu
- Method: POST
- URL: /api/v1/auth/change-password
- Content-Type: application/json
- Headers: Authorization: Bearer {token}
- Request body:
  ```json
  {
    "old_password": "string",
    "new_password": "string"
  }
  ```
- Response:
  - 200 OK: { "message": "Password changed successfully" }
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }

### 1.5. Xem thông tin tài khoản
- Method: GET
- URL: /api/v1/users/{user_id}
- Headers: Authorization: Bearer {token}
- Response:
  - 200 OK:
    ```json
    {
      "user_id": "string",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "avatar_url": "string"
    }
    ```
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "User not found" }

### 1.6. Cập nhật thông tin tài khoản
- Method: PATCH
- URL: /api/v1/users/{user_id}
- Headers: Authorization: Bearer {token}
- Content-Type: multipart/form-data
- Request body:
  - first_name: string (optional)
  - last_name: string (optional)
  - avatar: file (optional)
- Response:
  - 200 OK:
    ```json
    {
      "user_id": "string",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "avatar_url": "string"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "User not found" }

## 2. Danh mục sản phẩm

## 3. Sản phẩm
### 3.1. Xem danh sách sản phẩm
- Method: GET
- URL: /api/v1/products
- Query Parameters:
  - name: string (optional)
  - category: string (optional)
  - min_price: number (optional)
  - max_price: number (optional)
  - page: number (optional, default: 1)
  - limit: number (optional, default: 10)
- Response:
  - 200 OK:
    ```json
    {
      "page": "number",
      "limit": "number",
      "total_pages": "number",
      "total_items": "number",
      "items": [
        {
          "product_id": "string",
          "name": "string",
          "description": "string",
          "category": ["string"],
          "price": "number",
          "image_url": "string",
          "stock": "number"
        }
      ]
    }
    ```

### 3.2. Xem chi tiết sản phẩm
- Method: GET
- URL: /api/v1/products/{product_id}
- Response:
  - 200 OK:
    ```json
    {
      "product_id": "string",
      "name": "string",
      "description": "string",
      "category": ["string"],
      "price": "number",
      "images": ["string"],
      "stock": "number",
    }
    ```
  - 404 Not Found: { "error": "Product not found" }

### 3.3. Đánh giá sản phẩm
- Method: POST
- URL: /api/v1/products/{product_id}/reviews
- Request Headers: Authorization: Bearer {token}
- Content-Type: application/json
- Request body:
  ```json
  {
    "rating": "number",
    "comment": "string"
  }
  ```
- Response:
  - 201 Created:
    ```json
    {
      "review_id": "string",
      "product_id": "string",
      "user": {
        "user_id": "string",
        "first_name": "string",
        "last_name": "string",
        "avatar_url": "string"
      },
      "rating": "number",
      "comment": "string",
      "created_at": "string"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }

### 3.4. Lấy đánh giá sản phẩm
- Method: GET
- URL: /api/v1/products/{product_id}/reviews
- Response:
  - 200 OK:
    ```json
    {
      "reviews": [
        {
          "review_id": "string",
          "product_id": "string",
          "user": {
            "user_id": "string",
            "first_name": "string",
            "last_name": "string",
            "avatar_url": "string"
          },
          "rating": "number",
          "comment": "string",
          "created_at": "string"
        }
      ]
    }
    ```
  - 404 Not Found: { "error": "Product not found" }

### 3.5. Thêm sản phẩm mới
- Method: POST
- URL: /api/v1/products
- Request Headers: Authorization: Bearer {admin_token}
- Content-Type: multipart/form-data
- Request body:
  - name: string
  - description: string
  - price: number
  - images: file[] (optional)
  - stock: number
- Response:
  - 201 Created:
    ```json
    {
      "product_id": "string",
      "name": "string",
      "description": "string",
      "category": ["string"],
      "price": "number",
      "images": ["string"],
      "stock": "number"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }

### 3.6. Cập nhật sản phẩm
- Method: PATCH
- URL: /api/v1/products/{product_id}
- Request Headers: Authorization: Bearer {admin_token}
- Content-Type: multipart/form-data
- Request body:
  - name: string (optional)
  - description: string (optional)
  - category: ["string"] (optional)
  - price: number (optional)
  - images: file[] (optional)
  - stock: number (optional)
- Response:
  - 200 OK:
    ```json
    {
      "product_id": "string",
      "name": "string",
      "description": "string",
      "category": ["string"],
      "price": "number",
      "images": ["string"],
      "stock": "number"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }

### 3.7. Xóa sản phẩm
- Method: DELETE
- URL: /api/v1/products/{product_id}
- Request Headers: Authorization: Bearer {admin_token}
- Response:
  - 204 No Content
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }

## 4. Giỏ hàng
### 4.1. Thêm sản phẩm vào giỏ hàng
- Method: POST
- URL: /api/v1/cart
- Request Headers: Authorization: Bearer {token}
- Content-Type: application/json
- Request body:
  ```json
  {
    "product_id": "string",
    "quantity": "number" // optional, default = 1
  }
  ```
- Response:
  - 201 Created:
    ```json
    {
      "cart_item_id": "string",
      "product_id": "string",
      "quantity": "number"
    }
    ```
  - 200 OK (nếu sản phẩm đã có trong giỏ hàng):
    ```json
    {
      "cart_item_id": "string",
      "product_id": "string",
      "quantity": "number"
    }
    ```
  - 400 Bad Request: { "error": "Invalid quantity" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }

### 4.2. Xem giỏ hàng
- Method: GET
- URL: /api/v1/cart
- Request Headers: Authorization: Bearer {token}
- Response:
  - 200 OK:
    ```json
    {
      "items": [
        {
          "cart_item_id": "string",
          "product": {
            "product_id": "string",
            "name": "string",
            "description": "string",
            "category": ["string"],
            "price": "number",
            "image_url": "string"
          },
          "quantity": "number"
        }
      ],
      "total_price": "number"
    }
    ```
  - 401 Unauthorized: { "error": "Unauthorized" }

### 4.3. Cập nhật số lượng sản phẩm trong giỏ hàng
- Method: PATCH
- URL: /api/v1/cart/{cart_item_id}
- Request Headers: Authorization: Bearer {token}
- Content-Type: application/json
- Request body:
  ```json
  {
    "quantity": "number"
  }
  ```
- Response:
  - 200 OK:
    ```json
    {
      "cart_item_id": "string",
      "product_id": "string",
      "quantity": "number"
    }
    ```
  - 400 Bad Request: { "error": "Invalid quantity" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Cart item not found" }

### 4.4. Xóa sản phẩm khỏi giỏ hàng
- Method: DELETE
- URL: /api/v1/cart/{cart_item_id}
- Request Headers: Authorization: Bearer {token}
- Response:
  - 204 No Content
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Cart item not found" }

## 5. Thanh toán & Đơn hàng
### 5.1. Thanh toán giỏ hàng
- Method: POST
- URL: /api/v1/orders
- Request Headers: Authorization: Bearer {token}
- Content-Type: application/json
- Request body:
  ```json
  {
    "receiver_name": "string",
    "phone": "string",
    "address": "string"
  }
  ```
- Response:
  - 201 Created:
    ```json
    {
      "order_id": "string",
      "items": [
        {
          "product": {
            "product_id": "string",
            "name": "string",
            "description": "string",
            "category": ["string"],
            "price": "number",
            "image_url": "string"
          },
          "quantity": "number"
        }
      ],
      "raw_total_amount": "number",
      "final_total_amount": "number",
      "receiver_name": "string",
      "phone": "string",
      "address": "string",
      "status_history": [
        {
          "status": "string",
          "updated_at": "string"
        }
      ],
      "created_at": "string"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }

### 5.2. Thanh toán qua VNPay
- Method: POST
- URL: /api/v1/payments/vnpay
- Request Headers: Authorization: Bearer {token}
- Content-Type: application/json
- Request body:
  ```json
  {
    "order_id": "string",
    "return_url": "string"  // URL để VNPay chuyển hướng sau khi thanh toán
  }
  ```
- Response:
  - 200 OK:
    ```json
    {
      "payment_url": "string"  // URL để chuyển hướng người dùng đến VNPay thanh toán
    }
    ```
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Order not found" }

### 5.3. VNPay IPN URL (Endpoint VNPay gọi tới backend sau khi thanh toán để xác nhận giao dịch)
  - Method: GET
  - URL: /api/v1/payments/vnpay/ipn
  - Note: VNPay yêu cầu SSL (HTTPS)
  - Response:
    - 200 OK:
      ```json
      {
        "RspCode": "string",
        "Message": "string"
      }
      ```
    - 400 Bad Request: { "error": "Invalid signature or missing parameters" }

### 5.4. Xem lịch sử đơn hàng
- Method: GET
- URL: /api/v1/orders
- Request Headers: Authorization: Bearer {token}
- Response:
  - 200 OK:
    ```json
    {
      "orders": [
        {
          "order_id": "string",
          "items": [
            {
              "product": {
                "product_id": "string",
                "name": "string",
                "description": "string",
                "category": ["string"],
                "price": "number",
                "image_url": "string"
              },
              "quantity": "number"
            }
          ],
          "raw_total_amount": "number",
          "final_total_amount": "number",
          "receiver_name": "string",
          "phone": "string",
          "address": "string",
          "status_history": [
            {
              "status": "string",
              "updated_at": "string"
            }
          ],
          "created_at": "string"
        }
      ]
    }
    ```
  - 401 Unauthorized: { "error": "Unauthorized" }

### 5.5. Cập nhật trạng thái đơn hàng
- Method: PATCH
- URL: /api/v1/orders/{order_id}
- Request Headers: Authorization: Bearer {admin_token}
- Content-Type: application/json
- Request body:
  ```json
  {
    "status": "string"
  }
  ```
- Response:
  - 200 OK:
    ```json
    {
      "order_id": "string",
      "items": [
        {
          "product": {
            "product_id": "string",
            "name": "string",
            "description": "string",
            "category": ["string"],
            "price": "number",
            "image_url": "string"
          },
          "quantity": "number"
        }
      ],
      "raw_total_amount": "number",
      "final_total_amount": "number",
      "receiver_name": "string",
      "phone": "string",
      "address": "string",
      "status_history": [
        {
          "status": "string",
          "updated_at": "string"
        }
      ],
      "created_at": "string"
    }
    ```
  - 400 Bad Request: { "error": "Invalid status" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Order not found" }