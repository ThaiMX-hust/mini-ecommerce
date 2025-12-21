import React from "react";
import styles from "./StatusBadge.module.css";

const StatusBadge = ({ isActive }) => {
  return (
    <span
      className={`${styles.badge} ${
        isActive ? styles.active : styles.disabled
      }`}
    >
      {isActive ? "Hoạt Động" : "Tắt"}
    </span>
  );
};

export default StatusBadge;
