import React, { useState, useEffect } from "react";
import { getProductById } from "../../api/productApi";
import StatusBadge from "../StatusBadge/StatusBadge";
import styles from "./ProductDetailModal.module.css";

const ProductDetailModal = ({ productId, onClose }) => {
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProductDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getProductById(productId);
        const data = response.data;
        setProductData(data);
        if (data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          setSelectedImage(firstVariant.images?.[0] || "/placeholder.png");
          setSelectedVariantId(firstVariant.product_variant_id);
        }
      } catch (err) {
        console.error("Không thể tải chi tiết sản phẩm:", err);
        setError("Không thể tải chi tiết sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  const handleVariantRowClick = (variant) => {
    setSelectedImage(variant.images?.[0] || "/placeholder.png");
    setSelectedVariantId(variant.product_variant_id);
  };

  const formatCurrency = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const renderContent = () => {
    if (isLoading)
      return <div className={styles.loading}>Đang tải chi tiết...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!productData) return null;

    return (
      <div className={styles.contentGrid}>
        {/* Cột trái - Hình ảnh */}
        <div className={styles.imageSection}>
          <div className={styles.mainImageWrapper}>
            <img
              src={selectedImage || "/placeholder.png"}
              alt={productData.name}
              className={styles.mainImage}
            />
          </div>
        </div>

        {/* Cột phải - Thông tin */}
        <div className={styles.infoSection}>
          <h2 className={styles.productName}>{productData.name}</h2>
          <p className={styles.description}>{productData.description}</p>

          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Danh Mục:</span>
            <div className={styles.tagGroup}>
              {productData.categories.map((cat) => (
                <span key={cat.category_id} className={styles.tag}>
                  {cat.category_name}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Trạng Thái:</span>
            <StatusBadge isActive={!productData.is_disabled} />
          </div>

          {productData.options.map((option) => (
            <div key={option.product_option_id} className={styles.infoGroup}>
              <span className={styles.infoLabel}>{option.option_name}:</span>
              <div className={styles.tagGroup}>
                {option.values.map((val) => (
                  <span key={val.option_value_id} className={styles.optionTag}>
                    {val.value}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.variantsSection}>
            <h3 className={styles.variantsTitle}>Variants</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.variantsTable}>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Options</th>
                    <th>Giá</th>
                    <th>Tồn Kho</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.variants.map((variant) => (
                    <tr
                      key={variant.product_variant_id}
                      className={`${styles.variantRow} ${
                        variant.product_variant_id === selectedVariantId
                          ? styles.highlightedRow
                          : ""
                      }`}
                      onClick={() => handleVariantRowClick(variant)}
                    >
                      <td>{variant.sku}</td>
                      <td>
                        {variant.options
                          .map((opt) => opt.value.value)
                          .join(", ")}
                      </td>
                      <td>{formatCurrency(variant.price)}</td>
                      <td>{variant.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h1 className={styles.modalTitle}>Chi Tiết Sản Phẩm</h1>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.body}>{renderContent()}</div>
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.doneButton}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
