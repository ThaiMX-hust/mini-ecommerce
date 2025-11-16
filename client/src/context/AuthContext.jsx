import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Cần cài đặt thư viện này: npm install jwt-decode

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State chứa thông tin user nếu đã đăng nhập
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Effect này sẽ chạy mỗi khi token thay đổi (kể cả lúc tải lại trang)
  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Kiểm tra xem token đã hết hạn chưa (exp tính bằng giây)
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser); // Lưu thông tin user từ token vào state
          localStorage.setItem("token", token); // Đảm bảo token được lưu
        } else {
          // Token hết hạn
          logout();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout(); // Token không hợp lệ, đăng xuất
      }
    } else {
      setUser(null);
      localStorage.removeItem("token");
    }
  }, [token]);

  // Hàm để gọi khi đăng nhập thành công
  const login = (newToken) => {
    setToken(newToken);
  };

  // Hàm để đăng xuất
  const logout = () => {
    setToken(null);
  };

  // 3. Cung cấp state và các hàm cho các component con
  const value = { user, token, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Tạo một custom hook để sử dụng Context dễ dàng hơn
export const useAuth = () => {
  return useContext(AuthContext);
};
