import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;
export const getProductById = (productId) => {
  return axios.get(`${API_URL}/products/${productId}`);
};
export const getProductReviews = (productId) => {
  return axios.get(`${API_URL}/products/${productId}/reviews`);
};