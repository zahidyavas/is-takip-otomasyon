import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({ planned: 0, ongoing: 0 });

  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchStats = async () => {
      if (user && user.id) {
        try {
          // Dinamik URL yapısı (Hata önleyici)
          const baseUrl = window.location.origin + '/v1.1';
          
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
      <main className="flex-1 p-8">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Ana Sayfa</h2>
            <p className="text-gray-400 text-sm mt-1">{dateStr}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <div className="font-bold text-white">{user?.name}</div>
                <div className="text-xs text-gray-500 uppercase">{user?.role}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-lg font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Hoş geldin, {user?.name}</h3>
          <p className="text-gray-400">
            Bugün için sana atanmış <span className="text-brand-green font-bold text-lg">{stats.planned} planlanan</span> ve <span className="text-blue-400 font-bold text-lg">{stats.ongoing} devam eden</span> görevin var.
          </p>
        </div>

        {/* Hızlı İşlem Menüsü */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg mb-6">
          <h4 className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">Hızlı İşlem Menüsü</h4>
          <div className="flex gap-3">
             <button onClick={() => window.location.href='/v1.1/board'} className="btn btn-sm bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green">+ Yeni Görev</button>
             <button onClick={() => window.location.href='/v1.1/customers'} className="btn btn-sm bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green">+ Yeni Müşteri</button>
             <button onClick={() => window.location.href='/v1.1/notes'} className="btn btn-sm bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green">+ Yeni Not</button>
          </div>
        </div>
        
        {/* Motivasyon Notu */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg">
          <h4 className="text-sm text-gray-500 font-bold mb-2 uppercase tracking-wider">Günün Motivasyon Notu</h4>
          <p className="italic text-gray-300">"Disiplinli ajans, güven veren marka demektir."</p>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;