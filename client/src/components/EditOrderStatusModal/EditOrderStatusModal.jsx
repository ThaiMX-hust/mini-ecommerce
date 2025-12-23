import React, { useState, useEffect } from "react";
import styles from "./EditOrderStatusModal.module.css";

const ORDER_STATUSES = [
  { code: "CREATED", name: "Chờ xác nhận" },
  { code: "CONFIRMED", name: "Đã xác nhận" },
  { code: "PREPARING", name: "Chuẩn bị hàng" },
  { code: "SHIPPING", name: "Đang vận chuyển" },
  { code: "DELIVERED", name: "Đã giao hàng" },
  { code: "COMPLETED", name: "Hoàn thành" },
  { code: "CANCELLED", name: "Đã hủy" },
  { code: "REFUNDED", name: "Đã hoàn tiền" },
];

const EditOrderStatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading,
}) => {
  const [statusCode, setStatusCode] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (order && isOpen) {
      setStatusCode(order.status?.order_status_code || "");
      setNote("");
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (statusCode) {
      onConfirm(statusCode, note);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Cập Nhật Trạng Thái Đơn Hàng</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={isLoading}
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.orderInfo}>
            <p>
              <strong>Mã đơn hàng:</strong> {order?.order_id?.substring(0, 50)}
              ...
            </p>
            <p>
              <strong>Khách hàng:</strong> {order?.receiver_name}
            </p>
            <p>
              <strong>Trạng thái hiện tại:</strong> {order?.status}
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="statusCode">
              Trạng Thái Mới <span className={styles.required}>*</span>
            </label>
            <select
              id="statusCode"
              value={statusCode}
              onChange={(e) => setStatusCode(e.target.value)}
              className={styles.select}
              required
              disabled={isLoading}
            >
              <option value="">-- Chọn trạng thái --</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.code} value={status.code}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="note">Ghi Chú</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.textarea}
              placeholder="Nhập ghi chú (tùy chọn)..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={isLoading || !statusCode}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Cập Nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderStatusModal;
