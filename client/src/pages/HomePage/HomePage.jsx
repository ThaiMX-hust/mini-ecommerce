// src/pages/HomePage/HomePage.jsx (PHIÊN BẢN LỌC PHÍA CLIENT)

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../api/productApi";
import { getAllCategories } from "../../api/categoryApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import Hero from "../../components/Hero/Hero";
import Newsletter from "../../components/Newsletter/Newsletter";
import styles from "./HomePage.module.css";

const HomePage = () => {
  // State để lưu TOÀN BỘ sản phẩm fetch về
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  // 1. Effect để fetch TOÀN BỘ sản phẩm và categories MỘT LẦN DUY NHẤT
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Gọi song song 2 API để tối ưu
        const [productsData, cats] = await Promise.all([
          getAllProducts({ limit: 100 }), // Lấy một lượng lớn sản phẩm
          getAllCategories(),
        ]);

        setAllProducts(productsData.items || []);
        setCategories(cats || []);
      } catch (err) {
        setError("Failed to load initial data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

  // 2. Logic LỌC THỦ CÔNG sử dụng useMemo để tối ưu hiệu năng
  const filteredProducts = useMemo(() => {
    if (!activeCategory) {
      // Nếu không có category nào được chọn, hiển thị 6 sản phẩm đầu tiên
      return allProducts.slice(0, 6);
    }
    // Lọc thủ công trong mảng allProducts
    const productsInCategory = allProducts.filter((product) =>
      product.categories.includes(activeCategory.code)
    );
    // Chỉ lấy 6 sản phẩm đầu tiên của category đó
    return productsInCategory.slice(0, 6);
  }, [activeCategory, allProducts]); // Chỉ tính toán lại khi activeCategory hoặc allProducts thay đổi

  const handleCategoryClick = (category) => {
    if (activeCategory && activeCategory.code === category.code) {
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
  };

  const handleViewMore = () => {
    if (activeCategory) {
      navigate(`/products?category=${activeCategory.code}`);
    } else {
      navigate("/products");
    }
  };

  const renderProductGrid = () => {
    if (isLoading) {
      return <p className={styles.loading}>Loading...</p>;
    }
    if (error) {
      return <p className={styles.error}>{error}</p>;
    }
    // 3. Hiển thị mảng đã được lọc thủ công
    if (filteredProducts.length === 0) {
      return (
        <p className={styles.emptyMessage}>
          No products found in this category.
        </p>
      );
    }
    return (
      <div className={styles.productGrid}>
        {filteredProducts.map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    );
  };

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
              {categories.map((cat) => (
                <button
                  key={cat.code}
                  className={`${styles.tab} ${
                    activeCategory?.code === cat.code ? styles.active : ""
                  }`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {renderProductGrid()}

            {!isLoading && !error && (
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
    </div>
  );
};

export default HomePage;
