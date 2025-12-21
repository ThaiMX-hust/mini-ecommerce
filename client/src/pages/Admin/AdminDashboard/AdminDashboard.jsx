import React, { useState, useEffect } from "react";
import api from "../../../api";
import styles from "./AdminDashboard.module.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [chartData, setChartData] = useState({
    revenueByDay: [],
    ordersByStatus: [],
    productsByCategory: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch products count
      const productsRes = await api.get("/products", { params: { limit: 1 } });
      const totalProducts = productsRes.data.total_items || 0;

      // Fetch orders
      const ordersRes = await api.get("/orders");
      const orders = ordersRes.data.orders || [];
      const totalOrders = orders.length;

      // Calculate revenue
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.total_price_after_discount || 0);
      }, 0);

      // Count pending orders
      const pendingOrders = orders.filter((order) => {
        const latestStatus = order.status_history?.[0]?.status_code;
        return latestStatus === "CREATED" || latestStatus === "CONFIRMED";
      }).length;

      // Process chart data
      const revenueByDay = processRevenueByDay(orders);
      const ordersByStatus = processOrdersByStatus(orders);

      // Fetch categories for product distribution
      const categoriesRes = await api.get("/categories");
      const productsByCategory = await processProductsByCategory(
        categoriesRes.data.categories
      );

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
      });

      setChartData({
        revenueByDay,
        ordersByStatus,
        productsByCategory,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process revenue for last 7 days
  const processRevenueByDay = (orders) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const revenueMap = {};
    last7Days.forEach((day) => {
      revenueMap[day] = 0;
    });

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at).toISOString().split("T")[0];
      if (revenueMap.hasOwnProperty(orderDate)) {
        revenueMap[orderDate] += order.total_price_after_discount || 0;
      }
    });

    return last7Days.map((day) => ({
      date: new Date(day).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      }),
      revenue: revenueMap[day],
    }));
  };

  // Process orders by status
  const processOrdersByStatus = (orders) => {
    const statusMap = {
      CREATED: 0,
      CONFIRMED: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    orders.forEach((order) => {
      const latestStatus = order.status_history?.[0]?.status_code;
      if (statusMap.hasOwnProperty(latestStatus)) {
        statusMap[latestStatus]++;
      }
    });

    return Object.entries(statusMap).map(([status, count]) => ({
      status: status.charAt(0) + status.slice(1).toLowerCase(),
      count,
    }));
  };

  // Process products by category
  const processProductsByCategory = async (categories) => {
    const categoryData = await Promise.all(
      categories.slice(0, 5).map(async (category) => {
        try {
          const res = await api.get("/products", {
            params: { category_id: category.category_id, limit: 1 },
          });
          return {
            name: category.name,
            value: res.data.total_items || 0,
          };
        } catch (error) {
          console.error("Error fetching category products:", error);
          return { name: category.name, value: 0 };
        }
      })
    );
    return categoryData.filter((item) => item.value > 0);
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải bảng điều khiển...</div>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const COLORS = ["#3498db", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6"];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Tổng Quan Dashboard</h1>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statInfo}>
            <h3>Tổng Sản Phẩm</h3>
            <p className={styles.statValue}>{stats.totalProducts}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statIcon}>🛒</div>
          <div className={styles.statInfo}>
            <h3>Tổng Đơn Hàng</h3>
            <p className={styles.statValue}>{stats.totalOrders}</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.purple}`}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <h3>Tổng Doanh Thu</h3>
            <p className={styles.statValue}>
              {formatPrice(stats.totalRevenue)}
            </p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statInfo}>
            <h3>Đơn Chờ Xử Lý</h3>
            <p className={styles.statValue}>{stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Revenue Trend */}
        <div className={styles.chartCard}>
          <h2>Xu Hướng Doanh Thu (7 Ngày Gần Đây)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatPrice(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3498db"
                strokeWidth={2}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className={styles.chartCard}>
          <h2>Đơn Hàng Theo Trạng Thái</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#2ecc71" name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Category */}
        {chartData.productsByCategory.length > 0 && (
          <div className={styles.chartCard}>
            <h2>Sản Phẩm Theo Danh Mục</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.productsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.productsByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>Thao Tác Nhanh</h2>
        <div className={styles.actionButtons}>
          <button
            onClick={() => (window.location.href = "/admin/products/new")}
          >
            ➕ Thêm Sản Phẩm Mới
          </button>
          <button onClick={() => (window.location.href = "/admin/orders")}>
            📋 Xem Đơn Hàng
          </button>
          <button onClick={() => (window.location.href = "/admin/categories")}>
            🏷️ Quản Lý Danh Mục
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
