import api from "../api";

export const getAllProducts = async (params = {}) => {
  try {
    // ✅ Convert categories array to proper format
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