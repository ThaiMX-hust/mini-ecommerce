import React, { useState, useEffect } from "react";
import { getOrderDetail } from "../../api/orderApi";
import styles from "./OrderDetailModal.module.css";

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const res = await getOrderDetail(orderId);
          setDetail(res.data);
        } catch (error) {
          console.error("Failed to fetch order details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, orderId]);

  const formatCurrency = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-GB");

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Order Details</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.body}>
          {loading ? (
            <p>Loading details...</p>
          ) : !detail ? (
            <p>Could not load details.</p>
          ) : (
            <>
              <p className={styles.orderId}>Order ID: {detail.order_id}</p>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Customer Information</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <span>Receiver:</span> {detail.receiver_name}
                  </div>
                  <div>
                    <span>Phone:</span> {detail.phone}
                  </div>
                </div>
                <div className={styles.fullWidth}>
                  <span>Address:</span> {detail.address}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Pricing</h3>
                <div className={styles.infoGrid}>
                  <div>
                    <span>Subtotal:</span>{" "}
                    {formatCurrency(detail.raw_total_price)}
                  </div>
                  <div>
                    <span>Grand Total:</span>{" "}
                    {formatCurrency(detail.final_total_price)}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Status History</h3>
                <div className={styles.statusTimeline}>
                  {detail.status_history.map((history) => (
                    <div
                      key={history.changed_at}
                      className={styles.timelineItem}
                    >
                      <div className={styles.timelineDot}></div>
                      <div className={styles.timelineContent}>
                        <span className={styles.statusName}>
                          {history.status.name}
                        </span>
                        <span className={styles.statusTime}>
                          {formatDate(history.changed_at)}
                        </span>
                        <p className={styles.statusNote}>
                          "{history.note}" - by {history.changed_by}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Products</h3>
                {detail.items.map((item) => (
                  <div key={item.sku} className={styles.productItem}>
                    <img
                      src={item.image_urls?.[0] || "/placeholder.png"}
                      alt={item.name}
                    />
                    <div className={styles.productInfo}>
                      <h4>{item.name}</h4>
                      <p>SKU: {item.sku}</p>
                      <p>
                        Options:{" "}
                        {item.options
                          .map((opt) => `${opt.name}: ${opt.value}`)
                          .join(", ")}
                      </p>
                      <p>
                        {item.quantity} x {formatCurrency(item.final_price)} ={" "}
                        <strong>{formatCurrency(item.subtotal)}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
