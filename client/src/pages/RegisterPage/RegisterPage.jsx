// src/pages/RegisterPage/RegisterPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./RegisterPage.module.css";
import { register } from "../../api/authApi";
import registerHeroImage from "../../assets/images/login-hero-image.jpg";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      const response = await register(dataToSubmit);
      console.log("Đăng ký thành công:", response.data);
      setSuccess("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Không thể kết nối đến server. Vui lòng thử lại.");
      }
      console.error("Lỗi đăng ký:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerPageContainer}>
      <div className={styles.leftPanel}>
        <img src={registerHeroImage} alt="Fashion model in red blazer" />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.registerFormWrapper}>
          <h1 className={styles.logo}>FASCO</h1>
          <h2 className={styles.title}>Tạo Tài Khoản</h2>

          <form onSubmit={handleSubmit}>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p className={styles.successMessage}>{success}</p>}

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">Họ</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Tên</label>
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
              <label htmlFor="email">Địa Chỉ Email</label>
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
                <label htmlFor="password">Mật Khẩu</label>
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
                <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
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
                  : "Chọn ảnh đại diện (Options)"}
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
              {isLoading ? "Đang xử lý..." : "Tạo Tài Khoản"}
            </button>
          </form>

          <p className={styles.extraLink}>
            Đã có tài khoản? <Link to="/login">Đăng Nhập</Link>
          </p>

          <p className={styles.terms}>Điều Khoản & Điều Kiện FASCO</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
