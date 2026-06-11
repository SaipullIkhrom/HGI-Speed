import { useState, useEffect } from 'react';
import { FaPercentage, FaTrash, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', discount_percentage: '', start_date: '', end_date: ''
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/promos`);
        const data = await res.json();
        if (isMounted && data.success) setPromos(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/promos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus program promo ini?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/promos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setPromos(promos.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      <h1 className="text-xl font-black text-white flex items-center gap-2">
        <FaPercentage className="text-[#e11d48]" /> MANAJEMEN PROMO KILAT
      </h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="NAMA KAMPANYE PROMO (Misal: Flash Sale Ramadhan)" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#e11d48] md:col-span-2 text-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input type="number" placeholder="PERSENTASE DISKON (%)" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white" value={form.discount_percentage} onChange={e => setForm({...form, discount_percentage: e.target.value})} min="1" max="100" required />
        <button type="submit" className="bg-[#e11d48] text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 row-span-2">
          <FaPlus /> AKTIFKAN PROMO
        </button>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mulai Tanggal & Jam</label>
          <input type="datetime-local" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white w-full" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Selesai Tanggal & Jam</label>
          <input type="datetime-local" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white w-full" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
        </div>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
              <th className="p-4">Nama Promo</th>
              <th className="p-4">Potongan</th>
              <th className="p-4">Periode Aktif</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (<tr><td colSpan="4" className="p-4 text-center">Memuat...</td></tr>) :
              promos.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/50">
                <td className="p-4 font-bold text-white">{p.name}</td>
                <td className="p-4 text-rose-400 font-bold">-{p.discount_percentage}%</td>
                <td className="p-4 text-slate-400">
                  <div className="flex items-center gap-1.5"><FaCalendarAlt className="text-slate-500" /> {new Date(p.start_date).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})} s/d</div>
                  <div className="text-[10px] text-slate-500 pl-5">{new Date(p.end_date).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}</div>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(p.id)} className="text-slate-500 hover:text-red-500"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromos;
