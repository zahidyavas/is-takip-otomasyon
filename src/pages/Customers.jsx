import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaUserTie, FaMoneyBillWave, FaCalendarCheck, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaTimes } from 'react-icons/fa';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [contents, setContents] = useState([]);
  
  // Düzenleme Modu State'leri
  const [editingCustomerId, setEditingCustomerId] = useState(null); // Müşteri Düzenleme ID
  const [editingContentId, setEditingContentId] = useState(null);   // İçerik Düzenleme ID (YENİ)

  // Form Verileri
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', contract_start: '', contract_end: '', fee: ''
  });

  const [contentForm, setContentForm] = useState({
    customer_id: '', title: '', platform: 'Instagram'
  });

  // Veri Çekme
  const fetchData = async () => {
    try {
      const [resCust, resCont] = await Promise.all([
        axios.get('https://genckalmedya.cloud/v1.1/customers.php?type=customers'),
        axios.get('https://genckalmedya.cloud/v1.1/customers.php?type=content')
      ]);
      if (resCust.data.status === 'success') setCustomers(resCust.data.data);
      if (resCont.data.status === 'success') setContents(resCont.data.data);
    } catch (error) {
      console.error("Veri hatası:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLERS (MÜŞTERİ) ---
  const handleCustomerChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomerId) {
        // GÜNCELLEME
        await axios.post('https://genckalmedya.cloud/v1.1/customers.php', {
          ...formData, action: 'update', type: 'customer', id: editingCustomerId
        });
        alert("Müşteri Güncellendi!");
        setEditingCustomerId(null);
      } else {
        // EKLEME
        await axios.post('https://genckalmedya.cloud/v1.1/customers.php', formData);
        alert("Müşteri Eklendi!");
      }
      setFormData({ name: '', email: '', phone: '', contract_start: '', contract_end: '', fee: '' });
      fetchData();
    } catch(err) { alert("Hata oluştu."); }
  };

  const startEditCustomer = (customer) => {
    setEditingCustomerId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      contract_start: customer.contract_start || '',
      contract_end: customer.contract_end || '',
      fee: customer.fee || ''
    });
  };

  // --- HANDLERS (İÇERİK) ---
  const handleContentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContentId) {
        // İÇERİK GÜNCELLEME (YENİ)
        await axios.post('https://genckalmedya.cloud/v1.1/customers.php', {
          ...contentForm,
          action: 'update',
          type: 'content',
          id: editingContentId
        });
        alert("İçerik Güncellendi!");
        setEditingContentId(null);
      } else {
        // İÇERİK EKLEME
        await axios.post('https://genckalmedya.cloud/v1.1/customers.php', contentForm);
        alert("Planlandı!");
      }
      setContentForm({ customer_id: '', title: '', platform: 'Instagram' });
      fetchData();
    } catch(err) { alert("Hata"); }
  };

  const startEditContent = (content) => {
    setEditingContentId(content.id);
    setContentForm({
      customer_id: content.customer_id,
      title: content.title,
      platform: content.platform
    });
  };

  const cancelEditContent = () => {
    setEditingContentId(null);
    setContentForm({ customer_id: '', title: '', platform: 'Instagram' });
  }

  // SİLME
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

        {/* ANA IZGARA */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* --- 1. Müşteri Ekleme/Düzenleme --- */}
          <div className={`bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg h-fit transition-all duration-300 ${editingCustomerId ? 'border-yellow-500 shadow-yellow-900/20' : ''}`}>
            <h3 className="text-xl font-bold mb-4 border-b border-dark-border pb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                {editingCustomerId ? <FaEdit className="text-yellow-500"/> : <span className="text-brand-green">+</span>}
                {editingCustomerId ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
              </span>
              {editingCustomerId && (
                <button onClick={() => {setEditingCustomerId(null); setFormData({name:'', email:'', phone:'', contract_start:'', contract_end:'', fee:''})}} className="btn btn-xs btn-ghost text-gray-400 hover:text-white">
                  <FaTimes /> Vazgeç
                </button>
              )}
            </h3>
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="label text-gray-400 text-sm">Müşteri Adı</label>
                <input type="text" name="name" value={formData.name} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border focus:border-brand-green" placeholder="Örn: Mehmet Yılmaz" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="E-posta" type="email" name="email" value={formData.email} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
                <input placeholder="Telefon" type="text" name="phone" value={formData.phone} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="text-xs text-gray-500 mb-1 block">Başlangıç</label>
                   <input type="date" name="contract_start" value={formData.contract_start} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
                </div>
                <div>
                   <label className="text-xs text-gray-500 mb-1 block">Bitiş</label>
                   <input type="date" name="contract_end" value={formData.contract_end} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
                </div>
              </div>
              <div>
                 <div className="relative">
                   <FaMoneyBillWave className="absolute left-3 top-3.5 text-gray-500" />
                   <input type="number" name="fee" value={formData.fee} onChange={handleCustomerChange} className="input input-bordered w-full pl-10 bg-dark-main border-dark-border" placeholder="Sözleşme Ücreti (₺)" />
                 </div>
              </div>
              
              <button className={`btn w-full border-none text-white ${editingCustomerId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-brand-green hover:bg-green-600'}`}>
                {editingCustomerId ? 'Güncellemeyi Kaydet' : 'Müşteriyi Kaydet'}
              </button>
            </form>
          </div>

          {/* --- 2. İçerik Ekleme/Düzenleme --- */}
          <div className={`bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg h-fit transition-all duration-300 ${editingContentId ? 'border-blue-500 shadow-blue-900/20' : ''}`}>
            <h3 className="text-xl font-bold mb-4 border-b border-dark-border pb-2 flex items-center justify-between gap-2">
               <span className="flex items-center gap-2">
                  {editingContentId ? <FaEdit className="text-blue-500"/> : <FaCalendarCheck className="text-brand-green"/>} 
                  {editingContentId ? 'İçerik Düzenle' : 'İçerik Planı Ekle'}
               </span>
               {editingContentId && (
                <button onClick={cancelEditContent} className="btn btn-xs btn-ghost text-gray-400 hover:text-white">
                  <FaTimes /> Vazgeç
                </button>
              )}
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
              
              <div>
                <label className="label text-gray-400 text-sm">Platform</label>
                <select className="select select-bordered w-full bg-dark-main border-dark-border" value={contentForm.platform} onChange={(e) => setContentForm({...contentForm, platform: e.target.value})}>
                    <option>Instagram</option><option>TikTok</option><option>Facebook</option><option>YouTube</option><option>X</option><option>LinkedIn</option>
                </select>
              </div>

              <button className={`btn w-full border-none text-white ${editingContentId ? 'bg-blue-600 hover:bg-blue-700' : 'btn-secondary'}`}>
                  {editingContentId ? 'İçeriği Güncelle' : 'Planla'}
              </button>
            </form>
          </div>

          {/* --- 3. Müşteri Listesi --- */}
          <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card sticky top-0 z-10">
              <h3 className="font-bold text-lg">Müşteri Listesi</h3>
              <span className="badge badge-accent badge-outline">{customers.length} Kayıt</span>
            </div>
            <div className="overflow-auto flex-1">
              <table className="table w-full">
                <thead className="bg-dark-main text-gray-400 sticky top-0">
                  <tr>
                    <th>Müşteri</th>
                    <th>Tarih / Ücret</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className={`hover:bg-dark-main/50 border-dark-border ${editingCustomerId === c.id ? 'bg-yellow-900/10 border-l-4 border-l-yellow-500' : ''}`}>
                      <td>
                        <div className="font-bold text-white">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.phone}</div>
                      </td>
                      <td>
                        <div className="text-xs text-gray-400">{c.contract_end ? c.contract_end : '-'}</div> 
                        <div className="text-brand-green font-bold text-sm">{c.fee} ₺</div>
                      </td>
                      <td className="flex gap-1">
                        <button onClick={() => startEditCustomer(c)} className="btn btn-ghost btn-xs text-blue-400 hover:bg-blue-900/20"><FaEdit /></button>
                        <button onClick={() => handleDelete(c.id, 'customers')} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-900/20"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- 4. İçerik Listesi --- */}
          <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
             <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card sticky top-0 z-10">
                <h3 className="font-bold text-lg">Planlanan İçerikler</h3>
                <span className="badge badge-secondary badge-outline">{contents.length} Görev</span>
             </div>
             <div className="overflow-auto flex-1">
                <table className="table w-full">
                   <thead className="bg-dark-main text-gray-400 sticky top-0">
                      <tr>
                        <th>Platform / Müşteri</th>
                        <th>Başlık</th>
                        <th>İşlem</th>
                      </tr>
                   </thead>
                   <tbody>
                      {contents.length === 0 ? (
                         <tr><td colSpan="4" className="text-center p-4 text-gray-500">Plan yok.</td></tr>
                      ) : (
                         contents.map((c) => (
                            <tr key={c.id} className={`hover:bg-dark-main/50 border-dark-border ${editingContentId === c.id ? 'bg-blue-900/10 border-l-4 border-l-blue-500' : ''}`}>
                               <td>
                                  <div className="flex items-center gap-2 mb-1">
                                     {getIcon(c.platform)} <span className="text-xs opacity-70">{c.customer_name}</span>
                                  </div>
                               </td>
                               <td className="text-sm">{c.title}</td>
                               <td className="flex gap-1">
                                  {/* YENİ: DÜZENLE BUTONU */}
                                  <button onClick={() => startEditContent(c)} className="btn btn-ghost btn-xs text-blue-400 hover:bg-blue-900/20">
                                    <FaEdit />
                                  </button>
                                  <button onClick={() => handleDelete(c.id, 'content')} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-900/20">
                                    <FaTrash />
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
      </main>
    </div>
  );
};

export default Customers;