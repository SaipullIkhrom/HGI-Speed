import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCopyright, FaCheckCircle, FaHashtag } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState('');
  const [notification, setNotification] = useState('');

  const fetchBrands = () => {
    fetch(`${BASE_URL}/api/brands`)
      .then(res => res.json())
      .then(resData => { if (resData.success) setBrands(resData.data); })
      .catch(err => console.error('Gagal mengambil data merek:', err));
  };

  useEffect(() => { fetchBrands(); }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.trim()) return;

    const response = await fetch(`${BASE_URL}/api/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBrand })
    });

    if (response.ok) {
      showToast('Merek baru berhasil ditambahkan!');
      setNewBrand('');
      fetchBrands();
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Hapus merek "${name}" dari daftar hak paten?`)) {
      await fetch(`${BASE_URL}/api/brands/${id}`, { method: 'DELETE' });
      showToast('Merek berhasil dihapus.');
      fetchBrands();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-300">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white tracking-tight uppercase">📇 MANAJEMEN MEREK</h2>
          <p className="text-xs text-slate-400 mt-1">Kelola daftar produsen eksternal dan brand original komponen makro</p>
        </div>

        {/* Toast Notification Elegan */}
        {notification && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold animate-slideIn">
            <FaCheckCircle /> {notification}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 2. Form Tambah Merek (UI Elegan) */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="bg-slate-800/60 px-5 py-3.5 border-b border-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#e11d48]"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Registrasi Merek</span>
          </div>

          <form onSubmit={handleAddBrand} className="p-5 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nama Brand / Pabrikan</label>
              <input
                type="text"
                placeholder="Contoh: Brembo, RCB, Ohlins..."
                value={newBrand}
                onChange={e => setNewBrand(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#e11d48] transition-all tracking-wide font-medium"
                required
              />
            </div>

            <button type="submit" className="w-full bg-[#e11d48] hover:bg-red-700 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/10 active:scale-[0.98]">
              <FaPlus className="text-[10px]" /> DAFTARKAN BRAND
            </button>
          </form>
        </div>

        {/* 3. Grid Visual List Merek */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <FaHashtag className="text-[#e11d48]" /> Merek Terdaftar ({brands.length})
            </span>
          </div>

          {brands.length === 0 ? (
            <div className="bg-slate-800/10 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 italic">
              Belum ada lisensi merek terdaftar di database MotoPart.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {brands.map(b => (
                <div key={b.id} className="group bg-slate-800/20 hover:bg-slate-800/40 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between transition-all duration-300 shadow-sm hover:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-[#e11d48] border border-slate-800 group-hover:border-red-900/30 transition-all shadow-inner">
                      <FaCopyright className="text-sm transition-transform group-hover:rotate-12" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white uppercase tracking-wider transition-colors">{b.name}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(b.id, b.name)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 transition-all p-2 rounded-lg hover:bg-rose-500/5"
                    title="Hapus Brand"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBrands;
