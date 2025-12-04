import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaWallet, FaArrowUp, FaArrowDown, FaMoneyBillWave } from 'react-icons/fa';

const Accounting = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_income: 0, total_expense: 0, net_balance: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Form State
  const [form, setForm] = useState({
    type: 'Gider', // Varsayılan Gider olsun
    amount: '',
    date: new Date().toISOString().split('T')[0], // Bugünün tarihi
    category: '',
    description: ''
  });

  // GÜVENLİK KONTROLÜ
  useEffect(() => {
    if (!user || user.role !== 'patron') {
      alert("Bu sayfaya erişim yetkiniz yok!");
      navigate('/'); // Ana sayfaya postala
    } else {
      fetchData();
    }
  }, []);

  // Verileri Çek
  const fetchData = async () => {
    try {
      const res = await axios.get('https://genckalmedya.cloud/v1.1/accounting.php');
      if (res.data.status === 'success') {
        setTransactions(res.data.data);
        setStats(res.data.stats);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // İşlem Ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) { alert("Tutar ve Kategori giriniz."); return; }

    try {
      await axios.post('https://genckalmedya.cloud/v1.1/accounting.php', { ...form, user_id: user.id });
      setForm({ ...form, amount: '', category: '', description: '' }); // Tarih kalsın
      fetchData();
      alert("İşlem Kaydedildi!");
    } catch (error) { alert("Hata oluştu."); }
  };

  // Silme
  const handleDelete = async (id) => {
    if (!confirm("Bu kaydı silmek istediğine emin misin?")) return;
    await axios.post('https://genckalmedya.cloud/v1.1/accounting.php', { action: 'delete', id });
    fetchData();
  };

  // Para Formatı (₺)
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <div className="flex min-h-screen bg-dark-main text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        
        <header className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaWallet className="text-yellow-500" /> Muhasebe & Finans
          </h2>
          <p className="text-gray-400 mt-1">Sadece yöneticilere özel finansal genel bakış.</p>
        </header>

        {/* 1. İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Gelir Kartı */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-green-900/20 rounded-full text-green-500 text-2xl"><FaArrowUp /></div>
            <div>
              <p className="text-gray-400 text-sm">Toplam Gelir</p>
              <h3 className="text-2xl font-bold text-white">{formatMoney(stats.total_income)}</h3>
            </div>
          </div>

          {/* Gider Kartı */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-red-900/20 rounded-full text-red-500 text-2xl"><FaArrowDown /></div>
            <div>
              <p className="text-gray-400 text-sm">Toplam Gider</p>
              <h3 className="text-2xl font-bold text-white">{formatMoney(stats.total_expense)}</h3>
            </div>
          </div>

          {/* Net Kartı */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-4 bg-blue-900/20 rounded-full text-blue-500 text-2xl"><FaMoneyBillWave /></div>
            <div>
              <p className="text-gray-400 text-sm">Net Kasa</p>
              <h3 className={`text-2xl font-bold ${stats.net_balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatMoney(stats.net_balance)}
              </h3>
            </div>
          </div>
        </div>

        {/* 2. ANA BÖLÜM: EKLEME & LİSTE */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* SOL: İŞLEM EKLEME FORMU */}
          <div className="xl:col-span-1">
            <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg sticky top-6">
              <h3 className="text-xl font-bold mb-4 border-b border-dark-border pb-2">Yeni İşlem Ekle</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-gray-400 text-xs">İşlem Türü</label>
                    <select className="select select-bordered w-full bg-dark-main border-dark-border" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="Gider">Gider (Çıkan)</option>
                      <option value="Gelir">Gelir (Giren)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-gray-400 text-xs">Tutar</label>
                    <input type="number" step="0.01" className="input input-bordered w-full bg-dark-main border-dark-border" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                  </div>
                </div>

                <div>
                  <label className="label text-gray-400 text-xs">Tarih</label>
                  <input type="date" className="input input-bordered w-full bg-dark-main border-dark-border" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>

                <div>
                  <label className="label text-gray-400 text-xs">Kategori</label>
                  <input type="text" className="input input-bordered w-full bg-dark-main border-dark-border" placeholder="Örn: Ofis Kirası / Müşteri Ödemesi" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
                </div>

                <div>
                  <label className="label text-gray-400 text-xs">Açıklama (Opsiyonel)</label>
                  <textarea className="textarea textarea-bordered w-full bg-dark-main border-dark-border h-20" placeholder="Detaylar..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                </div>

                <button className={`btn w-full border-none text-white ${form.type === 'Gelir' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  <FaPlus /> {form.type} Ekle
                </button>
              </form>
            </div>
          </div>

          {/* SAĞ: İŞLEM GEÇMİŞİ LİSTESİ */}
          <div className="xl:col-span-2">
            <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b border-dark-border">
                <h3 className="font-bold text-lg">Son İşlemler</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-dark-main text-gray-400">
                    <tr>
                      <th>Tarih</th>
                      <th>Kategori / Açıklama</th>
                      <th>Tutar</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="4" className="text-center p-4">Yükleniyor...</td></tr>
                    ) : transactions.length === 0 ? (
                      <tr><td colSpan="4" className="text-center p-4 text-gray-500">Kayıt yok.</td></tr>
                    ) : (
                      transactions.map((item) => (
                        <tr key={item.id} className="hover:bg-dark-main/50 border-dark-border">
                          <td className="font-mono text-sm text-gray-400">{item.date}</td>
                          <td>
                            <div className="font-bold text-white">{item.category}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </td>
                          <td>
                            <span className={`font-bold px-2 py-1 rounded text-sm ${item.type === 'Gelir' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
                              {item.type === 'Gelir' ? '+' : '-'} {formatMoney(item.amount)}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-gray-500 hover:text-red-500"><FaTrash /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Accounting;