import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FaPlus, FaTrash, FaEdit, FaUserSecret, FaPhone, FaBuilding, 
  FaStickyNote, FaWhatsapp, FaTimes, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Sütun Aç/Kapa Durumları
  const [collapsedColumns, setCollapsedColumns] = useState({
    'Potansiyel Müşteri': false,
    'Görüşme Aşamasında': false,
    'Sonuçlanan Müşteri': false,
  });

  const [form, setForm] = useState({
    name: '', business_name: '', phone: '', note: ''
  });

  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'patron') {
      alert("Bu sayfaya sadece yöneticiler erişebilir!");
      navigate('/');
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('https://genckalmedya.cloud/v1.1/leads.php');
      // Burada da sıralama yapabiliriz (opsiyonel)
      if (res.data.status === 'success') setLeads(res.data.data.reverse()); 
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { alert("Müşteri adı zorunlu!"); return; }
    try {
      await axios.post('https://genckalmedya.cloud/v1.1/leads.php', form);
      setForm({ name: '', business_name: '', phone: '', note: '' });
      setIsFormOpen(false); 
      fetchData();
      alert("Aday eklendi!");
    } catch (err) { alert("Hata"); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Bu adayı silmek istediğine emin misin?")) return;
    await axios.post('https://genckalmedya.cloud/v1.1/leads.php', { action: 'delete', id });
    fetchData();
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    
    const newStatus = destination.droppableId;
    const updatedLeads = leads.map(l => l.id == draggableId ? { ...l, status: newStatus } : l);
    setLeads(updatedLeads);

    await axios.post('https://genckalmedya.cloud/v1.1/leads.php', { 
        action: 'update_status', id: draggableId, status: newStatus 
    });
  };

  const startEdit = (lead) => setEditingLead(lead);
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post('https://genckalmedya.cloud/v1.1/leads.php', {
            ...editingLead, action: 'edit'
        });
        setEditingLead(null);
        fetchData();
        alert("Güncellendi!");
    } catch(err) { alert("Güncelleme hatası"); }
  };

  const getWaLink = (phone) => {
    if(!phone) return '#';
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  };

  const columns = {
    'Potansiyel Müşteri': leads.filter(l => l.status === 'Potansiyel Müşteri'),
    'Görüşme Aşamasında': leads.filter(l => l.status === 'Görüşme Aşamasında'),
    'Sonuçlanan Müşteri': leads.filter(l => l.status === 'Sonuçlanan Müşteri'),
  };

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
                <h3 className="text-sm md:text-base font-bold text-gray-400 flex items-center gap-2">
                    <FaUserSecret className="text-brand-green"/> Yeni Aday Müşteri Ekle
                </h3>
                <div className="md:hidden text-gray-400">
                    {isFormOpen ? <FaChevronUp/> : <FaChevronDown/>}
                </div>
            </div>

            <div className={`px-4 pb-4 ${isFormOpen ? 'block' : 'hidden'} md:block border-t border-dark-border md:border-t-0`}>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:flex-wrap gap-3 items-end pt-3 md:pt-0">
                    <div className="w-full md:flex-1 md:min-w-[200px]">
                    <label className="text-xs text-gray-500 mb-1 block md:hidden">Müşteri Adı</label>
                    <input type="text" className="input input-sm md:input-sm h-10 input-bordered w-full bg-dark-main border-dark-border" placeholder="Müşteri Adı (Ad Soyad)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="w-full md:flex-1 md:min-w-[200px]">
                    <label className="text-xs text-gray-500 mb-1 block md:hidden">İşletme Adı</label>
                    <input type="text" className="input input-sm md:input-sm h-10 input-bordered w-full bg-dark-main border-dark-border" placeholder="İşletme Adı" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} />
                    </div>
                    <div className="w-full md:w-[180px]">
                    <label className="text-xs text-gray-500 mb-1 block md:hidden">Telefon</label>
                    <input type="text" className="input input-sm md:input-sm h-10 input-bordered w-full bg-dark-main border-dark-border" placeholder="Telefon (5xx...)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                    <div className="w-full md:flex-[2] md:min-w-[250px]">
                    <label className="text-xs text-gray-500 mb-1 block md:hidden">Notlar</label>
                    <input type="text" className="input input-sm md:input-sm h-10 input-bordered w-full bg-dark-main border-dark-border" placeholder="Notlar..." value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
                    </div>
                    <button className="btn btn-sm h-10 bg-brand-green border-none text-white hover:bg-green-600 px-6 w-full md:w-auto">Ekle</button>
                </form>
            </div>
            </div>

            {/* --- KANBAN PANOSU --- */}
            <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-y-hidden md:overflow-x-auto h-full pb-20 md:pb-2 items-start">
                {Object.entries(columns).map(([colId, colLeads]) => (
                    <div key={colId} className={`w-full md:min-w-[350px] md:w-[350px] bg-dark-card border border-dark-border rounded-xl flex flex-col shrink-0 shadow-xl transition-all duration-300 ${collapsedColumns[colId] ? 'h-auto' : 'h-auto md:h-full'}`}>
                        
                        {/* Başlık (Tıklanabilir) */}
                        <div 
                            className={`p-4 border-b border-dark-border font-bold text-lg flex justify-between items-center rounded-t-xl bg-dark-main/30 cursor-pointer select-none
                            ${colId === 'Potansiyel Müşteri' ? 'text-blue-400' : colId === 'Görüşme Aşamasında' ? 'text-yellow-400' : 'text-green-400'}`}
                            onClick={() => toggleColumn(colId)}
                        >
                            <div className="flex items-center gap-2">
                                {colId} <span className="text-xs bg-dark-border px-2 py-1 rounded-full text-white">{colLeads.length}</span>
                            </div>
                            <div className="text-gray-500 text-sm">
                                {collapsedColumns[colId] ? <FaChevronDown /> : <FaChevronUp />}
                            </div>
                        </div>
                        
                        {/* İçerik (Gizlenebilir) */}
                        <div className={`${collapsedColumns[colId] ? 'hidden' : 'flex'} flex-col h-full overflow-hidden`}>
                            <Droppable droppableId={colId}>
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[50px]">
                                    {colLeads.map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={String(lead.id)} index={index}>
                                        {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-dark-main p-4 rounded-lg shadow-md border border-dark-border group hover:border-gray-500 transition-all relative">
                                                    <h4 className="font-bold text-white text-lg">{lead.name}</h4>
                                                    
                                                    {lead.business_name && (
                                                        <div className="text-sm text-brand-green mb-1 flex items-center gap-1">
                                                                <FaBuilding size={12}/> {lead.business_name}
                                                        </div>
                                                    )}

                                                    {lead.phone && (
                                                        <div className="text-sm text-gray-400 mb-2 flex items-center gap-2 bg-dark-card/30 p-1.5 rounded w-fit border border-dark-border/50">
                                                                <FaPhone size={12} className="text-blue-400"/> 
                                                                <span className="font-mono tracking-wide">{lead.phone}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {lead.note && (
                                                        <div className="mt-2 bg-dark-card/50 p-2 rounded text-xs text-gray-300 flex gap-2 items-start border-l-2 border-gray-600 break-words">
                                                                <FaStickyNote className="mt-0.5 shrink-0 opacity-50"/> 
                                                                <span className="break-all">{lead.note}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-dark-border/50">
                                                        {lead.phone && (
                                                            /* GÜNCELLEME: Whatsapp Buton Hizalaması */
                                                            <a href={getWaLink(lead.phone)} target="_blank" className="btn btn-sm btn-circle btn-ghost text-green-500 hover:bg-green-900/20 tooltip border border-dark-border flex items-center justify-center" data-tip="WhatsApp'tan Yaz">
                                                                <FaWhatsapp size={18}/>
                                                            </a>
                                                        )}
                                                        <button onClick={() => startEdit(lead)} className="btn btn-sm btn-circle btn-ghost text-blue-400 hover:bg-blue-900/20 border border-dark-border flex items-center justify-center"><FaEdit size={16}/></button>
                                                        <button onClick={() => handleDelete(lead.id)} className="btn btn-sm btn-circle btn-ghost text-red-500 hover:bg-red-900/20 border border-dark-border flex items-center justify-center"><FaTrash size={16}/></button>
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
                    </div>
                ))}
            </div>
            </DragDropContext>

        </div>

        {/* --- DÜZENLEME MODALI --- */}
        {editingLead && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
                <div className="bg-dark-card border border-dark-border p-6 rounded-xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
                    
                    <button onClick={() => setEditingLead(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-dark-main p-2 rounded-full">
                        <FaTimes size={16} />
                    </button>
                    
                    <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                        <FaEdit className="text-brand-green"/> Adayı Düzenle
                    </h3>
                    
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Ad Soyad</label>
                            <input className="input input-bordered w-full bg-dark-main border-dark-border h-12" value={editingLead.name} onChange={e => setEditingLead({...editingLead, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">İşletme</label>
                            <input className="input input-bordered w-full bg-dark-main border-dark-border h-12" value={editingLead.business_name} onChange={e => setEditingLead({...editingLead, business_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Telefon</label>
                            <input className="input input-bordered w-full bg-dark-main border-dark-border h-12" value={editingLead.phone} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Notlar</label>
                            <textarea className="textarea textarea-bordered w-full bg-dark-main border-dark-border h-24" value={editingLead.note} onChange={e => setEditingLead({...editingLead, note: e.target.value})}></textarea>
                        </div>
                        
                        <div className="flex gap-3 mt-2">
                             <button type="button" onClick={() => setEditingLead(null)} className="btn btn-ghost flex-1 h-12 border border-dark-border">İptal</button>
                             <button className="btn bg-brand-green border-none text-white flex-1 hover:bg-green-600 h-12">Güncelle</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default Leads;