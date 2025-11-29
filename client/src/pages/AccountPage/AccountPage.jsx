// src/pages/AccountPage/AccountPage.jsx (PHIÊN BẢN NÂNG CẤP TOÀN DIỆN)

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../contexts/AppContext";
import { getUserProfile, updateUserProfile } from "../../api/authApi";
import styles from "./AccountPage.module.css";

// Component avatar mặc định
const DefaultAvatar = () => (
  <svg className={styles.avatarSvg} viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const AccountPage = () => {
  const { user, login } = useAppContext(); // Lấy hàm login để cập nhật token nếu cần

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editData, setEditData] = useState({ first_name: "", last_name: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Hàm fetch dữ liệu người dùng
  const fetchProfile = useCallback(async () => {
    if (!user?.user_id) return;
    setIsLoading(true);
    try {
      const response = await getUserProfile(user.user_id);
      setProfile(response.data);
      setEditData({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
      });
    } catch (err) {
      setError("Could not fetch profile data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError("");
    setSuccess("");
    // Reset lại form edit về dữ liệu gốc khi nhấn Cancel
    if (profile) {
      setEditData({
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
      setAvatarFile(null);
      setAvatarPreview("");
    }
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Tạo URL tạm thời để xem trước ảnh
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
      setProfile(response.data); // Cập nhật profile hiển thị với dữ liệu mới
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      // Optional: Nếu API trả về token mới, hãy cập nhật nó
      // if (response.data.token) { login(response.data.token); }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profile) return <div>Loading profile...</div>;
  if (!profile) return <div>Could not load profile.</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Account</h1>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}

      {isEditing ? (
        // --- EDIT MODE ---
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <div className={styles.avatarContainer}>
            <img
              src={avatarPreview || profile.avatar_url || "default-avatar.png"}
              alt="Avatar"
              className={styles.avatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.png";
              }}
            />
            <label htmlFor="avatar-upload" className={styles.avatarEditButton}>
              Change
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={editData.first_name}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="last_name">Last Name</label>
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
            <input type="email" value={profile.email} disabled />
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleEditToggle}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.saveButton}`}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        // --- VIEW MODE ---
        <div className={styles.viewProfile}>
          <div className={styles.avatarContainer}>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className={styles.avatar}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
            ) : (
              <DefaultAvatar />
            )}
          </div>
          <div className={styles.userInfo}>
            <p>
              <strong>First Name:</strong> {profile.first_name}
            </p>
            <p>
              <strong>Last Name:</strong> {profile.last_name}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
          </div>
          <button
            onClick={handleEditToggle}
            className={`${styles.button} ${styles.editButton}`}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
