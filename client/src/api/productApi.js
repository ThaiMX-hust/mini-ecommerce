import api from "../api";

export const getAllProducts = async (params = {}) => {
  try {
    const response = await api.get("/products", { params });
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
