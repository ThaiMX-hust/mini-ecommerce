// src/App.js

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import các component trang của bạn
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";

function App() {
  return (
    // BrowserRouter: Bọc toàn bộ ứng dụng để kích hoạt tính năng routing
    <BrowserRouter>
      {/* Routes: Container chứa tất cả các đường dẫn (route) của bạn */}
      <Routes>
        {/* Route: Định nghĩa một đường dẫn cụ thể */}
        {/* Khi người dùng truy cập vào "/login", component LoginPage sẽ được hiển thị */}
        <Route path="/login" element={<LoginPage />} />

        {/* Khi người dùng truy cập vào "/register", component RegisterPage sẽ được hiển thị */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Route mặc định: Nếu người dùng truy cập vào đường dẫn gốc "/",
            tự động chuyển hướng họ đến trang "/login" */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
