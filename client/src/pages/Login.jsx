import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Import api instance

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Gọi API đăng nhập
      const response = await api.post('/auth/login', credentials);
      
      const { token, user } = response.data;
      
      // Lưu token vào localStorage để dùng cho các request sau
      localStorage.setItem('token', token);
      
      console.log('Đăng nhập thành công!', user);
      
      // Chuyển hướng về trang chủ
      navigate('/');
      
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Email hoặc mật khẩu không đúng.'); //
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
      console.error('Lỗi đăng nhập:', err);
    }
  };

  return (
    <div>
      <h2>Trang Đăng Nhập</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={credentials.email}
          onChange={handleInputChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Mật khẩu" 
          value={credentials.password}
          onChange={handleInputChange} 
          required 
        />
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default LoginPage;