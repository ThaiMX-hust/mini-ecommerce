// src/components/SidebarFilters/SidebarFilters.jsx (PHIÊN BẢN HOÀN CHỈNH)

import React from "react";
// 1. Import component từ 'rc-slider' và đổi tên nó thành 'SliderRange' để tránh lỗi.
import Slider from "rc-slider";
// 2. Import CSS bắt buộc của thư viện để nó hiển thị đúng.
import "rc-slider/assets/index.css";
import styles from "./SidebarFilters.module.css";

// Tạm thời hardcode danh sách categories. Sau này nên gọi API để lấy.
const AVAILABLE_CATEGORIES = [
  "Clothing",
  "Electronics",
  "Furniture",
  "Accessories",
  "Footwear",
];

const SidebarFilters = ({ filters, onFilterChange }) => {
  const handleCategoryChange = (e) => {
    const { name, checked } = e.target;
    const currentCategories = filters.categories || [];
    const newCategories = checked
      ? [...currentCategories, name]
      : currentCategories.filter((cat) => cat !== name);
    onFilterChange("categories", newCategories);
  };

  // 3. Thêm hàm xử lý mới cho thanh trượt giá
  const handlePriceChange = (value) => {
    // value là một mảng [min, max] được trả về từ SliderRange
    onFilterChange("priceRange", value);
  };

  const handleResetFilters = () => {
    onFilterChange("reset", null);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.filterGroup}>
        <h3 className={styles.title}>Categories</h3>
        {AVAILABLE_CATEGORIES.map((category) => (
          <div key={category} className={styles.checkboxItem}>
            <input
              type="checkbox"
              id={category}
              name={category}
              checked={filters.categories?.includes(category) || false}
              onChange={handleCategoryChange}
            />
            <label htmlFor={category}>{category}</label>
          </div>
        ))}
      </div>

      {/* 4. Thêm khối JSX cho bộ lọc giá */}
      <div className={styles.filterGroup}>
        <h3 className={styles.title}>Price Range</h3>
        <div className={styles.sliderWrapper}>
          <Slider
            range // Prop này để kích hoạt chế độ 2 đầu kéo
            min={0}
            max={1000}
            allowCross={false}
            defaultValue={[0, 1000]}
            value={filters.priceRange || [0, 1000]}
            onChange={handlePriceChange}
          />
        </div>
        <div className={styles.priceLabels}>
          <span>${filters.priceRange ? filters.priceRange[0] : 0}</span>
          <span>${filters.priceRange ? filters.priceRange[1] : 1000}</span>
        </div>
      </div>

      <button onClick={handleResetFilters} className={styles.resetButton}>
        Reset Filters
      </button>
    </aside>
  );
};

export default SidebarFilters;
