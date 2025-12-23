import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FaPlus, FaTrash, FaWhatsapp, FaCalendarAlt, FaUser, FaBriefcase, FaEdit, 
  FaTimes, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);

  // Kullanıcı bilgisini al
  const user = JSON.parse(localStorage.getItem('user'));

  // Form Görünürlüğü (Mobil)
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Sütun Görünürlüğü (Mobil ve Masaüstü için Açılır/Kapanır özellik)
  const [collapsedColumns, setCollapsedColumns] = useState({
    'Planlanan': false,
    'Devam Eden': false,
    'Tamamlandı': false
  });

  const [form, setForm] = useState({
    customer_id: '',
    project_name: '',
    title: '',
    assignee_user_id: '',
    deadline: ''
  });

  const [editingTask, setEditingTask] = useState(null); 
  
  const fetchData = async () => {
    try {
      const res = await axios.get('https://genckalmedya.cloud/v1.1/board.php');
      if (res.data.status === 'success') {
        // Görevleri ID'ye göre tersten sırala (En yeni en üstte)
        const sortedTasks = res.data.tasks.sort((a, b) => b.id - a.id);
        setTasks(sortedTasks);
        setCustomers(res.data.customers);
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id || !form.project_name) { 
      alert("Lütfen Müşteri ve İş Başlığı seçiniz!"); 
      return; 
    }
    try {
      await axios.post('https://genckalmedya.cloud/v1.1/board.php', form);
      setForm({ ...form, project_name: '', title: '', deadline: '' });
      setIsFormOpen(false); 
      fetchData();
    } catch (error) { alert("Hata"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Silmek istediğine emin misin?")) return;
    await axios.post('https://genckalmedya.cloud/v1.1/board.php', { action: 'delete', id });
    fetchData();
  };

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

  // --- DÜZENLEME FONKSİYONLARI ---
  const openEditModal = (task) => { setEditingTask({ ...task }); };
  const handleEditChange = (e) => { setEditingTask({ ...editingTask, [e.target.name]: e.target.value }); };
  
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
        setEditingTask(null);
        fetchData();
      }
    } catch (error) { alert("Güncelleme hatası"); }
  };

  const getWaLink = (phone, title, project) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Merhaba, "${project}" - "${title}" hakkında:`)}`;
  };

  // --- GÖREV FİLTRELEME MANTIĞI (YENİ) ---
  const getFilteredTasks = () => {
     // Eğer kullanıcı yoksa boş dön
     if (!user) return [];

     // Eğer Patron ise TÜM GÖREVLERİ görsün
     if (user.role === 'patron') {
        return tasks;
     }

     // Eğer Çalışan ise SADECE KENDİNE ATANANLARI görsün
     // String çevrimi yapıyoruz çünkü veritabanından string "5" gelebilir, user.id number 5 olabilir.
     return tasks.filter(task => String(task.assignee_user_id) === String(user.id));
  };

  const filteredTasks = getFilteredTasks();

  const columns = {
    'Planlanan': filteredTasks.filter(t => t.status === 'Planlanan'),
    'Devam Eden': filteredTasks.filter(t => t.status === 'Devam Eden'),
    'Tamamlandı': filteredTasks.filter(t => t.status === 'Tamamlandı'),
  };

  // Sütun Aç/Kapa Fonksiyonu
  const toggleColumn = (colId) => {
    setCollapsedColumns(prev => ({
        ...prev,
        [colId]: !prev[colId]
    }));
  };

  return (
    <div className="flex min-h-screen bg-dark-main text-white font-sans overflow-x-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen relative pt-16 md:pt-0 overflow-hidden">
        
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden h-full">

            {/* --- ÜST FORM --- */}
            <div className="bg-dark-card border border-dark-border rounded-xl shadow-lg mb-4 shrink-0 transition-all duration-300">
            
            <div 
                className="p-4 flex justify-between items-center cursor-pointer md:cursor-default"
                onClick={() => setIsFormOpen(!isFormOpen)}
            >
                <h2 className="font-bold text-brand-green flex items-center gap-2">
                    <FaPlus size={14}/> Yeni Görev Oluştur
                </h2>
                <div className="md:hidden text-gray-400">
                    {isFormOpen ? <FaChevronUp/> : <FaChevronDown/>}
                </div>
            </div>

            <div className={`px-4 pb-4 ${isFormOpen ? 'block' : 'hidden'} md:block border-t border-dark-border md:border-t-0`}>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:flex-wrap gap-3 items-end pt-3 md:pt-0">
                
                <div className="w-full md:flex-1 md:min-w-[180px]">
                    <label className="text-xs text-gray-400 ml-1 mb-1 block">İşletme Seç</label>
                    <select className="select select-bordered select-sm w-full bg-dark-main border-dark-border focus:border-brand-green h-10" value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} required>
                    <option value="">-- Müşteri Seç --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="w-full md:flex-[1.5] md:min-w-[200px]">
                    <label className="text-xs text-gray-400 ml-1 mb-1 block">İş Başlığı</label>
                    <input type="text" className="input input-bordered input-sm w-full bg-dark-main border-dark-border focus:border-brand-green font-bold h-10" placeholder="Örn: LOGO TASARIMI" value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} required />
                </div>

                <div className="w-full md:flex-[2] md:min-w-[200px]">
                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Alt Başlık (Detay)</label>
                    <input type="text" className="input input-bordered input-sm w-full bg-dark-main border-dark-border h-10" placeholder="Örn: Revize yapılacak" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>

                <div className="w-full md:flex-1 md:min-w-[150px]">
                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Atanacak Kişi</label>
                    <select className="select select-bordered select-sm w-full bg-dark-main border-dark-border h-10" value={form.assignee_user_id} onChange={e => setForm({ ...form, assignee_user_id: e.target.value })}>
                    <option value="">Personel Seç</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>

                <div className="w-full md:w-[140px]">
                    <label className="text-xs text-gray-400 ml-1 mb-1 block">Son Teslim</label>
                    <input type="date" className="input input-bordered input-sm w-full bg-dark-main border-dark-border h-10" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>

                <button className="w-full md:w-auto btn btn-sm bg-brand-green border-none text-white hover:bg-green-600 px-6 h-10">
                    Ekle
                </button>
                </form>
            </div>
            </div>

            {/* --- KANBAN PANOSU --- */}
            <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto h-full pb-20 md:pb-2 items-start">
                {Object.entries(columns).map(([colId, colTasks]) => (
                
                <div key={colId} className={`w-full md:min-w-[350px] md:w-[350px] bg-dark-card border border-dark-border rounded-xl flex flex-col shrink-0 shadow-xl transition-all duration-300 ${collapsedColumns[colId] ? 'h-auto' : 'h-auto md:h-full'}`}>
                    
                    {/* Sütun Başlığı */}
                    <div 
                        className={`p-4 border-b border-dark-border font-bold text-lg flex justify-between items-center bg-dark-main/30 rounded-t-xl cursor-pointer select-none
                        ${colId === 'Planlanan' ? 'text-blue-400' : colId === 'Devam Eden' ? 'text-yellow-400' : 'text-green-400'}`}
                        onClick={() => toggleColumn(colId)}
                    >
                        <div className="flex items-center gap-2">
                            {colId} <span className="text-xs bg-dark-border px-2 py-1 rounded-full text-white">{colTasks.length}</span>
                        </div>
                        <div className="text-gray-500 text-sm">
                            {collapsedColumns[colId] ? <FaChevronDown /> : <FaChevronUp />}
                        </div>
                    </div>

                    {/* Sütun İçeriği */}
                    <div className={`${collapsedColumns[colId] ? 'hidden' : 'flex'} flex-col h-full overflow-hidden`}>
                        <Droppable droppableId={colId}>
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[50px]">
                            {colTasks.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm py-4 italic">Burada hiç görev yok.</div>
                            ) : (
                                colTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                                            className="bg-dark-main p-4 rounded-lg shadow-md border border-dark-border group hover:border-gray-500 transition-all active:shadow-2xl active:border-brand-green">
                                        
                                        <h4 className="font-bold text-white mb-1 uppercase tracking-wide text-sm border-b border-dark-border/50 pb-1 break-words">{task.project_name}</h4>
                                        
                                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                            <FaBriefcase className="text-brand-green shrink-0"/> <span className="truncate">{task.customer_name}</span>
                                        </div>
                                        
                                        {task.title && (
                                            <p className="text-gray-300 text-sm mb-3 font-medium bg-dark-card/50 p-2 rounded break-words">{task.title}</p>
                                        )}
                                        
                                        <div className="flex flex-wrap gap-2 justify-between items-center mb-3">
                                            {task.assignee_name && <span className="flex items-center gap-1 text-[10px] md:text-xs text-blue-300 bg-blue-900/20 px-2 py-1 rounded border border-blue-900/30 whitespace-nowrap"><FaUser /> {task.assignee_name}</span>}
                                            {task.deadline && <span className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-600/30 whitespace-nowrap"><FaCalendarAlt /> {task.deadline}</span>}
                                        </div>
                                        
                                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-dark-border mt-2">
                                            <button onClick={() => openEditModal(task)} className="btn btn-xs md:btn-xs h-8 md:h-6 btn-outline border-dark-border text-gray-400 hover:text-white col-span-1">Düzenle</button>
                                            
                                            {colId !== 'Tamamlandı' ? (
                                            <button onClick={() => handleMove(task.id, colId)} className="btn btn-xs md:btn-xs h-8 md:h-6 btn-outline btn-info col-span-1">İlerle</button>
                                            ) : (
                                            <div className='col-span-1'></div>
                                            )}

                                            {task.assignee_phone ? (
                                            <a href={getWaLink(task.assignee_phone, task.title, task.project_name)} target="_blank" className="btn btn-xs md:btn-xs h-8 md:h-6 btn-outline btn-success col-span-1 flex justify-center items-center"><FaWhatsapp size={16}/></a>
                                            ) : (<div className='col-span-1'></div>)}
                                            
                                            <button onClick={() => handleDelete(task.id)} className="btn btn-xs md:btn-xs h-8 md:h-6 btn-outline btn-error col-span-1">Sil</button>
                                        </div>

                                        </div>
                                    )}
                                    </Draggable>
                                ))
                            )}
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </div>
                </div>
                ))}
            </div>
            </DragDropContext>

        </div>

        {/* --- DÜZENLEME MODALI --- */}
        {editingTask && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-dark-card border border-dark-border p-6 rounded-xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
              
              <button onClick={() => setEditingTask(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-dark-main p-2 rounded-full">
                <FaTimes size={20} />
              </button>

              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaEdit className="text-brand-green"/> Görevi Düzenle
              </h3>

              <div className="mb-4">
                 <div className="text-xs text-gray-500 uppercase font-bold mb-1">Müşteri & Proje (Değiştirilemez)</div>
                 <div className="p-3 bg-dark-main rounded text-gray-300 text-sm border border-dark-border">
                    {editingTask.customer_name} <br/> 
                    <span className="text-brand-green font-bold">{editingTask.project_name}</span>
                 </div>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                   <label className="label text-gray-400 text-xs">Alt Başlık (Detay)</label>
                   <input type="text" name="title" value={editingTask.title} onChange={handleEditChange} className="input input-bordered w-full bg-dark-main border-dark-border h-12" required />
                </div>
                
                <div>
                   <label className="label text-gray-400 text-xs">Atanacak Kişi</label>
                   <select name="assignee_user_id" value={editingTask.assignee_user_id || ''} onChange={handleEditChange} className="select select-bordered w-full bg-dark-main border-dark-border h-12">
                      <option value="">Personel Yok</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                   </select>
                </div>

                <div>
                   <label className="label text-gray-400 text-xs">Son Teslim Tarihi</label>
                   <input type="date" name="deadline" value={editingTask.deadline || ''} onChange={handleEditChange} className="input input-bordered w-full bg-dark-main border-dark-border h-12" />
                </div>

                <div className="flex gap-3 mt-6">
                   <button type="button" onClick={() => setEditingTask(null)} className="btn btn-ghost flex-1 h-12 border border-dark-border">İptal</button>
                   <button className="btn btn-primary flex-1 bg-brand-green border-none text-white h-12 hover:bg-green-600">Güncelle</button>
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