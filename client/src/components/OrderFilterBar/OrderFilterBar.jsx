import React from "react";
import styles from "./OrderFilterBar.module.css";

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

const SORT_OPTIONS = [
  { value: "created_at", label: "Ngày Tạo" },
  { value: "final_total_price", label: "Tổng Giá" },
];

const SORT_ORDER = [
  { value: "desc", label: "Giảm Dần" },
  { value: "asc", label: "Tăng Dần" },
];

const OrderFilterBar = ({ filters, onFilterChange }) => {
  return (
    <div className={styles.filterBar}>
      <h3 className={styles.title}>
        <i className="fas fa-filter"></i> Bộ Lọc
      </h3>
      <div className={styles.controlsGrid}>
        {/* Status Filter */}
        <div className={styles.controlGroup}>
          <label htmlFor="status_code">Trạng Thái</label>
          <select
            id="status_code"
            name="status_code"
            value={filters.status_code}
            onChange={onFilterChange}
          >
            <option value="">Tất Cả Trạng Thái</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Filter */}
        <div className={styles.controlGroup}>
          <label htmlFor="sort_by">Sắp Xếp Theo</label>
          <select
            id="sort_by"
            name="sort_by"
            value={filters.sort_by}
            onChange={onFilterChange}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order Filter */}
        <div className={styles.controlGroup}>
          <label htmlFor="sort_order">Thứ Tự</label>
          <select
            id="sort_order"
            name="sort_order"
            value={filters.sort_order}
            onChange={onFilterChange}
          >
            {SORT_ORDER.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderFilterBar;
