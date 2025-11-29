import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import styles from "./CheckoutPage.module.css";

const CheckoutPage = () => {
    const [formData, setFormData] = useState({
        receiver_name: "",
        phone: "",
        address: "",
    });
    const [cart, setCart] = useState({ items: [], total_price_after_discount: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Fetch cart data
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }
                const res = await api.get("/cart");
                setCart(res.data);
            } catch (err) {
                console.error("Error fetching cart data:", err);
                setError("Unable to load item. Please try again.");
            }
        };
        fetchCart();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const orderRes = await api.post("/orders", formData);

            // Get orderID, amout from orderRes
            const { order_id, total_price_after_discount } = orderRes.data;

            // ✅ Sửa: Gửi tham số đúng tên
            const paymentRes = await api.post("/payments/vnpay", {
                orderInfo: 'Thanh toán đơn hàng ' + order_id,  // ✅ order_id thay vì orderID
                orderId: order_id,  // ✅ orderId thay vì orderID
                amount: total_price_after_discount,  // ✅ total_price_after_discount thay vì final_total_price
            });

            if (paymentRes.data.url) {
                window.location.href = paymentRes.data.url;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An error occurred while processing the order.";
            setError(errorMessage);
            console.error("Error creating payment:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.layout}>
                {/* Checkout Form */}
                <div className={styles.formSection}>
                    <h2>Checkout</h2>
                    <form onSubmit={handleSubmit}>
                        <h3>Contact Information</h3>
                        <input
                            name="email"
                            placeholder="Email address"
                            type="email"
                            required
                        />

                        <h3>Delivery Address</h3>
                        <input
                            name="receiver_name"
                            placeholder="Receiver Name"
                            value={formData.receiver_name}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            name="phone"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />

                        {error && <p className={styles.error}>{error}</p>}
                        
                        <button
                            type="submit"
                            className={styles.payButton}
                            disabled={loading || cart.items.length === 0}
                        >
                            {loading ? "Processing..." : "Pay with VNPay"}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className={styles.summarySection}>
                    <h3>Order Summary</h3>
                    {cart.items.length === 0 ? (
                        <p>Your cart is empty</p>
                    ) : (
                        <>
                            {cart.items.map((item) => (
                                <div key={item.cart_item_id} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <img
                                            src={item.variant?.image_urls?.[0] || 'https://via.placeholder.com/50'}
                                            alt={item.product?.name}
                                        />
                                        <div>
                                            <p><strong>{item.product?.name}</strong></p>
                                            <p>Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className={styles.price}>
                                        {Number(item.subtotal_after_discount).toLocaleString('vi-VN')} VND
                                    </span>
                                </div>
                            ))}
                            <hr />
                            <div className={styles.total}>
                                <strong>Total</strong>
                                <strong className={styles.totalPrice}>
                                    {Number(cart.total_price_after_discount).toLocaleString('vi-VN')} VND
                                </strong>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;