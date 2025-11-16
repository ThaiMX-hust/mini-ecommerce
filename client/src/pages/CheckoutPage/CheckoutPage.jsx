import React, {useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import styles from "./CheckoutPage.module.css";

const CheckoutPage = () => {
    const [formData, setFormData] = useState({
        receiver_name: "",
        receiver_phone: "",
        address: "",
    });
    const [cart, setCart] = useState({items:[], total_price_after_discount:0});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Fetch cart data to display summary on checkout page
    useEffect(() => {
        const fetchCart = async () => { 
            try {
                const token = localStorage.getItem("token");
                if(!token) {
                    navigate("/login");
                    return;
                }
                const res = await api.get("/cart");
                setCart(res.data);
            } catch (err) {
                console.error("Error fetching cart data:", err);
                setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
            }
        };
        fetchCart();
},[navigate]);
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const orderRes = await api.post("/orders", formData);

            // Get orderID, amout from orderRes
            const { orderID, final_total_price } = orderRes.data;

            // Create payment
            const paymentRes = await api.post("/payments/vnpay/create_payment_url", {
                orderInfo: 'Thanh toán đơn hàng ' + orderID,
                orderID,
                amount: final_total_price,
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Đã xảy ra lỗi khi xử lý đơn hàng.";
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
                    <form onSubmit={handleSubmit}>
                        <h3>Contact</h3>
                        <input 
                        name="email"
                        placeholder="Email address"
                        type="email"
                        />
                        <h3>Delivery Address</h3>
                        <div className={styles.nameFields}>
                            <input 
                            name="first_name" placeholder="First Name"
                            />
                            <input 
                            name="last_name" placeholder="Last Name"
                            />
                            <input 
                            name="receiver_name" placeholder="Receiver Name"
                            onChange={handleInputChange}
                            required
                            />
                            <input
                            name="receiver_phone" placeholder="Receiver Phone"
                            onChange={handleInputChange}
                            required
                            />
                            <input
                            name="address" placeholder="Address"
                            onChange={handleInputChange}
                            required
                            />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <button type="submit" className={styles.payButton} disabled={loading}>
                            {loading ? "Processing..." : "Pay with VNPay"}
                        </button>
        
                    </form>
                </div>
                {/* Order Summary */}
                <div className={styles.summarySection}>
                    <h3>Order Summary</h3>
                    {cart.items.length ==0  && <p>Your cart is empty</p>}
                    {cart.items.map((item) => (
                        <div key={item.cart_item_id} className={styles.item}>
                            <div className={styles.itemInfo}>
                                <img src={item.variant.image_urls?.[0] || 'https://via.placeholder.com/50'} alt={item.product.name}  />
                                <div>
                                    <p>{item.product.name}</p>
                                    <p>Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <span>{Number(item.subtotal_after_discount).toLocaleString('vi-VN')} VND</span>

                        </div>
                            ))}
                            <hr />
                            <div className={styles.total}>
                                <strong>Total</strong>
                                <strong>
                                    {Number(cart.total_price_after_discount).toLocaleString('vi-VN')} VND
                                </strong>

                </div>
            </div>

        </div>
        </div>
    );
};
export default CheckoutPage;