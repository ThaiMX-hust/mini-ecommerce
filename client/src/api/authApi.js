// src/api/authApi.js

import api from "../api";

/**
 * Gửi yêu cầu đăng nhập đến server.
 * @param {object} credentials - Đối tượng chứa email và password.
 * @param {string} credentials.email - Email của người dùng.
 * @param {string} credentials.password - Mật khẩu của người dùng.
 * @returns {Promise<object>} Promise trả về dữ liệu từ API (token và thông tin user).
 */
export const login = (credentials) => {
  // Dựa trên API contract (1.2), URL là /auth/login
  return api.post(`/auth/login`, credentials);
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
  return api.post(`/users`, userData);
};

// Bạn có thể thêm các hàm khác ở đây sau này, ví dụ:
// export const forgotPassword = (email) => { ... };
// export const resetPassword = (data) => { ... };

/**
 * Lấy thông tin chi tiết của người dùng đã đăng nhập.
 * @param {string} userId - ID của người dùng (lấy từ token).
 * @returns {Promise<object>} Promise trả về dữ liệu hồ sơ người dùng.
 */
export const getUserProfile = (userId) => {
  return api.get(`/users/${userId}`);
};

/**
 * Cập nhật thông tin hồ sơ người dùng.
 * @param {string} userId - ID của người dùng.
 * @param {FormData} formData - Dữ liệu cần cập nhật (dùng FormData vì có thể có file avatar).
 * @returns {Promise<object>} Promise trả về dữ liệu hồ sơ đã được cập nhật.
 */
export const updateUserProfile = (userId, formData) => {
  // Axios sẽ tự động set 'Content-Type': 'multipart/form-data' khi body là FormData
  return api.patch(`/users/${userId}`, formData);
};

/**
 * Gửi yêu cầu thay đổi mật khẩu.
 * @param {object} passwords - Object chứa mật khẩu cũ và mới.
 * @param {string} passwords.old_password - Mật khẩu hiện tại.
 * @param {string} passwords.new_password - Mật khẩu mới.
 * @returns {Promise<object>}
 */
export const changePassword = (passwords) => {
  return api.post("/auth/change-password", passwords);
};

/**
 * Gửi yêu cầu lấy link reset mật khẩu qua email.
 * @param {string} email - Email của người dùng.
 * @returns {Promise<object>}
 */
export const requestPasswordReset = (email) => {
  return api.post("/auth/forgot-password", { email });
};

/**
 * Gửi yêu cầu đặt lại mật khẩu với token và mật khẩu mới.
 * @param {string} token - Token nhận được từ email.
 * @param {string} new_password - Mật khẩu mới.
 * @returns {Promise<object>}
 */
export const resetPassword = (token, new_password) => {
  return api.post("/auth/reset-password", { token, new_password });
};
