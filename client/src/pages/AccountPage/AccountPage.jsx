// src/pages/AccountPage/AccountPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import { getUserProfile } from "../../api/authApi";
import { getOrderHistory } from "../../api/orderApi";
import styles from "./AccountPage.module.css";

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
        const [profileRes, ordersRes] = await Promise.all([
          getUserProfile(user.user_id),
          getOrderHistory(),
        ]);

        setProfile(profileRes.data);

        // Debug: Xem cấu trúc dữ liệu từ API
        console.log("ordersRes.data:", ordersRes.data);

        const orders = ordersRes.data.orders || ordersRes.data;
        console.log("orders:", orders);
        console.log("orders length:", orders?.length);

        const total = orders?.length || 0;
        const pending =
          orders?.filter((o) => {
            const latestStatus =
              o.status_history?.[o.status_history.length - 1];
            console.log(
              "Order",
              o.order_id,
              "status:",
              latestStatus?.status_code
            );
            return latestStatus?.status_code === "CREATED";
          }).length || 0;
        const completed =
          orders?.filter(
            (o) =>
              o.status_history?.[o.status_history.length - 1]?.status_code ===
              "CONFIRMED"
          ).length || 0;

        console.log("Stats:", { total, pending, completed });
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
    return <div className={styles.loading}>Đang tải tài khoản của bạn...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Tài Khoản Của Tôi</h1>
      <div className={styles.dashboardGrid}>
        {/* Card 1: Profile Information */}
        <DashboardCard
          title="Thông Tin Cá Nhân"
          description="Xem thông tin hồ sơ của bạn"
          icon={<i className="fas fa-user-circle"></i>} // Sử dụng Font Awesome icon
        >
          {profile ? (
            <div className={styles.profileInfo}>
              <p>
                <span>Họ:</span> {profile.first_name}
              </p>
              <p>
                <span>Tên:</span> {profile.last_name}
              </p>
              <p>
                <span>Email:</span> {profile.email}
              </p>
            </div>
          ) : (
            <p>Không thể tải hồ sơ.</p>
          )}
          <button
            onClick={() => navigate("/account/edit-profile")}
            className={styles.cardButton}
          >
            Chỉnh Sửa Hồ Sơ
          </button>
        </DashboardCard>

        {/* Card 2: Order History */}
        <DashboardCard
          title="Đơn Hàng Của Tôi"
          description="Theo dõi đơn hàng của bạn"
          icon={<i className="fas fa-box-open"></i>}
        >
          <div className={styles.orderStats}>
            <p>
              <span>Tổng Đơn Hàng:</span> {orderStats.total}
            </p>
            <p>
              <span>Chờ Xử Lý:</span> {orderStats.pending}
            </p>
            <p>
              <span>Hoàn Thành:</span> {orderStats.completed}
            </p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className={styles.cardButton}
          >
            Xem Tất Cả Đơn Hàng
          </button>
        </DashboardCard>

        {/* Card 3: Settings */}
        <DashboardCard
          title="Cài Đặt"
          description="Quản lý Options của bạn"
          icon={<i className="fas fa-cog"></i>}
        >
          <div className={styles.settingsActions}>
            <button
              onClick={() => navigate("/account/change-password")}
              className={styles.settingButton}
            >
              Đổi Mật Khẩu
            </button>
            <button className={styles.settingButton}>Liên Hệ Hỗ Trợ</button>
            <button
              onClick={handleLogout}
              className={`${styles.settingButton} ${styles.logoutButton}`}
            >
              <i className="fas fa-sign-out-alt"></i> Đăng Xuất
            </button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default AccountPage;
