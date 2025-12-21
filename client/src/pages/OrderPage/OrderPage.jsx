import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../../api'
import styles from './OrderPage.module.css'

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [payingOrderId, setPayingOrderId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
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
                
                //  Hiển thị thông báo nếu vừa tạo đơn hàng mới
                if (location.state?.message) {
                    alert(location.state.message);
                }
                
            } catch (err) {
                setError("Unable to load orders. Please try again.");
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderHistory();
    }, [navigate, location.state]);

    // ✅ Hàm thanh toán đơn hàng
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

    if (loading) return <p className={styles.loading}>Loading your orders...</p>
    if (error) return <p className={styles.error}>{error}</p>

    return (
        <div className={styles.container}>
            {/*  Đổi tiêu đề */}
            <h1 className={styles.pageTitle}>My Orders</h1>
            
            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>You haven't placed any orders yet.</p>
                    <Link to="/products" className={styles.shopButton}>
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className={styles.orderList}>
                    {orders.map((order) => {
                        const currentStatus = order.status_history?.[0]?.status_name || "Processing";
                        const isPending = currentStatus === "Chờ xác nhận";
                        
                        return (
                            <div key={order.order_id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <div className={styles.orderId}>
                                        <strong>Order ID:</strong> 
                                        <span>{order.order_id}</span>
                                    </div>
                                    <div className={styles.orderDate}>
                                        {formatDate(order.created_at)}
                                    </div>
                                </div>
                                
                                <div className={styles.orderBody}>
                                    <div className={styles.deliveryInfo}>
                                        <p><strong>Receiver:</strong> {order.receiver_name}</p>
                                        <p><strong>Phone:</strong> {order.phone}</p>
                                        <p><strong>Address:</strong> {order.address}</p>
                                    </div>

                                    <div className={styles.orderSummary}>
                                        <div className={styles.totalPrice}>
                                            <span>Total:</span>
                                            <strong>{formatCurrency(order.total_price_after_discount)}</strong>
                                        </div>
                                        <div className={styles.statusContainer}>
                                            <span>Status:</span>
                                            <span 
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: getStatusColor(currentStatus) }}
                                            >
                                                {currentStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Nút thanh toán cho đơn hàng pending */}
                                    {isPending && (
                                        <button
                                            onClick={() => handlePayNow(order)}
                                            disabled={payingOrderId === order.order_id}
                                            className={styles.payNowButton}
                                        >
                                            {payingOrderId === order.order_id ? "Processing..." : "💳 Pay Now"}
                                        </button>
                                    )}
                                </div>
                                
                                <hr className={styles.divider} />

                                <div className={styles.itemList}>
                                    <h4 className={styles.itemsTitle}>Order Items ({order.items.length})</h4>
                                    {order.items.map((item) => (
                                        <div key={item.order_item_id} className={styles.item}>
                                            <img
                                                src={item.variant?.image_urls?.[0] || 'https://via.placeholder.com/80'}
                                                alt={item.product?.name}
                                                className={styles.itemImage}
                                            />
                                            <div className={styles.itemInfo}>
                                                <p className={styles.itemName}>{item.product?.name}</p>
                                                {item.variant?.options && (
                                                    <p className={styles.itemVariant}>
                                                        {item.variant.options.map(opt => 
                                                            `${opt.option_name}: ${opt.value}`
                                                        ).join(' • ')}
                                                    </p>
                                                )}
                                                <p className={styles.itemQuantity}>Qty: {item.quantity}</p>
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
    );
};

export default OrderPage;






