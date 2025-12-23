import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import StripeCheckout from "../../components/StripeCheckout/StripeCheckout";
import styles from "./CheckoutPage.module.css";

const CheckoutPage = () => {
  const navigate = useNavigate();

  /* ===== STATE ===== */
  const [formData, setFormData] = useState({
    receiver_name: "",
    phone: "",
    address: "",
  });

  const [cart, setCart] = useState({
    items: [],
    total_price_after_discount: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Stripe specific states
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showStripeForm, setShowStripeForm] = useState(false);

  /* ===== FETCH CART ===== */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart");
        setCart(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải giỏ hàng. Vui lòng thử lại.");
      }
    };

    fetchCart();
  }, []);

  /* ===== HANDLERS ===== */
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Tạo đơn hàng
      const orderRes = await api.post("/orders", {
        receiver_name: formData.receiver_name,
        phone: formData.phone,
        address: formData.address,
      });

      const { order_id } = orderRes.data;
      setCurrentOrderId(order_id);

      // 2. Xử lý thanh toán theo phương thức
      if (paymentMethod === "vnpay") {
        const paymentRes = await api.post("/payments/vnpay", {
          orderId: order_id,
        });

        if (paymentRes.data?.url) {
          window.location.href = paymentRes.data.url;
        } else {
          throw new Error("Không lấy được link thanh toán VNPay");
        }
      } else if (paymentMethod === "stripe") {
        // Lấy client secret từ backend
        const paymentRes = await api.post("/payments/stripe", {
          orderId: order_id,
        });

        setStripeClientSecret(paymentRes.data.clientSecret);
        setShowStripeForm(true);
        setLoading(false);
      } else {
        // Thanh toán sau
        navigate("/orders", {
          state: {
            message: "Đơn hàng đã được tạo. Vui lòng thanh toán để đơn hàng được xử lý.",
          },
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại."
      );
      setLoading(false);
    }
  };

  const handleStripeSuccess = () => {
    navigate("/orders", {
      state: {
        message: "Thanh toán thành công! Đơn hàng đã được xác nhận.",
      },
    });
  };

  const handleStripeError = (error) => {
    setError(error.message || "Thanh toán thất bại. Vui lòng thử lại.");
    setShowStripeForm(false);
    setStripeClientSecret(null);
  };

  // Nếu đang hiển thị form Stripe
  if (showStripeForm && stripeClientSecret) {
    return (
      <div className={styles.container}>
        <h2>Thanh toán qua Stripe</h2>
        <StripeCheckout
          orderId={currentOrderId}
          clientSecret={stripeClientSecret}
          onSuccess={handleStripeSuccess}
          onError={handleStripeError}
        />
        <button 
          onClick={() => {
            setShowStripeForm(false);
            setStripeClientSecret(null);
          }}
          className={styles.backButton}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  /* ===== RENDER ===== */
  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* ===== FORM ===== */}
        <div className={styles.formSection}>
          <h2>Thanh toán</h2>

          <form onSubmit={handleSubmit}>
            <h3>Địa chỉ giao hàng</h3>

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
              placeholder="Địa chỉ giao hàng"
              value={formData.address}
              onChange={handleInputChange}
              required
            />

            <h3>Phương thức thanh toán</h3>

            <div className={styles.paymentMethodGroup}>
              <label className={styles.paymentMethodOption}>
                <input
                  type="radio"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className={styles.radioLabel}>
                  <strong>💳 VNPay</strong>
                  <p>Thanh toán qua cổng VNPay</p>
                </div>
              </label>

              <label className={styles.paymentMethodOption}>
                <input
                  type="radio"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className={styles.radioLabel}>
                  <strong>💳 Stripe</strong>
                  <p>Thanh toán quốc tế qua Stripe (Visa, Mastercard, ...)</p>
                </div>
              </label>

              <label className={styles.paymentMethodOption}>
                <input
                  type="radio"
                  value="later"
                  checked={paymentMethod === "later"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className={styles.radioLabel}>
                  <strong>🕐 Thanh toán sau</strong>
                  <p>Đơn hàng chỉ được xử lý sau khi thanh toán</p>
                </div>
              </label>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#666", textAlign: "center" }}>
              🔒 Thanh toán an toàn – Chúng tôi không lưu thông tin thẻ của bạn
            </p>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.payButton}
              disabled={loading || cart.items.length === 0}
            >
              {loading
                ? "Đang xử lý..."
                : paymentMethod === "vnpay"
                ? "Thanh toán qua VNPay"
                : paymentMethod === "stripe"
                ? "Thanh toán qua Stripe"
                : "Đặt hàng"}
            </button>
          </form>
        </div>

        {/* ===== ORDER SUMMARY ===== */}
        <div className={styles.summarySection}>
          <h3>Tóm tắt đơn hàng</h3>

          {cart.items.length === 0 ? (
            <p>Giỏ hàng trống</p>
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
                      <p>Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <span>
                    {Number(
                      item.subtotal_after_discount
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </span>
                </div>
              ))}

              <hr />

              <div className={styles.total}>
                <strong>Tổng cộng</strong>
                <strong>
                  {Number(cart.total_price_after_discount).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  ₫
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
