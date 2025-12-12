# API Contract – Website Bán sản phẩm

Phiên bản: 3.1\
Ngày cập nhật: 12/12/2025

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
      "cart_id": "string",
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
        "card_id": "string",
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
  - 403 Forbidden: { "error": "Forbidden" }
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
  - 403 Forbidden: { "error": "Forbidden" }
  - 404 Not Found: { "error": "User not found" }

### 1.7. Lấy danh sách người dùng

- Method: GET
- URL: /api/v1/users
- Authorization: Bearer {admin_token}
- Response:
  - 200 OK:
    ```json
    {
      "user_id": "string",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "avatar_url": "string",
      "locked": "boolean",
      "created_at": "string"
    }
    ```
  - 401 Unauthorized
  - 403 Forbidden

### 1.8. Khóa/Mở khóa người dùng

- Method: PATCH
- URL: /api/v1/users/{user_id}/locked
- Authorization: Bearer {admin_token}
- Content-Type: application/json
- Request body:
  ````json
  {
    "locked": "boolean"
  }
  ```json
  ````
- Response:
  - 200 OK
  - 401 Unauthorized
  - 403 Forbidden

## 2. Danh mục sản phẩm

### 2.1. Tạo category

- Method: POST
- URL: /api/categories
- Request Headers: Authorization: Bearer {admin_token}
- Content-Type: application/json

```json
{
  "categories": [
    {
      "category_name": "string",
      "category_code": "string",
      "category_description": "string"
    }
  ]
}
```

- Response

```json
{
  "categories": [
    {
      "category_id": "string",
      "category_name": "string",
      "category_code": "string",
      "category_description": "string"
    }
  ]
}
```

### 2.2. Update category

- Method: PATCH
- URL: /api/categories/{category_id}
- Authorization: Bearer {admin_token}
- Content-Type: application/json

```json
{
  "category_name": "string",
  "category_code": "string",
  "category_description": "string"
}
```

- Response

```json
{
  "category_id": "string",
  "category_name": "string",
  "category_code": "string",
  "category_description": "string"
}
```

### 2.3. Xóa category

- Method: DELETE
- URL: /api/categories/{category_id}
- Authorization: Bearer {admin_token}
- Content-Type: application/json

- Response

```json
{
  "category_id": "string"
}
```

## 3. Sản phẩm

### 3.1. Xem danh sách sản phẩm

- Method: GET
- URL: /api/v1/products
- Query Parameters:
  - name: string (optional)
  - search: string (optional) - Search by product name
  - categories: [string] (optional)
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
          "categories": [
            {
              "category_id": "string",
              "category_name": "string",
              "category_code": "string",
              "category_description": "string"
            }
          ],
          "min_price": "number",
          "max_price": "number",
          "image_url": "string"
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
      "categories": [
        {
          "category_id": "string",
          "category_name": "string",
          "category_code": "string",
          "category_description": "string"
        }
      ],
      "is_disabled": "boolean",

      "options": [
        {
          "product_option_id": "string",
          "option_name": "string",
          "values": [{ "option_value_id": "string", "value": "string" }]
        }
      ],

      "variants": [
        {
          "product_variant_id": "string",
          "sku": "string",
          "price": "number",
          "stock": "number",
          "is_disabled": "boolean",
          "images": ["string"],
          "options": [
            {
              "product_option_id": "string",
              "option_name": "string",
              "value": { "option_value_id": "string", "value": "string" }
            }
          ]
        }
      ]
    }
    ```

    Ví dụ

    ```json
    {
      "product_id": "a3f7943c-8a0b-4bc3-8c24-41306cbcd498",
      "name": "Áo chống nắng TomiJun",
      "description": "Chất liệu co dãn 4 chiều, thoáng khí, chống tia UV UPF50+",
      "categories": ["Thời trang", "Áo khoác"],
      "is_disabled": false,

      "options": [
        {
          "product_option_id": "b0859f28-0cda-4a4d-a3d1-d75cf54fc285",
          "option_name": "Color",
          "values": [
            {
              "option_value_id": "1dbe7b26-c189-45ac-8d29-6602bd0d11f0",
              "value": "Black"
            },
            {
              "option_value_id": "a80c6ae2-6ba6-4af8-8f53-2b05757df33b",
              "value": "White"
            }
          ]
        },
        {
          "product_option_id": "660a1b2a-1f02-4fdc-8817-7ce143a47a42",
          "option_name": "Size",
          "values": [
            {
              "option_value_id": "e2094432-9c54-486e-9fd3-d02fc3a542b9",
              "value": "M"
            },
            {
              "option_value_id": "41552ad4-fc52-4697-823a-7c97c29bde1a",
              "value": "L"
            }
          ]
        }
      ],

      "variants": [
        {
          "product_variant_id": "7c4acd34-d706-4c4c-8cbf-9399cf2281f6",
          "sku": "TMJ-UV-BLK-M",
          "price": 219000,
          "stock": 12,
          "is_disabled": false,
          "images": ["https://cdn.myshop.com/img/product/tmj-uv-black-m-1.jpg"],
          "options": [
            {
              "product_option_id": "b0859f28-0cda-4a4d-a3d1-d75cf54fc285",
              "option_name": "Color",
              "value": {
                "option_value_id": "1dbe7b26-c189-45ac-8d29-6602bd0d11f0",
                "value": "Black"
              }
            },
            {
              "product_option_id": "660a1b2a-1f02-4fdc-8817-7ce143a47a42",
              "option_name": "Size",
              "value": {
                "option_value_id": "e2094432-9c54-486e-9fd3-d02fc3a542b9",
                "value": "M"
              }
            }
          ]
        },
        {
          "product_variant_id": "c94c1f0c-66d7-43b5-ba17-fc63d6a753b8",
          "sku": "TMJ-UV-WHT-L",
          "price": 219000,
          "stock": 8,
          "is_disabled": false,
          "images": ["https://cdn.myshop.com/img/product/tmj-uv-white-l-1.jpg"],
          "options": [
            {
              "product_option_id": "b0859f28-0cda-4a4d-a3d1-d75cf54fc285",
              "option_name": "Color",
              "value": {
                "option_value_id": "a80c6ae2-6ba6-4af8-8f53-2b05757df33b",
                "value": "White"
              }
            },
            {
              "product_option_id": "660a1b2a-1f02-4fdc-8817-7ce143a47a42",
              "option_name": "Size",
              "value": {
                "option_value_id": "41552ad4-fc52-4697-823a-7c97c29bde1a",
                "value": "L"
              }
            }
          ]
        }
      ]
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
  - metadata: text
  - variant_images: file[]
- Mô tả metadata body

| Trường chính       | Trường con       | Kiểu                      | Yêu cầu        | Mô tả                                                       |
| ------------------ | ---------------- | ------------------------- | -------------- | ----------------------------------------------------------- |
| `name`             | -                | string                    | Bắt buộc       | Tên sản phẩm hiển thị                                       |
| `description`      | -                | string                    | Bắt buộc       | Mô tả chi tiết của sản phẩm                                 |
| `categories`       | -                | string[]                  | Bắt buộc       | Danh sách category mà sản phẩm thuộc về                     |
| `is_disabled`      | -                | boolean (default = false) | Không bắt buộc | Xác định xem sản phẩm có bị ẩn hay không                    |
| `options`          | -                | Object[]                  | Bắt buộc       | Danh sách các options chi tiết thuộc về sản phẩm            |
| `options`          | `option_name`    | string                    | Bắt buộc       | Tên option                                                  |
| `options`          | `values`         | string[]                  | Bắt buộc       | Giá trị tương ứng của option                                |
| `variants`         | -                | Object[]                  | Bắt buộc       | Danh sách variants của sản phẩm                             |
| `variants`         | `sku`            | string                    | Bắt buộc       | Mã định danh duy nhất cho từng variant (Stock Keeping Unit) |
|                    | `raw_price`      | string                    | Bắt buộc       | Giá gốc                                                     |
|                    | `stock_quantity` | number                    | Bắt buộc       | Số lượng tồn kho                                            |
|                    | `image_indexes`  | number[]                  | Không bắt buộc | Danh sách index ảnh mapping sang mảng file upload           |
|                    | `is_disabled`    | boolean                   | Bắt buộc       | Xác định xem variant hiện tại có đang tắt hay không         |
|                    | `options`        | object[]                  | Bắt buộc       | Danh sách các option cụ thể của variant                     |
| `variants.options` | `option_name`    | string                    | Bắt buộc       | Tên option                                                  |
|                    | `value`          | string                    | Bắt buộc       | Giá trị của option ứng với variant                          |

- Metadata
  ```json
  {
    "name": "string",
    "description": "string",
    "categories": ["string"],
    "is_disabled": "boolean",
    "options": [{ "option_name": "string", "values": ["string"] }],
    "variants": [
      {
        "sku": "string",
        "raw_price": "string",
        "stock_quantity": "number",
        "image_indexes:": ["number"],
        "is_disabled": "boolean",
        "options": [{ "option_name": "string", "value": "string" }]
      }
    ]
  }
  ```
- Mô tả file body

| Trường chính                | Kiểu | Yêu cầu  | Mô tả                                                                                                                                                             |
| --------------------------- | ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variants_images[${index}]` | file | Bắt buộc | Ảnh của từng variant, upload theo dạng mảng file (multipart/form-data). `${index}` sẽ tương ứng với vị trí trong mảng để mapping với `image_indexes` của variant. |

