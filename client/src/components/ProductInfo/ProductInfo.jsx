import React from "react";
import OptionSelector from "../OptionSelector/OptionSelector";
import QuantitySelector from "../QuantitySelector/QuantitySelector";
import styles from "./ProductInfo.module.css";

const ProductInfo = ({
  productData,
  activeVariant,
  selectedOptions,
  quantity,
  onOptionSelect,
  onQuantityChange,
  onAddToCart,
}) => {
  console.log(productData);
  if (!productData || !productData.options) {
    return <div className={styles.loading}>Đang tải thông tin sản phẩm...</div>;
  }

  return (
    <div className={styles.infoContainer}>
      <p className={styles.brand}>FASCO</p>
      <h1 className={styles.title}>{productData.name}</h1>
      {/* rating star */}
      <div className={styles.rating}>
        <span>★★★★☆</span>
        <span>(3)</span>
      </div>

      {activeVariant ? (
        <>
          <div className={styles.priceContainer}>
            <p className={styles.currentPrice}>{activeVariant.price} VND</p>
          </div>
          <div
            className={`${styles.stock} ${
              activeVariant.stock > 0 ? styles.inStock : styles.outOfStock
            }`}
          >
            {activeVariant.stock > 10
              ? "Còn hàng"
              : activeVariant.stock > 0
              ? `Chỉ còn ${activeVariant.stock} sản phẩm!`
              : "Hết hàng"}
          </div>
        </>
      ) : (
        <p className={styles.priceUnavailable}>
          Vui lòng chọn các Options để xem giá và tình trạng kho hàng
        </p>
      )}

      {/*render các nhóm Options*/}
      {productData.options.map((option) => (
        <OptionSelector
          key={option.product_option_id}
          option={option}
          selectedValueId={selectedOptions[option.product_option_id]}
          onSelect={onOptionSelect}
        />
      ))}
      <QuantitySelector
        quantity={quantity}
        onQuantityChange={onQuantityChange}
        maxStock={activeVariant ? activeVariant.stock : 0}
      />
      <button
        className={styles.addToCartButton}
        onClick={onAddToCart}
        disabled={!activeVariant || activeVariant.stock === 0}
      >
        {!activeVariant || activeVariant.stock === 0
          ? "Đã hết hàng"
          : "Thêm vào giỏ"}
      </button>
    </div>
  );
};
export default ProductInfo;
