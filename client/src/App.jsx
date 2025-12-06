import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProductListPage from "./pages/ProductListPage/ProductListPage";
import AccountPage from "./pages/AccountPage/AccountPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";

import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage";

//import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import PaymentResultPage from "./pages/PaymentResultPage/PaymentResultPage";
import OrderHistoryPage from "./pages/OrderHistoryPage/OrderHistoryPage";
import EditProfilePage from "./components/EditProfilePage/EditProfilePage";
import ChangePasswordPage from "./components/ChangePasswordPage/ChangePasswordPage";

// Admin Page
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import AdminLayout from "./components/Admin/AdminLayout/AdminLayout";
// import ProductManagement from './pages/Admin/ProductManagement/ProductManagement';
// import OrderManagement from './pages/Admin/OrderManagement/OrderManagement';
// import CategoryManagement from './pages/Admin/CategoryManagement/CategoryManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Các route công khai */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          {/* 3. Các route được bảo vệ */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/edit-profile" element={<EditProfilePage />} />
            <Route
              path="/account/change-password"
              element={<ChangePasswordPage />}
            />
            <Route path="/cart" element={<div>Cart Page</div>} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/payment-result" element={<PaymentResultPage />} />
          </Route>
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
