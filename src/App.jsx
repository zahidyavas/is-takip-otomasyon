// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx'; // <--- YENİ: Kayıt sayfasını içeri aldık

// Basit bir Ana Sayfa (Dashboard) taslağı - Şimdilik burada dursun
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-base-200 p-10">
      <div className="navbar bg-base-100 rounded-box shadow-lg mb-8">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">GM Panel</a>
        </div>
        <div className="flex-none gap-2">
          <span className="text-sm font-bold mr-2">Hoşgeldin, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-error btn-sm">Çıkış</button>
        </div>
      </div>
      
      <div className="hero bg-base-100 rounded-xl p-10 shadow-md">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-primary">Merhaba!</h1>
            <p className="py-6">Sisteme başarıyla giriş yaptın. Artık API bağlantımız çalışıyor.</p>
            <button className="btn btn-primary">İşlere Başla</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  // Kullanıcı giriş yapmış mı kontrol et
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <Routes>
        {/* Giriş yapılmamışsa Login'e yönlendir */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* YENİ: Giriş yapılmamışsa Register sayfasına git, yapılmışsa Ana Sayfaya at */}
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Giriş yapılmışsa Dashboard'u göster */}
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;