- Response:
  - 201 Created:
    ```json
    {
      "product_id": "string",
      "name": "string",
      "description": "string",
      "categories": ["string"],
      "options": [
        {
          "product_option_id": "string",
          "option_name": "string",
          "values": ["string"]
        }
      ],
      "variants": [
        {
          "product_variant_id": "string",
          "sku": "string",
          "raw_price": "string",
          "stock_quantity": "number",
          "image_urls:": ["string"],
          "is_disabled": "boolean",
          "options": [
            {
              "product_option_id": "string",
              "option_name": "string",
              "value": "string"
            }
          ],
          "created_at": "timestamp"
        }
      ],
      "created_at": "timestamp"
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }

### 3.6. Cập nhật sản phẩm

- Method: PATCH
- URL: /api/v1/products/{product_id}
- Request Headers: Authorization: Bearer {admin_token}
- Content-Type: application/json
- Mô tả body

| Trường chính     | Kiểu     | Yêu cầu        | Mô tả                                   |
| ---------------- | -------- | -------------- | --------------------------------------- |
| `name`           | string   | Không bắt buộc | Tên sản phẩm hiển thị                   |
| `description`    | string   | Không bắt buộc | Mô tả chi tiết về sản phẩm              |
| `categories`     | string[] | Không bắt buộc | Danh sách category mà sản phẩm thuộc về |
| `is_disabled`    | boolean  | Không bắt buộc | Ẩn/hiện sản phẩm                        |
| `variant_images` | file[]   | Không bắt buộc | Ảnh mới                                 |

- Body

  ```json
  {
    "product_id": "string",
    "name": "string",
    "description": "string",
    "categories": ["string"],
    "is_disabled": "boolean",
    "variant_images": ["file"]
  }
  ```

- Response:
  - 200 OK:
    ```json
    {
      "product_id": "string",
      "name": "string",
      "description": "string",
      "categories": ["string"],
      "is_disabled": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "image_urls": ["string"]
    }
    ```
  - 400 Bad Request: { "error": "Missing or invalid fields" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }

### 3.7 Cập nhật một option của sản phẩm

- Method: PATCH
- URL: /api/v1/products/{product_id}/options/{product_option_id}
- Request Headers:
  - Authorization: Bearer {admin_token}
  - Content-Type: application/json
- Mô tả body

| Trường chính  | Trường con | Kiểu     | Yêu cầu        | Mô tả                                      |
| ------------- | ---------- | -------- | -------------- | ------------------------------------------ |
| `option_name` | -          | string   | Không bắt buộc | Tên của option (Ví dụ: Size)               |
| `value`       | -          | string[] | Không bắt buộc | Mảng giá trị của option (Ví dụ ["M", "L"]) |

- Metadata

```json
{
  "option_name": "string",
  "value": ["string"]
}
```

- Response

  - 200 OK

  ```json
  {
    "product_id": "string",
    "option_name": "string",
    "value": ["string"],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```

  - 400 Bad Request { "error": "Missing or invalid fields" }
  - 401 Unauthorized { "error": "Unauthorized" }
  - 404 Not Found { "error": "Product or option not found" }

### 3.8 Cập nhật một variant của sản phẩm

- Method: PATCH
- URL: /api/v1/products/{product_id}/variants/{product_variant_id}
- Request Headers:
  - Authorization: Bearer {admin_token}
  - Content-Type: multipart/form-data
- Request body:
  - metadata: text (JSON string)
  - variant_images: file[] (optional)
- Mô tả metadata body

| Trường chính     | Trường con          | Kiểu     | Yêu cầu                     | Mô tả                                         |
| ---------------- | ------------------- | -------- | --------------------------- | --------------------------------------------- |
| `sku`            | -                   | string   | Không bắt buộc              | Mã SKU của variant                            |
| `raw_price`      | -                   | string   | Không bắt buộc              | Giá gốc của variant                           |
| `stock_quantity` | -                   | number   | Không bắt buộc              | Số lượng tồn kho                              |
| `image_indexes`  | -                   | number[] | Không bắt buộc              | Mapping sang mảng `variant_images` upload kèm |
| `options`        | -                   | object[] | Không bắt buộc              | Danh sách option ứng với variant              |
| `options`        | `product_option_id` | string   | Bắt buộc nếu truyền options | Tham chiếu option gốc                         |
| `options`        | `option_name`       | string   | Bắt buộc nếu truyền options | Denormalized name                             |
| `options`        | `value`             | string   | Bắt buộc nếu truyền options | Giá trị của option                            |

- Metadata

```json
{
  "sku": "string",
  "raw_price": "number",
  "stock_quantity": "number",
  "image_indexes": ["number"],
  "options": [
    {
      "product_option_id": "string",
      "option_name": "string",
      "value": "string"
    }
  ]
}
```

- Response

  - 200 OK

  ```json
  {
    "product_variant_id": "string",
    "product_id": "string",
    "sku": "string",
    "raw_price": "string",
    "stock_quantity": "number",
    "image_urls": ["string"],
    "options": [
      {
        "product_option_id": "string",
        "option_name": "string",
        "value": "string"
      }
    ],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```

  - 400 Bad Request { "error": "Missing or invalid fields" }
  - 401 Unauthorized { "error": "Unauthorized" }
  - 404 Not Found { "error": "Variant not found" }

### 3.9 Xóa sản phẩm

- Method: DELETE
- URL: /api/v1/products/{product_id}
- Request Headers: Authorization: Bearer {admin_token}
- Response:
  - 204 No Content
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }

### 3.10 Soft-delete sản phẩm

- Method: GET
- URL: /api/v1/products/{product_id}/soft-delete
- Headers: Authorization: Bearer {admin_token}

- Response:

  - 200 OK

  ```json
  {
    "product_id": "string",
    "is_deleted": true,
    "deleted_at": "timestamp"
  }
  ```

  - 401 Unauthorized {error: "Unauthorized"}

### 3.11 Khôi phục sản phẩm

- Method: GET
- URL: /api/v1/products/{product_id}/restore
- Headers: Authorization: Bearer {admin_token}

- Response:

  - 200 OK

  ```json
  {
    "product_id": "string",
    "is_deleted": false,
    "restored_at": "timestamp"
  }
  ```

  - 401 Unauthorized {error: "Unauthorized"}

### 3.12 Xóa variant của sản phẩm

- Method: DELETE
- URL: /api/v1/products/{product_id}/variants/{product_variant_id}
- Request Headers: Authorization: Bearer {admin_token}
- Response:
  - 204 No Content
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product or variant not found" }

### 3.13. Xem danh sách sản phẩm cho admin

- Method: GET
- URL: /api/v1/products/all
- Query Parameters:
  - name: string (optional)
  - search: string (optional) - Search by product name
  - categories: [string] (optional)
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
          "categories": [
            {
              "category_id": "string",
              "category_name": "string",
              "category_code": "string",
              "category_description": "string"
            }
          ],
          "min_price": "number",
          "max_price": "number",
          "image_url": "string"
        }
      ],
      "is_disabled": "boolean",
      "created_at": "string",
      "deleted_at": "string",
      "restored_at": "string"
    }
    ```

## 4. Giỏ hàng

### 4.1. Thêm sản phẩm vào giỏ hàng

- Method: POST
- URL: /api/v1/cart
- Request Headers: Authorization: Bearer {token}
- Content-Type: application/json
- Request body:
  ```json
  {
    "product_variant_id": "string",
    "quantity": "number" // optional, default = 1
  }
  ```
- Response:
  - 201 Created:
    ```json
    {
      "cart_item_id": "string",
      "quantity": "number",
      "product": {
        "product_id": "string",
        "name": "string",
        "description": "string"
      },
      "variant": {
        "product_variant_id": "string",
        "sku": "string",
        "raw_price": "number",
        "final_price": "number",
        "stock_quantity": "number",
        "image_urls": ["string"],
        "options": [
          {
            "option_name": "string",
            "value": "string"
          }
        ]
      }
    }
    ```
  - 200 OK (nếu sản phẩm đã có trong giỏ hàng):
    ```json
    {
      "cart_item_id": "string",
      "product_id": "string",
      "product_variant_id": "string",
      "quantity": "number",
      "raw_unit_price": "string",
      "final_unit_price": "string",
      "raw_subtotal": "number",
      "final_subtotal": "number",
      "added_at": "string"
    }
    ```
  - 400 Bad Request: { "error": "Invalid quantity" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Product not found" }
  - 404 Not Found: { "error": "Product variant not found" }

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
          "quantity": "number",
          "product": {
            "product_id": "string",
            "name": "string",
            "description": "string",
            "categories": ["string"]
          },
          "variant": {
            "product_variant_id": "string",
            "sku": "string",
            "raw_price": "string",
            "final_price": "string",
            "image_urls": ["string"],
            "options": [{ "option_name": "string", "value": ["string"] }]
          },
          "subtotal_before_discount": "number",
          "subtotal_after_discount": "number"
        }
      ],
      "total_price": "number",
      "total_price_after_discount": "number"
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
      "product_variant_id": "string",
      "quantity": "number",
      "raw_unit_price": "string",
      "final_unit_price": "string",
      "raw_subtotal": "number",
      "final_subtotal": "number",
      "added_at": "string"
    }
    ```
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
          "cart_item_id": "string",
          "quantity": "number",
          "product": {
            "product_id": "string",
            "name": "string",
            "description": "string",
            "categories": ["string"]
          },
          "variant": {
            "product_variant_id": "string",
            "sku": "string",
            "raw_price": "string",
            "final_price": "string",
            "image_urls": ["string"],
            "options": [{ "option_name": "string", "value": ["string"] }]
          },
          "subtotal_before_discount": "number",
          "subtotal_after_discount": "number"
        }
      ],
      "total_price": "number",
      "total_price_after_discount": "number",
      "receiver_name": "string",
      "phone": "string",
      "address": "string",
      "status_history": [
        {
          "status_code": "string",
          "status_name": "string",
          "changed_by": "string",
          "changed_at": "string",
          "note": "string"
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
    "return_url": "string" // URL để VNPay chuyển hướng sau khi thanh toán
  }
  ```
