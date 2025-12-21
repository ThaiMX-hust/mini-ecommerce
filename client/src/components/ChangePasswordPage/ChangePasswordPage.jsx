import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/authApi";
import styles from "./ChangePasswordPage.module.css";

const ChangePasswordPage = () => {
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwords.new_password !== passwords.confirm_password) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    if (passwords.new_password.length < 6) {
      // Thêm validation cơ bản
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend = {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      };
      const response = await changePassword(dataToSend);
      setSuccess(
        response.data.message || "Đổi mật khẩu thành công! Đang chuyển hướng..."
      );

      // Reset form
      setPasswords({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      setTimeout(() => {
        navigate("/account"); // Chuyển về trang account sau 2 giây
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error("Đổi mật khẩu lỗi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Đổi Mật Khẩu</h1>
        <p className={styles.subtitle}>
          Cập nhật mật khẩu của bạn để bảo mật hơn.
        </p>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="old_password">Old Password</label>
            <input
              type="password"
              id="old_password"
              name="old_password"
              value={passwords.old_password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="new_password">New Password</label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              value={passwords.new_password}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate("/account")}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Back to Account
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.saveButton}`}
              disabled={isLoading}
            >
              {isLoading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
