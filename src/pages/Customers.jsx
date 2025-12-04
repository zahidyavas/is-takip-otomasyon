import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { FaPlus, FaTrash, FaUserTie, FaPhone, FaCalendarAlt, FaMoneyBillWave, FaCalendarCheck, FaInstagram, FaYoutube, FaTiktok, FaFacebook } from 'react-icons/fa';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form Verileri
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', contract_start: '', contract_end: '', fee: ''
  });

  const [contentForm, setContentForm] = useState({
    customer_id: '', title: '', platform: 'Instagram', scheduled_date: ''
  });

  // Veri Çekme
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCust, resCont] = await Promise.all([
        axios.get('https://genckalmedya.cloud/v1.1/customers.php?type=customers'),
        axios.get('https://genckalmedya.cloud/v1.1/customers.php?type=content')
      ]);
      if (resCust.data.status === 'success') setCustomers(resCust.data.data);
      if (resCont.data.status === 'success') setContents(resCont.data.data);
    } catch (error) {
      console.error("Veri hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://genckalmedya.cloud/v1.1/customers.php', formData);
      if (res.data.status === 'success') {
        alert("Müşteri Eklendi!");
        setFormData({ name: '', email: '', phone: '', contract_start: '', contract_end: '', fee: '' });
        fetchData();
      }
    } catch(err) { alert("Hata"); }
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://genckalmedya.cloud/v1.1/customers.php', contentForm);
      if (res.data.status === 'success') {
        alert("Planlandı!");
        setContentForm({ ...contentForm, title: '' });
        fetchData();
      }
    } catch(err) { alert("Hata"); }
  };

  const handleDelete = async (id, type) => {
    if(!confirm("Silmek istediğine emin misin?")) return;
    await axios.post('https://genckalmedya.cloud/v1.1/customers.php', { action: 'delete', id, type });
    fetchData();
  };

  const getIcon = (platform) => {
    if(platform === 'Instagram') return <FaInstagram className="text-pink-500" />;
    if(platform === 'TikTok') return <FaTiktok className="text-white" />;
    if(platform === 'Facebook') return <FaFacebook className="text-blue-600" />;
    return <FaYoutube className="text-red-600" />;
  };

  return (
    <div className="flex min-h-screen bg-dark-main text-white font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaUserTie className="text-brand-green" /> Müşteri & İçerik Yönetimi
          </h2>
          <p className="text-gray-400 mt-1">Müşterilerini ekle ve içerik takvimini yönet.</p>
        </header>

        {/* ANA IZGARA: 2 Sütunlu Yapı */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* --- 1. SOL ÜST: Müşteri Ekleme Formu --- */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg h-fit">
            <h3 className="text-xl font-bold mb-4 border-b border-dark-border pb-2 flex items-center gap-2">
              <span className="text-brand-green">+</span> Yeni Müşteri Ekle
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label text-gray-400 text-sm">Müşteri Adı</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input input-bordered w-full bg-dark-main border-dark-border focus:border-brand-green" placeholder="Örn: Mehmet Yılmaz" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="E-posta" type="email" name="email" value={formData.email} onChange={handleChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
                <input placeholder="Telefon" type="text" name="phone" value={formData.phone} onChange={handleChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="text-xs text-gray-500 mb-1 block">Başlangıç</label>
                   <input type="date" name="contract_start" value={formData.contract_start} onChange={handleChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
                </div>
                <div>
                   <label className="text-xs text-gray-500 mb-1 block">Bitiş</label>
                   <input type="date" name="contract_end" value={formData.contract_end} onChange={handleChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
                </div>
              </div>
              <div>
                 <div className="relative">
                   <FaMoneyBillWave className="absolute left-3 top-3.5 text-gray-500" />
                   <input type="number" name="fee" value={formData.fee} onChange={handleChange} className="input input-bordered w-full pl-10 bg-dark-main border-dark-border" placeholder="Sözleşme Ücreti (₺)" />
                 </div>
              </div>
              <button className="btn bg-brand-green hover:bg-green-600 text-white w-full border-none">Müşteriyi Kaydet</button>
            </form>
          </div>

          {/* --- 2. SAĞ ÜST: İçerik Planı Formu --- */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg h-fit">
            <h3 className="text-xl font-bold mb-4 border-b border-dark-border pb-2 flex items-center gap-2">
               <FaCalendarCheck className="text-brand-green"/> İçerik Planı Ekle
            </h3>
            <form onSubmit={handleContentSubmit} className="space-y-4">
              <div>
                 <label className="label text-gray-400 text-sm">Müşteri Seç</label>
                 <select className="select select-bordered w-full bg-dark-main border-dark-border" value={contentForm.customer_id} onChange={(e) => setContentForm({...contentForm, customer_id: e.target.value})} required>
                    <option value="">-- Listeden Seç --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="label text-gray-400 text-sm">İçerik Başlığı</label>
                 <input type="text" className="input input-bordered w-full bg-dark-main border-dark-border" placeholder="Örn: Instagram Reels" value={contentForm.title} onChange={(e) => setContentForm({...contentForm, title: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="label text-gray-400 text-sm">Platform</label>
                    <select className="select select-bordered w-full bg-dark-main border-dark-border" value={contentForm.platform} onChange={(e) => setContentForm({...contentForm, platform: e.target.value})}>
                       <option>Instagram</option><option>TikTok</option><option>Facebook</option><option>YouTube</option>
                    </select>
                 </div>
                 <div>
                    <label className="label text-gray-400 text-sm">Planlanan Tarih</label>
                    <input type="date" className="input input-bordered w-full bg-dark-main border-dark-border" value={contentForm.scheduled_date} onChange={(e) => setContentForm({...contentForm, scheduled_date: e.target.value})} required />
                 </div>
              </div>
              <button className="btn btn-secondary w-full border-none mt-4">Planla</button>
            </form>
          </div>

          {/* --- 3. SOL ALT: Müşteri Listesi --- */}
          <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card sticky top-0 z-10">
              <h3 className="font-bold text-lg">Müşteri Listesi</h3>
              <span className="badge badge-accent badge-outline">{customers.length} Kayıt</span>
            </div>
            <div className="overflow-auto flex-1">
              <table className="table w-full">
                <thead className="bg-dark-main text-gray-400 sticky top-0">
                  <tr><th>Müşteri</th><th>Tarih / Ücret</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-dark-main/50 border-dark-border">
                      <td>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.phone}</div>
                      </td>
                      <td>
                        <div className="text-xs text-gray-400">{c.contract_end ? c.contract_end : '-'}</div>
                        <div className="text-brand-green font-bold text-sm">{c.fee} ₺</div>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(c.id, 'customers')} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-900/20"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- 4. SAĞ ALT: İçerik Listesi --- */}
          <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
             <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card sticky top-0 z-10">
                <h3 className="font-bold text-lg">Planlanan İçerikler</h3>
                <span className="badge badge-secondary badge-outline">{contents.length} Görev</span>
             </div>
             <div className="overflow-auto flex-1">
                <table className="table w-full">
                   <thead className="bg-dark-main text-gray-400 sticky top-0">
                      <tr><th>Tarih</th><th>Platform / Müşteri</th><th>Başlık</th><th>İşlem</th></tr>
                   </thead>
                   <tbody>
                      {contents.length === 0 ? (
                         <tr><td colSpan="4" className="text-center p-4 text-gray-500">Plan yok.</td></tr>
                      ) : (
                         contents.map((c) => (
                            <tr key={c.id} className="hover:bg-dark-main/50 border-dark-border">
                               <td className="font-mono text-sm text-gray-300">{c.scheduled_date}</td>
                               <td>
                                  <div className="flex items-center gap-2 mb-1">
                                     {getIcon(c.platform)} <span className="text-xs opacity-70">{c.customer_name}</span>
                                  </div>
                               </td>
                               <td className="text-sm">{c.title}</td>
                               <td>
                                  <button onClick={() => handleDelete(c.id, 'content')} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-900/20"><FaTrash /></button>
                               </td>
                            </tr>
                         ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Customers;