- Response:
  - 200 OK:
    ```json
    {
      "payment_url": "string" // URL để chuyển hướng người dùng đến VNPay thanh toán
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
              "cart_item_id": "string",
              "quantity": "number",
              "product": {
                "product_id": "string",
                "name": "string",
                "description": "string"
              },
              "variant": {
                "product_variant_id": "string",
                "sku": "string",
                "raw_price": "string",
                "final_price": "string",
                "image_urls": ["string"],
                "options": [{ "option_name": "string", "value": ["string"] }]
              },
              "subtotal_before_discount": "number",
              "subtotal_after_discount": "number"
            }
          ],
          "total_price": "number",
          "total_price_after_discount": "number",
          "receiver_name": "string",
          "phone": "string",
          "address": "string",
          "status_history": [
            {
              "status_code": "string",
              "status_name": "string",
              "changed_by": "string",
              "changed_at": "string",
              "note": "string"
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
    "status_code": "string",
    "note": "string?"
  }
  ```
- Response:
  - 200 OK:
    ```json
    {
      "order_id": "string",
      "status_code": "string",
      "note": "string",
      "previous_status_code": "string",
      "previous_note": "string",
      "updated_at": "string",
      "status_history": [
        {
          "status_code": "string",
          "status_name": "string",
          "changed_by": "string",
          "changed_at": "string",
          "note": "string"
        }
      ]
    }
    ```
  - 400 Bad Request: { "error": "Invalid status" }
  - 401 Unauthorized: { "error": "Unauthorized" }
  - 404 Not Found: { "error": "Order not found" }

