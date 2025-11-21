import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
// Sau này bạn sẽ tạo các component trang thực sự

import ProductListPage from './pages/ProductListPage/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';

//import CartPage from './pages/CartPage/CartPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import PaymentResultPage from './pages/PaymentResultPage/PaymentResultPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Các route công khai và cần layout chung */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Route cho danh sách sản phẩm */}
          <Route path="/products" element={<ProductListPage />} />

          {/* Route cho chi tiết sản phẩm - có dynamic parameter */}
          <Route
            path="/products/:productId"
            element={<ProductDetailPage />}
          />

          {/* Các route yêu cầu đăng nhập */}
          {/* Sau này chúng ta sẽ thêm một lớp bảo vệ (Protected Route) ở đây */}
          {/* <Route path="/cart" element={<CartPage />} /> */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-history" element={<div>Order History Page</div>} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
