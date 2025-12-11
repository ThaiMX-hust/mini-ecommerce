import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getAllProducts } from "../../api/productApi";
import { getAllPossibleCategories } from "../../api/categoryApi"; // Sử dụng hàm này
import ProductCard from "../../components/ProductCard/ProductCard";
import SidebarFilters from "../../components/SidebarFilters/SidebarFilters";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./ProductListPage.module.css";

const ITEMS_PER_PAGE = 9;

const ProductListPage = () => {
  const location = useLocation();

  // State để lưu dữ liệu gốc từ API
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // State cho trạng thái UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("price-asc");

  // State cho bộ lọc
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    const initialCategory = params.get("category");
    return {
      categories: initialCategory ? [initialCategory] : [],
      priceRange: [0, 1000000],
    };
  });

  // 1. Fetch TẤT CẢ dữ liệu một lần duy nhất
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, catsData] = await Promise.all([
          getAllProducts({ limit: 1000 }), // Lấy tất cả sản phẩm
          getAllPossibleCategories(),
        ]);
        setAllProducts(productsData.items || []);
        setAllCategories(catsData || []);
      } catch (err) {
        setError("Failed to load products.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // 2. LOGIC LỌC, SẮP XẾP, VÀ PHÂN TRANG PHÍA CLIENT (sử dụng useMemo)
  const paginatedProducts = useMemo(() => {
    let filtered = [...allProducts];

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
  }, [allProducts, filters, sort, currentPage]);

  const handleFilterChange = (filterName, value) => {
    setCurrentPage(1); // Luôn reset về trang 1 khi filter thay đổi
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

  // Tính toán thông tin hiển thị
  const firstItemIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastItemIndex = firstItemIndex + paginatedProducts.items.length - 1;

  return (
    <>
    {searchQuery && searchQuery.trim() && (
      <div className={styles.searchInfoWrapper}> 
        <p className={styles.searchInfo}>
          Showing results for: "<strong>{searchQuery}</strong>"
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
          <h1 className={styles.title}>All Products</h1>
          <div className={styles.info}>
            {!isLoading && paginatedProducts.totalItems > 0 && (
              <p>
                Showing {firstItemIndex}-{lastItemIndex} of{" "}
                {paginatedProducts.totalItems} products
              </p>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={styles.sortDropdown}
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
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
                  No products match your filters.
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
