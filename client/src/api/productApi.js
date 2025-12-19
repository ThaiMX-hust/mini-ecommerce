import api from "../api";

export const getAllProducts = async (params = {}) => {
  try {
    //  Convert categories array to proper format
    const queryParams = { ...params };
    if (params.categories && Array.isArray(params.categories)) {
      // Backend expects multiple categories as separate params
      // e.g., ?categories=CAT1&categories=CAT2
      queryParams.categories = params.categories;
    }
    
    const response = await api.get("/products", { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { items: [], total_pages: 0, page: 1, total_items: 0 };
  }
};

export const getProductById = (productId) => {
  return api.get(`/products/${productId}`);
};

export const getProductReviews = (productId) => {
  return api.get(`/products/${productId}/reviews`);
};

/**
 * Thực hiện soft-delete một sản phẩm.
 * @param {string} productId - ID của sản phẩm cần xóa mềm.
 * @returns {Promise<object>}
 */
export const softDeleteProduct = (productId) => {
  return api.get(`/products/${productId}/soft-delete`);
};

/**
 * Xóa vĩnh viễn một sản phẩm.
 * @param {string} productId - ID của sản phẩm cần xóa.
 * @returns {Promise<object>}
 */
export const deleteProductPermanently = (productId) => {
  return api.delete(`/products/${productId}`);
};

/**
 * Creates a new product.
 * @param {FormData} productFormData - The FormData object containing metadata and images.
 * @returns {Promise<object>}
 */
export const createProduct = (productFormData) => {
  return api.post("/products", productFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Updates a product's main information (name, description, etc.).
 * @param {string} productId
 * @param {object} productData - The data to update.
 * @returns {Promise<object>}
 */
export const updateProduct = (productId, productData) => {
  return api.patch(`/products/${productId}`, productData);
};

// You can add functions for updating options and variants here as well
export const updateProductOption = (productId, optionId, optionData) => {
  return api.patch(`/products/${productId}/options/${optionId}`, optionData);
};

export const updateProductVariant = (productId, variantId, variantFormData) => {
  return api.patch(
    `/products/${productId}/variants/${variantId}`,
    variantFormData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};
