import React, { useState, useMemo } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./SidebarFilters.module.css";

const SidebarFilters = ({
  filters,
  onFilterChange,
  availableCategories = [],
}) => {
  const [categorySearch, setCategorySearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

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
    setCategorySearch("");
    setShowAllCategories(false);
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return availableCategories;

    const searchLower = categorySearch.toLowerCase();
    return availableCategories.filter((cat) =>
      cat.name.toLowerCase().includes(searchLower)
    );
  }, [availableCategories, categorySearch]);

  // Show only first 8 categories by default
  const displayedCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, 8);

  const selectedCount = filters.categories?.length || 0;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.filterGroup}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Danh mục</h3>
          {selectedCount > 0 && (
            <span className={styles.badge}>{selectedCount}</span>
          )}
        </div>

        {/* Search Input */}
        {availableCategories.length > 8 && (
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className={styles.searchInput}
            />
            {categorySearch && (
              <button
                className={styles.clearSearch}
                onClick={() => setCategorySearch("")}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Categories List */}
        <div className={styles.categoryList}>
          {displayedCategories.length > 0 ? (
            displayedCategories.map((category) => (
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
            <p className={styles.noResults}>Không tìm thấy danh mục</p>
          )}
        </div>

        {/* Show More/Less Button */}
        {!categorySearch && filteredCategories.length > 8 && (
          <button
            className={styles.showMoreButton}
            onClick={() => setShowAllCategories(!showAllCategories)}
          >
            {showAllCategories
              ? "Thu gọn"
              : `Xem tất cả (${availableCategories.length})`}
          </button>
        )}
      </div>

      {/* Price Range Filter */}
      <div className={styles.filterGroup}>
        <h3 className={styles.title}>Khoảng giá</h3>
        <div className={styles.sliderWrapper}>
          <Slider
            range
            min={0}
            max={1000000}
            step={10000}
            allowCross={false}
            defaultValue={[0, 1000000]}
            value={filters.priceRange || [0, 1000000]}
            onChange={handlePriceChange}
          />
        </div>
        <div className={styles.priceLabels}>
          <span>
            {filters.priceRange ? filters.priceRange[0].toLocaleString() : 0}₫
          </span>
          <span>
            {filters.priceRange
              ? filters.priceRange[1].toLocaleString()
              : "1,000,000"}
            ₫
          </span>
        </div>
      </div>

      <button onClick={handleResetFilters} className={styles.resetButton}>
        Đặt lại bộ lọc
      </button>
    </aside>
  );
};

export default SidebarFilters;