### 5.6. Tạo yêu cầu hoàn tiền
- Method: POST
- URL: /api/v1/refunds
- Authorization: Bearer
- Content-Type: application/json
- Request body:
  - order_id
  - reason: string
- Response:
  - 201 Created:
    ```json
    {
      "refund_id": "fade15f8-5320-4b3a-9a09-54f90c0d2c96",
      "order_id": "5f809a00-b53d-4130-9b4a-1783a6ffbf7f",
      "reason": "test",
      "amount": "798000",
      "status": "PENDING",
      "created_at": "2025-11-30T14:18:14.374Z"
    }
    ```
  - 400 Bad Request
  - 401 Unauthorized
  - 404 Not Found
  - 409 Conflict

### 5.7. Lấy danh sách yêu cầu hoàn tiền của 1 người dùng
- Method: GET
- URL: /api/v1/refunds
- Authorization: Bearer
- Response:
  - 200 OK:
    ```json
    [
      {
        "refund_id": "fade15f8-5320-4b3a-9a09-54f90c0d2c96",
        "order_id": "5f809a00-b53d-4130-9b4a-1783a6ffbf7f",
        "reason": "test",
        "amount": "798000",
        "status": "PENDING",
        "created_at": "2025-11-30T14:18:14.374Z",
        "processed_at": null,
        "note": null
      }
    ]
    ```
  - 401 Unauthorized

