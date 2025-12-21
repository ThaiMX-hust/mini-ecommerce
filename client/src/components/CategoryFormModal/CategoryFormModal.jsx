import React, { useState, useEffect } from "react";
import styles from "./CategoryFormModal.module.css";

const CategoryFormModal = ({
  isOpen,
  onClose,
  onSave,
  category,
  isLoading,
}) => {
  const isEditMode = !!category;
  const [formData, setFormData] = useState({
    category_name: "",
    category_code: "",
    category_description: "",
  });

  useEffect(() => {
    if (isEditMode && category) {
      setFormData({
        category_name: category.category_name || "",
        category_code: category.category_code || "",
        category_description: category.category_description || "",
      });
    } else {
      setFormData({
        category_name: "",
        category_code: "",
        category_description: "",
      });
    }
  }, [category, isEditMode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditMode ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="category_name">
              Tên Danh Mục <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="category_name"
              name="category_name"
              value={formData.category_name}
              onChange={handleInputChange}
              placeholder="Nhập tên danh mục"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category_code">
              Mã Danh Mục <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="category_code"
              name="category_code"
              value={formData.category_code}
              onChange={handleInputChange}
              placeholder="VD: FASHION"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category_description">Mô Tả</label>
            <textarea
              id="category_description"
              name="category_description"
              value={formData.category_description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả danh mục"
              rows="4"
            />
          </div>
          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnSecondary}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : isEditMode ? "Cập Nhật" : "Tạo Mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
