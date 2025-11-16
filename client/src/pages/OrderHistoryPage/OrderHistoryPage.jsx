import React, {useState, useEffect } from "react";
import {Link, useNavigate} from 'react-router-dom'
import api from '../../api'
import styles from './OrderHistoryPage.module.css'

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect( ()=>{
        const fetchOrderHistory = async () =>{
            try{
                const token = localStorage.getItem("token");
                if(!token){
                    navigate('/login');
                    return;
                }
                setLoading(true);
                const response= await api.get('/orders');

                setOrders(response.data.orders);
                
            }
            catch{
                setError("Don't download order history. Please try again.");
                console.error(err);
            }
            finally{

            }
        };
        fetchOrderHistory();
    },[navigate]);

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    const formatDate = (dateString) =>{
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if(loading) return <p className={styles.loading}>Loading order history ...</p>
    if(error) return <p className={styles.error}>{error}</p>

    return (
        <div className={styles.container}>
            <h2>Order History</h2>
            {orders.length === 0 ? (
                <p>No orders found. <Link to="/">Create a new order</Link></p>
            ) : (
                <div className={styles.orderList}>
                    {orders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div>
                                    <strong>Order ID:</strong> {order.id}
                                </div>
                                <span>Order Date: {formatDate(order.created_at)}</span>
                            </div>
                            <div className={styles.orderBody}>
                                <p><strong>Receiver Name:</strong> {order.receiver_name}</p>
                                <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
                                <p><strong>Total price:</strong><span className={styles.totalPrice}> {formatCurrency(order.total_price)}</span></p>
                                <p><strong>Status:</strong> {order.status_history?.[0]?.status || "Processing"}</p>

                            </div>
                            <hr className={styles.divider}/>

                            <div className={styles.itemList}>
                                {order.items.map((item) => (
                                    <div key={item.order_item_id} className={styles.item}>
                                        <img
                                            src={item.product_variant.image_urls?.[0] || 'https://via.placeholder.com/80'}
                                            alt={item.product_variant.Product.name}
                                            />
                                        <div className={styles.itemInfo}>
                                            <p className={styles.itemName}>{item.product_variant.Product.name}</p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Price: {formatCurrency(item.final_price)}</p>
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






