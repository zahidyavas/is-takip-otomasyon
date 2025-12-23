import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { 
  FaPlus, FaTrash, FaEdit, FaUserTie, FaMoneyBillWave, FaCalendarCheck, 
  FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaTimes, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [contents, setContents] = useState([]);
  
  // Mobil Form Görünürlük State'leri
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isContentFormOpen, setIsContentFormOpen] = useState(false);

  // Düzenleme Modu State'leri
  const [editingCustomerId, setEditingCustomerId] = useState(null); 
  const [editingContentId, setEditingContentId] = useState(null);   

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
      setIsCustomerFormOpen(false); // Mobilde formu kapat
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
    // Düzenleme moduna geçince formu mobilde de aç
    setIsCustomerFormOpen(true);
    // Sayfanın en üstüne (forma) kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- HANDLERS (İÇERİK) ---
  const handleContentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContentId) {
        // İÇERİK GÜNCELLEME
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
      setIsContentFormOpen(false); // Mobilde formu kapat
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
    setIsContentFormOpen(true);
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

      {/* Main Container: pt-16 (mobil header), p-4 (mobil padding), md:p-8 (masaüstü padding) */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto">
        
        <header className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaUserTie className="text-brand-green" /> Müşteri & İçerik
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-1">Müşterilerini ekle ve içerik takvimini yönet.</p>
        </header>

        {/* ANA IZGARA: Mobilde tek sütun, Laptopta (lg) iki sütun */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* --- 1. MÜŞTERİ EKLEME/DÜZENLEME --- */}
          <div className={`bg-dark-card border border-dark-border rounded-xl shadow-lg h-fit transition-all duration-300 ${editingCustomerId ? 'border-yellow-500 shadow-yellow-900/20' : ''}`}>
            
            {/* Başlık (Toggle) */}
            <div 
              className="p-4 md:p-6 border-b border-dark-border flex justify-between items-center cursor-pointer md:cursor-default"
              onClick={() => setIsCustomerFormOpen(!isCustomerFormOpen)}
            >
                <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
                   {editingCustomerId ? <FaEdit className="text-yellow-500"/> : <span className="text-brand-green font-bold text-xl">+</span>}
                   {editingCustomerId ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
                </div>
                
                {/* Mobilde Ok, Düzenleme Modundaysa Vazgeç Butonu */}
                <div className="flex items-center gap-2">
                    {editingCustomerId && (
                        <button onClick={(e) => { e.stopPropagation(); setEditingCustomerId(null); setFormData({name:'', email:'', phone:'', contract_start:'', contract_end:'', fee:''})}} className="btn btn-xs btn-ghost text-gray-400 hover:text-white z-10">
                           <FaTimes /> Vazgeç
                        </button>
                    )}
                    <div className="md:hidden text-gray-400">
                        {isCustomerFormOpen ? <FaChevronUp/> : <FaChevronDown/>}
                    </div>
                </div>
            </div>

            {/* Form Gövdesi */}
            <div className={`p-4 md:p-6 ${isCustomerFormOpen ? 'block' : 'hidden'} md:block`}>
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                <div>
                    <label className="label text-gray-400 text-xs">Müşteri Adı</label>
                    <input type="text" name="name" value={formData.name} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border focus:border-brand-green h-12 md:h-12" placeholder="Örn: Mehmet Yılmaz" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="E-posta" type="email" name="email" value={formData.email} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border h-12" />
                    <input placeholder="Telefon" type="text" name="phone" value={formData.phone} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border h-12" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Başlangıç</label>
                        <input type="date" name="contract_start" value={formData.contract_start} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border h-12 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Bitiş</label>
                        <input type="date" name="contract_end" value={formData.contract_end} onChange={handleCustomerChange} className="input input-bordered w-full bg-dark-main border-dark-border h-12 text-sm" />
                    </div>
                </div>
                <div>
                    <div className="relative">
                        <FaMoneyBillWave className="absolute left-3 top-4 text-gray-500" />
                        <input type="number" name="fee" value={formData.fee} onChange={handleCustomerChange} className="input input-bordered w-full pl-10 bg-dark-main border-dark-border h-12" placeholder="Sözleşme Ücreti (₺)" />
                    </div>
                </div>
                
                <button className={`btn w-full border-none text-white h-12 ${editingCustomerId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-brand-green hover:bg-green-600'}`}>
                    {editingCustomerId ? 'Güncellemeyi Kaydet' : 'Müşteriyi Kaydet'}
                </button>
                </form>
            </div>
          </div>

          {/* --- 2. İÇERİK EKLEME/DÜZENLEME --- */}
          <div className={`bg-dark-card border border-dark-border rounded-xl shadow-lg h-fit transition-all duration-300 ${editingContentId ? 'border-blue-500 shadow-blue-900/20' : ''}`}>
            
            <div 
              className="p-4 md:p-6 border-b border-dark-border flex justify-between items-center cursor-pointer md:cursor-default"
              onClick={() => setIsContentFormOpen(!isContentFormOpen)}
            >
               <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
                  {editingContentId ? <FaEdit className="text-blue-500"/> : <FaCalendarCheck className="text-brand-green"/>} 
                  {editingContentId ? 'İçerik Düzenle' : 'İçerik Planı Ekle'}
               </div>
               
               <div className="flex items-center gap-2">
                   {editingContentId && (
                    <button onClick={(e) => { e.stopPropagation(); cancelEditContent() }} className="btn btn-xs btn-ghost text-gray-400 hover:text-white z-10">
                      <FaTimes /> Vazgeç
                    </button>
                  )}
                   <div className="md:hidden text-gray-400">
                        {isContentFormOpen ? <FaChevronUp/> : <FaChevronDown/>}
                    </div>
               </div>
            </div>

            <div className={`p-4 md:p-6 ${isContentFormOpen ? 'block' : 'hidden'} md:block`}>
                <form onSubmit={handleContentSubmit} className="space-y-4">
                <div>
                    <label className="label text-gray-400 text-xs">Müşteri Seç</label>
                    <select className="select select-bordered w-full bg-dark-main border-dark-border h-12" value={contentForm.customer_id} onChange={(e) => setContentForm({...contentForm, customer_id: e.target.value})} required>
                        <option value="">-- Listeden Seç --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label text-gray-400 text-xs">İçerik Başlığı</label>
                    <input type="text" className="input input-bordered w-full bg-dark-main border-dark-border h-12" placeholder="Örn: Instagram Reels" value={contentForm.title} onChange={(e) => setContentForm({...contentForm, title: e.target.value})} required />
                </div>
                
                <div>
                    <label className="label text-gray-400 text-xs">Platform</label>
                    <select className="select select-bordered w-full bg-dark-main border-dark-border h-12" value={contentForm.platform} onChange={(e) => setContentForm({...contentForm, platform: e.target.value})}>
                        <option>Instagram</option><option>TikTok</option><option>Facebook</option><option>YouTube</option><option>X</option><option>LinkedIn</option>
                    </select>
                </div>

                <button className={`btn w-full border-none text-white h-12 ${editingContentId ? 'bg-blue-600 hover:bg-blue-700' : 'btn-secondary'}`}>
                    {editingContentId ? 'İçeriği Güncelle' : 'Planla'}
                </button>
                </form>
            </div>
          </div>

          {/* --- 3. MÜŞTERİ LİSTESİ --- */}
          {/* Mobilde max-height'i sınırlayalım */}
          <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden flex flex-col h-[400px] md:h-[500px]">
            <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card sticky top-0 z-10">
              <h3 className="font-bold text-base md:text-lg">Müşteri Listesi</h3>
              <span className="badge badge-accent badge-outline text-xs md:text-sm">{customers.length} Kayıt</span>
            </div>
            {/* overflow-x-auto ekledik ki mobilde tablo taşarsa kaydırılabilsin */}
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="table w-full">
                <thead className="bg-dark-main text-gray-400 sticky top-0 z-10 text-xs md:text-sm">
                  <tr>
                    <th>Müşteri</th>
                    <th>Tarih / Ücret</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {customers.map((c) => (
                    <tr key={c.id} className={`hover:bg-dark-main/50 border-dark-border ${editingCustomerId === c.id ? 'bg-yellow-900/10 border-l-4 border-l-yellow-500' : ''}`}>
                      <td>
                        <div className="font-bold text-white whitespace-nowrap">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.phone}</div>
                      </td>
                      <td>
                        <div className="text-xs text-gray-400 whitespace-nowrap">{c.contract_end ? c.contract_end : '-'}</div> 
                        <div className="text-brand-green font-bold text-sm whitespace-nowrap">{c.fee} ₺</div>
                      </td>
                      <td className="flex gap-1">
                        <button onClick={() => startEditCustomer(c)} className="btn btn-ghost btn-xs text-blue-400 hover:bg-blue-900/20"><FaEdit size={14} /></button>
                        <button onClick={() => handleDelete(c.id, 'customers')} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-900/20"><FaTrash size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- 4. İÇERİK LİSTESİ --- */}
          <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg overflow-hidden flex flex-col h-[400px] md:h-[500px]">
             <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-card sticky top-0 z-10">
                <h3 className="font-bold text-base md:text-lg">Planlanan İçerikler</h3>
                <span className="badge badge-secondary badge-outline text-xs md:text-sm">{contents.length} Görev</span>
             </div>
             <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="table w-full">
                   <thead className="bg-dark-main text-gray-400 sticky top-0 z-10 text-xs md:text-sm">
                      <tr>
                        <th>Platform / Müşteri</th>
                        <th>Başlık</th>
                        <th>İşlem</th>
                      </tr>
                   </thead>
                   <tbody className="text-sm">
                      {contents.length === 0 ? (
                         <tr><td colSpan="4" className="text-center p-4 text-gray-500">Plan yok.</td></tr>
                      ) : (
                         contents.map((c) => (
                            <tr key={c.id} className={`hover:bg-dark-main/50 border-dark-border ${editingContentId === c.id ? 'bg-blue-900/10 border-l-4 border-l-blue-500' : ''}`}>
                               <td>
                                  <div className="flex items-center gap-2 mb-1 whitespace-nowrap">
                                     {getIcon(c.platform)} <span className="text-xs opacity-70 truncate max-w-[100px]">{c.customer_name}</span>
                                  </div>
                               </td>
                               <td className="text-xs md:text-sm min-w-[120px]">{c.title}</td>
                               <td className="flex gap-1">
                                  <button onClick={() => startEditContent(c)} className="btn btn-ghost btn-xs text-blue-400 hover:bg-blue-900/20">
                                    <FaEdit size={14} />
                                  </button>
                                  <button onClick={() => handleDelete(c.id, 'content')} className="btn btn-ghost btn-xs text-red-500 hover:bg-red-900/20">
                                    <FaTrash size={14} />
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