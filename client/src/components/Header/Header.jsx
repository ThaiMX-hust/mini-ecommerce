import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import styles from "./Header.module.css";

// Biểu tượng giỏ hàng không thay đổi
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const Header = () => {
  const { isAuthenticated, user, logout, openCart, cartItemCount } =
    useAppContext();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          FASCO
        </Link>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            Products
          </NavLink>

          {/* THAY ĐỔI: Thêm link "Checkout" và chỉ hiển thị khi đã đăng nhập */}
          {isAuthenticated && (
            <NavLink
              to="/checkout"
              className={({ isActive }) =>
                isActive ? styles.activeLink : styles.navLink
              }
            >
              Checkout
            </NavLink>
          )}
        </nav>

        <div className={styles.userActions}>
          {isAuthenticated ? (
            // Giao diện khi đã đăng nhập
            <>
              {/* Link giỏ hàng giờ chỉ còn là biểu tượng */}
              <button
                onClick={openCart}
                className={styles.cartLink}
                aria-label="View your cart"
              >
                <CartIcon />
                {cartItemCount > 0 && (
                  <span className={styles.cartCount}>{cartItemCount}</span>
                )}
              </button>

              <div className={styles.userMenu}>
                <span className={styles.welcome}>
                  Hi, {user.first_name || "User"}!
                </span>
              </div>

              <button onClick={logout} className={styles.logoutButton}>
                Sign Out
              </button>
            </>
          ) : (
            // Giao diện khi chưa đăng nhập
            <>
              <NavLink to="/login" className={styles.authLink}>
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                className={`${styles.authLink} ${styles.signUpButton}`}
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
