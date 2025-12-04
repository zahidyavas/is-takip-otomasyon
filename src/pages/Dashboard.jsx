// src/pages/Dashboard.jsx
import React from 'react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Tarih Formatı
  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen bg-dark-main text-white font-sans">
      
      {/* Sol Menü */}
      <Sidebar />

      {/* Ana İçerik Alanı */}
      <main className="flex-1 p-8">
        
        {/* Üst Başlık */}
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
             <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-lg font-bold">
                {user?.name?.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        {/* Karşılama Kartı */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Hoş geldin, {user?.name}</h3>
          <p className="text-gray-400">
            Bugün için sana atanmış <span className="text-brand-green font-bold">0 planlanan</span> ve <span className="text-blue-400 font-bold">0 devam eden</span> görevin var.
          </p>
        </div>

        {/* Hızlı İşlem Menüsü */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg mb-6">
          <h4 className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">Hızlı İşlem Menüsü</h4>
          <div className="flex gap-3">
             <button className="btn btn-sm bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green">+ Yeni Görev</button>
             <button className="btn btn-sm bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green">+ Yeni Müşteri</button>
             <button className="btn btn-sm bg-dark-main border-dark-border text-white hover:border-brand-green hover:text-brand-green">+ Yeni Not</button>
          </div>
        </div>

        {/* Motivasyon Notu (Resimdeki gibi) */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg">
          <h4 className="text-sm text-gray-500 font-bold mb-2 uppercase tracking-wider">Günün Motivasyon Notu</h4>
          <p className="italic text-gray-300">"Disiplinli ajans, güven veren marka demektir."</p>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;