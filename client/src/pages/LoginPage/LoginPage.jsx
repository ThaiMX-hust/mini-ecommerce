// src/pages/LoginPage/LoginPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// 1. Import CSS Modules. React sẽ xử lý `styles` như một object JavaScript.
import styles from "./LoginPage.module.css";

// 2. Import hàm API đã được tách biệt rõ ràng.
import { login as apiLogin } from "../../api/authApi";
import { useAppContext } from "../../contexts/AppContext";

// 3. Import hình ảnh (đảm bảo đường dẫn chính xác).
import loginHeroImage from "../../assets/images/login-hero-image.jpg";

const LoginPage = () => {
  // 4. Quản lý state của form bằng một object duy nhất, dễ mở rộng.
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login,user } = useAppContext(); // Lấy hàm login từ AuthContext

  // Hàm xử lý chung cho các input, giúp code gọn hơn.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  // Hàm xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 5. Gọi hàm API `login` với dữ liệu từ state.
      const response = await apiLogin(credentials);

      const { token, user } = response.data;
      console.log("Token:", token);
      console.log("User:", user);
      console.log("User role:", user?.role);

      // Gọi hàm login từ AuthContext để Context tự lưu token và cập nhật user
      login(token);
      navigate("/");
      // Chuyển hướng người dùng về trang chủ sau khi đăng nhập thành công
    } catch (err) {
      // 8. Xử lý lỗi từ API và hiển thị thông báo thân thiện.
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 404)
      ) {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      }
      console.error("Lỗi đăng nhập:", err);
    } finally {
      setIsLoading(false); // Dừng loading dù thành công hay thất bại
    }
  };
  useEffect(() => {
    if (user) {
      console.log("User từ context:", user);
      console.log("User role:", user.role);
      
      if (user.role === 'ADMIN') {
        console.log("Redirect to admin dashboard");
        navigate("/admin");
      } else {
        console.log("Redirect to home page");
        navigate("/");
      }
    }
  }, [user, navigate]);

  return (
    // 9. Sử dụng className từ object `styles` đã import.
    // Ví dụ: className="login-page-container" -> className={styles.loginPageContainer}
    <div className={styles.loginPageContainer}>
      <div className={styles.leftPanel}>
        <img src={loginHeroImage} alt="Fashion model" />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.loginFormWrapper}>
          <h1 className={styles.logo}>FASCO</h1>
          <h2 className={styles.title}>Sign In To FASCO</h2>

          {/* Form đăng nhập chính */}
          <form onSubmit={handleSubmit}>
            {/* 10. Hiển thị thông báo lỗi nếu có */}
            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email" // Quan trọng: `name` phải khớp với key trong state `credentials`
                value={credentials.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password" // Quan trọng: `name` phải khớp với key trong state `credentials`
                value={credentials.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.btnSignin}
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Sign In"}
            </button>
          </form>

          <Link
            to="/register"
            className={styles.btnRegister}
            style={{ textDecoration: "none" }}
          >
            Register Now
          </Link>

          <Link to="/forgot-password" className={styles.forgotPasswordLink}>
            Forgot Password?
          </Link>

          <p className={styles.terms}>FASCO Terms & Conditions</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
