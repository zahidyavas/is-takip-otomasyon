// src/components/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// DÜZELTME: Fawallet yerine FaWallet yazdık (W büyük)
import { FaHome, FaTasks, FaUsers, FaStickyNote, FaChartBar, FaWallet, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Menü Listesi
  const menuItems = [
    { title: 'Ana Sayfa', path: '/', icon: <FaHome /> },
    { title: 'İş Takibi', path: '/board', icon: <FaTasks /> },
    { title: 'Müşteri Takibi', path: '/customers', icon: <FaUsers /> },
    { title: 'Notlar', path: '/notes', icon: <FaStickyNote /> },
    { title: 'Raporlar', path: '/reports', icon: <FaChartBar /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = "/v1.1/login";
  };

  return (
    <div className="w-64 bg-dark-card border-r border-dark-border min-h-screen flex flex-col text-gray-300">
      
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-xl font-bold text-white tracking-wider">GENÇKAL MEDYA</h1>
        <p className="text-xs text-gray-500 mt-1">İş Takip Paneli</p>
      </div>

      {/* Menü */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200
              ${location.pathname === item.path 
                ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' 
                : 'hover:bg-dark-main hover:text-white'}
            `}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.title}</span>
          </div>
        ))}

        {/* Patron Linki - DÜZELTME: İkon ismi düzeltildi */}
        {user?.role === 'patron' && (
          <div 
            onClick={() => navigate('/accounting')}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-red-900/20 hover:text-red-400 mt-4 border border-transparent hover:border-red-900/50"
          >
            <span className="text-lg"><FaWallet /></span>
            <span className="font-medium">Muhasebe (Patron)</span>
          </div>
        )}
      </nav>

      {/* Çıkış */}
      <div className="p-4 border-t border-dark-border">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors w-full p-2"
        >
          <FaSignOutAlt />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;