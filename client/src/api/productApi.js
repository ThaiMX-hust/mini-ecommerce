import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

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
  return axios.get(`${API_URL}/products/${productId}`);
};
