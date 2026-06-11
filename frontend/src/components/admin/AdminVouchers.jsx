import { useState, useEffect } from 'react';
import { FaTicketAlt, FaTrash, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: '', discount_type: 'percentage', discount_value: '',
    min_purchase: '', expiry_date: '', usage_limit: ''
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/vouchers`);
        const data = await res.json();
        if (isMounted && data.success) setVouchers(data.data);
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
      const res = await fetch(`${BASE_URL}/api/vouchers`, {
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
    if (!confirm('Hapus voucher?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/vouchers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setVouchers(vouchers.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      <h1 className="text-xl font-black text-white flex items-center gap-2">
        <FaTicketAlt className="text-[#e11d48]" /> MANAJEMEN VOUCHER
      </h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" placeholder="KODE VOUCHER" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#e11d48]" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
        <select className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none" value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}>
          <option value="percentage">Persentase (%)</option>
          <option value="fixed">Potongan Harga (Rp)</option>
        </select>
        <input type="number" placeholder="NILAI DISKON" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} required />
        <input type="number" placeholder="MIN. PEMBELIAN" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none" value={form.min_purchase} onChange={e => setForm({...form, min_purchase: e.target.value})} required />
        <input type="date" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} required />
        <button type="submit" className="bg-[#e11d48] text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2">
          <FaPlus /> BUAT VOUCHER
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase">
              <th className="p-4">Kode</th>
              <th className="p-4">Diskon</th>
              <th className="p-4">Masa Berlaku</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (<tr><td colSpan="4" className="p-4 text-center">Memuat...</td></tr>) :
              vouchers.map(v => (
              <tr key={v.id} className="hover:bg-slate-800/50">
                <td className="p-4 font-bold text-white">{v.code}</td>
                <td className="p-4">{v.discount_type === 'percentage' ? `${v.discount_value}%` : `Rp ${v.discount_value.toLocaleString()}`}</td>
                <td className="p-4 flex items-center gap-2"><FaCalendarAlt /> {new Date(v.expiry_date).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(v.id)} className="text-slate-500 hover:text-red-500"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVouchers;
