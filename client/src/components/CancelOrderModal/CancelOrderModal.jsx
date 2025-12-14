import React, { useState, useEffect } from "react";
import styles from "./CancelOrderModal.module.css";

const CancelOrderModal = ({ isOpen, onClose, onConfirm, order, isLoading }) => {
  const [reason, setReason] = useState("");

  // Reset reason when modal is opened for a new order
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
            <i className={`fas fa-exclamation-circle ${styles.icon}`}></i>{" "}
            Cancel Order
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.body}>
          <p>
            Please provide a reason for cancelling order{" "}
            <strong>#{order.order_id.substring(0, 8)}...</strong>. This action
            cannot be undone.
          </p>
          <div className={styles.formGroup}>
            <label htmlFor="reason">Reason for Cancellation</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
              placeholder="Enter reason for cancellation..."
            />
          </div>
        </div>
        <div className={styles.footer}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`${styles.button} ${styles.btnSecondary}`}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isLoading || !reason}
            className={`${styles.button} ${styles.btnDanger}`}
          >
            {isLoading ? "Confirming..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
