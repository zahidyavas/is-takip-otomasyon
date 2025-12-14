import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUserTie, FaClipboardList, FaStickyNote, 
  FaChartBar, FaWallet, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaBars 
} from 'react-icons/fa';

const Sidebar = () => {
  // Sidebar açık mı kapalı mı state'i (Varsayılan: Açık)
  const [isOpen, setIsOpen] = useState(true);
  
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Menü Linkleri
  const menuItems = [
    { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },
    { path: '/board', name: 'İş Takip', icon: <FaClipboardList /> },
    { path: '/customers', name: 'Müşteriler', icon: <FaUserTie /> },
    { path: '/notes', name: 'Notlar', icon: <FaStickyNote /> },
    { path: '/reports', name: 'Raporlar', icon: <FaChartBar /> },
  ];

  // Sadece Patronun göreceği menü
  if (user && user.role === 'patron') {
    menuItems.push({ path: '/accounting', name: 'Muhasebe', icon: <FaWallet /> });
  }

  // Çıkış Yap Fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = import.meta.env.DEV ? '/login' : '/v1.1/login';
  };

  return (
    // Dış Kapsayıcı: Genişlik animasyonlu değişecek (w-72 veya w-20)
    <aside 
      className={`h-screen bg-dark-card border-r border-dark-border flex flex-col transition-all duration-300 relative 
      ${isOpen ? 'w-72' : 'w-20'}`}
    >
      
      {/* --- AÇMA/KAPAMA BUTONU (Ok İşareti) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="absolute -right-3 top-9 bg-brand-green text-white rounded-full p-1.5 shadow-lg border border-dark-main hover:bg-green-600 transition-colors z-50"
      >
        {isOpen ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
      </button>

      {/* --- LOGO ALANI --- */}
      <div className="p-6 flex items-center gap-3 border-b border-dark-border h-20 overflow-hidden whitespace-nowrap">
        {/* Logo İkonu (Her zaman görünür) */}
        <div className="min-w-[40px] h-10 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-900/50">
          G
        </div>
        
        {/* Logo Yazısı (Sadece açıksa görünür) */}
        <div className={`transition-all duration-300 ${!isOpen && 'opacity-0 translate-x-10 hidden'}`}>
          <h1 className="text-xl font-bold tracking-wide text-white">GENÇKAL</h1>
          <span className="text-xs text-gray-400 tracking-widest">MEDYA</span>
        </div>
      </div>

      {/* --- MENÜ LİNKLERİ --- */}
      <nav className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center h-12 px-6 transition-all duration-200 relative group
                ${isActive ? 'text-white bg-brand-green/10 border-r-4 border-brand-green' : 'text-gray-400 hover:text-white hover:bg-dark-main'}
              `}
            >
              {/* İkon */}
              <div className={`text-xl min-w-[24px] flex justify-center transition-colors ${isActive ? 'text-brand-green' : ''}`}>
                {item.icon}
              </div>

              {/* Yazı (Animasyonlu Gizleme) */}
              <span className={`ml-4 font-medium whitespace-nowrap transition-all duration-300 ${!isOpen && 'opacity-0 w-0 hidden'}`}>
                {item.name}
              </span>

              {/* Hover Tooltip (Sadece kapalıyken üzerine gelince çıkan yazı) */}
              {!isOpen && (
                <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* --- ÇIKIŞ BUTONU (En Altta) --- */}
      <div className="p-4 border-t border-dark-border">
        <button 
          onClick={handleLogout} 
          className={`flex items-center w-full h-12 px-2 rounded-lg text-red-400 hover:bg-red-900/10 transition-colors group
            ${isOpen ? 'justify-start' : 'justify-center'}
          `}
        >
          <div className="text-xl min-w-[24px] flex justify-center"><FaSignOutAlt /></div>
          
          <span className={`ml-4 font-medium whitespace-nowrap transition-all duration-300 ${!isOpen && 'opacity-0 w-0 hidden'}`}>
            Çıkış Yap
          </span>

          {/* Tooltip */}
          {!isOpen && (
             <div className="absolute left-16 bg-red-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
               Çıkış
             </div>
          )}
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;