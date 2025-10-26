// src/pages/RegisterPage/RegisterPage.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../LoginPage/LoginPage.css";
import "./RegisterPage.css";
import registerHeroImage from "../../assets/images/login-hero-image.jpg";
import googleIcon from "../../assets/images/google-icon.png";
import emailIcon from "../../assets/images/email-icon.png";

const RegisterPage = () => {
  // Sử dụng một object state để quản lý tất cả các trường trong form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Hàm xử lý chung cho tất cả các ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Hàm này sẽ được gọi khi người dùng nhấn nút "Create Account"
  const handleRegister = (event) => {
    event.preventDefault();

    // Kiểm tra xem mật khẩu có khớp không
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return; // Dừng thực thi nếu mật khẩu không khớp
    }

    console.log("Dữ liệu đăng ký gửi đi:", formData);

    // --- NƠI ĐỂ GỌI API BACKEND ĐỂ TẠO TÀI KHOẢN SAU NÀY ---
    // Ví dụ:
    // fetch('https://api.fasco.com/register', { ... });
    // ----------------------------------------------------
  };

  return (
    <div className="login-page-container">
      {/* Phần bên trái chứa ảnh */}
      <div className="left-panel">
        <img src={registerHeroImage} alt="Fashion model in red blazer" />
      </div>

      {/* Phần bên phải chứa form đăng ký */}
      <div className="right-panel">
        <div className="login-form-wrapper">
          <h1 className="logo-register">FASCO</h1>
          <h2 className="title">Create Account</h2>

          <div className="social-login">
            <button className="social-button google">
              <img src={googleIcon} alt="Google" className="icon" />
              Sign up with Google
            </button>
            <button className="social-button email-btn">
              <img src={emailIcon} alt="Email" className="icon" />
              Sign up with Email
            </button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <form onSubmit={handleRegister}>
            {/* Hàng chứa First Name và Last Name */}
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Hàng chứa Email và Phone */}
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Hàng chứa Password và Confirm Password */}
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-signin">
              Create Account
            </button>
          </form>

          <p className="extra-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <p className="terms">FASCO Terms & Conditions</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
