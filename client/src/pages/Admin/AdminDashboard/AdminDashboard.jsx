import React, { useState, useEffect } from 'react';
import api from '../../../api';
import styles from './AdminDashboard.module.css';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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
        productsByCategory: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Sử dụng Promise.allSettled để tiếp tục ngay cả khi một số request thất bại
            const [productsRes, ordersRes, categoriesRes, revenueRes] = await Promise.allSettled([
                api.get('/products/all', { params: { limit: 1 } }), // Endpoint admin từ API contract
                api.get('/orders/all'), // Endpoint admin
                api.get('/categories'),
                fetchRevenueStats()
            ]);

            // Xử lý products
            let totalProducts = 0;
            if (productsRes.status === 'fulfilled') {
                totalProducts = productsRes.value.data.total_items || 0;
            }

            // Xử lý orders
            let orders = [];
            let totalOrders = 0;
            let pendingOrders = 0;
            if (ordersRes.status === 'fulfilled') {
                orders = ordersRes.value.data.orders || [];
                totalOrders = ordersRes.value.data.total_items || orders.length;
                
                // Đếm pending orders (CREATED hoặc CONFIRMED)
                pendingOrders = orders.filter(order => {
                    const status = order.status?.toUpperCase() || '';
                    return status === 'CHỜ XÁC NHẬN' || status === 'ĐÃ XÁC NHẬN';
                }).length;
            }

            // Xử lý revenue
            let totalRevenue = 0;
            if (revenueRes.status === 'fulfilled') {
                totalRevenue = revenueRes.value?.revenue || 0;
            } else {
                // Fallback: tính từ orders
                totalRevenue = orders.reduce((sum, order) => {
                    return sum + (parseFloat(order.final_total_price) || 0);
                }, 0);
            }

            // Process chart data
            const revenueByDay = processRevenueByDay(orders);
            const ordersByStatus = processOrdersByStatus(orders);
            
            // Process categories
            let productsByCategory = [];
            if (categoriesRes.status === 'fulfilled') {
                const categories = categoriesRes.value.data.categories || [];
                productsByCategory = await processProductsByCategory(categories);
            }

            setStats({
                totalProducts,
                totalOrders,
                totalRevenue,
                pendingOrders,
            });

            setChartData({
                revenueByDay,
                ordersByStatus,
                productsByCategory
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch revenue từ stats API (theo API contract section 7.1)
    const fetchRevenueStats = async () => {
        try {
            const today = new Date();
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            
            const response = await api.get('/stats/revenue', {
                params: {
                    from: lastMonth.toISOString().split('T')[0],
                    to: today.toISOString().split('T')[0]
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
            return null;
        }
    };

    // Process revenue for last 7 days
    const processRevenueByDay = (orders) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const revenueMap = {};
        last7Days.forEach(day => {
            revenueMap[day] = 0;
        });

        orders.forEach(order => {
            const orderDate = new Date(order.created_at).toISOString().split('T')[0];
            if (revenueMap.hasOwnProperty(orderDate)) {
                revenueMap[orderDate] += parseFloat(order.final_total_price) || 0;
            }
        });

        return last7Days.map(day => ({
            date: new Date(day).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
            revenue: revenueMap[day]
        }));
    };

    // Process orders by status
    const processOrdersByStatus = (orders) => {
        const statusMap = {
            'Chờ xác nhận': 0,
            'Đã xác nhận': 0,
            'Đang vận chuyển': 0,
            'Hoàn thành': 0,
            'Đã hủy': 0
        };

        orders.forEach(order => {
            const status = order.status || '';
            if (statusMap.hasOwnProperty(status)) {
                statusMap[status]++;
            }
        });

        return Object.entries(statusMap).map(([status, count]) => ({
            status,
            count
        }));
    };

    // Process products by category
    const processProductsByCategory = async (categories) => {
        try {
            const categoryData = await Promise.all(
                categories.slice(0, 5).map(async (category) => {
                    try {
                        const res = await api.get('/products', {
                            params: { 
                                categories: [category.category_code],
                                limit: 1 
                            }
                        });
                        return {
                            name: category.category_name,
                            value: res.data.total_items || 0
                        };
                    } catch (error) {
                        console.error('Error fetching category products:', error);
                        return { name: category.category_name, value: 0 };
                    }
                })
            );
            return categoryData.filter(item => item.value > 0);
        } catch (error) {
            console.error('Error processing products by category:', error);
            return [];
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const COLORS = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'];

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Đang tải dữ liệu dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button onClick={fetchDashboardStats} className={styles.retryButton}>
                    🔄 Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Dashboard Overview</h1>
                    <p className={styles.subtitle}>Tổng quan về hoạt động kinh doanh</p>
                </div>
                <button onClick={fetchDashboardStats} className={styles.refreshButton}>
                    🔄 Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.blue}`}>
                    <div className={styles.statIcon}>📦</div>
                    <div className={styles.statInfo}>
                        <h3>Tổng sản phẩm</h3>
                        <p className={styles.statValue}>{stats.totalProducts.toLocaleString()}</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.green}`}>
                    <div className={styles.statIcon}>🛒</div>
                    <div className={styles.statInfo}>
                        <h3>Tổng đơn hàng</h3>
                        <p className={styles.statValue}>{stats.totalOrders.toLocaleString()}</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.purple}`}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statInfo}>
                        <h3>Tổng doanh thu</h3>
                        <p className={styles.statValue}>{formatPrice(stats.totalRevenue)}</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.orange}`}>
                    <div className={styles.statIcon}>⏳</div>
                    <div className={styles.statInfo}>
                        <h3>Đơn chờ xử lý</h3>
                        <p className={styles.statValue}>{stats.pendingOrders.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                {/* Revenue Trend */}
                <div className={styles.chartCard}>
                    <h2>📈 Xu hướng doanh thu (7 ngày gần nhất)</h2>
                    {chartData.revenueByDay.length > 0 ? (
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
                                    dot={{ fill: '#3498db' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.noData}>Không có dữ liệu</div>
                    )}
                </div>

                {/* Orders by Status */}
                <div className={styles.chartCard}>
                    <h2>📊 Đơn hàng theo trạng thái</h2>
                    {chartData.ordersByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.ordersByStatus}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#2ecc71" name="Số đơn" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.noData}>Không có dữ liệu</div>
                    )}
                </div>

                {/* Products by Category */}
                {chartData.productsByCategory.length > 0 && (
                    <div className={styles.chartCard}>
                        <h2>🏷️ Sản phẩm theo danh mục</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.productsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.productsByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <h2>⚡ Thao tác nhanh</h2>
                <div className={styles.actionButtons}>
                    <button onClick={() => window.location.href = '/admin/products'}>
                        ➕ Thêm sản phẩm
                    </button>
                    <button onClick={() => window.location.href = '/admin/orders'}>
                        📋 Xem đơn hàng
                    </button>
                    <button onClick={() => window.location.href = '/admin/categories'}>
                        🏷️ Quản lý danh mục
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;