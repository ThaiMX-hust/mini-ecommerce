import React, { useState, useEffect, useCallback } from "react";
import {
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
} from "../../../api/orderApi";
import Pagination from "../../../components/Pagination/Pagination";
import OrderStatusBadge from "../../../components/OrderStatusBadge/OrderStatusBadge";
import CancelOrderModal from "../../../components/CancelOrderModal/CancelOrderModal";
import OrderDetailModal from "../../../components/OrderDetailModal/OrderDetailModal";
import EditOrderStatusModal from "../../../components/EditOrderStatusModal/EditOrderStatusModal";
import OrderFilterBar from "../../../components/OrderFilterBar/OrderFilterBar";
import styles from "./OrderManagement.module.css";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status_code: "",
    sort_by: "created_at",
    sort_order: "desc",
    search: "",
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    order: null,
    isLoading: false,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    order: null,
    isLoading: false,
  });
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    orderId: null,
  });

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        status_code: filters.status_code || undefined,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        name: debouncedSearch || undefined,
      };

      const response = await getAllOrders(params);
      const data = response.data;
      setOrders(data.orders || []);
      setPagination({
        currentPage: data.page,
        totalPages: data.total_pages,
        totalItems: data.total_items,
      });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.status_code,
    filters.sort_by,
    filters.sort_order,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageClick = (event) => {
    setFilters((prev) => ({ ...prev, page: event.selected + 1 }));
  };

  const handleCancelConfirm = async (reason) => {
    setCancelModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await cancelOrder(cancelModal.order.order_id, reason);
      setCancelModal({ isOpen: false, order: null, isLoading: false });
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error("Failed to cancel order:", error);
      setCancelModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleEditConfirm = async (statusCode, note) => {
    setEditModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await updateOrderStatus(editModal.order.order_id, statusCode, note);
      setEditModal({ isOpen: false, order: null, isLoading: false });
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error("Failed to update order status:", error);
      setEditModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const formatCurrency = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("vi-VN");

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản Lý Đơn Hàng</h1>
          <p className={styles.subtitle}>
            Xem và theo dõi tất cả đơn hàng của khách hàng
          </p>
        </div>
        <div className={styles.totalCount}>
          <i className="fas fa-receipt"></i>
          <span>
            Tổng Đơn Hàng: <strong>{pagination.totalItems || 0}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <OrderFilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Order Table */}
      <div className={styles.tableContainer}>
        <table className={styles.orderTable}>
          <thead>
            <tr>
              <th>Mã Đơn Hàng</th>
              <th>Khách Hàng</th>
              <th>Tổng Tiền</th>
              <th>Ngày</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6">Đang tải...</td>
              </tr>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id.substring(0, 8)}...</td>
                  <td>{order.receiver_name}</td>
                  <td>{formatCurrency(order.final_total_price)}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>
                    <div className={styles.actionIcons}>
                      <button
                        onClick={() =>
                          setDetailModal({
                            isOpen: true,
                            orderId: order.order_id,
                          })
                        }
                        className={styles.iconButton}
                        aria-label="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        onClick={() => setEditModal({ isOpen: true, order })}
                        className={`${styles.iconButton} ${styles.edit}`}
                        aria-label="Edit Status"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => setCancelModal({ isOpen: true, order })}
                        className={`${styles.iconButton} ${styles.danger}`}
                        aria-label="Cancel Order"
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Không tìm thấy đơn hàng.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        pageCount={pagination.totalPages || 0}
        onPageChange={handlePageClick}
        currentPage={filters.page}
      />

      {/* Modals */}
      <CancelOrderModal
        isOpen={cancelModal.isOpen}
        onClose={() =>
          setCancelModal({ isOpen: false, order: null, isLoading: false })
        }
        onConfirm={handleCancelConfirm}
        order={cancelModal.order}
        isLoading={cancelModal.isLoading}
      />
      <EditOrderStatusModal
        isOpen={editModal.isOpen}
        onClose={() =>
          setEditModal({ isOpen: false, order: null, isLoading: false })
        }
        onConfirm={handleEditConfirm}
        order={editModal.order}
        isLoading={editModal.isLoading}
      />
      <OrderDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, orderId: null })}
        orderId={detailModal.orderId}
      />
    </div>
  );
};

export default OrderManagement;
