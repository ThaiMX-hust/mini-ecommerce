import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts, softDeleteProduct } from "../../../api/productApi";
import Pagination from "../../../components/Pagination/Pagination";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import ProductDetailModal from "../../../components/ProductDetailModal/ProductDetailModal";
import ProductFormModal from "../../../components/ProductFormModal/ProductFormModal";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import styles from "./ProductManagement.module.css";

const useDebounce = (value, delay) => {
  /* ... */
}; // Giữ nguyên hook debounce

const ProductManagement = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [modalState, setModalState] = useState({
    isOpen: false,
    productToDelete: null,
    isLoading: false,
  });

  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    productId: null,
  });

  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    productId: null,
  });

  const fetchProducts = useCallback(async (page, name) => {
    setIsLoading(true);
    try {
      const params = { limit: 4, page, name: name || undefined };
      const data = await getAllProducts(params);
      setProducts(data.items || []);
      setPagination({
        currentPage: data.page,
        totalPages: data.total_pages,
        totalItems: data.total_items,
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchProducts]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1);
  };

  const openDeleteModal = (product) => {
    setModalState({ isOpen: true, productToDelete: product, isLoading: false });
  };
  const closeDeleteModal = () => {
    setModalState({ isOpen: false, productToDelete: null, isLoading: false });
  };

  const openDetailModal = (productId) => {
    setDetailModal({ isOpen: true, productId });
  };
  const closeDetailModal = () => {
    setDetailModal({ isOpen: false, productId: null });
  };

  const openFormModal = (mode, productId = null) => {
    setFormModal({ isOpen: true, mode, productId });
  };
  const closeFormModal = () => {
    setFormModal({ isOpen: false, mode: "create", productId: null });
  };
  const handleSave = () => {
    // Refresh product list after saving
    fetchProducts(currentPage, debouncedSearchTerm);
  };

  const handleDeleteConfirm = async () => {
    if (!modalState.productToDelete) return;
    setModalState((prev) => ({ ...prev, isLoading: true }));
    try {
      await softDeleteProduct(modalState.productToDelete.product_id);
      // Refresh the product list after deletion
      fetchProducts(currentPage, debouncedSearchTerm);
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete product:", error);
      // Có thể thêm thông báo lỗi ở đây
      setModalState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const formatPriceRange = (min, max) => {
    const format = (price) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    if (min === max) return format(min);
    return `${format(min)} - ${format(max)}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Management</h1>
          <p className={styles.subtitle}>
            Manage product information, variants, and options
          </p>
        </div>
        <button
          onClick={() => openFormModal("create")}
          className={styles.addButton}
        >
          + Add Product
        </button>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button className={styles.filterButton}>
          <i className="fas fa-filter"></i> Filter
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.productTable}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className={styles.loading}>
                  Loading products...
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((product) => (
                <tr key={product.product_id}>
                  <td>
                    <div className={styles.productInfo}>
                      <img
                        src={product.image_url || "/placeholder.png"}
                        alt={product.name}
                        className={styles.productImage}
                      />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>
                    {formatPriceRange(product.min_price, product.max_price)}
                  </td>
                  <td>
                    <StatusBadge isActive={!product.is_disabled} />
                  </td>
                  <td>
                    <div className={styles.actionIcons}>
                      <button
                        onClick={() => openDetailModal(product.product_id)}
                        className={styles.iconButton}
                        aria-label="View"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        onClick={() =>
                          openFormModal("edit", product.product_id)
                        }
                        className={styles.iconButton}
                        aria-label="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className={`${styles.iconButton} ${styles.deleteButton}`}
                        aria-label="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noResults}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.paginationContainer}>
        {!isLoading && pagination.totalItems > 0 && (
          <p>
            Showing {products.length} of {pagination.totalItems} products
          </p>
        )}
        <Pagination
          pageCount={pagination.totalPages || 0}
          onPageChange={handlePageClick}
          currentPage={currentPage}
        />
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={modalState.isLoading}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the product "${modalState.productToDelete?.name}"? This action is reversible (soft delete).`}
        confirmText="Yes, Delete"
      />

      {detailModal.isOpen && (
        <ProductDetailModal
          productId={detailModal.productId}
          onClose={closeDetailModal}
        />
      )}

      {formModal.isOpen && (
        <ProductFormModal
          mode={formModal.mode}
          productId={formModal.productId}
          onClose={closeFormModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ProductManagement;
