// src/pages/LoginPage/LoginPage.js

import React, { useState } from "react";
import "./LoginPage.css";
import loginHeroImage from "../../assets/images/login-hero-image.jpg";
import googleIcon from "../../assets/images/google-icon.png";
import emailIcon from "../../assets/images/email-icon.png";
import { Link } from "react-router-dom";

const LoginPage = () => {
  // Sử dụng 'state' để lưu trữ dữ liệu người dùng nhập vào form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hàm này sẽ được gọi khi người dùng nhấn nút "Sign In"
  const handleSignIn = (event) => {
    // Ngăn trình duyệt tải lại trang, đây là hành vi mặc định của form
    event.preventDefault();

    // Tạo một đối tượng chứa thông tin đăng nhập
    const loginData = {
      email: email,
      password: password,
    };

    console.log("Đang gửi dữ liệu đăng nhập:", loginData);

    // --- NƠI ĐỂ GỌI API BACKEND SAU NÀY ---
    // Ví dụ:
    // fetch('https://api.fasco.com/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(loginData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //    console.log('Phản hồi từ server:', data);
    //    // Xử lý logic sau khi đăng nhập thành công (chuyển trang, lưu token, ...)
    // });
    // -----------------------------------------
  };

  return (
    <div className="login-page-container">
      {/* Phần bên trái chứa ảnh */}
      <div className="left-panel">
        <img src={loginHeroImage} alt="Fashion model" />
      </div>

      {/* Phần bên phải chứa form đăng nhập */}
      <div className="right-panel">
        <div className="login-form-wrapper">
          <h1 className="logo">FASCO</h1>
          <h2 className="title">Sign In To FASCO</h2>

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

          {/* Form đăng nhập chính */}
          <form onSubmit={handleSignIn}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Cập nhật state 'email' mỗi khi người dùng gõ
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Cập nhật state 'password' mỗi khi người dùng gõ
                required
              />
            </div>

            <button type="submit" className="btn-signin">
              Sign In
            </button>
          </form>

          <Link
            to="/register"
            className="btn-register"
            style={{ textDecoration: "none" }}
          >
            Register Now
          </Link>

          <a href="/forgot-password" className="forgot-password-link">
            Forget Password?
          </a>

          <p className="terms">FASCO Terms & Conditions</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
