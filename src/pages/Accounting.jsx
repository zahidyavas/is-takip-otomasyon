import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaTrash, FaWallet, FaArrowUp, FaArrowDown, 
  FaMoneyBillWave, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';

const Accounting = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_income: 0, total_expense: 0, net_balance: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Mobil Form Açma/Kapama State'i
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    type: 'Gider', // Varsayılan Gider
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: ''
  });

  // GÜVENLİK KONTROLÜ
  useEffect(() => {
    if (!user || user.role !== 'patron') {
      alert("Bu sayfaya erişim yetkiniz yok!");
      navigate('/'); 
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
      setIsFormOpen(false); // Mobilde ekleme yapınca formu kapat
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
      
      {/* pt-16: Mobil üst boşluk, p-4: Mobil padding */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
        
        <header className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaWallet className="text-yellow-500" /> Muhasebe
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-1">Sadece yöneticilere özel finansal genel bakış.</p>
        </header>

        {/* 1. İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Gelir Kartı */}
          <div className="bg-dark-card border border-dark-border p-4 md:p-6 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-3 md:p-4 bg-green-900/20 rounded-full text-green-500 text-xl md:text-2xl"><FaArrowUp /></div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Toplam Gelir</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">{formatMoney(stats.total_income)}</h3>
            </div>
          </div>

          {/* Gider Kartı */}
          <div className="bg-dark-card border border-dark-border p-4 md:p-6 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-3 md:p-4 bg-red-900/20 rounded-full text-red-500 text-xl md:text-2xl"><FaArrowDown /></div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Toplam Gider</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">{formatMoney(stats.total_expense)}</h3>
            </div>
          </div>

          {/* Net Kartı */}
          <div className="bg-dark-card border border-dark-border p-4 md:p-6 rounded-xl shadow-lg flex items-center gap-4">
            <div className="p-3 md:p-4 bg-blue-900/20 rounded-full text-blue-500 text-xl md:text-2xl"><FaMoneyBillWave /></div>
            <div>
              <p className="text-gray-400 text-xs md:text-sm">Net Kasa</p>
              <h3 className={`text-xl md:text-2xl font-bold ${stats.net_balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatMoney(stats.net_balance)}
              </h3>
            </div>
          </div>
        </div>

        {/* 2. ANA BÖLÜM: EKLEME & LİSTE */}
        {/* Mobilde tek kolon, çok geniş ekranlarda 3 kolon */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          
          {/* SOL: İŞLEM EKLEME FORMU */}
          <div className="xl:col-span-1">
            <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg h-fit transition-all duration-300">
              
              {/* Başlık (Accordion Toggle) */}
              <div 
                className="p-4 md:p-6 border-b border-dark-border flex justify-between items-center cursor-pointer md:cursor-default"
                onClick={() => setIsFormOpen(!isFormOpen)}
              >
                  <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                     <FaPlus className="text-brand-green"/> Yeni İşlem Ekle
                  </h3>
                  <div className="md:hidden text-gray-400">
                    {isFormOpen ? <FaChevronUp/> : <FaChevronDown/>}
                  </div>
              </div>

              {/* Form İçeriği */}
              <div className={`p-4 md:p-6 ${isFormOpen ? 'block' : 'hidden'} md:block`}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label text-gray-400 text-xs">İşlem Türü</label>
                        <select className="select select-bordered w-full bg-dark-main border-dark-border h-12" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                          <option value="Gider">Gider (Çıkan)</option>
                          <option value="Gelir">Gelir (Giren)</option>
                        </select>
                      </div>
                      <div>
                        <label className="label text-gray-400 text-xs">Tutar</label>
                        <input type="number" step="0.01" className="input input-bordered w-full bg-dark-main border-dark-border h-12" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                      </div>
                    </div>

                    <div>
                      <label className="label text-gray-400 text-xs">Tarih</label>
                      <input type="date" className="input input-bordered w-full bg-dark-main border-dark-border h-12" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                    </div>

                    <div>
                      <label className="label text-gray-400 text-xs">Kategori</label>
                      <input type="text" className="input input-bordered w-full bg-dark-main border-dark-border h-12" placeholder="Örn: Ofis Kirası / Müşteri Ödemesi" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
                    </div>

                    <div>
                      <label className="label text-gray-400 text-xs">Açıklama (Opsiyonel)</label>
                      <textarea className="textarea textarea-bordered w-full bg-dark-main border-dark-border h-20" placeholder="Detaylar..." value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                    </div>

                    <button className={`btn w-full border-none text-white h-12 ${form.type === 'Gelir' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                      <FaPlus /> {form.type} Ekle
                    </button>
                  </form>
              </div>
            </div>
          </div>

          {/* SAĞ: İŞLEM GEÇMİŞİ LİSTESİ */}
          <div className="xl:col-span-2">
            <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px] md:h-auto">
              <div className="p-4 md:p-6 border-b border-dark-border">
                <h3 className="font-bold text-lg">Son İşlemler</h3>
              </div>
              {/* Tablo Taşıyıcı: Mobilde yatay scroll */}
              <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                <table className="table w-full">
                  <thead className="bg-dark-main text-gray-400 sticky top-0 z-10 text-xs md:text-sm">
                    <tr>
                      <th>Tarih</th>
                      <th>Kategori / Açıklama</th>
                      <th className="text-right">Tutar</th>
                      <th className="text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      <tr><td colSpan="4" className="text-center p-4">Yükleniyor...</td></tr>
                    ) : transactions.length === 0 ? (
                      <tr><td colSpan="4" className="text-center p-4 text-gray-500">Kayıt yok.</td></tr>
                    ) : (
                      transactions.map((item) => (
                        <tr key={item.id} className="hover:bg-dark-main/50 border-dark-border">
                          {/* Tarih: Kırılmasın */}
                          <td className="font-mono text-xs md:text-sm text-gray-400 whitespace-nowrap">{item.date}</td>
                          
                          <td className="min-w-[150px]">
                            <div className="font-bold text-white whitespace-nowrap">{item.category}</div>
                            {/* Açıklama mobilde çok uzunsa truncate edilebilir veya sığdırılır */}
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</div>
                          </td>
                          
                          <td className="text-right whitespace-nowrap">
                            <span className={`font-bold px-2 py-1 rounded text-xs md:text-sm ${item.type === 'Gelir' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'}`}>
                              {item.type === 'Gelir' ? '+' : '-'} {formatMoney(item.amount)}
                            </span>
                          </td>
                          
                          <td className="text-center">
                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs text-gray-500 hover:text-red-500">
                                <FaTrash size={14}/>
                            </button>
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