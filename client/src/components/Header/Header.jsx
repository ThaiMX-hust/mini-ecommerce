import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";

// Bạn có thể tìm một icon giỏ hàng dạng SVG và import nó
// Hoặc dùng một ký tự đơn giản như dưới đây
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
  const { isAuthenticated, user, logout } = useAuth();

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
          {/* Sửa "Shop" thành "Products" cho nhất quán. Đây sẽ là trang danh sách sản phẩm. */}
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? styles.activeLink : styles.navLink
            }
          >
            Products
          </NavLink>
          {/* Trang chi tiết sản phẩm không cần link trên header, người dùng sẽ click từ danh sách sản phẩm để vào */}
        </nav>

        <div className={styles.userActions}>
          {isAuthenticated ? (
            // Giao diện khi đã đăng nhập
            <>
              {/* Thêm link giỏ hàng với biểu tượng */}
              <NavLink to="/cart" className={styles.cartLink}>
                <CartIcon />
                {/* Có thể thêm số lượng sản phẩm ở đây sau này */}
                {/* <span className={styles.cartCount}>3</span> */}
              </NavLink>

              <div className={styles.userMenu}>
                <span className={styles.welcome}>
                  Hi, {user.first_name || "User"}!
                </span>
                {/* Có thể mở rộng thành một dropdown menu sau này */}
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
