// src/pages/AccountPage/AccountPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import { getUserProfile } from "../../api/authApi";
import { getOrderHistory } from "../../api/orderApi";
import styles from "./AccountPage.module.css";

// Component con cho từng card trên dashboard
const DashboardCard = ({ title, description, icon, children }) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div className={styles.iconWrapper}>{icon}</div>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
    </div>
    <div className={styles.cardBody}>{children}</div>
  </div>
);

const AccountPage = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) return;
      setIsLoading(true);
      try {
        // Gọi đồng thời 2 API để tăng tốc
        const [profileRes, ordersRes] = await Promise.all([
          getUserProfile(user.user_id),
          getOrderHistory(),
        ]);

        setProfile(profileRes.data);

        // Xử lý và tính toán thống kê đơn hàng
        const orders = ordersRes.data.orders;
        const total = orders.length;
        // Giả sử trạng thái cuối cùng trong history là trạng thái hiện tại
        const pending = orders.filter(
          (o) =>
            o.status_history[o.status_history.length - 1]?.status_name ===
            "Pending"
        ).length;
        const completed = orders.filter(
          (o) =>
            o.status_history[o.status_history.length - 1]?.status_name ===
            "Completed"
        ).length;
        setOrderStats({ total, pending, completed });
      } catch (error) {
        console.error("Failed to fetch account data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.user_id]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading your account...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>My Account</h1>
      <div className={styles.dashboardGrid}>
        {/* Card 1: Profile Information */}
        <DashboardCard
          title="Profile Information"
          description="View your profile details"
          icon={<i className="fas fa-user-circle"></i>} // Sử dụng Font Awesome icon
        >
          {profile ? (
            <div className={styles.profileInfo}>
              <p>
                <span>First Name:</span> {profile.first_name}
              </p>
              <p>
                <span>Last Name:</span> {profile.last_name}
              </p>
              <p>
                <span>Email:</span> {profile.email}
              </p>
            </div>
          ) : (
            <p>Could not load profile.</p>
          )}
          <button
            onClick={() => navigate("/account/edit-profile")}
            className={styles.cardButton}
          >
            Edit Profile
          </button>
        </DashboardCard>

        {/* Card 2: Order History */}
        <DashboardCard
          title="My order"
          description="Track your orders"
          icon={<i className="fas fa-box-open"></i>}
        >
          <div className={styles.orderStats}>
            <p>
              <span>Total Orders:</span> {orderStats.total}
            </p>
            <p>
              <span>Pending:</span> {orderStats.pending}
            </p>
            <p>
              <span>Completed:</span> {orderStats.completed}
            </p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className={styles.cardButton}
          >
            View All Orders  
          </button>
        </DashboardCard>

        {/* Card 3: Settings */}
        <DashboardCard
          title="Settings"
          description="Manage your preferences"
          icon={<i className="fas fa-cog"></i>}
        >
          <div className={styles.settingsActions}>
            <button
              onClick={() => navigate("/account/change-password")}
              className={styles.settingButton}
            >
              Change Password
            </button>
            <button className={styles.settingButton}>Contact Support</button>
            <button
              onClick={handleLogout}
              className={`${styles.settingButton} ${styles.logoutButton}`}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default AccountPage;
