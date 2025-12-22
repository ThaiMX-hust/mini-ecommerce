import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../api'
import styles from './OrderPage.module.css'
import CancelOrderModal from '../../components/CancelOrderModal/CancelOrderModal'
import {cancelOrder} from '../../api/orderApi'

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [payingOrderId, setPayingOrderId] = useState(null);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelModal, setCancelModal] = useState({ isOpen: false, order: null, isLoading: false });
    const navigate = useNavigate();
    const location = useLocation();

    // Hàm fetch orders - tách ra để tái sử dụng
    const fetchOrderHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/login');
                return;
            }
            
            setLoading(true);
            const response = await api.get('/orders');
            setOrders(response.data.orders || response.data);
            
            
        } catch (err) {
            setError("Unable to load orders. Please try again.");
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, [navigate, location.state]);

    // Thêm effect để refresh khi có query param từ payment result
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const fromPayment = searchParams.get('fromPayment');
        
        if (fromPayment === 'true') {
            fetchOrderHistory();
             // Xóa query param để tránh refresh lại liên tục
            navigate(location.pathname, { replace: true });
        }
    }, [location.search]);

    // Hàm thanh toán đơn hàng
    const handlePayNow = async (order) => {
    try {
        setPayingOrderId(order.order_id);
        
        const paymentRes = await api.post("/payments/vnpay", {
            orderId: order.order_id, 
        });

        if (paymentRes.data.url) {
            window.location.href = paymentRes.data.url;
        }
    } catch (err) {
        console.error("Error creating payment:", err);
        alert(err.response?.data?.message || "Failed to create payment. Please try again.");
    } finally {
        setPayingOrderId(null);
    }
};

    const handleCancelOrder = async (reason) => {
        setCancelModal(prev => ({ ...prev, isLoading: true }));
        try {
            await cancelOrder(cancelModal.order.order_id, reason);
            
            // Refresh danh sách đơn hàng
            await fetchOrderHistory();
            
            // Đóng modal
            setCancelModal({ isOpen: false, order: null, isLoading: false });
            
            alert('Hủy đơn hàng thành công!');
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert(err.response?.data?.error || "Failed to cancel order. Please try again.");
            setCancelModal(prev => ({ ...prev, isLoading: false }));
        }
    };


    const getCurrentStatus = (statusHistory = []) => {
      if (!Array.isArray(statusHistory) || statusHistory.length === 0) {
        return {
          status_code: "",
          status_name: "Đang xử lý"
        };
      }

      return statusHistory.reduce((latest, current) => {
        const latestTime = new Date(latest.changed_at).getTime();
        const currentTime = new Date(current.changed_at).getTime();

        return currentTime > latestTime ? current : latest;
      });
    };


    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Hàm lấy màu cho status badge
    const getStatusColor = (statusName) => {
        const statusColors = {
            'Chờ xác nhận': '#ffc107',
            'Đã xác nhận': '#17a2b8',
            'Chuẩn bị hàng': '#6c757d',
            'Đang vận chuyển': '#007bff',
            'Đã giao hàng': '#28a745',
            'Hoàn thành': '#28a745',
            'Đã hủy': '#dc3545',
            'Đã hoàn tiền': '#6f42c1'
        };
        return statusColors[statusName] || '#6c757d';
    };

    if (loading) return <p className={styles.loading}>Đang tải danh sách đơn hàng...</p>
    if (error) return <p className={styles.error}>{error}</p>

return (
  <>
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/products" className={styles.shopButton}>
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => {
            // Lấy phần tử CUỐI CÙNG (trạng thái mới nhất)
            const currentStatusObj = getCurrentStatus(order.status_history);

            const currentStatus = currentStatusObj.status_name;
            const currentStatusCode = currentStatusObj.status_code;
             
            const canPay = currentStatusCode === "CREATED";

            return (
              <div key={order.order_id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderId}>
                    <strong>Mã đơn hàng:</strong>
                    <span>{order.order_id}</span>
                  </div>
                  <div className={styles.orderDate}>
                    {formatDate(order.created_at)}
                  </div>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.deliveryInfo}>
                    <p><strong>Người nhận:</strong> {order.receiver_name}</p>
                    <p><strong>Số điện thoại:</strong> {order.phone}</p>
                    <p><strong>Địa chỉ:</strong> {order.address}</p>
                  </div>

                  <div className={styles.orderSummary}>
                    <div className={styles.totalPrice}>
                      <span>Tổng tiền:</span>
                      <strong>{formatCurrency(order.total_price_after_discount)}</strong>
                    </div>
                    <div className={styles.statusContainer}>
                      <span>Trạng thái:</span>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(currentStatus) }}
                      >
                        {currentStatus}
                      </span>
                    </div>
                  </div>

                  {canPay && (
                    <button
                      onClick={() => handlePayNow(order)}
                      disabled={payingOrderId === order.order_id}
                      className={styles.payNowButton}
                    >
                      {payingOrderId === order.order_id
                        ? "Đang xử lý..."
                        : "Thanh toán ngay"}
                    </button>
                  )}

                 
                  {canPay&& (
                    <button
                      onClick={() =>
                        setCancelModal({
                          isOpen: true,
                          order: order,
                          isLoading: false
                        })
                      }
                      className={styles.cancelButton}
                    >
                      Huỷ đơn hàng
                    </button>
                  )}
               
                </div>

                <hr className={styles.divider} />

                <div className={styles.itemList}>
                  <h4 className={styles.itemsTitle}>
                    Sản phẩm đã đặt ({order.items.length})
                  </h4>

                  {order.items.map((item) => (
                    <div key={item.order_item_id} className={styles.item}>
                      <img
                        src={item.variant?.image_urls?.[0] || "https://via.placeholder.com/80"}
                        alt={item.product?.name}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.product?.name}</p>
                        {item.variant?.options && (
                          <p className={styles.itemVariant}>
                            {item.variant.options
                              .map(opt => `${opt.option_name}: ${opt.value}`)
                              .join(" • ")}
                          </p>
                        )}
                        <p className={styles.itemQuantity}>
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className={styles.itemPrice}>
                        {formatCurrency(item.subtotal_after_discount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    <CancelOrderModal
      isOpen={cancelModal.isOpen}
      onClose={() =>
        setCancelModal({ isOpen: false, order: null, isLoading: false })
      }
      onConfirm={handleCancelOrder}
      order={cancelModal.order}
      isLoading={cancelModal.isLoading}
    />
  </>
);

};
export default OrderPage;






