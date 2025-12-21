import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../../api/authApi";

import styles from "../LoginPage/LoginPage.module.css";

import loginHeroImage from "../../assets/images/login-hero-image.jpg";

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Đọc token từ URL: http://.../forgot-password?token=abc123
  const token = searchParams.get("token");

  // State chung
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State cho form yêu cầu email
  const [email, setEmail] = useState("");

  // State cho form đặt lại mật khẩu
  const [passwords, setPasswords] = useState({
    new_password: "",
    confirm_password: "",
  });

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await requestPasswordReset(email);
      setSuccess(
        response.data.message ||
          "Nếu tài khoản với email đó tồn tại, một liên kết đặt lại mật khẩu đã được gửi."
      );
      setEmail("");
    } catch (err) {
      setSuccess(
        "Nếu tài khoản với email đó tồn tại, một liên kết đặt lại mật khẩu đã được gửi."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      setError("Mật khẩu không khớp.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await resetPassword(token, passwords.new_password);
      setSuccess(
        response.data.message + " Đang chuyển hướng đến trang đăng nhập..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderResetPasswordForm = () => (
    <>
      <h2 className={styles.title}>Đặt Lại Mật Khẩu</h2>
      <p className={styles.subtitle}>Nhập mật khẩu mới của bạn bên dưới.</p>
      <form onSubmit={handlePasswordResetSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="new_password">Mật Khẩu Mới</label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={passwords.new_password}
            onChange={(e) =>
              setPasswords({ ...passwords, new_password: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="confirm_password">Xác Nhận Mật Khẩu Mới</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={passwords.confirm_password}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm_password: e.target.value })
            }
            required
          />
        </div>
        <button type="submit" className={styles.btnSignin} disabled={isLoading}>
          {isLoading ? "Đang đặt lại..." : "Đặt Lại Mật Khẩu"}
        </button>
      </form>
    </>
  );

  const renderRequestLinkForm = () => (
    <>
      <h2 className={styles.title}>Quên Mật Khẩu</h2>
      <p className={styles.subtitle}>
        Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt
        lại mật khẩu.
      </p>
      <form onSubmit={handleEmailSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Địa Chỉ Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.btnSignin} disabled={isLoading}>
          {isLoading ? "Đang gửi..." : "Gửi Liên Kết Đặt Lại"}
        </button>
      </form>
    </>
  );

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.leftPanel}>
        <img src={loginHeroImage} alt="Fashion model" />
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.loginFormWrapper}>
          <h1 className={styles.logo}>FASCO</h1>

          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}

          {/* Dựa vào token để quyết định render form nào */}
          {token ? renderResetPasswordForm() : renderRequestLinkForm()}

          <Link
            to="/login"
            className={styles.forgotPasswordLink}
            style={{ marginTop: "20px" }}
          >
            Quay Lại Đăng Nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
