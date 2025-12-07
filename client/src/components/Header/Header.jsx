// src/components/Header/Header.jsx (PHIÊN BẢN SỬA LỖI)

import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import styles from "./Header.module.css";

// Đã sửa lại với SVG code đầy đủ
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

const UserIcon = () => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const Header = () => {
  const { isAuthenticated, openCart, cartItemCount } = useAppContext();

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
            <>
              <button
                onClick={openCart}
                className={styles.iconLink}
                aria-label="View your cart"
              >
                <CartIcon />
                {cartItemCount > 0 && (
                  <span className={styles.cartCount}>{cartItemCount}</span>
                )}
              </button>
              <NavLink
                to="/account"
                className={styles.iconLink}
                aria-label="View your account"
              >
                <UserIcon />
              </NavLink>
            </>
          ) : (
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
