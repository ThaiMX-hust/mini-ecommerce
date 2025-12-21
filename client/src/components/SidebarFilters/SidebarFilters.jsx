import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./SidebarFilters.module.css";

const SidebarFilters = ({
  filters,
  onFilterChange,
  availableCategories = [],
}) => {
  const handleCategoryChange = (e) => {
    const { name: categoryCode, checked } = e.target;
    const currentCategories = filters.categories || [];

    const newCategories = checked
      ? [...currentCategories, categoryCode]
      : currentCategories.filter((code) => code !== categoryCode);
    onFilterChange("categories", newCategories);
  };

  const handlePriceChange = (value) => {
    onFilterChange("priceRange", value);
  };

  const handleResetFilters = () => {
    onFilterChange("reset", null);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.filterGroup}>
        <h3 className={styles.title}>Danh Mục</h3>
        {availableCategories.length > 0 ? (
          availableCategories.map((category) => (
            <div key={category.code} className={styles.checkboxItem}>
              <input
                type="checkbox"
                id={category.code}
                name={category.code}
                checked={filters.categories?.includes(category.code) || false}
                onChange={handleCategoryChange}
              />
              <label htmlFor={category.code}>{category.name}</label>
            </div>
          ))
        ) : (
          <p>Đang tải danh mục...</p>
        )}
      </div>

      {/* 4. Thêm khối JSX cho bộ lọc giá */}
      <div className={styles.filterGroup}>
        <h3 className={styles.title}>Khoảng Giá</h3>
        <div className={styles.sliderWrapper}>
          <Slider
            range
            min={0}
            max={1000000}
            allowCross={false}
            defaultValue={[0, 1000000]}
            value={filters.priceRange || [0, 1000000]}
            onChange={handlePriceChange}
          />
        </div>
        <div className={styles.priceLabels}>
          <span>${filters.priceRange ? filters.priceRange[0] : 0}</span>
          <span>${filters.priceRange ? filters.priceRange[1] : 1000000}</span>
        </div>
      </div>

      <button onClick={handleResetFilters} className={styles.resetButton}>
        Đặt Lại Bộ Lọc
      </button>
    </aside>
  );
};

export default SidebarFilters;
