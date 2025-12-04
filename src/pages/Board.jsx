import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus, FaTrash, FaWhatsapp, FaArrowRight, FaCalendarAlt, FaUser, FaBriefcase, FaEdit, FaTimes } from 'react-icons/fa';

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);

  // Yeni Görev Form State
  const [form, setForm] = useState({
    customer_id: '',
    project_name: '',
    title: '',
    assignee_user_id: '',
    deadline: ''
  });

  // --- YENİ: Düzenleme Modu State'i ---
  const [editingTask, setEditingTask] = useState(null); // Düzenlenen görevi tutar
  
  // Verileri Çek
  const fetchData = async () => {
    try {
      const res = await axios.get('https://genckalmedya.cloud/v1.1/board.php');
      if (res.data.status === 'success') {
        setTasks(res.data.tasks);
        setCustomers(res.data.customers);
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Ekleme İşlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.project_name || !form.title) { 
        alert("Zorunlu alanları doldurun!"); return; 
    }
    try {
      await axios.post('https://genckalmedya.cloud/v1.1/board.php', form);
      setForm({ ...form, project_name: '', title: '', deadline: '' });
      fetchData();
    } catch (error) { alert("Hata"); }
  };

  // Silme
  const handleDelete = async (id) => {
    if (!confirm("Silmek istediğine emin misin?")) return;
    await axios.post('https://genckalmedya.cloud/v1.1/board.php', { action: 'delete', id });
    fetchData();
  };

  // Taşıma
  const handleMove = async (id, currentStatus) => {
    let newStatus = currentStatus === 'Planlanan' ? 'Devam Eden' : currentStatus === 'Devam Eden' ? 'Tamamlandı' : '';
    if(!newStatus) return;
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    await axios.post('https://genckalmedya.cloud/v1.1/board.php', { action: 'update_status', id, status: newStatus });
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId;
      const updatedTasks = tasks.map(t => t.id == draggableId ? { ...t, status: newStatus } : t);
      setTasks(updatedTasks);
      await axios.post('https://genckalmedya.cloud/v1.1/board.php', { action: 'update_status', id: draggableId, status: newStatus });
    }
  };

  // --- YENİ: DÜZENLEME FONKSİYONLARI ---
  
  // 1. Düzenle butonuna basınca Modalı aç
  const openEditModal = (task) => {
    setEditingTask({ ...task }); // Seçilen görevi state'e kopyala
  };

  // 2. Modal içindeki inputlar değişince
  const handleEditChange = (e) => {
    setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
  };

  // 3. Güncelle butonuna basınca API'ye gönder
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://genckalmedya.cloud/v1.1/board.php', {
        action: 'edit_task',
        id: editingTask.id,
        title: editingTask.title,
        assignee_user_id: editingTask.assignee_user_id,
        deadline: editingTask.deadline
      });
      
      if(res.data.status === 'success') {
        alert("Görev Güncellendi!");
        setEditingTask(null); // Modalı kapat
        fetchData(); // Listeyi yenile
      }
    } catch (error) {
      alert("Güncelleme hatası");
    }
  };

  const getWaLink = (phone, title, project) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Merhaba, "${project}" - "${title}" hakkında:`)}`;
  };

  const columns = {
    'Planlanan': tasks.filter(t => t.status === 'Planlanan'),
    'Devam Eden': tasks.filter(t => t.status === 'Devam Eden'),
    'Tamamlandı': tasks.filter(t => t.status === 'Tamamlandı'),
  };

  return (
    <div className="flex min-h-screen bg-dark-main text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-6 overflow-hidden flex flex-col h-screen relative">
        
        {/* ÜST FORM (Ekleme) */}
        <div className="bg-dark-card border border-dark-border p-4 rounded-xl shadow-lg mb-4 shrink-0">
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-gray-400 ml-1 mb-1 block">İşletme Seç</label>
              <select className="select select-bordered select-sm w-full bg-dark-main border-dark-border focus:border-brand-green" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} required>
                <option value="">-- Müşteri Seç --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex-[1.5] min-w-[200px]">
              <label className="text-xs text-gray-400 ml-1 mb-1 block">İş Başlığı</label>
              <input type="text" className="input input-bordered input-sm w-full bg-dark-main border-dark-border focus:border-brand-green font-bold" placeholder="Örn: LOGO TASARIMI" value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} required />
            </div>
            <div className="flex-[2] min-w-[250px]">
              <label className="text-xs text-gray-400 ml-1 mb-1 block">Alt Başlık (Detay)</label>
              <input type="text" className="input input-bordered input-sm w-full bg-dark-main border-dark-border" placeholder="Örn: Revize yapılacak" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-gray-400 ml-1 mb-1 block">Atanacak Kişi</label>
              <select className="select select-bordered select-sm w-full bg-dark-main border-dark-border" value={form.assignee_user_id} onChange={e => setForm({ ...form, assignee_user_id: e.target.value })}>
                <option value="">Personel Seç</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-gray-400 ml-1 mb-1 block">Son Teslim</label>
              <input type="date" className="input input-bordered input-sm w-full bg-dark-main border-dark-border" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <button className="btn btn-sm bg-brand-green border-none text-white hover:bg-green-600 px-6 h-[32px]">Ekle</button>
          </form>
        </div>

        {/* KANBAN PANOSU */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto h-full pb-2">
            {Object.entries(columns).map(([colId, colTasks]) => (
              <div key={colId} className="flex-1 min-w-[350px] bg-dark-card border border-dark-border rounded-xl flex flex-col h-full shadow-xl">
                <div className={`p-4 border-b border-dark-border font-bold text-lg flex justify-between items-center bg-dark-main/30 rounded-t-xl
                  ${colId === 'Planlanan' ? 'text-blue-400' : colId === 'Devam Eden' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {colId} <span className="text-xs bg-dark-border px-2 py-1 rounded-full text-white">{colTasks.length}</span>
                </div>
                <Droppable droppableId={colId}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                 className="bg-dark-main p-4 rounded-lg shadow-md border border-dark-border group hover:border-gray-500 transition-all">
                              <h4 className="font-bold text-white mb-1 uppercase tracking-wide text-sm border-b border-dark-border/50 pb-1">{task.project_name}</h4>
                              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><FaBriefcase className="text-brand-green"/> {task.customer_name}</div>
                              <p className="text-gray-300 text-sm mb-3 font-medium bg-dark-card/50 p-2 rounded">{task.title}</p>
                              <div className="flex justify-between items-center mb-3">
                                {task.assignee_name && <span className="flex items-center gap-1 text-xs text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30"><FaUser /> {task.assignee_name}</span>}
                                {task.deadline && <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-600/30"><FaCalendarAlt /> {task.deadline}</span>}
                              </div>
                              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-dark-border mt-2">
                                <button onClick={() => openEditModal(task)} className="btn btn-xs btn-outline border-dark-border text-gray-400 hover:text-white col-span-1">Düzenle</button>
                                {colId !== 'Tamamlandı' && <button onClick={() => handleMove(task.id, colId)} className="btn btn-xs btn-outline btn-info col-span-1">Taşı</button>}
                                {task.assignee_phone && <a href={getWaLink(task.assignee_phone, task.title, task.project_name)} target="_blank" className="btn btn-xs btn-outline btn-success col-span-1"><FaWhatsapp /></a>}
                                <button onClick={() => handleDelete(task.id)} className="btn btn-xs btn-outline btn-error col-span-1">Sil</button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* --- DÜZENLEME MODALI (POPUP) --- */}
        {editingTask && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-dark-card border border-dark-border p-6 rounded-xl w-full max-w-md shadow-2xl relative">
              
              {/* Kapat Butonu */}
              <button onClick={() => setEditingTask(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>

              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaEdit className="text-brand-green"/> Görevi Düzenle
              </h3>

              <div className="mb-4">
                 <div className="text-xs text-gray-500 uppercase font-bold mb-1">Müşteri & Proje (Değiştirilemez)</div>
                 <div className="p-2 bg-dark-main rounded text-gray-300 text-sm">
                    {editingTask.customer_name} / {editingTask.project_name}
                 </div>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                   <label className="label text-gray-400 text-xs">Alt Başlık (Detay)</label>
                   <input type="text" name="title" value={editingTask.title} onChange={handleEditChange} className="input input-bordered w-full bg-dark-main border-dark-border" required />
                </div>
                
                <div>
                   <label className="label text-gray-400 text-xs">Atanacak Kişi</label>
                   <select name="assignee_user_id" value={editingTask.assignee_user_id || ''} onChange={handleEditChange} className="select select-bordered w-full bg-dark-main border-dark-border">
                      <option value="">Personel Yok</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                   </select>
                </div>

                <div>
                   <label className="label text-gray-400 text-xs">Son Teslim Tarihi</label>
                   <input type="date" name="deadline" value={editingTask.deadline || ''} onChange={handleEditChange} className="input input-bordered w-full bg-dark-main border-dark-border" />
                </div>

                <div className="flex gap-2 mt-4">
                   <button type="button" onClick={() => setEditingTask(null)} className="btn btn-ghost flex-1">İptal</button>
                   <button className="btn btn-primary flex-1 bg-brand-green border-none text-white">Güncelle</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Board;