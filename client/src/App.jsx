import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProductListPage from "./pages/ProductListPage/ProductListPage";
import AccountPage from "./pages/AccountPage/AccountPage";

import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage";

//import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import PaymentResultPage from "./pages/PaymentResultPage/PaymentResultPage";
import OrderHistoryPage from "./pages/OrderHistoryPage/OrderHistoryPage";

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
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          {/* 3. Các route được bảo vệ */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/cart" element={<div>Cart Page</div>} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/payment-result" element={<PaymentResultPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
