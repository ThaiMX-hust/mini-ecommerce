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

  // Helper function để format giá VNĐ
  const formatPrice = (price) => {
    // price có thể là string hoặc number từ API
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numPrice);
  };

  const renderCartItems = () => {
    if (cartLoading && !cart) {
      return <p className={styles.loadingMessage}>Loading cart...</p>;
    }

    if (!cart || cart.items.length === 0) {
      return <p className={styles.emptyMessage}>Your cart is empty.</p>;
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
            {item.variant.options
              .map((opt) => `${opt.option_name}: ${opt.value}`)
              .join(" / ")}
          </p>

          <div className={styles.priceInfo}>
            <p className={styles.itemPrice}>
              {formatPrice(item.variant.final_price)} x {item.quantity}
            </p>
            <p className={styles.itemSubtotal}>
              Subtotal: {formatPrice(item.subtotal_after_discount)}
            </p>
          </div>

          <QuantitySelector
            quantity={item.quantity}
            onQuantityChange={(newQuantity) =>
              updateCartItemQuantity(item.cart_item_id, newQuantity)
            }
            maxStock={item.variant.stock_quantity}
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
          <h2 className={styles.title}>Shopping Cart</h2>
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
              <span>Subtotal:</span>
              <span className={styles.subtotalAmount}>
                {formatPrice(cart.total_price_after_discount)}
              </span>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className={styles.checkoutButton}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPanel;
