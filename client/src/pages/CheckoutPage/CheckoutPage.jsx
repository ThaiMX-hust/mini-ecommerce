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
  const [cart, setCart] = useState({
    items: [],
    total_price_after_discount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("vnpay"); // ✅ Thêm state chọn phương thức
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
      // Tạo đơn hàng
      const orderRes = await api.post("/orders", formData);
      const { order_id, total_price_after_discount } = orderRes.data;

      // ✅ Kiểm tra phương thức thanh toán
      if (paymentMethod === "vnpay") {
        // Thanh toán ngay qua VNPay
        const paymentRes = await api.post("/payments/vnpay", {
          orderInfo: `Thanh toán đơn hàng ${order_id}`,
          orderId: order_id,
          amount: total_price_after_discount,
        });

        if (paymentRes.data.url) {
          window.location.href = paymentRes.data.url;
        }
      } else {
        // Thanh toán sau - redirect về Order History
        navigate(`/orders?new_order=${order_id}`, {
          state: {
            message:
              "Order created successfully! You can pay anytime from Order History.",
          },
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred while processing the order.";
      setError(errorMessage);
      console.error("Error creating order:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Checkout Form */}
        <div className={styles.formSection}>
          <h2>Thanh Toán</h2>
          <form onSubmit={handleSubmit}>
            <h3>Thông Tin Liên Hệ</h3>
            <input
              name="email"
              placeholder="Địa chỉ email"
              type="email"
              required
            />

            <h3>Địa Chỉ Giao Hàng</h3>
            <input
              name="receiver_name"
              placeholder="Tên người nhận"
              value={formData.receiver_name}
              onChange={handleInputChange}
              required
            />
            <input
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              name="address"
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={handleInputChange}
              required
            />

            {/* ✅ THÊM LỰA CHỌN PHƯƠNG THỨC THANH TOÁN */}
            <h3>Phương Thức Thanh Toán</h3>
            <div className={styles.paymentMethodGroup}>
              <label className={styles.paymentMethodOption}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className={styles.radioLabel}>
                  <strong>💳 Thanh Toán Ngay bằng VNPay</strong>
                  <p>Chuyển hướng đến VNPay để thanh toán ngay</p>
                </div>
              </label>

              <label className={styles.paymentMethodOption}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="later"
                  checked={paymentMethod === "later"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className={styles.radioLabel}>
                  <strong>🕐 Thanh Toán Sau</strong>
                  <p>
                    Tạo đơn hàng và thanh toán bất kỳ lúc nào từ Lịch Sử Đơn
                    Hàng
                  </p>
                </div>
              </label>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.payButton}
              disabled={loading || cart.items.length === 0}
            >
              {loading
                ? "Đang xử lý..."
                : paymentMethod === "vnpay"
                ? "Tiến Hành Đến VNPay"
                : "Đặt Hàng"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className={styles.summarySection}>
          <h3>Tóm Tắt Đơn Hàng</h3>
          {cart.items.length === 0 ? (
            <p>Giỏ hàng của bạn đang trống</p>
          ) : (
            <>
              {cart.items.map((item) => (
                <div key={item.cart_item_id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <img
                      src={
                        item.variant?.image_urls?.[0] ||
                        "https://via.placeholder.com/50"
                      }
                      alt={item.product?.name}
                    />
                    <div>
                      <p>
                        <strong>{item.product?.name}</strong>
                      </p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className={styles.price}>
                    {Number(item.subtotal_after_discount).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VND
                  </span>
                </div>
              ))}
              <hr />
              <div className={styles.total}>
                <strong>Tổng Cộng</strong>
                <strong className={styles.totalPrice}>
                  {Number(cart.total_price_after_discount).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  VND
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
