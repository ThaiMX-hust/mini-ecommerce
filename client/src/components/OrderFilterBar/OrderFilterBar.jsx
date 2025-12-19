import React from "react";
import styles from "./OrderFilterBar.module.css";

// Tạm thời hardcode danh sách trạng thái.
// Lý tưởng nhất là gọi API GET /order-statuses để lấy danh sách này.
const ORDER_STATUSES = [
  { code: "CREATED", name: "Pending Confirmation" },
  { code: "CONFIRMED", name: "Confirmed" },
  { code: "SHIPPING", name: "Shipping" },
  { code: "COMPLETED", name: "Completed" },
  { code: "CANCELLED", name: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Date Created" },
  { value: "final_total_price", label: "Total Price" },
];

const SORT_ORDER = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

const OrderFilterBar = ({ filters, onFilterChange }) => {
  return (
    <div className={styles.filterBar}>
      <h3 className={styles.title}>
        <i className="fas fa-filter"></i> Filters
      </h3>
      <div className={styles.controlsGrid}>
        {/* Status Filter */}
        <div className={styles.controlGroup}>
          <label htmlFor="status_code">Status</label>
          <select
            id="status_code"
            name="status_code"
            value={filters.status_code}
            onChange={onFilterChange}
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status.code} value={status.code}>
                {status.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Filter */}
        <div className={styles.controlGroup}>
          <label htmlFor="sort_by">Sort By</label>
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
          <label htmlFor="sort_order">Order</label>
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

        {/* Search Filter */}
        <div className={styles.controlGroup}>
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            placeholder="Order ID, Customer Name..."
          />
        </div>
      </div>
    </div>
  );
};

export default OrderFilterBar;
