// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Link ekledik

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      // API'ye istek at
      const response = await axios.post('https://genckalmedya.cloud/v1.1/register.php', formData);

      if (response.data.status === 'success') {
        setMessage({ type: 'success', text: response.data.message });
        // 2 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }

    } catch (err) {
      setMessage({ type: 'error', text: 'Sunucu hatası oluştu.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold mb-4">Yeni Hesap Oluştur</h2>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} text-sm p-2`}>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Ad Soyad</span></label>
              <input type="text" name="name" onChange={handleChange} className="input input-bordered" required />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">E-posta</span></label>
              <input type="email" name="email" onChange={handleChange} className="input input-bordered" required />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Şifre</span></label>
              <input type="password" name="password" onChange={handleChange} className="input input-bordered" required />
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-secondary w-full">Kayıt Ol</button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="link link-hover text-sm">Zaten hesabın var mı? Giriş Yap</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;