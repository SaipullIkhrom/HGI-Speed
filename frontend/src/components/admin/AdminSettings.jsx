import { useState } from 'react';
import { FaCog, FaStore, FaShieldAlt, FaSlidersH, FaSave, FaLock, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

const AdminSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // State Form Profil Toko
  const [shopProfile, setShopProfile] = useState({
    name: 'HGI SPEED',
    tagline: 'Professional Motorcycle Parts & Custom Engineering Components',
    whatsapp: '0896-0421-0396',
    address: 'Jl. Raya Puspitek, Tangerang Selatan, Banten',
    critical_limit: 5
  });

  // State Form Keamanan
  const [securityData, setSecurityData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // State Fitur Sistem
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleProfileChange = (e) => {
    setShopProfile({ ...shopProfile, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e) => {
    setSecurityData({ ...securityData, [e.target.name]: e.target.value });
  };

  const saveProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulasi save ke backend (bisa kamu hubungkan ke API kelak)
    setTimeout(() => {
      setLoading(false);
      alert('Konfigurasi profil HGI SPEED berhasil diperbarui!');
    }, 800);
  };

  const updatePassword = (e) => {
    e.preventDefault();
    if (securityData.new_password !== securityData.confirm_password) {
      return alert('Konfirmasi password baru tidak cocok!');
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Password admin berhasil diubah!');
      setSecurityData({ current_password: '', new_password: '', confirm_password: '' });
    }, 800);
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      {/* HEADER UTAMA */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight uppercase">
          <FaCog className="text-[#e11d48] animate-spin-slow" /> Pengaturan Sistem
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Konfigurasi otoritas global, parameter database, dan identitas toko HGI Speed.</p>
      </div>

      {/* SUB-TAB NAVIGATOR */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 max-w-md gap-1">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 text-[11px] font-bold py-2 rounded-lg transition-all ${activeSubTab === 'profile' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FaStore size={11} /> Profil Toko
        </button>
        <button
          onClick={() => setActiveSubTab('system')}
          className={`flex-1 flex items-center justify-center gap-2 text-[11px] font-bold py-2 rounded-lg transition-all ${activeSubTab === 'system' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FaSlidersH size={11} /> Fitur & Mode
        </button>
        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex-1 flex items-center justify-center gap-2 text-[11px] font-bold py-2 rounded-lg transition-all ${activeSubTab === 'security' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FaShieldAlt size={11} /> Keamanan
        </button>
      </div>

      {/* BOX KONTEN PENGATURAN */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md max-w-3xl">

        {/* TAB 1: PROFIL TOKO */}
        {activeSubTab === 'profile' && (
          <form onSubmit={saveProfile} className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <FaStore className="text-[#e11d48]" size={12} /> Informasi Inti Instansi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Bisnis / Toko</label>
                <input name="name" type="text" value={shopProfile.name} onChange={handleProfileChange} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#e11d48] outline-none" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><FaWhatsapp className="text-emerald-500" /> Gateway WhatsApp HotLine</label>
                <div className="relative flex items-center">
                  <FaWhatsapp className="absolute left-4 text-emerald-500 text-xs" />
                  <input name="whatsapp" type="text" value={shopProfile.whatsapp} onChange={handleProfileChange} className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-[#e11d48] outline-none w-full" required />
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Slogan / Tagline Toko</label>
                <input name="tagline" type="text" value={shopProfile.tagline} onChange={handleProfileChange} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#e11d48] outline-none" required />
              </div>

              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><FaMapMarkerAlt /> Alamat Fisik Bengkel & Workshop</label>
                <textarea name="address" rows="3" value={shopProfile.address} onChange={handleProfileChange} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#e11d48] outline-none resize-none" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-4 bg-[#e11d48] hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
              <FaSave /> {loading ? 'Menyimpan...' : 'SIMPAN PERUBAHAN IDENTITAS'}
            </button>
          </form>
        )}

        {/* TAB 2: FITUR & MODE */}
        {activeSubTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                <FaSlidersH className="text-[#e11d48]" size={12} /> Manajemen Kondisi Operasional
              </h3>
            </div>

            {/* Switch Maintenance Mode */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Maintenance Mode (Perbaikan Aplikasi)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Jika diaktifkan, halaman pembeli akan ditutup sementara dan memunculkan info perbaikan.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e11d48]"></div>
              </label>
            </div>

            {/* Threshold Stok Kritis */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Batas Stok Opname Gudang (Kritis)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Kuantitas minimal item produk untuk masuk ke dalam radar filter bahaya laporan eksekutif.</p>
              </div>
              <div className="flex items-center gap-2">
                <input name="critical_limit" type="number" value={shopProfile.critical_limit} onChange={handleProfileChange} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-[#e11d48] outline-none w-16 text-center font-bold" />
                <span className="text-xs text-slate-400 font-bold">Pcs</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEAMANAN (GANTI PASSWORD) */}
        {activeSubTab === 'security' && (
          <form onSubmit={updatePassword} className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              <FaShieldAlt className="text-[#e11d48]" size={12} /> Kredensial Otoritas Pusat
            </h3>

            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Password Saat Ini</label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-4 text-slate-600 text-xs" />
                <input name="current_password" type="password" placeholder="••••••••" value={securityData.current_password} onChange={handleSecurityChange} className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-[#e11d48] outline-none w-full" required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Password Baru</label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-4 text-slate-600 text-xs" />
                <input name="new_password" type="password" placeholder="Minimal 8 karakter" value={securityData.new_password} onChange={handleSecurityChange} className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-[#e11d48] outline-none w-full" required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Konfirmasi Password Baru</label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-4 text-slate-600 text-xs" />
                <input name="confirm_password" type="password" placeholder="Ulangi password baru" value={securityData.confirm_password} onChange={handleSecurityChange} className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-[#e11d48] outline-none w-full" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
              <FaLock /> {loading ? 'Memproses...' : 'PERBARUI KUNCI KEAMANAN'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default AdminSettings;
