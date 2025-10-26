import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    if (avatar) {
      data.append('avatar', avatar);
    }

    try {
      // Gọi API đăng ký
      const response = await api.post('/users', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Đăng ký thành công:', response.data);
      setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Có lỗi xảy ra.'); //
      } else {
        setError('Không thể kết nối đến server.');
      }
      console.error('Lỗi đăng ký:', err);
    }
  };

  return (
    <div>
      <h2>Trang Đăng Ký</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <input name="first_name" placeholder="Tên" onChange={handleInputChange} required />
        <input name="last_name" placeholder="Họ" onChange={handleInputChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required />
        <input type="password" name="password" placeholder="Mật khẩu" onChange={handleInputChange} required />
        <input type="file" name="avatar" onChange={handleFileChange} />
        <button type="submit">Đăng ký</button>
      </form>
    </div>
  );
};

export default RegisterPage;