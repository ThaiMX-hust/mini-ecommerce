import React, { useState, useEffect, useCallback } from "react";
import {
  getAllCategoriesAdmin,
  createCategories,
  updateCategory,
  deleteCategory,
} from "../../../api/categoryApi";
import CategoryFormModal from "../../../components/CategoryFormModal/CategoryFormModal";
import ConfirmationModal from "../../../components/ConfirmationModal/ConfirmationModal";
import styles from "./CategoryManagement.module.css";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    category: null,
    isLoading: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
    isLoading: false,
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllCategoriesAdmin();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Could not load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenFormModal = (mode, category = null) => {
    setFormModal({ isOpen: true, mode, category, isLoading: false });
  };
  const handleCloseFormModal = () => {
    setFormModal({
      isOpen: false,
      mode: "create",
      category: null,
      isLoading: false,
    });
  };

  const handleSaveCategory = async (formData) => {
    setFormModal((prev) => ({ ...prev, isLoading: true }));
    try {
      if (formModal.mode === "create") {
        // API expects an array
        await createCategories([formData]);
      } else {
        await updateCategory(formModal.category.category_id, formData);
      }
      fetchCategories(); // Refresh list
      handleCloseFormModal();
    } catch (err) {
      console.error("Failed to save category:", err);
      // You can set an error state here to show in the modal
    }
  };

  const handleOpenDeleteModal = (category) => {
    setDeleteModal({ isOpen: true, category, isLoading: false });
  };
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, category: null, isLoading: false });
  };
  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await deleteCategory(deleteModal.category.category_id);
      fetchCategories(); // Refresh list
      handleCloseDeleteModal();
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Category Management</h1>
          <p className={styles.subtitle}>Manage all product categories</p>
        </div>
        <button
          onClick={() => handleOpenFormModal("create")}
          className={styles.addButton}
        >
          + Add Category
        </button>
      </div>

      {isLoading && <p>Loading categories...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!isLoading && !error && (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div key={cat.category_id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{cat.category_name}</h3>
                <span className={styles.cardCode}>{cat.category_code}</span>
              </div>
              <p className={styles.cardDescription}>
                {cat.category_description}
              </p>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleOpenFormModal("edit", cat)}
                  className={styles.actionButton}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleOpenDeleteModal(cat)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        isOpen={formModal.isOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveCategory}
        category={formModal.category}
        isLoading={formModal.isLoading}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteModal.isLoading}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the category "${deleteModal.category?.category_name}"?`}
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default CategoryManagement;