### 5.8. Lấy toàn bộ danh sách yêu cầu hoàn tiền (cho admin)
- Method: GET
- URL: /api/v1/refunds
- Authorization: Bearer (admin)
- Response:
  - 200 OK:
    ```json
    [
      {
        "refund_id": "d7e77ef5-f529-4400-bd24-6711065c1157",
        "order_id": "d6cb7f8f-f1b5-4c37-b1aa-ba8958d2d692",
        "reason": "test",
        "amount": "798000",
        "status": "REJECTED",
        "created_at": "2025-11-30T13:46:21.588Z",
        "processed_at": "2025-11-30T13:46:44.761Z",
        "admin_id": "assmin",
        "note": "reject 123"
      }
    ]
    ```
  - 401 Unauthorized
  - 403 Forbidden

### 5.9. Chấp nhận hoàn tiền

- Method: POST
- URL: /api/v1/refunds/{refund_id}/approve
- Authorization: Bearer (admin)
- Content-Type: application/json
- Request body:
  - note
- Response:
  - 200 OK:
    ```json
    {
      "refund_id": "fade15f8-5320-4b3a-9a09-54f90c0d2c96",
      "order_id": "5f809a00-b53d-4130-9b4a-1783a6ffbf7f",
      "reason": "test",
      "amount": "798000",
      "status": "APPROVED",
      "created_at": "2025-11-30T14:18:14.374Z",
      "processed_at": "2025-11-30T14:20:44.018Z",
      "admin_id": "assmin",
      "note": "approve 123"
    }
    ```
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

