import { useState, useEffect } from 'react';
import { FaPercentage, FaTrash, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminPromos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', discount_percentage: '', start_date: '', end_date: ''
  });

  // 1. MEMUAT DAFTAR PROMO DARI BACKEND
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/promos`);
        const data = await res.json();
        if (isMounted && data.success) setPromos(data.data);
      } catch (err) {
        console.error("Gagal memuat daftar promo admin:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // 2. PROSES REKREASI / PEMBUATAN PROMO BARU (FIXED ROUTE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🛠️ FIX: URL diarahkan ke /api/promos/create sesuai promoRoutes.js
      const res = await fetch(`${BASE_URL}/api/promos/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message || 'Promo berhasil diaktifkan!');

        // Optimasi: Memasukkan promo baru ke tabel secara real-time tanpa reload paksa
        const newPromoWithId = { ...form, id: data.id || Date.now() };
        setPromos((prev) => [newPromoWithId, ...prev]);

        // Reset form isian kembali kosong
        setForm({ name: '', discount_percentage: '', start_date: '', end_date: '' });
      } else {
        alert(data.message || 'Gagal membuat promo baru.');
      }
    } catch (err) {
      console.error("Gagal menyimpan promo baru:", err);
    }
  };

  // 3. PROSES PENGHAPUSAN PROMO (FIXED ROUTE)
  const handleDelete = async (id) => {
    if (!confirm('Hapus program promo ini?')) return;
    try {
      // URL /api/promos/:id sudah pas dengan config router backend
      const res = await fetch(`${BASE_URL}/api/promos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPromos(promos.filter(p => p.id !== id));
      } else {
        alert(data.message || 'Gagal menghapus promo.');
      }
    } catch (err) {
      console.error("Gagal mengeksekusi hapus promo:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      <h1 className="text-xl font-black text-white flex items-center gap-2">
        <FaPercentage className="text-[#e11d48]" /> MANAJEMEN PROMO KILAT
      </h1>

      {/* Form Input Kampanye Promo */}
      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="NAMA KAMPANYE PROMO (Misal: Flash Sale Ramadhan)" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#e11d48] md:col-span-2 text-white" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input type="number" placeholder="PERSENTASE DISKON (%)" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white" value={form.discount_percentage} onChange={e => setForm({...form, discount_percentage: e.target.value})} min="1" max="100" required />
        <button type="submit" className="bg-[#e11d48] text-white font-black rounded-xl text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 row-span-2 uppercase tracking-widest active:scale-95">
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

      {/* Tabel Data Promosi Toko */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
              <th className="p-4">Nama Promo</th>
              <th className="p-4">Potongan</th>
              <th className="p-4">Periode Aktif</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center text-slate-500 font-bold">Memuat data promo...</td></tr>
            ) : promos.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-slate-500">Belum ada program promo aktif yang terdaftar.</td></tr>
            ) : (
              promos.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white">{p.name}</td>
                  <td className="p-4 text-rose-500 font-black font-mono text-sm">-{p.discount_percentage}%</td>
                  <td className="p-4 text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <FaCalendarAlt className="text-[#e11d48]" size={10} />
                      {new Date(p.start_date).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})} s/d
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium pl-4 mt-0.5">
                      {new Date(p.end_date).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(p.id)} className="text-slate-500 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-all active:scale-90" title="Hapus Promo">
                      <FaTrash size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromos;
