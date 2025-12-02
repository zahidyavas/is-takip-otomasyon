// src/App.jsx
import React from 'react';

function App() {
  return (
    // Tailwind sınıfları: min-h-screen (tam ekran), bg-base-200 (tema rengi)
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4">
      
      <h1 className="text-4xl font-bold text-primary">Gençkal Medya</h1>
      <p className="text-lg">İş Yönetim Merkezi</p>

      {/* DaisyUI Butonları */}
      <div className="flex gap-2">
        <button className="btn btn-primary">Giriş Yap</button>
        <button className="btn btn-outline btn-secondary">Kayıt Ol</button>
      </div>

      {/* Örnek bir Kart (Card) */}
      <div className="card w-96 bg-base-100 shadow-xl mt-5">
        <div className="card-body">
          <h2 className="card-title">İstatistikler</h2>
          <p>Burası statik bir kart örneğidir.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-sm btn-accent">Detaylar</button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;