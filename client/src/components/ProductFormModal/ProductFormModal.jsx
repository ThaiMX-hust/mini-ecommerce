import React, { useState, useEffect } from "react";
import styles from "./ProductFormModal.module.css";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../api/productApi";

const ProductFormModal = ({ mode, productId, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [product, setProduct] = useState({
    name: "",
    description: "",
    categories: [],
    is_disabled: false,
    options: [{ name: "", values: [] }],
    variants: [],
  });

  // Temporary input states
  const [categoryInput, setCategoryInput] = useState("");
  const [optionValueInputs, setOptionValueInputs] = useState({}); // { optionIndex: "input" }

  // Fetch product data if in 'edit' mode
  useEffect(() => {
    if (mode === "edit" && productId) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          const response = await getProductById(productId);
          const data = response.data;
          setProduct({
            name: data.name,
            description: data.description,
            categories: data.categories.map((c) => c.category_name),
            is_disabled: data.is_disabled,
            options: data.options.map((o) => ({
              name: o.option_name,
              values: o.values.map((v) => v.value),
            })),
            variants: data.variants.map((v) => ({
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              is_disabled: v.is_disabled,
              options: v.options.reduce((acc, opt) => {
                acc[opt.option_name] = opt.value.value;
                return acc;
              }, {}),
              imageUrl: v.images?.[0] || "",
            })),
          });
        } catch (err) {
          setError("Failed to load product data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialData();
    }
  }, [mode, productId]);

  // ==================== STEP 1 HANDLERS ====================
  const handleCategoryKeyDown = (e) => {
    if (e.key === "Enter" && categoryInput.trim()) {
      e.preventDefault();
      if (!product.categories.includes(categoryInput.trim())) {
        setProduct({
          ...product,
          categories: [...product.categories, categoryInput.trim()],
        });
      }
      setCategoryInput("");
    }
  };

  const removeCategory = (catToRemove) => {
    setProduct({
      ...product,
      categories: product.categories.filter((c) => c !== catToRemove),
    });
  };

  // ==================== STEP 2 HANDLERS ====================
  const addOption = () => {
    setProduct({
      ...product,
      options: [...product.options, { name: "", values: [] }],
    });
  };

  const removeOption = (index) => {
    const newOptions = product.options.filter((_, i) => i !== index);
    setProduct({ ...product, options: newOptions });
  };

  const updateOptionName = (index, name) => {
    const newOptions = [...product.options];
    newOptions[index].name = name;
    setProduct({ ...product, options: newOptions });
  };

  const handleOptionValueKeyDown = (index, e) => {
    if (e.key === "Enter" && optionValueInputs[index]?.trim()) {
      e.preventDefault();
      const value = optionValueInputs[index].trim();
      const newOptions = [...product.options];
      if (!newOptions[index].values.includes(value)) {
        newOptions[index].values.push(value);
        setProduct({ ...product, options: newOptions });
      }
      setOptionValueInputs({ ...optionValueInputs, [index]: "" });
    }
  };

  const removeOptionValue = (optionIndex, valueToRemove) => {
    const newOptions = [...product.options];
    newOptions[optionIndex].values = newOptions[optionIndex].values.filter(
      (v) => v !== valueToRemove
    );
    setProduct({ ...product, options: newOptions });
  };

  const generateVariants = () => {
    const validOptions = product.options.filter(
      (opt) => opt.name && opt.values.length > 0
    );
    if (validOptions.length === 0) {
      alert("Please add at least one option with values.");
      return;
    }

    // Generate all combinations
    const combinations = validOptions.reduce(
      (acc, option) => {
        const newCombos = [];
        acc.forEach((combo) => {
          option.values.forEach((val) => {
            newCombos.push({ ...combo, [option.name]: val });
          });
        });
        return newCombos;
      },
      [{}]
    );

    const newVariants = combinations.map((combo, idx) => ({
      sku: `SKU-${idx + 1}`,
      price: "",
      stock: 0,
      is_disabled: false,
      options: combo,
      imageUrl: "",
    }));

    setProduct({ ...product, variants: newVariants });
    setStep(3);
  };

  // ==================== STEP 3 HANDLERS ====================
  const updateVariant = (index, field, value) => {
    const newVariants = [...product.variants];
    newVariants[index][field] = value;
    setProduct({ ...product, variants: newVariants });
  };

  const updateVariantOption = (variantIndex, optionName, value) => {
    const newVariants = [...product.variants];
    newVariants[variantIndex].options[optionName] = value;
    setProduct({ ...product, variants: newVariants });
  };

  const addVariant = () => {
    const emptyOptions = {};
    product.options.forEach((opt) => {
      if (opt.name && opt.values.length > 0) {
        emptyOptions[opt.name] = opt.values[0];
      }
    });
    setProduct({
      ...product,
      variants: [
        ...product.variants,
        {
          sku: `SKU-${product.variants.length + 1}`,
          price: "",
          stock: 0,
          is_disabled: false,
          options: emptyOptions,
          imageUrl: "",
        },
      ],
    });
  };

  const removeVariant = (index) => {
    setProduct({
      ...product,
      variants: product.variants.filter((_, i) => i !== index),
    });
  };

  // ==================== SUBMIT HANDLER ====================
  const handleSubmit = async () => {
    // Validation
    if (!product.name || !product.description) {
      setError("Tên sản phẩm và mô tả là bắt buộc.");
      return;
    }
    if (product.categories.length === 0) {
      setError("Vui lòng thêm ít nhất một danh mục.");
      return;
    }

    // Chỉ validate variants cho mode create
    if (mode === "create" && product.variants.length === 0) {
      setError("Vui lòng tạo ít nhất một variant.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (mode === "create") {
        // CREATE MODE - Use FormData with metadata
        const metadata = {
          name: product.name,
          description: product.description,
          categories: product.categories,
          is_disabled: product.is_disabled,
          options: product.options
            .filter((o) => o.name && o.values.length > 0)
            .map((o) => ({
              option_name: o.name,
              values: o.values,
            })),
          variants: product.variants.map((v) => ({
            sku: v.sku,
            raw_price: String(v.price), // Ensure it's a string
            stock_quantity: parseInt(v.stock) || 0,
            is_disabled: v.is_disabled || false,
            image_indexes: [],
            options: Object.entries(v.options).map(([key, value]) => ({
              option_name: key,
              value,
            })),
          })),
        };

        const formData = new FormData();
        formData.append("metadata", JSON.stringify(metadata));

        console.log(
          "CREATE - Sending metadata:",
          JSON.stringify(metadata, null, 2)
        );

        await createProduct(formData);
      } else {
        // EDIT MODE - Use FormData (backend requires multipart/form-data)
        const formData = new FormData();
        formData.append("name", product.name.trim());
        formData.append("description", product.description.trim());

        // Append categories as JSON array string
        formData.append("categories", JSON.stringify(product.categories));

        formData.append("is_disabled", product.is_disabled);

        console.log("EDIT - Product ID:", productId);
        console.log("EDIT - Form Data:");
        console.log("  name:", product.name.trim());
        console.log("  description:", product.description.trim());
        console.log("  categories:", product.categories);
        console.log("  is_disabled:", product.is_disabled);

        const response = await updateProduct(productId, formData);
        console.log("EDIT - Response:", response.data);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Đã có lỗi xảy ra. Vui lòng kiểm tra lại dữ liệu."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderStep1 = () => (
    <div className={styles.formStep}>
      <div className={styles.formGroup}>
        <label>
          Tên sản phẩm <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          placeholder="Nhập tên sản phẩm"
        />
      </div>

      <div className={styles.formGroup}>
        <label>
          Mô tả <span className={styles.required}>*</span>
        </label>
        <textarea
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
          placeholder="Nhập mô tả sản phẩm"
          rows={4}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Danh mục (nhập và nhấn Enter)</label>
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          onKeyDown={handleCategoryKeyDown}
          placeholder="Nhập danh mục và nhấn Enter"
        />
        <div className={styles.tagContainer}>
          {product.categories.map((cat) => (
            <span key={cat} className={styles.tag}>
              {cat}
              <button type="button" onClick={() => removeCategory(cat)}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={product.is_disabled}
            onChange={(e) =>
              setProduct({ ...product, is_disabled: e.target.checked })
            }
          />
          Ẩn sản phẩm
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.formStep}>
      <div className={styles.sectionHeader}>
        <p>Thêm các options cho sản phẩm (ví dụ: Size, Color)</p>
        <button type="button" className={styles.addButton} onClick={addOption}>
          + Thêm option
        </button>
      </div>

      {product.options.map((option, index) => (
        <div key={index} className={styles.optionCard}>
          <div className={styles.optionHeader}>
            <input
              type="text"
              value={option.name}
              onChange={(e) => updateOptionName(index, e.target.value)}
              placeholder="Tên option"
              className={styles.optionNameInput}
            />
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => removeOption(index)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>Giá trị (nhập và nhấn Enter)</label>
            <input
              type="text"
              value={optionValueInputs[index] || ""}
              onChange={(e) =>
                setOptionValueInputs({
                  ...optionValueInputs,
                  [index]: e.target.value,
                })
              }
              onKeyDown={(e) => handleOptionValueKeyDown(index, e)}
              placeholder="Nhập giá trị và nhấn Enter"
            />
            <div className={styles.tagContainer}>
              {option.values.map((val) => (
                <span key={val} className={styles.tag}>
                  {val}
                  <button
                    type="button"
                    onClick={() => removeOptionValue(index, val)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={styles.generateButton}
        onClick={generateVariants}
      >
        Tự động tạo variants từ options
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.formStep}>
      <div className={styles.sectionHeader}>
        <p>Quản lý các biến thể sản phẩm</p>
        <button type="button" className={styles.addButton} onClick={addVariant}>
          + Thêm variant
        </button>
      </div>

      {product.variants.map((variant, index) => (
        <div key={index} className={styles.variantCard}>
          <div className={styles.variantHeader}>
            <h4>Variant {index + 1}</h4>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => removeVariant(index)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>

          <div className={styles.variantGrid}>
            <div className={styles.formGroup}>
              <label>
                SKU <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={variant.sku}
                onChange={(e) => updateVariant(index, "sku", e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                Giá <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={variant.price}
                onChange={(e) => updateVariant(index, "price", e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                Tồn kho <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={variant.stock}
                onChange={(e) => updateVariant(index, "stock", e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={variant.is_disabled}
                  onChange={(e) =>
                    updateVariant(index, "is_disabled", e.target.checked)
                  }
                />
                Ẩn variant
              </label>
            </div>
          </div>

          {Object.entries(variant.options).map(([optionName, optionValue]) => {
            const option = product.options.find((o) => o.name === optionName);
            return (
              <div key={optionName} className={styles.formGroup}>
                <label>{optionName}</label>
                <select
                  value={optionValue}
                  onChange={(e) =>
                    updateVariantOption(index, optionName, e.target.value)
                  }
                >
                  {option?.values.map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          <div className={styles.formGroup}>
            <label>URL hình ảnh (nhập và nhấn Enter)</label>
            <input
              type="text"
              value={variant.imageUrl}
              onChange={(e) => updateVariant(index, "imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {variant.imageUrl && (
              <img
                src={variant.imageUrl}
                alt="Preview"
                className={styles.imagePreview}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            {mode === "create" ? "Chỉnh sửa sản phẩm" : "Chỉnh sửa sản phẩm"}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={styles.stepper}>
          <div
            className={`${styles.stepItem} ${step >= 1 ? styles.active : ""}`}
          >
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepLabel}>Thông tin</div>
          </div>
          <div
            className={`${styles.stepItem} ${step >= 2 ? styles.active : ""}`}
          >
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepLabel}>Options</div>
          </div>
          <div
            className={`${styles.stepItem} ${step >= 3 ? styles.active : ""}`}
          >
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepLabel}>Variants</div>
          </div>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}
          {isLoading ? <p>Loading...</p> : renderCurrentStep()}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.btnSecondary}>
            Hủy
          </button>
          <div className={styles.footerRight}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className={styles.btnSecondary}
              >
                Quay lại
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className={styles.btnPrimary}
              >
                Tiếp tục
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={styles.btnPrimary}
                disabled={isLoading}
              >
                {isLoading
                  ? "Đang lưu..."
                  : mode === "create"
                    ? "Tạo mới"
                    : "Cập nhật"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
