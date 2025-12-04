// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Senin canlı sunucuna istek atıyoruz
      const response = await axios.post('https://genckalmedya.cloud/v1.1/login.php', {
        email: email,
        password: password
      });

      if (response.data.status === 'success') {
        // Giriş başarılıysa kullanıcıyı tarayıcı hafızasına kaydet
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Ana sayfaya yönlendir ve sayfayı yenile (State'lerin güncellenmesi için)
        window.location.href = "/v1.1/";
      } else {
        // Sunucudan "Hatalı şifre" gibi bir mesaj geldiyse göster
        setError(response.data.message);
      }

    } catch (err) {
      console.error(err);
      setError('Sunucu ile bağlantı kurulamadı. İnternetinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold mb-4">GM İş Takip</h2>
          
          {error && (
            <div role="alert" className="alert alert-error text-sm p-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">E-posta</span>
              </label>
              <input 
                type="email" 
                placeholder="ornek@genckalmedya.com" 
                className="input input-bordered w-full" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Şifre</span>
              </label>
              <input 
                type="password" 
                placeholder="******" 
                className="input input-bordered w-full" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-6">
              <button className="btn btn-primary w-full">Giriş Yap</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;