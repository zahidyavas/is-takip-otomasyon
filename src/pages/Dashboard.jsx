import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Sayfa yönlendirmesi için
import { FaPlus, FaClipboardList, FaUserTie, FaStickyNote } from 'react-icons/fa';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({ planned: 0, ongoing: 0 });
  const navigate = useNavigate(); // Yönlendirme hook'u

  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchStats = async () => {
      if (user && user.id) {
        try {
          // API URL'sini belirle
          // Not: Eğer development ortamındaysan localhost, production'da ise tam domain.
          // Burada mevcut yapını koruyorum.
          const baseUrl = 'https://genckalmedya.cloud/v1.1'; 
          
          const response = await axios.get(`${baseUrl}/dashboard.php?user_id=${user.id}`);
          
          if (response.data.status === 'success') {
            setStats({
              planned: response.data.planned,
              ongoing: response.data.ongoing
            });
          }
        } catch (error) {
          console.error("İstatistik hatası:", error);
        }
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-dark-main text-white font-sans">
      <Sidebar />
      
      {/* pt-16: Mobil üst boşluk (Hamburger menü için) */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        
        {/* --- BAŞLIK ALANI --- */}
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Ana Sayfa</h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1">{dateStr}</p>
          </div>
          
          <div className="flex items-center gap-4">
              {/* Kullanıcı İsmi: Mobilde gizle, Masaüstünde göster */}
              <div className="text-right hidden md:block">
                <div className="font-bold text-white">{user?.name}</div>
                <div className="text-xs text-gray-500 uppercase">{user?.role}</div>
              </div>
              
              {/* Avatar: Her zaman görünür */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-green flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-green-900/50">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
          </div>
        </header>

        {/* --- HOŞGELDİN KARTI --- */}
        <div className="bg-dark-card border border-dark-border p-5 md:p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Hoş geldin, {user?.name} 👋</h3>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Bugün için sana atanmış <strong className="text-brand-green text-base md:text-lg">{stats.planned} planlanan</strong> ve <strong className="text-blue-400 text-base md:text-lg">{stats.ongoing} devam eden</strong> görevin var.
          </p>
        </div>

        {/* --- HIZLI İŞLEM MENÜSÜ --- */}
        <div className="bg-dark-card border border-dark-border p-5 md:p-6 rounded-xl shadow-lg mb-6">
          <h4 className="text-xs md:text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">Hızlı İşlem Menüsü</h4>
          
          {/* Mobilde alt alta (grid-cols-1), Tablet/Masaüstünde yan yana (grid-cols-3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <button 
                onClick={() => navigate('/board')} 
                className="btn h-12 bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green hover:bg-dark-main flex items-center gap-2 justify-start md:justify-center"
             >
                <FaClipboardList /> Yeni Görev Ekle
             </button>
             
             <button 
                onClick={() => navigate('/customers')} 
                className="btn h-12 bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green hover:bg-dark-main flex items-center gap-2 justify-start md:justify-center"
             >
                <FaUserTie /> Yeni Müşteri Ekle
             </button>
             
             <button 
                onClick={() => navigate('/notes')} 
                className="btn h-12 bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green hover:bg-dark-main flex items-center gap-2 justify-start md:justify-center"
             >
                <FaStickyNote /> Yeni Not Al
             </button>
          </div>
        </div>
        
        {/* --- MOTİVASYON NOTU --- */}
        <div className="bg-gradient-to-r from-dark-card to-dark-main border border-dark-border p-5 md:p-6 rounded-xl shadow-lg">
          <h4 className="text-xs md:text-sm text-gray-500 font-bold mb-2 uppercase tracking-wider">Günün Motivasyon Notu</h4>
          <p className="italic text-gray-300 text-sm md:text-base">
            "Disiplinli ajans, güven veren marka demektir."
          </p>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;