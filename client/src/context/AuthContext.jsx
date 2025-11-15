import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Khởi tạo state từ localStorage để duy trì đăng nhập khi refresh trang
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  // Effect này sẽ chỉ chạy một lần khi component được mount lần đầu
  // để khôi phục trạng thái đăng nhập từ token trong localStorage
  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
        } else {
          // Token hết hạn, xóa khỏi localStorage
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (error) {
        console.error("Invalid token on initial load:", error);
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  }, []); // Mảng rỗng đảm bảo nó chỉ chạy một lần

  // HÀM LOGIN ĐƯỢC SỬA LẠI - ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT
  const login = (newToken) => {
    try {
      const decodedUser = jwtDecode(newToken);
      // Cập nhật cả token và user state CÙNG LÚC
      setToken(newToken);
      setUser(decodedUser);
      // Lưu token vào localStorage để duy trì đăng nhập
      localStorage.setItem("token", newToken);
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      // Nếu token không hợp lệ, đảm bảo người dùng bị đăng xuất
      logout();
    }
  };

  // HÀM LOGOUT ĐƯỢC SỬA LẠI
  const logout = () => {
    // Xóa tất cả các state và localStorage
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  // Giá trị cung cấp cho context
  const value = { user, token, login, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
