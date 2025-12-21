import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getProductById, getProductReviews } from "../../api/productApi";
import { useAppContext } from "../../contexts/AppContext";
import styles from "./ProductDetailPage.module.css";

import ImageGallery from "../../components/ImageGallery/ImageGallery";
import ProductInfo from "../../components/ProductInfo/ProductInfo";
import ProductReviews from "../../components/ProductReviews/ProductReviews";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { addToCart, isAuthenticated } = useAppContext();

  const [productData, setProductData] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [activeVariant, setActiveVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productResponse, reviewsResponse] = await Promise.all([
          getProductById(productId),
          getProductReviews(productId),
        ]);
        const data = productResponse.data;
        setProductData(data);
        setReviews(reviewsResponse.data.reviews);
        if (data.variants && data.variants.length > 0) {
          const initialVariant = data.variants[0];
          setActiveVariant(initialVariant);
          const initialSelections = {};
          initialVariant.options.forEach((opt) => {
            initialSelections[opt.product_option_id] =
              opt.value.option_value_id;
          });
          setSelectedOptions(initialSelections);
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
        setError("Lỗi khi tải dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [productId]);

  useEffect(() => {
    if (!productData || !productData.variants) return;

    const newActiveVariant = productData.variants.find((variant) => {
      return variant.options.every((variantOption) => {
        const optionId = variantOption.product_option_id;
        const valueId = variantOption.value.option_value_id;
        return selectedOptions[optionId] === valueId;
      });
    });
    setActiveVariant(newActiveVariant || null);
    setQuantity(1);
  }, [selectedOptions, productData]);

  // Các hàm xử lý sự kiện

  const handleOptionSelect = (optionId, valueId) => {
    setSelectedOptions((prevSelections) => ({
      ...prevSelections,
      [optionId]: valueId,
    }));
  };

  const handleQuantityChange = (newQuantity) => {
    if (activeVariant) {
      setQuantity(Math.min(newQuantity, activeVariant.stock));
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      window.location.href = "/login";
      return;
    }

    // Kiểm tra đã chọn variant chưa
    if (!activeVariant) {
      alert("Vui lòng chọn đầy đủ các tùy chọn sản phẩm!");
      return;
    }

    // Kiểm tra còn hàng không
    if (activeVariant.stock <= 0) {
      alert("Sản phẩm hiện đang hết hàng!");
      return;
    }

    // Kiểm tra số lượng hợp lệ
    if (quantity <= 0 || quantity > activeVariant.stock) {
      alert(`Số lượng phải nằm trong khoảng từ 1 đến ${activeVariant.stock}!`);
      return;
    }

    try {
      setAddingToCart(true);

      await addToCart(activeVariant.product_variant_id, quantity);

      // Thông báo thành công
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      // Reset số lượng về 1
      setQuantity(1);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);

      if (error.response?.status === 401) {
        alert("Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "/login";
      } else if (error.response?.status === 400) {
        alert(
          error.response.data.error || "Không thể thêm sản phẩm vào giỏ hàng!"
        );
      } else {
        alert("Đã xảy ra lỗi. Vui lòng thử lại sau!");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Đang tải...</div>;
  }
  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }
  if (!productData) {
    return (
      <div className={styles.errorContainer}>Không tìm thấy sản phẩm.</div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainContent}>
        <ImageGallery images={activeVariant ? activeVariant.images : []} />
        <ProductInfo
          productData={productData}
          activeVariant={activeVariant}
          selectedOptions={selectedOptions}
          quantity={quantity}
          onOptionSelect={handleOptionSelect}
          onQuantityChange={handleQuantityChange}
          onAddToCart={handleAddToCart}
          isAddingToCart={addingToCart}
        />
      </div>
      <ProductReviews reviews={reviews} />
    </div>
  );
};

export default ProductDetailPage;
