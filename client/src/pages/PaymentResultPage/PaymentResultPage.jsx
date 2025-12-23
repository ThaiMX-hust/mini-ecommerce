import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import styles from "./PaymentResultPage.module.css";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Hỗ trợ cả VNPay và Stripe
  const vnpaySuccess = searchParams.get("success") === "true";
  const stripeStatus = searchParams.get("redirect_status");
  const paymentIntent = searchParams.get("payment_intent");
  
  // Xác định thành công hay thất bại
  const success = vnpaySuccess || stripeStatus === "succeeded";
  
  // Lấy message và orderId
  let message = searchParams.get("message");
  const orderId = searchParams.get("orderId");
  
  // Tạo message phù hợp nếu chưa có
  if (!message) {
    if (stripeStatus === "succeeded") {
      message = "Thanh toán qua Stripe thành công!";
    } else if (stripeStatus === "failed") {
      message = "Thanh toán qua Stripe thất bại. Vui lòng thử lại.";
    } else if (stripeStatus === "processing") {
      message = "Thanh toán đang được xử lý. Vui lòng đợi...";
    } else if (stripeStatus === "requires_payment_method") {
      message = "Thanh toán yêu cầu phương thức thanh toán khác.";
    } else {
      message = success ? "Thanh toán thành công!" : "Thanh toán thất bại!";
    }
  }

  const handleBackToOrders = () => {
    navigate("/orders?fromPayment=true");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {success ? (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h1 className={styles.title}>Thanh toán thành công!</h1>
            <p className={styles.message}>{message}</p>
            {orderId && (
              <p className={styles.orderId}>Mã đơn hàng: {orderId}</p>
            )}
            {paymentIntent && (
              <p className={styles.paymentIntent}>
                Payment Intent: {paymentIntent}
              </p>
            )}
            <div className={styles.actions}>
              <button
                onClick={handleBackToOrders}
                className={styles.btnPrimary}
              >
                Xem lịch sử đơn hàng
              </button>
              <Link to="/" className={styles.btnSecondary}>
                Về trang chủ
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={styles.iconError}>✕</div>
            <h1 className={styles.title}>Thanh toán thất bại</h1>
            <p className={styles.message}>{message}</p>
            {orderId && (
              <p className={styles.orderId}>Mã đơn hàng: {orderId}</p>
            )}
            <div className={styles.actions}>
              {orderId && (
                <button
                  onClick={() => navigate(`/orders`)}
                  className={styles.btnPrimary}
                >
                  Thử thanh toán lại
                </button>
              )}
              <Link to="/checkout" className={styles.btnSecondary}>
                Về trang checkout
              </Link>
              <Link to="/" className={styles.btnSecondary}>
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;