### 5.10. Từ chối hoàn tiền

- Method: POST
- URL: /api/v1/refunds/{refund_id}/reject
- Authorization: Bearer (admin)
- Content-Type: application/json
- Request body:
  - note
- Response:
  - 200 OK:
    ```json
    {
      "refund_id": "fade15f8-5320-4b3a-9a09-54f90c0d2c96",
      "order_id": "5f809a00-b53d-4130-9b4a-1783a6ffbf7f",
      "reason": "test",
      "amount": "798000",
      "status": "REJECTED",
      "created_at": "2025-11-30T14:18:14.374Z",
      "processed_at": "2025-11-30T14:20:44.018Z",
      "admin_id": "assmin",
      "note": "approve 123"
    }
    ```
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

### 5.11. Xem danh sách đơn hàng (cho admin)

- Method: GET
- URL: /api/v1/orders/all
- Authorization: Bearer (admin)
- Query:
  - page
  - limit
  - status_code
  - sort_by (created_at/total_final_price/raw_final_price)
  - sort_order (asc/desc)
- Response:
  - 200 OK:
    ```json
    {
      "page": 1,
      "limit": 5,
      "total_items": 2,
      "total_pages": 1,
      "orders": [
        {
          "order_id": "0c68db1e-994f-4ba1-9e20-125933f62219",
          "user_id": "f200eeb6-b97b-42f7-bebb-0ba40e524298",
          "receiver_name": "Tam",
          "raw_total_price": "798000",
          "final_total_price": "798000",
          "created_at": "2025-12-05T05:59:10.841Z",
          "status": "Đang vận chuyển"
        },
        {
          "order_id": "1793b812-b197-4fd3-b260-d1babde94aec",
          "user_id": "f200eeb6-b97b-42f7-bebb-0ba40e524298",
          "receiver_name": "Tam",
          "raw_total_price": "699000",
          "final_total_price": "699000",
          "created_at": "2025-12-05T07:08:54.639Z",
          "status": "Chờ xác nhận"
        }
      ]
    }
    ```
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

### 5.12. Xem chi tiết đơn hàng (cho admin)

- Method: GET
- URL: /api/v1/orders/{order_id}/detail
- Authorization: Bearer (admin)
- Response:
  - 200 OK:
    ```json
    {
      "order_id": "0c68db1e-994f-4ba1-9e20-125933f62219",
      "user_id": "f200eeb6-b97b-42f7-bebb-0ba40e524298",
      "receiver_name": "Tam",
      "phone": "12345678",
      "address": "?????",
      "raw_total_price": "798000",
      "final_total_price": "798000",
      "created_at": "2025-12-05T05:59:10.841Z",
      "status_history": [
        {
          "status": {
            "code": "SHIPPING",
            "name": "Đang vận chuyển"
          },
          "changed_at": "2025-12-05T06:00:26.319Z",
          "changed_by": "assmin",
          "note": "Đơn hàng đã đến kho Thẩm Quyến"
        },
        {
          "status": {
            "code": "CREATED",
            "name": "Chờ xác nhận"
          },
          "changed_at": "2025-12-05T05:59:10.851Z",
          "changed_by": "f200eeb6-b97b-42f7-bebb-0ba40e524298",
          "note": "Đơn hàng được tạo"
        }
      ],
      "items": [
        {
          "name": "Quần jean slim-fit",
          "description": "Jean nam nữ co giãn, form ôm vừa.",
          "sku": "JN-BLU-30",
          "image_urls": [],
          "options": [
            {
              "name": "Size",
              "value": "30"
            },
            {
              "name": "Color",
              "value": "Blue"
            }
          ],
          "quantity": 2,
          "unit_price": "399000",
          "promotion": "0",
          "final_price": "399000",
          "subtotal": "798000"
        }
      ]
    }
    ```
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

