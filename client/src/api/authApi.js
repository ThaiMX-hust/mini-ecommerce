// src/api/authApi.js

import axios from "axios";

// Lấy URL gốc của API từ biến môi trường, giống như file productApi.js
const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

/**
 * Gửi yêu cầu đăng nhập đến server.
 * @param {object} credentials - Đối tượng chứa email và password.
 * @param {string} credentials.email - Email của người dùng.
 * @param {string} credentials.password - Mật khẩu của người dùng.
 * @returns {Promise<object>} Promise trả về dữ liệu từ API (token và thông tin user).
 */
export const login = (credentials) => {
  // Dựa trên API contract (1.2), URL là /auth/login
  return axios.post(`${API_URL}/auth/login`, credentials);
};

/**
 * Gửi yêu cầu đăng ký tài khoản mới đến server.
 * @param {FormData} userData - Dữ liệu form đăng ký, bao gồm cả file avatar.
 *                                FormData là cần thiết vì API yêu cầu Content-Type: multipart/form-data.
 * @returns {Promise<object>} Promise trả về thông tin user vừa được tạo.
 */
export const register = (userData) => {
  // Dựa trên API contract (1.1), URL là /users
  // Chúng ta cần set header 'Content-Type': 'multipart/form-data'
  // Axios sẽ tự động làm điều này khi bạn truyền vào một đối tượng FormData.
  return axios.post(`${API_URL}/users`, userData);
};

// Bạn có thể thêm các hàm khác ở đây sau này, ví dụ:
// export const forgotPassword = (email) => { ... };
// export const resetPassword = (data) => { ... };
