import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../api/productApi";
import { getAllCategories } from "../../api/categoryApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import Hero from "../../components/Hero/Hero";
import Newsletter from "../../components/Newsletter/Newsletter";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // AUTO MOTION STATE
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [productsData, cats] = await Promise.all([
          getAllProducts({ limit: 100 }),
          getAllCategories(),
        ]);
        setAllProducts(productsData.items || []);
        setCategories(cats || []);
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  /* ================= AUTO CATEGORY ================= */
  useEffect(() => {
    if (!isAuto || categories.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAuto, categories.length]);

  /* ================= DERIVE CATEGORY ================= */
  const activeCategory = categories[activeIndex] || null;

  /* ================= FILTER PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return allProducts.slice(0, 6);

    return allProducts
      .filter((p) => p.categories.includes(activeCategory.code))
      .slice(0, 6);
  }, [activeCategory, allProducts]);

  /* ================= HANDLERS ================= */
  const handleCategoryClick = (index) => {
    setIsAuto(false);      // ⛔ tắt auto
    setActiveIndex(index);
  };

  const handleViewMore = () => {
    if (activeCategory) {
      navigate(`/products?category=${activeCategory.code}`);
    } else {
      navigate("/products");
    }
  };

  /* ================= RENDER GRID ================= */
  const renderProductGrid = () => {
    if (isLoading) return <p className={styles.loading}>Loading...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    if (filteredProducts.length === 0) {
      return <p className={styles.emptyMessage}>No products found.</p>;
    }

    return (
      <div className={styles.productGrid}>
        {filteredProducts.map((product, index) => (
          <div
            key={product.product_id}
            className={styles.productCard}
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  };

  /* ================= RENDER ================= */
  return (
    <div className={styles.homePage}>
      <main>
        <Hero />

        <section className={styles.newArrivals}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <p className={styles.sectionDescription}>
              Explore the latest trends and styles from our new collection.
            </p>

            <div className={styles.categoryTabs}>
              {categories.map((cat, index) => (
                <button
                  key={cat.code}
                  className={`${styles.tab} ${
                    activeIndex === index ? styles.active : ""
                  }`}
                  onClick={() => handleCategoryClick(index)}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {renderProductGrid()}

            {!isLoading && !error && (
              <div className={styles.viewMoreContainer}>
                <button
                  className={styles.viewMoreButton}
                  onClick={handleViewMore}
                >
                  View More
                </button>
              </div>
            )}
          </div>
        </section>

        <Newsletter />
      </main>
    </div>
  );
};

export default HomePage;
