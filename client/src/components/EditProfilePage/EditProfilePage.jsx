import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import { getUserProfile, updateUserProfile } from "../../api/authApi";
import styles from "./EditProfilePage.module.css";

const EditProfilePage = () => {
  const { user, login } = useAppContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editData, setEditData] = useState({ first_name: "", last_name: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.user_id) return;
      setIsLoading(true);
      try {
        const response = await getUserProfile(user.user_id);
        setProfile(response.data);
        setEditData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
        });
        setAvatarPreview(response.data.avatar_url);
      } catch (err) {
        setError("Không thể lấy dữ liệu hồ sơ.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user?.user_id]);

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("first_name", editData.first_name);
    formData.append("last_name", editData.last_name);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const response = await updateUserProfile(user.user_id, formData);
      setSuccess("Cập nhật hồ sơ thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/account"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Không thể cập nhật hồ sơ.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) return <div>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Chỉnh Sửa Hồ Sơ</h1>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.avatarContainer}>
            <img
              src={avatarPreview || "/default-avatar.png"}
              alt="Avatar"
              className={styles.avatar}
            />
            <label
              htmlFor="avatar-upload"
              className={styles.avatarEditButton}
            ></label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="first_name">Họ</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={editData.first_name}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="last_name">Tên</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={editData.last_name}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" value={profile?.email || ""} disabled />
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate("/account")}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.saveButton}`}
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
