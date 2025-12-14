import api from "../api";

/**
 * Lấy lịch sử tất cả các đơn hàng của người dùng đã đăng nhập.
 * @returns {Promise<object>} Promise trả về một object chứa mảng các đơn hàng.
 */
export const getOrderHistory = () => {
  return api.get("/orders");
};

/**
 * [ADMIN] Fetches a paginated list of all orders with filters.
 * @param {object} params - Query parameters (page, limit, status_code, etc.).
 * @returns {Promise<object>}
 */
export const getAllOrders = (params) => {
  return api.get("/orders/all", { params });
};

/**
 * [ADMIN] Fetches the detailed information for a single order.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<object>}
 */
export const getOrderDetail = (orderId) => {
  return api.get(`/orders/${orderId}/detail`);
};

/**
 * [ADMIN] Cancels an order.
 * @param {string} orderId - The ID of the order to cancel.
 * @param {string} reason - The reason for cancellation.
 * @returns {Promise<object>}
 */
export const cancelOrder = (orderId, reason) => {
  // API doc says GET but body implies POST/PATCH. Assuming POST is more correct for sending a body.
  // If it's truly GET, the backend needs to change how it accepts the 'reason'.
  return api.post(`/orders/${orderId}/cancel`, { reason });
};
