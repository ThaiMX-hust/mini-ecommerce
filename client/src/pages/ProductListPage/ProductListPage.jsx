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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [sort, setSort] = useState("price-asc");
  
  // State cho search query - đọc từ URL params
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

  //  Update searchQuery khi URL thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newSearchQuery = params.get("search") || "";
    setSearchQuery(newSearchQuery);
    setCurrentPage(1); // Reset về trang 1 khi search mới
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
        setError("Failed to load products.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Thêm search vào useMemo
  const paginatedProducts = useMemo(() => {
    let filtered = [...allProducts];

    //  Lọc theo search query (tên sản phẩm)
    if (searchQuery && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(lowerQuery)
      );
    }

    // Lọc theo category
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.some((selectedCatCode) =>
          product.categories.some(
            (productCat) => productCat.category_code === selectedCatCode
        )
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
    <div className={styles.pageWrapper}>
      {/* Hiển thị thông báo search */}
      {searchQuery && searchQuery.trim() && (
        <div className={styles.searchInfoWrapper}>
          <div className={styles.searchInfo}>
            🔍 Showing results for: "<strong>{searchQuery}</strong>"
            {paginatedProducts.totalItems === 0 && " - No products found"}
          </div>
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
            <div className={styles.titleSection}>
              <h1 className={styles.title}>
                {searchQuery ? "Search Results" : "All Products"}
              </h1>
              {!isLoading && paginatedProducts.totalItems > 0 && (
                <div className={styles.info}>
                  Showing {firstItemIndex}-{lastItemIndex} of{" "}
                  {paginatedProducts.totalItems} products
                </div>
              )}
            </div>
            
            <div className={styles.headerControls}>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={styles.sortDropdown}
                aria-label="Sort products"
              >
                <option value="price-asc">💰 Price: Low to High</option>
                <option value="price-desc">💎 Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>Loading products...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <span className={styles.errorIcon}>⚠️</span>
              <p className={styles.error}>{error}</p>
            </div>
          ) : paginatedProducts.items.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {paginatedProducts.items.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
              <Pagination
                pageCount={paginatedProducts.totalPages || 0}
                onPageChange={handlePageClick}
                currentPage={currentPage}
              />
            </>
          ) : (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>
                {searchQuery ? "🔍" : "📦"}
              </div>
              <p className={styles.emptyMessage}>
                {searchQuery
                  ? `No products found for "${searchQuery}"`
                  : "No products match your filters"}
              </p>
              <p className={styles.emptyHint}>
                {searchQuery
                  ? "Try searching with different keywords"
                  : "Try adjusting your filters to see more products"}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListPage;
