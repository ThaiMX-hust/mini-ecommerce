import React from "react";
import styles from "./ConfirmationModal.module.css";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác Nhận",
  cancelText = "Hủy",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <button
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.button} ${styles.confirmButton}`}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
