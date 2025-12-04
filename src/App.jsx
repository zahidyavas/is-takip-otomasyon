// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; // <--- YENİ: Artık harici dosyadan çekiyoruz
import Customers from './pages/Customers';
import Board from './pages/Board';
import Notes from './pages/Notes';
import Reports from './pages/Reports';
import Accounting from './pages/Accounting';

function App() {
  // Kullanıcı giriş yapmış mı kontrol et
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router basename="/v1.1">
      <Routes>
        {/* Giriş yapılmamışsa Login'e yönlendir */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* Kayıt sayfası */}
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Ana Sayfa: Giriş yapılmışsa Dashboard'u göster */}
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />

        <Route path="/customers" element={user ? <Customers /> : <Navigate to="/login" />} />
        
        <Route path="/board" element={user ? <Board /> : <Navigate to="/login" />} />

        <Route path="/notes" element={user ? <Notes /> : <Navigate to="/login" />} />

        <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />}  />

        <Route path="/accounting" element={user ? <Accounting /> : <Navigate to="/login" />}  />
      </Routes>
    </Router>
  );
}

export default App;