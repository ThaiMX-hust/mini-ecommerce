// OrderStatusBadge.jsx
import React from "react";
import styles from "./OrderStatusBadge.module.css";

const OrderStatusBadge = ({ status }) => {
  const statusClass =
    styles[status?.toLowerCase().replace(" ", "")] || styles.default;
  return <span className={`${styles.badge} ${statusClass}`}>{status}</span>;
};
export default OrderStatusBadge;
