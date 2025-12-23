import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppContext } from "../../../contexts/AppContext";
import styles from "./AdminSidebar.module.css";

const AdminSidebar = () => {
  const { logout, user } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/admin", label: "📊 Tổng Quan", exact: true },
    { path: "/admin/products", label: "📦 Sản Phẩm" },
    { path: "/admin/orders", label: "🛒 Đơn Hàng" },
    { path: "/admin/categories", label: "📂 Danh Mục" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className={styles.hamburger}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.backdrop} onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          isMobileMenuOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.logo}>
          <h2>FASCO Admin</h2>
          <p className={styles.adminName}>
            {user?.first_name} {user?.last_name}
          </p>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
              onClick={closeMobileMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button
            onClick={() => (window.location.href = "/")}
            className={styles.backButton}
          >
            ← Về Cửa Hàng
          </button>
          <button onClick={logout} className={styles.logoutButton}>
            🚪 Đăng Xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
