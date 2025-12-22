import React from "react";
import { useAppContext } from "../../contexts/AppContext";
import styles from "./CartPanel.module.css";
import QuantitySelector from "../QuantitySelector/QuantitySelector";
import { Link } from "react-router-dom";

const CartPanel = () => {
  const {
    isCartOpen,
    closeCart,
    cart,
    cartLoading,
    updateCartItemQuantity,
    removeCartItem,
  } = useAppContext();

  const formatPrice = (price) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numPrice);
  };

  // Parse SKU để lấy Color và Size
  // Format: PRODUCT-NAME-COLOR-SIZE-HASH_images
  const parseSkuOptions = (sku) => {
    try {
      // Bỏ phần hash và "_images" ở cuối
      const skuWithoutHash = sku.split("-").slice(0, -1).join("-");
      const parts = skuWithoutHash.split("-");

      // Lấy 2 phần cuối: Color và Size
      if (parts.length >= 2) {
        const size = parts[parts.length - 1];
        const color = parts[parts.length - 2];
        return `${color} / ${size}`;
      }
      return sku; // Fallback về SKU gốc nếu không parse được
    } catch (error) {
      console.error("Error parsing SKU:", error);
      return sku;
    }
  };

  const renderCartItems = () => {
    if (cartLoading && !cart) {
      return <p className={styles.loadingMessage}>Đang tải giỏ hàng...</p>;
    }

    if (!cart || cart.items.length === 0) {
      return (
        <p className={styles.emptyMessage}>Giỏ hàng của bạn đang trống.</p>
      );
    }

    return cart.items.map((item) => (
      <div key={item.cart_item_id} className={styles.cartItem}>
        <img
          src={item.variant.image_urls[0]}
          alt={item.product.name}
          className={styles.itemImage}
        />
        <div className={styles.itemDetails}>
          <p className={styles.itemName}>{item.product.name}</p>

          <p className={styles.itemOptions}>
            {parseSkuOptions(item.variant.sku)}
          </p>

          <div className={styles.priceInfo}>
            <p className={styles.itemPrice}>
              {formatPrice(item.variant.final_price)} x {item.quantity}
            </p>
            <p className={styles.itemSubtotal}>
              Tạm tính: {formatPrice(item.subtotal_after_discount)}
            </p>
          </div>

          <QuantitySelector
            quantity={item.quantity}
            onQuantityChange={(newQuantity) => {
              console.log("Updating quantity:", item.cart_item_id, newQuantity);
              updateCartItemQuantity(item.cart_item_id, newQuantity);
            }}
            maxStock={item.variant.stock_quantity || 999}
          />
        </div>

        <button
          onClick={() => removeCartItem(item.cart_item_id)}
          className={styles.removeButton}
          aria-label="Remove item"
        >
          ×
        </button>
      </div>
    ));
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isCartOpen ? styles.show : ""}`}
        onClick={closeCart}
        aria-hidden={!isCartOpen}
      ></div>

      <div
        className={`${styles.cartPanel} ${isCartOpen ? styles.show : ""}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Giỏ Hàng</h2>
          <button
            onClick={closeCart}
            className={styles.closeButton}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className={styles.itemList}>{renderCartItems()}</div>

        {cart && cart.items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Tạm tính:</span>
              <span className={styles.subtotalAmount}>
                {formatPrice(cart.total_price_after_discount)}
              </span>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className={styles.checkoutButton}
            >
              Tiến Hành Thanh Toán
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPanel;
