import React from "react";
import { useAppContext } from "../../contexts/AppContext";
import styles from "./CartPanel.module.css";
import QuantitySelector from "../QuantitySelector/QuantitySelector"; // Tái sử dụng component này!
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

  const renderCartItems = () => {
    if (cartLoading && !cart) return <p>Loading cart...</p>;
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
              .map((opt) => `${opt.option_name}: ${opt.value.value}`)
              .join(" / ")}
          </p>
          <p className={styles.itemPrice}>${item.variant.final_price}</p>
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
      ></div>
      <div className={`${styles.cartPanel} ${isCartOpen ? styles.show : ""}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Shopping Cart</h2>
          <button onClick={closeCart} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.itemList}>{renderCartItems()}</div>
        <div className={styles.footer}>
          <div className={styles.subtotal}>
            <span>Subtotal</span>
            <span>${cart?.total_price_after_discount || "0.00"}</span>
          </div>
          <Link
            to="/checkout"
            onClick={closeCart}
            className={styles.checkoutButton}
          >
            Checkout
          </Link>
        </div>
      </div>
    </>
  );
};

export default CartPanel;
