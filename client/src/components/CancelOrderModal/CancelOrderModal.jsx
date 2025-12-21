import React, { useState, useEffect } from "react";
import styles from "./CancelOrderModal.module.css";

const CancelOrderModal = ({ isOpen, onClose, onConfirm, order, isLoading }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <i className={`fas fa-exclamation-circle ${styles.icon}`}></i> Hủy
            Đơn Hàng
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.body}>
          <p>
            Vui lòng cung cấp lý do hủy đơn hàng{" "}
            <strong>#{order.order_id.substring(0, 8)}...</strong>. Hành động này
            không thể hoàn tác.
          </p>
          <div className={styles.formGroup}>
            <label htmlFor="reason">Lý Do Hủy</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
              placeholder="Nhập lý do hủy đơn hàng..."
            />
          </div>
        </div>
        <div className={styles.footer}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`${styles.button} ${styles.btnSecondary}`}
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isLoading || !reason}
            className={`${styles.button} ${styles.btnDanger}`}
          >
            {isLoading ? "Đang xác nhận..." : "Xác Nhận Hủy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
