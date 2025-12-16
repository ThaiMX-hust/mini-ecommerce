import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import styles from "./Header.module.css";

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
  const { isAuthenticated, user, logout, openCart, cartItemCount } =
    useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          FASCO
        </Link>

        {/* Nút menu mobile */}
        <button
          className={`${styles.hamburger} ${
            isMobileMenuOpen ? styles.open : ""
          }`}
          onClick={toggleMobileMenu}
          aria-label="Mở menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Overlay mobile */}
        <div
          className={`${styles.mobileOverlay} ${
            isMobileMenuOpen ? styles.open : ""
          }`}
          onClick={closeMobileMenu}
        ></div>

        {/* Điều hướng */}
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.open : ""}`}>
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/products"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            Sản phẩm
          </NavLink>
        </nav>

        {/* Tìm kiếm */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </button>
        </form>

        {/* Tài khoản & giỏ hàng */}
        <div className={styles.userActions}>
          {isAuthenticated ? (
            <>
              <button
                onClick={openCart}
                className={styles.iconLink}
                aria-label="Xem giỏ hàng"
              >
                <CartIcon />
                {cartItemCount > 0 && (
                  <span className={styles.cartCount}>{cartItemCount}</span>
                )}
              </button>
              <NavLink
                to="/account"
                className={styles.iconLink}
                aria-label="Tài khoản cá nhân"
              >
                <UserIcon />
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={styles.authLink}>
                Đăng nhập
              </NavLink>
              <NavLink
                to="/register"
                className={`${styles.authLink} ${styles.signUpButton}`}
              >
                Đăng ký
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
