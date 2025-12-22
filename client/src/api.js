import axios from "axios";

// Thay đổi URL này thành địa chỉ backend của bạn
// Dựa vào file .env.example của server, backend chạy ở port 3636
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3636/api/v1";


const api = axios.create({
  baseURL: API_URL,
});

// Interceptor để tự động thêm token vào header Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;