## 6. Khuyến mãi

### 6.1. Tạo promotion

- Method: POST
- Require Headers: Authorization {admin_token}
- URL: `/api/v1/promotions`

#### **Request Body**

```json
{
  "promotion_name": "string",
  "promotion_description": "string",
  "promotion_type": "string",
  "promotion_status": "string",
  "promotion_value": "number",
  "promotion_metadata": {
    "product_id": "string",
    "exclude_variant_id": [{ "product_variant_id": "string" }],
    "max_usage": "number",
    "current_usage": "number",
    "start_at": "timestamp",
    "end_at": "timestamp"
  },
  "promotion_rules": {
    "time": {
      "time_slots_count": "number",
      "time_slots": [{ "start_time": "timestamp", "end_time": "timestamp" }]
    },
    "limit": {
      "max_per_order": "number",
      "max_per_user": "number"
    },
    "constraints": {
      "min_order_value": "number",
      "min_quantity": "number"
    }
  }
}
```

#### Mô tả trường body

| Trường                    | Kiểu   | Bắt buộc | Mô tả                                      |
| ------------------------- | ------ | -------- | ------------------------------------------ |
| **promotion_name**        | string | có       | Tên chương trình khuyến mãi.               |
| **promotion_description** | string | không    | Mô tả nội dung khuyến mãi.                 |
| **promotion_type**        | string | có       | Loại khuyến mãi.                           |
| **promotion_status**      | string | không    | Trạng thái. Mặc định khi tạo sẽ là `DRAFT` |
| **promotion_value**       | number | có       | Giá trị khuyến mãi.                        |
| **promotion_metadata**    | object | có       | Thông tin của khuyến mãi                   |
| **promotion_rules**       | number | có       | Rule set của promotion                     |

#### Mô tả promotion metadata

| Field                | Type      | Required | Description                           |
| -------------------- | --------- | -------- | ------------------------------------- |
| product_id           | string    | Yes      | ID của sản phẩm được áp dụng.         |
| exclude_variant_id   | array     | No       | Danh sách các biến thể cần loại trừ.  |
| └ product_variant_id | string    | No       | ID biến thể bị loại trừ.              |
| max_usage            | number    | Yes      | Tổng số lần promotion có thể sử dụng. |
| current_usage        | number    | Yes      | Số lần đã sử dụng.                    |
| start_at             | timestamp | Yes      | Thời điểm bắt đầu hiệu lực.           |
| end_at               | timestamp | Yes      | Thời điểm kết thúc hiệu lực.          |

#### Mô tả promotion rule

- Mô tả Time rule

| Field            | Type      | Required                | Description              |
| ---------------- | --------- | ----------------------- | ------------------------ |
| time_slots_count | number    | No                      | Số lượng time slot.      |
| time_slots       | array     | No                      | Danh sách các time slot. |
| └ start_time     | timestamp | Yes (nếu có time_slots) | Thời điểm bắt đầu.       |
| └ end_time       | timestamp | Yes (nếu có time_slots) | Thời điểm kết thúc.      |

- Mô tả Limit rule

| Field         | Type   | Required | Description                         |
| ------------- | ------ | -------- | ----------------------------------- |
| max_per_order | number | No       | Số lần áp dụng trên một đơn hàng.   |
| max_per_user  | number | No       | Số lần áp dụng trên mỗi người dùng. |

- Mô tả constraints

| Field           | Type   | Required | Description                                                                        |
| --------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| min_order_value | number | No       | Giá trị đơn hàng tối thiểu để áp dụng. Để `-1` nếu như không có giá trị tối thiểu  |
| min_quantity    | number | No       | Số lượng sản phẩm tối thiểu để áp dụng. Để `-1` nếu như không có giá trị tối thiểu |

#### **Response**

- 201 Created

```json
{
  "promotion_id": "string",
  "created_at": "timestamp"
}
```

