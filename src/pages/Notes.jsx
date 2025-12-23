import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaStickyNote, FaExclamationCircle, FaCheckCircle, FaTimes } from 'react-icons/fa';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  // Form State
  const [form, setForm] = useState({
    title: '',
    body: '',
    priority: 'Normal'
  });

  // Düzenleme Modu State
  const [editingNote, setEditingNote] = useState(null);

  // Notları Çek
  const fetchNotes = async () => {
    try {
      const res = await axios.get('https://genckalmedya.cloud/v1.1/notes.php');
      if (res.data.status === 'success') {
        setNotes(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  // Not Ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) { alert("Başlık ve içerik gerekli!"); return; }

    try {
      await axios.post('https://genckalmedya.cloud/v1.1/notes.php', { ...form, owner_user_id: user.id });
      setForm({ title: '', body: '', priority: 'Normal' }); // Formu temizle
      fetchNotes();
      // Mobilde alert yerine sessizce eklese daha modern olur ama şimdilik bırakıyoruz
      alert("Not eklendi!");
    } catch (error) {
      alert("Hata oluştu");
    }
  };

  // Not Sil
  const handleDelete = async (id) => {
    if (!confirm("Notu silmek istediğine emin misin?")) return;
    await axios.post('https://genckalmedya.cloud/v1.1/notes.php', { action: 'delete', id });
    fetchNotes();
  };

  // Düzenleme İşlemi (Modalı Aç)
  const openEditModal = (note) => {
    setEditingNote(note);
  };

  // Düzenlemeyi Kaydet
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://genckalmedya.cloud/v1.1/notes.php', { 
        action: 'edit', 
        id: editingNote.id,
        title: editingNote.title,
        body: editingNote.body,
        priority: editingNote.priority
      });
      setEditingNote(null);
      fetchNotes();
      alert("Not güncellendi!");
    } catch (error) {
      alert("Güncelleme hatası");
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-main text-white font-sans">
      <Sidebar />
      
      {/* Mobilde üstten boşluk (pt-16) hamburger menü için. 
          Mobilde padding (p-4), masaüstünde (p-8).
      */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto h-screen">
        
        <header className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FaStickyNote className="text-brand-green" /> Notlar
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-1">Hızlı notlar al, önceliklerini belirle.</p>
        </header>

        {/* --- 1. KART: NOT EKLEME (ÜSTTE) --- */}
        <div className="bg-dark-card border border-dark-border p-4 md:p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-lg md:text-xl font-bold mb-4 border-b border-dark-border pb-2">Yeni Not Oluştur</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Başlık */}
              <div className="flex-1">
                <label className="label text-gray-400 text-xs md:text-sm">Not Başlığı</label>
                <input 
                  type="text" 
                  className="input input-bordered input-sm md:input-md w-full bg-dark-main border-dark-border focus:border-brand-green" 
                  placeholder="Örn: Müşteri Toplantı Notları"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                />
              </div>

              {/* Öncelik (Radio Butonlar) */}
              <div className="w-full md:w-auto md:min-w-[200px]">
                <label className="label text-gray-400 text-xs md:text-sm">Öncelik Durumu</label>
                <div className="flex gap-4 p-2 md:p-3 bg-dark-main rounded-lg border border-dark-border h-10 md:h-[48px] items-center justify-center md:justify-start">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      className="radio radio-success radio-xs md:radio-sm" 
                      checked={form.priority === 'Normal'} 
                      onChange={() => setForm({...form, priority: 'Normal'})}
                    />
                    <span className="text-sm">Normal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priority" 
                      className="radio radio-error radio-xs md:radio-sm" 
                      checked={form.priority === 'Acil'} 
                      onChange={() => setForm({...form, priority: 'Acil'})}
                    />
                    <span className="text-sm text-red-400 font-bold">Acil</span>
                  </label>
                </div>
              </div>
            </div>

            {/* İçerik */}
            <div>
              <label className="label text-gray-400 text-xs md:text-sm">Not İçeriği</label>
              <textarea 
                className="textarea textarea-bordered w-full bg-dark-main border-dark-border h-24 md:h-24 text-sm" 
                placeholder="Detayları buraya yaz..."
                value={form.body}
                onChange={e => setForm({...form, body: e.target.value})}
              ></textarea>
            </div>

            <button className="btn bg-brand-green hover:bg-green-600 text-white border-none w-full md:w-auto px-8 h-10 min-h-[40px]">
              <FaPlus /> Notu Kaydet
            </button>
          </form>
        </div>

        {/* --- 2. KART: NOT LİSTESİ (ALTTA) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-0">
          {loading ? (
             <p className="text-gray-500">Notlar yükleniyor...</p>
          ) : notes.length === 0 ? (
             <p className="text-gray-500 col-span-3 text-center py-10">Henüz hiç not eklenmemiş.</p>
          ) : (
            notes.map((note) => (
              <div 
                key={note.id} 
                className={`bg-dark-card p-4 md:p-5 rounded-xl shadow-md border relative group hover:-translate-y-1 transition-transform duration-200 flex flex-col
                  ${note.priority === 'Acil' ? 'border-red-500/50 shadow-red-900/10' : 'border-dark-border'}
                `}
              >
                {/* Öncelik Rozeti */}
                <div className="absolute top-4 right-4">
                  {note.priority === 'Acil' ? (
                    <span className="badge badge-error gap-1 text-white text-[10px] md:text-xs font-bold"><FaExclamationCircle /> ACİL</span>
                  ) : (
                    <span className="badge badge-ghost gap-1 text-gray-400 text-[10px] md:text-xs"><FaCheckCircle /> Normal</span>
                  )}
                </div>

                <h4 className="font-bold text-base md:text-lg text-white mb-2 pr-16 truncate">{note.title}</h4>
                <p className="text-gray-400 text-sm mb-4 whitespace-pre-wrap h-24 overflow-y-auto custom-scrollbar">
                  {note.body}
                </p>

                <div className="flex justify-between items-center border-t border-dark-border pt-3 mt-auto">
                  <span className="text-xs text-gray-600">{new Date(note.created_at).toLocaleDateString()}</span>
                  
                  {/* Butonlar: Mobilde Her Zaman Görünür (Opacity 100), Masaüstünde Hover İle Gelir */}
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(note)} className="btn btn-sm btn-square btn-ghost text-blue-400 hover:bg-blue-900/20 active:bg-blue-900/40">
                        <FaEdit size={16} />
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="btn btn-sm btn-square btn-ghost text-red-500 hover:bg-red-900/20 active:bg-red-900/40">
                        <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- DÜZENLEME MODALI --- */}
        {editingNote && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card border border-dark-border p-4 md:p-6 rounded-xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setEditingNote(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-dark-main p-2 rounded-full">
                  <FaTimes size={18}/>
              </button>
              
              <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                  <FaEdit className="text-brand-green"/> Notu Düzenle
              </h3>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                    <label className="label text-gray-400 text-xs">Başlık</label>
                    <input 
                    className="input input-bordered w-full bg-dark-main border-dark-border" 
                    value={editingNote.title} 
                    onChange={e => setEditingNote({...editingNote, title: e.target.value})} 
                    />
                </div>
                
                <div className="flex gap-4 p-2 bg-dark-main rounded border border-dark-border justify-center md:justify-start">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" className="radio radio-success radio-xs" checked={editingNote.priority === 'Normal'} onChange={() => setEditingNote({...editingNote, priority: 'Normal'})} />
                      <span className="text-sm">Normal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" className="radio radio-error radio-xs" checked={editingNote.priority === 'Acil'} onChange={() => setEditingNote({...editingNote, priority: 'Acil'})} />
                      <span className="text-sm text-red-400">Acil</span>
                  </label>
                </div>

                <div>
                    <label className="label text-gray-400 text-xs">İçerik</label>
                    <textarea 
                    className="textarea textarea-bordered w-full bg-dark-main border-dark-border h-32 md:h-32 text-sm" 
                    value={editingNote.body}
                    onChange={e => setEditingNote({...editingNote, body: e.target.value})} 
                    ></textarea>
                </div>

                <div className="flex gap-2 mt-4">
                   <button type="button" onClick={() => setEditingNote(null)} className="btn btn-ghost flex-1 h-12 border border-dark-border">İptal</button>
                   <button className="btn btn-primary flex-1 bg-brand-green border-none text-white h-12">Güncelle</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Notes;