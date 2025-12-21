// src/pages/LoginPage/LoginPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { login as apiLogin } from "../../api/authApi";
import { useAppContext } from "../../contexts/AppContext";
import loginHeroImage from "../../assets/images/login-hero-image.jpg";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAppContext();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiLogin(credentials);

      const { token, user } = response.data;
      console.log("Token:", token);
      console.log("User:", user);
      console.log("User role:", user?.role);

      login(token);
      navigate("/");
    } catch (err) {
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
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      console.log("User từ context:", user);
      console.log("User role:", user.role);

      if (user.role === "ADMIN") {
        console.log("Redirect to admin dashboard");
        navigate("/admin");
      } else {
        console.log("Redirect to home page");
        navigate("/");
      }
    }
  }, [user, navigate]);

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.leftPanel}>
        <img src={loginHeroImage} alt="Fashion model" />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.loginFormWrapper}>
          <h1 className={styles.logo}>FASCO</h1>
          <h2 className={styles.title}>Đăng Nhập FASCO</h2>

          {/* Form đăng nhập chính */}
          <form onSubmit={handleSubmit}>
            {/* 10. Hiển thị thông báo lỗi nếu có */}
            {error && <p className={styles.errorMessage}>{error}</p>}

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Mật Khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
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
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>

          <Link
            to="/register"
            className={styles.btnRegister}
            style={{ textDecoration: "none" }}
          >
            Đăng Ký Ngay
          </Link>

          <Link to="/forgot-password" className={styles.forgotPasswordLink}>
            Quên Mật Khẩu?
          </Link>

          <p className={styles.terms}>Điều Khoản & Điều Kiện FASCO</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
