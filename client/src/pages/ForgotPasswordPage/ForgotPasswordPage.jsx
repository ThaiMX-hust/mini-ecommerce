import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../../api/authApi";

// Tái sử dụng CSS từ trang Login để có giao diện đồng bộ
import styles from "../LoginPage/LoginPage.module.css";

// Tái sử dụng ảnh từ trang Login
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
          "If an account with that email exists, a password reset link has been sent."
      );
      setEmail(""); // Xóa email sau khi gửi
    } catch (err) {
      // Ngay cả khi lỗi, ta cũng nên hiển thị thông báo thành công để bảo mật
      // Tránh việc kẻ xấu dò xem email nào đã tồn tại trong hệ thống
      setSuccess(
        "If an account with that email exists, a password reset link has been sent."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await resetPassword(token, passwords.new_password);
      setSuccess(response.data.message + " Redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Invalid or expired token. Please request a new link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render Giai đoạn 2: Đặt lại mật khẩu (nếu có token trên URL) (http://localhost:5173/forgot-password?token=abc123)
  const renderResetPasswordForm = () => (
    <>
      <h2 className={styles.title}>Reset Your Password</h2>
      <p className={styles.subtitle}>Enter your new password below.</p>
      <form onSubmit={handlePasswordResetSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="new_password">New Password</label>
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
          <label htmlFor="confirm_password">Confirm New Password</label>
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
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </>
  );

  // Render Giai đoạn 1: Yêu cầu link (nếu không có token)
  const renderRequestLinkForm = () => (
    <>
      <h2 className={styles.title}>Forgot Password</h2>
      <p className={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your
        password.
      </p>
      <form onSubmit={handleEmailSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.btnSignin} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
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
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
