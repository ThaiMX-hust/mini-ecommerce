import api from "../api";

/**
 * Lấy lịch sử tất cả các đơn hàng của người dùng đã đăng nhập.
 * @returns {Promise<object>} Promise trả về một object chứa mảng các đơn hàng.
 */
export const getOrderHistory = () => {
  return api.get("/orders");
};
