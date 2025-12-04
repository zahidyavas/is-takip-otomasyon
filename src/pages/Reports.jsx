import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { FaPlus, FaTrash, FaChartBar, FaCalendarAlt, FaCheckDouble, FaFileAlt } from 'react-icons/fa';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]); // Otomatik çekilen görevler
  const user = JSON.parse(localStorage.getItem('user'));

  // Form State
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    title: '',
    summary: ''
  });

  // Geçmiş Raporları Çek
  const fetchReports = async () => {
    try {
      const res = await axios.get('https://genckalmedya.cloud/v1.1/reports.php');
      if (res.data.status === 'success') setReports(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchReports(); }, []);

  // TARİH SEÇİLİNCE OTOMATİK GÖREVLERİ GETİR
  useEffect(() => {
    const fetchAutoTasks = async () => {
      if (form.start_date && form.end_date) {
        try {
          const res = await axios.get(`https://genckalmedya.cloud/v1.1/reports.php?action=fetch_completed&start=${form.start_date}&end=${form.end_date}`);
          if (res.data.status === 'success') {
            setCompletedTasks(res.data.data);
          }
        } catch (error) { console.error("Görev çekme hatası", error); }
      }
    };
    // Küçük bir gecikme ekleyelim ki her harfte istek atmasın
    const timer = setTimeout(() => { fetchAutoTasks(); }, 500);
    return () => clearTimeout(timer);
  }, [form.start_date, form.end_date]);

  // Rapor Kaydet
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.summary) { alert("Başlık ve özet yazmalısın."); return; }

    try {
      await axios.post('https://genckalmedya.cloud/v1.1/reports.php', { ...form, user_id: user.id });
      alert("Rapor Kaydedildi!");
      setForm({ start_date: '', end_date: '', title: '', summary: '' });
      setCompletedTasks([]);
      fetchReports();
    } catch (error) { alert("Hata oluştu."); }
  };

  // Silme
  const handleDelete = async (id) => {
    if (!confirm("Raporu silmek istiyor musun?")) return;
    await axios.post('https://genckalmedya.cloud/v1.1/reports.php', { action: 'delete', id });
    fetchReports();
  };

  return (
    <div className="flex min-h-screen bg-dark-main text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        
        <header className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaChartBar className="text-brand-green" /> Haftalık Raporlar
          </h2>
          <p className="text-gray-400 mt-1">Tamamlanan işleri gör, haftalık özetini oluştur.</p>
        </header>

        {/* ÜST BÖLÜM: RAPOR OLUŞTURMA */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
          
          {/* 1. SOL KART: RAPOR YAZMA ALANI */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 border-b border-dark-border pb-2 flex items-center gap-2">
               <FaFileAlt className="text-blue-400"/> Yeni Rapor Oluştur
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-gray-400 text-xs">Başlangıç Tarihi</label>
                  <input type="date" className="input input-bordered w-full bg-dark-main border-dark-border" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
                </div>
                <div>
                  <label className="label text-gray-400 text-xs">Bitiş Tarihi</label>
                  <input type="date" className="input input-bordered w-full bg-dark-main border-dark-border" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
                </div>
              </div>

              <div>
                <label className="label text-gray-400 text-xs">Rapor Başlığı</label>
                <input type="text" className="input input-bordered w-full bg-dark-main border-dark-border" placeholder="Örn: Kasım 1. Hafta Raporu" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>

              <div>
                <label className="label text-gray-400 text-xs">Haftalık Özet / Notlar</label>
                <textarea className="textarea textarea-bordered w-full bg-dark-main border-dark-border h-32" placeholder="Bu hafta yapılan önemli işler, notlar..." value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} required></textarea>
              </div>

              <button className="btn bg-brand-green border-none text-white w-full hover:bg-green-600"><FaPlus /> Raporu Kaydet</button>
            </form>
          </div>

          {/* 2. SAĞ KART: OTOMATİK TAMAMLANAN İŞLER (Analiz) */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-xl shadow-lg flex flex-col h-full">
            <h3 className="text-xl font-bold mb-4 border-b border-dark-border pb-2 flex items-center gap-2 text-yellow-400">
               <FaCheckDouble /> Bu Aralıkta Tamamlananlar
            </h3>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-dark-main rounded-lg p-4 border border-dark-border">
              {!form.start_date || !form.end_date ? (
                <div className="text-center text-gray-500 mt-10">
                  <FaCalendarAlt className="text-4xl mx-auto mb-2 opacity-20"/>
                  <p>Tarih aralığı seçersen, o tarihlerde tamamlanan işler burada listelenir.</p>
                </div>
              ) : completedTasks.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Bu tarih aralığında tamamlanmış iş bulunamadı.</p>
              ) : (
                <ul className="space-y-3">
                  {completedTasks.map((task, index) => (
                    <li key={index} className="bg-dark-card p-3 rounded border border-dark-border flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-white">{task.project_name}</div>
                        <div className="text-xs text-gray-400">{task.title}</div>
                      </div>
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900/50">
                        {new Date(task.updated_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">* Bu liste İş Takip sayfasından otomatik çekilir.</p>
          </div>

        </div>

        {/* ALT BÖLÜM: GEÇMİŞ RAPORLAR LİSTESİ */}
        <h3 className="text-xl font-bold mb-4 border-l-4 border-brand-green pl-3">Geçmiş Raporlar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-dark-card border border-dark-border p-5 rounded-xl shadow-md hover:border-gray-500 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-white text-lg">{report.title}</h4>
                  <p className="text-xs text-brand-green flex items-center gap-1 mt-1">
                    <FaCalendarAlt /> {report.start_date} / {report.end_date}
                  </p>
                </div>
                <button onClick={() => handleDelete(report.id)} className="btn btn-xs btn-ghost text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><FaTrash /></button>
              </div>
              
              <div className="bg-dark-main p-3 rounded-lg text-sm text-gray-300 h-24 overflow-y-auto border border-dark-border">
                {report.summary}
              </div>
              
              <div className="mt-3 text-xs text-gray-500 text-right">
                Oluşturan: {report.creator_name}
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-gray-500">Henüz kaydedilmiş rapor yok.</p>}
        </div>

      </main>
    </div>
  );
};

export default Reports;