import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAppContext(); // Giả sử context có isLoading để xử lý lần tải đầu
  const location = useLocation();

  // Nếu vẫn đang kiểm tra token lúc tải trang, có thể hiển thị loading
  if (isLoading) {
    return <div>Loading...</div>; // Hoặc một spinner đẹp hơn
  }

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang login
    // state={{ from: location }} giúp chúng ta có thể quay lại trang trước đó sau khi login thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, hiển thị component con (ví dụ: AccountPage, CheckoutPage...)
  return <Outlet />;
};

export default ProtectedRoute;
