// src/pages/RegisterPage/RegisterPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// 1. Import CSS Modules và các tài nguyên
import styles from "./RegisterPage.module.css";
import { register } from "../../api/authApi";
import registerHeroImage from "../../assets/images/login-hero-image.jpg"; // Dùng ảnh từ Figma

const RegisterPage = () => {
  // 2. State quản lý form, file, và trạng thái UI
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState(null); // State riêng cho file
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 3. Các hàm xử lý input không đổi
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  // 4. Hàm submit được nâng cấp
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    setIsLoading(true);

    const dataToSubmit = new FormData();
    dataToSubmit.append("first_name", formData.firstName);
    dataToSubmit.append("last_name", formData.lastName);
    dataToSubmit.append("email", formData.email);
    dataToSubmit.append("password", formData.password);
    if (avatar) {
      dataToSubmit.append("avatar", avatar);
    }

    try {
      // Gọi API đăng ký
      const response = await register(dataToSubmit);
      console.log("Đăng ký thành công:", response.data);
      setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");

      // Chuyển hướng sau 2 giây
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error); // Hiển thị lỗi từ server
      } else {
        setError("Không thể kết nối đến server. Vui lòng thử lại.");
      }
      console.error("Lỗi đăng ký:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. JSX kết hợp giao diện cũ và logic mới
  return (
    <div className={styles.registerPageContainer}>
      <div className={styles.leftPanel}>
        <img src={registerHeroImage} alt="Fashion model in red blazer" />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.registerFormWrapper}>
          <h1 className={styles.logo}>FASCO</h1>
          <h2 className={styles.title}>Create Account</h2>

          <form onSubmit={handleSubmit}>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p className={styles.successMessage}>{success}</p>}

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="avatar" className={styles.fileInputLabel}>
                {avatar
                  ? `Đã chọn: ${avatar.name}`
                  : "Chọn ảnh đại diện (Tùy chọn)"}
              </label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className={styles.btnCreateAccount}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Create Account"}
            </button>
          </form>

          <p className={styles.extraLink}>
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <p className={styles.terms}>FASCO Terms & Conditions</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
