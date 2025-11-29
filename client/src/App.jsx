import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProductListPage from "./pages/ProductListPage/ProductListPage";
import AccountPage from "./pages/AccountPage/AccountPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Các route công khai */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route
            path="/products/:productId"
            element={<div>Product Detail Page</div>}
          />

          {/* 3. Các route được bảo vệ */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/cart" element={<div>Cart Page</div>} />
            <Route path="/checkout" element={<div>Checkout Page</div>} />
            {/* Đặt thêm các route cần đăng nhập khác vào đây */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
