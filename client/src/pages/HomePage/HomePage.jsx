import React, { useState, useEffect } from "react";
import { getAllProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard/ProductCard";
// Giả sử bạn đã tạo các component tĩnh này
// import Header from '../../components/Header/Header';
// import Hero from '../../components/Hero/Hero';
// import Features from '../../components/Features/Features';
// import Footer from '../../components/Footer/Footer';
import Newsletter from "../../components/Newsletter/Newsletter";
import styles from "./HomePage.module.css";
import Hero from "../../components/Hero/Hero";

const CATEGORIES = [
  "Women's Fashion",
  "Men's Fashion",
  "Women Accessories",
  "Men Accessories",
  "Discount Deals",
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Women's Fashion");

  const fetchProducts = async (currentPage, category, shouldAppend = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 6, // Hiển thị 6 sản phẩm mỗi lần tải
        categories: [category],
      };
      const data = await getAllProducts(params);

      if (shouldAppend) {
        setProducts((prevProducts) => [...prevProducts, ...data.items]);
      } else {
        setProducts(data.items);
      }

      // Kiểm tra xem còn sản phẩm để tải thêm không
      setHasMore(data.page < data.total_pages);
    } catch (err) {
      setError("Failed to load products. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect để fetch lại sản phẩm khi category thay đổi
  useEffect(() => {
    setPage(1); // Reset lại trang về 1 khi đổi category
    setHasMore(true); // Reset lại hasMore
    fetchProducts(1, activeCategory, false);
  }, [activeCategory]);

  const handleViewMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, activeCategory, true);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  return (
    <div className={styles.homePage}>
      {/* <Header /> */}
      <main>
        <Hero />
        {/* <Features /> */}

        <section className={styles.newArrivals}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <p className={styles.sectionDescription}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Scelerisque duis ultrices sollicitudin aliquam.
            </p>

            <div className={styles.categoryTabs}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.tab} ${
                    activeCategory === cat ? styles.active : ""
                  }`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>

            {isLoading && <p className={styles.loading}>Loading...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {hasMore && !isLoading && (
              <div className={styles.viewMoreContainer}>
                <button
                  onClick={handleViewMore}
                  className={styles.viewMoreButton}
                >
                  View More
                </button>
              </div>
            )}
          </div>
        </section>
        <Newsletter />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default HomePage;
