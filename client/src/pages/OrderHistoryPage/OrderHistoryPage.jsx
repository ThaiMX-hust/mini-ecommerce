import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api'
import styles from './OrderHistoryPage.module.css'

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

                // ✅ API trả về { orders: [...] }
                setOrders(response.data.orders || response.data);
                
            } catch (err) {  // ✅ Thêm parameter err
                setError("Unable to load order history. Please try again.");
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);  // ✅ Thêm setLoading(false)
            }
        };
        fetchOrderHistory();
    }, [navigate]);

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) return <p className={styles.loading}>Loading order history...</p>
    if (error) return <p className={styles.error}>{error}</p>

    return (
        <div className={styles.container}>
            <h2>Order History</h2>
            {orders.length === 0 ? (
                <p>No orders found. <Link to="/">Start shopping</Link></p>
            ) : (
                <div className={styles.orderList}>
                    {orders.map((order) => (
                        <div key={order.order_id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div>
                                    <strong>Order ID:</strong> {order.order_id}
                                </div>
                                <span>Order Date: {formatDate(order.created_at)}</span>
                            </div>
                            
                            <div className={styles.orderBody}>
                                <p><strong>Receiver Name:</strong> {order.receiver_name}</p>
                                <p><strong>Phone:</strong> {order.phone}</p>
                                <p><strong>Delivery Address:</strong> {order.address}</p>
                                <p>
                                    <strong>Total Price:</strong>
                                    <span className={styles.totalPrice}>
                                        {formatCurrency(order.total_price_after_discount)}
                                    </span>
                                </p>
                                <p>
                                    <strong>Status:</strong> 
                                    <span className={styles.statusBadge}>
                                        {order.status_history?.[0]?.status_name || "Processing"}
                                    </span>
                                </p>
                            </div>
                            
                            <hr className={styles.divider} />

                            <div className={styles.itemList}>
                                {order.items.map((item) => (
                                    <div key={item.order_item_id} className={styles.item}>
                                        <img
                                            src={item.variant?.image_urls?.[0] || 'https://via.placeholder.com/80'}
                                            alt={item.product?.name}
                                        />
                                        <div className={styles.itemInfo}>
                                            <p className={styles.itemName}>{item.product?.name}</p>
                                            <p>
                                                {item.variant?.options?.map(opt => 
                                                    `${opt.option_name}: ${opt.value}`
                                                ).join(', ')}
                                            </p>
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: {formatCurrency(item.subtotal_after_discount)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;






