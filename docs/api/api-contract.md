# API Contract – Website Bán sản phẩm
Phiên bản: 1.0
Ngày cập nhật: 12/10/2025

## Tổng quan
Các API chính: Tài khoản, Sản phẩm, Giỏ hàng, Thanh toán & Đơn hàng

## 1. Tài khoản
### 1.1. Đăng ký tài khoản
- Method: POST
- URL: /api/v1/users
- Content-Type: multipart/form-data
- Request body:
  - first_name: string (required)
  - last_name: string (required)
  - email: string (required)
  - password: string (required)
  - avatar: file (optional)
- Response:
  - 201 Created:
    ```json
    {
      "id": "string",
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
        "id": "string",
        "first_name": "string",
        "last_name": "string",
        "email": "string",
        "avatar_url": "string"
      }
    }
    ```
  - 401 Unauthorized: { "error": "Invalid email or password" }

### 1.3. Xem thông tin tài khoản
- Method: GET
- URL: /api/v1/users/{user_id}
- Headers: Authorization: Bearer {token}
- Response:
  - 200 OK:
    ```json
    {
      "id": "string",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "avatar_url": "string"
    }
    ```
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "User not found" }

## 2. Sản phẩm
### 2.1. Xem danh sách sản phẩm
- Method: GET
- URL: /api/v1/products
- Query Parameters:
  - name: string (optional)
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
          "id": "string",
          "name": "string",
          "description": "string",
          "price": "number",
          "image_url": "string",
          "stock": "number"
        }
      ]
    }
    ```

### 2.2. Xem chi tiết sản phẩm
- Method: GET
- URL: /api/v1/products/{product_id}
- Response:
  - 200 OK:
    ```json
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "images": ["string"],
      "stock": "number"
    }
    ```
  - 404 Not Found: { "error": "Product not found" }

### 2.3. Thêm sản phẩm mới
- Method: POST
- URL: /api/v1/products
- Request Headers: Authorization: Bearer {admin_token}
- Content-Type: multipart/form-data
- Request body:
  - name: string (required)
  - description: string (required)
  - price: number (required)
  - images: file[] (optional)
  - stock: number (required)
- Response:
  - 201 Created:
    ```json
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "images": ["string"],
      "stock": "number"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }

### 2.4. Cập nhật sản phẩm
- Method: PUT
- URL: /api/v1/products/{product_id}
- Request Headers: Authorization: Bearer {admin_token}
- Content-Type: multipart/form-data
- Request body:
  - name: string (optional)
  - description: string (optional)
  - price: number (optional)
  - images: file[] (optional)
  - stock: number (optional)
- Response:
  - 200 OK:
    ```json
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "images": ["string"],
      "stock": "number"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }

### 2.5. Xóa sản phẩm
- Method: DELETE
- URL: /api/v1/products/{product_id}
- Request Headers: Authorization: Bearer {admin_token}
- Response:
  - 204 No Content
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }

## 3. Giỏ hàng
### 3.1. Thêm sản phẩm vào giỏ hàng
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

### 3.2. Xem giỏ hàng
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
            "id": "string",
            "name": "string",
            "description": "string",
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

### 3.3. Cập nhật số lượng sản phẩm trong giỏ hàng
- Method: PUT
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

### 3.4. Xóa sản phẩm khỏi giỏ hàng
- Method: DELETE
- URL: /api/v1/cart/{cart_item_id}
- Request Headers: Authorization: Bearer {token}
- Response:
  - 204 No Content
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Cart item not found" }

## 4. Thanh toán & Đơn hàng
### 4.1. Thanh toán giỏ hàng
- Method: POST
- URL: /api/v1/orders
- Request Headers: Authorization: Bearer {token}
- Content-Type: application/json
- Request body:
  ```json
  {
    "recipient_name": "string",
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
            "id": "string",
            "name": "string",
            "description": "string",
            "price": "number",
            "image_url": "string"
          },
          "quantity": "number"
        }
      ],
      "total_price": "number",
      "recipient_name": "string",
      "phone": "string",
      "address": "string",
      "status": "string",
      "created_at": "string"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }

### 4.2. Thanh toán qua VNPay
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

### 4.3. VNPay IPN URL (Endpoint VNPay gọi tới backend sau khi thanh toán để xác nhận giao dịch)
  - Method: GET
  - URL: /api/v1/payments/vnpay/ipn
  - Note: Yêu cầu SSL (HTTPS)
  - Response:
    - 200 OK:
      ```json
      {
        "RspCode": "string",
        "Message": "string"
      }
      ```
    - 400 Bad Request: { "error": "Invalid signature or missing parameters" }

### 4.4. Xem lịch sử đơn hàng
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
                "id": "string",
                "name": "string",
                "description": "string",
                "price": "number",
                "image_url": "string"
              },
              "quantity": "number"
            }
          ],
          "total_price": "number",
          "recipient_name": "string",
          "phone": "string",
          "address": "string",
          "status": "string",
          "created_at": "string"
        }
      ]
    }
    ```
  - 401 Unauthorized: { "error": "Unauthorized" }

### 4.5. Cập nhật trạng thái đơn hàng
- Method: PUT
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
            "id": "string",
            "name": "string",
            "description": "string",
            "price": "number",
            "image_url": "string"
          },
          "quantity": "number"
        }
      ],
      "total_price": "number",
      "recipient_name": "string",
      "phone": "string",
      "address": "string",
      "status": "string",
      "created_at": "string"
    }
    ```
  - 400 Bad Request: { "error": "Invalid status" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Order not found" }