### 6.2. Lấy list khuyến mãi

- Method: GET
- URL `/api/v1/promotions`
- Request Headers: Authorization Bearer {admin_token}

### **Query Params**

| Param        | Type   | Required | Description                                      |
| ------------ | ------ | -------- | ------------------------------------------------ |
| `product_id` | string | No       | Lọc theo sản phẩm                                |
| `status`     | string | No       | `DRAFT`, `RUNNING`, `EXPIRED`, `ARCHIVED`        |
| `type`       | string | No       | `PERCENTAGE`, `FIXED`, `FLASH_SALE`, `SET_PRICE` |
| `page`       | number | No       | Default `1`                                      |
| `limit`      | number | No       | Default `20`                                     |

### **Response 200**

```json
{
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number"
  },
  "promotions": [
    {
      "promotion_id": "string",
      "product_id": "string",
      "promotion_name": "string",
      "promotion_description": "string",
      "promotion_type": "string",
      "promotion_status": "string",
      "start_at": "timestamp",
      "end_at": "timestamp"
    }
  ]
}
```

### 6.3. Lấy khuyến mãi theo id

-Method: GET
-URL: `/api/v1/promotions/{promotion_id}`

#### **Response 200**

```json
{
  "promotion_id": "string",
  "product_id": "string",
  "promotion_name": "string",
  "promotion_description": "string",
  "promotion_type": "string",
  "promotion_status": "string",
  "start_at": "timestamp",
  "end_at": "timestamp"
}
```

#### **Response 404**

```json
{
  "error": "Promotion not found"
}
```

### 6.4. Update Promotion

- Method: PUT
- Require Headers: Authorization: Bearer {admin_token}
- URL `/api/v1/promotions/{promotion_id}`

#### **Request Body**

```json
{
  "promotion_name": "string",
  "promotion_description": "string",
  "promotion_type": "string",
  "promotion_status": "string",
  "start_at": "timestamp",
  "end_at": "timestamp"
}
```

#### **Response 200**

```json
{
  "promotion_id": "string",
  "product_id": "string",
  "promotion_name": "string",
  "promotion_description": "string",
  "promotion_type": "string",
  "promotion_status": "string",
  "start_at": "timestamp",
  "end_at": "timestamp"
}
```

---

### 6.5. Delete Promotion

- Method: DELETE
- Require Headers: Authorization: Bearer {admin_token}
- URL `/api/v1/promotions/{promotion_id}`

#### **Response 204**

#### **Response 404**

```json
{ "error": "Promotion not found" }
```

---

### 6.6. Thay đổi trạng thái của promotion

- Method PATCH
- Require Headers: Authorization: Bearer {admin_token}
- URL `/api/v1/promotions/{promotion_id}/status`

#### **Request Body**

```json
{
  "promotion_status": "string"
}
```

#### **Response 200**

```json
{
  "message": "Promotion status updated",
  "promotion_status": "string"
}
```

---

### 6.7. Lấy khuyến mãi đang được áp dụng cho sản phẩm

- Method GET
- URL `/api/v1/promotions/product/{product_id}/active`

#### Lưu ý: Luật áp dụng promotion cho sản phẩm được mô tả như sau

- Thứ tự áp dụng promotion: (FLASH_SALE || SET_PRICE) > FIXED > PERCENTAGE

- Chỉ áp dụng một promotion cùng loại

- Số lượng promotion áp dụng tối đa: 2

- API chỉ trả về đúng 2 promotion áp dụng cho sản phẩm đó theo quy tắc như trên

- Nếu cùng loại thì luôn chọn promotion có giá trị giảm cao hơn

- Nếu bằng nhau thì chọn theo ngày tạo mới nhất

#### **Response 200**

```json
{
  "product_id": "string",
  "promotions": [
    {
      "promotion_id": "string",
      "promotion_name": "string",
      "promotion_type": "string",
      "promotion_status": "string",
      "start_at": "timestamp",
      "end_at": "timestamp"
    }
  ]
}
```

---
## 7. Thống kê

### 7.1. Doanh thu

- Method: GET
- URL: /api/v1/stats/revenue
- Authorization: Bearer {admin_token}
- Query params:
  - from: date  (yyyy-mm-dd)
  - to: date    (yyyy-mm-dd)
- Response:
  - 200 OK:
    ```json
    {
      "revenue": 500000,
      "total_orders": 10,
      "from": 2025-01-01,
      "to": 2025-06-01
    }
    ```
  - 400 Bad Request: { "error": "Invalid date" }
  - 401 Unauthorized
  - 403 Forbidden
