import React, { useState, useEffect, useCallback } from "react";
import { getAllProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import SidebarFilters from "../../components/SidebarFilters/SidebarFilters";
import Pagination from "../../components/Pagination/Pagination"; 
import { useSearchParams } from "react-router-dom";
import styles from "./ProductListPage.module.css";

// Hook useDebounce không thay đổi
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // 2. Thêm state cho trang hiện tại

  // 3. Cập nhật state filters cho thanh trượt giá 2 đầu
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
  });
  const [sort, setSort] = useState("price-asc");

  const debouncedPriceRange = useDebounce(filters.priceRange, 500);

  const fetchProducts = useCallback(
    async (page) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          limit: 9,
          page: page, // 4. Sử dụng page được truyền vào
          categories: filters.categories,
          min_price: debouncedPriceRange[0],
          max_price:
            debouncedPriceRange[1] === 1000
              ? undefined
              : debouncedPriceRange[1],
            
        };
        
        if(searchQuery && searchQuery.trim()){
          params.search = searchQuery.trim();
          console.log(searchQuery.trim());
          console.log(params.search);
        }

        Object.keys(params).forEach((key) =>{
          if(params[key] === undefined || params[key]=== null 
            || (Array.isArray(params[key]) && params[key].length === 0)
          ){
            delete params[key];
          }
            
      });

        const data = await getAllProducts(params);
        setProducts(data.items);
        setPagination({
          page: data.page,
          limit: data.limit,
          total_pages: data.total_pages,
          total_items: data.total_items,
        });
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    },
    [filters.categories, debouncedPriceRange, searchQuery]
  );

  useEffect(() => {
    // 5. Gọi API mỗi khi trang hoặc bộ lọc thay đổi
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage, debouncedPriceRange, filters.categories, searchQuery]); // ✅ Thêm searchQuery

  const handleFilterChange = (filterName, value) => {
    // 6. Reset cả trang về 1 khi filter thay đổi
    setCurrentPage(1);
    if (filterName === "reset") {
      setFilters({ categories: [], priceRange: [0, 1000] });
      return;
    }
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
  };

  // 7. Hàm xử lý khi người dùng click vào một trang mới
  const handlePageClick = (event) => {
    // event.selected là index (bắt đầu từ 0), nên ta + 1
    const newPage = event.selected + 1;
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
  };

  // Sắp xếp client-side không thay đổi
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.min_price - b.min_price;
    if (sort === "price-desc") return b.min_price - a.min_price;
    return 0;
  });

  // Tính toán thông tin hiển thị
  const firstItemIndex = (pagination.page - 1) * pagination.limit + 1;
  const lastItemIndex = firstItemIndex + products.length - 1;

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
      
      <SidebarFilters filters={filters} onFilterChange={handleFilterChange} />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>All Products</h1>
          <div className={styles.info}>
            {pagination.total_items > 0 && (
              <p>
                Showing {firstItemIndex}-{lastItemIndex} of{" "}
                {pagination.total_items} products
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
            {/* Thêm các option sort khác */}
          </select>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <>
            <div className={styles.productGrid}>
              {sortedProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>

            {/* 8. Render component Pagination */}
            <Pagination
              pageCount={pagination.total_pages || 0}
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
