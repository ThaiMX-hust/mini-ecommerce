import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getAllProducts } from "../../api/productApi";
import { getAllPossibleCategories } from "../../api/categoryApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import SidebarFilters from "../../components/SidebarFilters/SidebarFilters";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./ProductListPage.module.css";

const ITEMS_PER_PAGE = 9;

const ProductListPage = () => {
  const location = useLocation();

  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("price-asc");

  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search") || "";
  });

  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    const initialCategory = params.get("category");
    return {
      categories: initialCategory ? [initialCategory] : [],
      priceRange: [0, 1000000],
    };
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newSearchQuery = params.get("search") || "";
    setSearchQuery(newSearchQuery);
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, catsData] = await Promise.all([
          getAllProducts({ limit: 1000 }),
          getAllPossibleCategories(),
        ]);
        setAllProducts(productsData.items || []);
        setAllCategories(catsData || []);
      } catch (err) {
        setError("Lỗi khi tải sản phẩm. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const paginatedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Lọc theo search query
    if (searchQuery && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(lowerQuery)
      );
    }

    // Lọc theo category
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.some((catCode) =>
          product.categories.includes(catCode)
        )
      );
    }

    // Lọc theo giá
    const [minPrice, maxPrice] = filters.priceRange;
    filtered = filtered.filter(
      (product) =>
        product.min_price >= minPrice && product.min_price <= maxPrice
    );

    // Sắp xếp
    filtered.sort((a, b) => {
      if (sort === "price-asc") return a.min_price - b.min_price;
      if (sort === "price-desc") return b.min_price - a.min_price;
      return 0;
    });

    // Phân trang
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE),
    };
  }, [allProducts, filters, sort, currentPage, searchQuery]);

  const handleFilterChange = (filterName, value) => {
    setCurrentPage(1);
    if (filterName === "reset") {
      setFilters({ categories: [], priceRange: [0, 1000000] });
      return;
    }
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);
    window.scrollTo(0, 0);
  };

  const firstItemIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastItemIndex = firstItemIndex + paginatedProducts.items.length - 1;

  return (
    <>
      {/* ✅ Hiển thị thông báo search */}
      {searchQuery && searchQuery.trim() && (
        <div className={styles.searchInfoWrapper}>
          <p className={styles.searchInfo}>
            Showing results for: "<strong>{searchQuery}</strong>"
            {paginatedProducts.totalItems === 0 &&
              " - Không tìm thấy sản phẩm nào"}
          </p>
        </div>
      )}
      <div className={styles.container}>
        <SidebarFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          availableCategories={allCategories}
        />
        <main className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {searchQuery ? "Kết quả tìm kiếm" : "Tất cả sản phẩm"}
            </h1>
            <div className={styles.info}>
              {!isLoading && paginatedProducts.totalItems > 0 && (
                <p>
                  Hiển thị {firstItemIndex}-{lastItemIndex} trong tổng số{" "}
                  {paginatedProducts.totalItems} sản phẩm
                </p>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={styles.sortDropdown}
            >
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
            </select>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <>
              <div className={styles.productGrid}>
                {paginatedProducts.items.length > 0 ? (
                  paginatedProducts.items.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                  ))
                ) : (
                  <p className={styles.emptyMessage}>
                    {searchQuery
                      ? `Không tìm thấy sản phẩm cho "${searchQuery}"`
                      : "Không có sản phẩm nào phù hợp với bộ lọc của bạn."}
                  </p>
                )}
              </div>
              <Pagination
                pageCount={paginatedProducts.totalPages || 0}
                onPageChange={handlePageClick}
                currentPage={currentPage}
              />
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default ProductListPage;
