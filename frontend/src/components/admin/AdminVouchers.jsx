import { useState, useEffect } from 'react';
import { FaTicketAlt, FaTrash, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: '',
    expiry_date: '',
    usage_limit: '100' // Bawaan standar limit kupon belanja toko
  });

  // 1. MEMUAT DAFTAR MANIFES VOUCHER DARI DATABASE
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/vouchers`);
        const data = await res.json();
        if (isMounted && data.success) setVouchers(data.data || []);
      } catch (err) {
        console.error("Gagal sinkronisasi data voucher ke backend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // 2. PROSES REKREASI / PEMBUATAN VOUCHER BARU (FIXED ROUTE)
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // 🛠️ FIX UTAMA: Ubah dari /api/vouchers/create menjadi /api/vouchers
    const res = await fetch(`${BASE_URL}/api/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();

    if (data.success) {
      alert(data.message || 'Manifes kupon voucher berhasil diamankan!');

      const newVoucherWithId = {
        ...form,
        id: data.id || Date.now(),
        code: form.code.toUpperCase()
      };
      setVouchers((prev) => [newVoucherWithId, ...prev]);

      setForm({
        code: '', discount_type: 'percentage', discount_value: '',
        min_purchase: '', expiry_date: '', usage_limit: '100'
      });
    } else {
      alert(data.message || 'Gagal menerbitkan voucher baru.');
    }
  } catch (err) {
    console.error("Eror fatal saat memproses submit voucher:", err);
  }
};

  // 3. PROSES EKSEKUSI DELESI VOUCHER (DELETE)
  const handleDelete = async (id) => {
    if (!confirm('Hapus kupon voucher belanja ini dari peredaran?')) return;
    try {
      // URL /api/vouchers/:id sudah sesuai dengan config param backend
      const res = await fetch(`${BASE_URL}/api/vouchers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setVouchers(vouchers.filter(v => v.id !== id));
      } else {
        alert(data.message || 'Gagal menghapus berkas voucher.');
      }
    } catch (err) {
      console.error("Gagal melakukan delesi voucher via network:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      <h1 className="text-xl font-black text-white flex items-center gap-2">
        <FaTicketAlt className="text-[#e11d48]" /> MANAJEMEN VOUCHER TOKO
      </h1>

      {/* Form Pembuatan Voucher Baru */}
      <form onSubmit={handleSubmit} className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kode Unik Kupon</label>
          <input type="text" placeholder="MISAL: HGI200CC" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#e11d48] text-white font-mono uppercase" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kategori Potongan</label>
          <select className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white focus:border-[#e11d48] cursor-pointer h-[38px]" value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}>
            <option value="percentage">Persentase (%)</option>
            <option value="fixed">Potongan Harga (Rp)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nilai / Besaran Diskon</label>
          <input type="number" placeholder="Misal: 15000 atau 10" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#e11d48] text-white font-mono" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Minimal Belanja (Rp)</label>
          <input type="number" placeholder="Misal: 50000" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#e11d48] text-white font-mono" value={form.min_purchase} onChange={e => setForm({...form, min_purchase: e.target.value})} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Batas Maks Kuota Penggunaan</label>
          <input type="number" placeholder="Misal: 100" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#e11d48] text-white font-mono" value={form.usage_limit} onChange={e => setForm({...form, usage_limit: e.target.value})} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Masa Kedaluwarsa</label>
          <input type="date" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none focus:border-[#e11d48] text-white h-[38px]" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} required />
        </div>

        <div className="md:col-span-3 pt-2">
          <button type="submit" className="w-full md:w-max md:float-right bg-[#e11d48] text-white font-black px-8 py-3 rounded-xl text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-md shadow-red-900/10 active:scale-95">
            <FaPlus /> TERBITKAN KUPON VOUCHER
          </button>
          <div className="clear-both"></div>
        </div>
      </form>

      {/* Tabel Data Kupon Aktif */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                <th className="p-4">Kode Kupon</th>
                <th className="p-4">Jenis & Nilai Diskon</th>
                <th className="p-4">Min. Belanja</th>
                <th className="p-4">Masa Berlaku</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500 font-bold">Sinkronisasi data kupon...</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-slate-500">Belum ada kupon kuota aktif yang diterbitkan.</td></tr>
              ) : (
                vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-black text-white font-mono text-sm tracking-wide">{v.code}</td>
                    <td className="p-4 font-bold text-emerald-400">
                      {v.discount_type === 'percentage' ? `${v.discount_value}%` : `Rp ${(Number(v.discount_value)).toLocaleString('id-ID')}`}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      Rp {(Number(v.min_purchase || 0)).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FaCalendarAlt className="text-[#e11d48]" size={10} />
                        {new Date(v.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(v.id)} className="text-slate-500 hover:text-red-500 p-2 rounded-xl hover:bg-red-500/10 transition-all active:scale-90" title="Hapus Voucher">
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
    </div>
  );
};

export default AdminVouchers;
