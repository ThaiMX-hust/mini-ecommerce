import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import styles from "./PaymentResultPage.module.css";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success") === "true";
  const message = searchParams.get("message") || "Unknown error";
  const orderId = searchParams.get("orderId");

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {success ? (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h1 className={styles.title}>Thanh Toán Thành Công!</h1>
            <p className={styles.message}>{message}</p>
            {orderId && (
              <p className={styles.orderId}>Mã Đơn Hàng: {orderId}</p>
            )}
            <div className={styles.actions}>
              <Link to="/order-history" className={styles.btnPrimary}>
                Xem Lịch Sử Đơn Hàng
              </Link>
              <Link to="/" className={styles.btnSecondary}>
                Trở Về Trang Chủ
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={styles.iconError}>✕</div>
            <h1 className={styles.title}>Thanh Toán Thất Bại</h1>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <Link to="/checkout" className={styles.btnPrimary}>
                Thử Lại
              </Link>
              <Link to="/" className={styles.btnSecondary}>
                Trở Về Trang Chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
