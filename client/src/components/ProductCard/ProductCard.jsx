import React from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

// Helper function để định dạng tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const ProductCard = ({ product }) => {
  if (!product) return null;

  return (
    <Link to={`/products/${product.product_id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={product.image_url}
          alt={product.name}
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        {/* Chúng ta sẽ hiển thị min_price như đã quyết định */}
        <p className={styles.price}>{formatCurrency(product.min_price)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
