import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle, FaCamera, FaArrowLeft, FaSave, FaUser, FaEnvelope,
  FaLock, FaCheckCircle, FaPhone, FaMapMarkerAlt, FaVenusMars,
  FaCalendarAlt, FaMotorcycle, FaWrench, FaShieldAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { Container } from '../components/layout/Container';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../config/api";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const localUserData = localStorage.getItem('user');
  const user = localUserData ? JSON.parse(localUserData) : null;

  // State Manajemen Tab
  const [activeTab, setActiveTab] = useState('personal');

  // State Form Lengkap
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [birthdate, setBirthdate] = useState(user?.birthdate || '');

  // Data Spesifik Garasi
  const [motorType, setMotorType] = useState(user?.motor_type || '');
  const [motorYear, setMotorYear] = useState(user?.motor_year || '');
  const [motorCc, setMotorCc] = useState(user?.motor_cc || '');

  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.avatar ? `${BASE_URL}/uploads/profiles/${user.avatar}` : null
  );

  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData();
    formData.append('id', user.id);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('gender', gender);
    formData.append('birthdate', birthdate);
    formData.append('motor_type', motorType);
    formData.append('motor_year', motorYear);
    formData.append('motor_cc', motorCc);

    if (password) formData.append('password', password);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/customers/profile/update`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert(data.message);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/profile');
        window.location.reload();
      } else {
        alert(data.message || t('update_failed'));
      }
    } catch (err) {
      console.error(err);
      alert(t('network_error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-20 text-slate-700 selection:bg-[#e11d48] selection:text-white relative z-0">

      {/* LUXURY BACKGROUND HEADER ACCENT */}
      <div className="absolute top-0 left-0 right-0 h-[280px] bg-slate-950 overflow-hidden -z-10 rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] bg-gradient-to-bl from-[#e11d48]/30 to-purple-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 w-full h-32 bg-gradient-to-t from-[#f8f9fa] to-transparent opacity-100"></div>
      </div>

      <Container className="max-w-6xl pt-8 sm:pt-10 space-y-6 px-4 sm:px-6">

        {/* BREADCRUMB / BACK BUTTON */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-white transition-all group tracking-widest bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/30 px-4 py-2.5 rounded-2xl shadow-sm active:scale-95 w-max"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-[#e11d48]" />
          <span className="uppercase">{t('back_to_profile') || 'KEMBALI KE PROFIL'}</span>
        </button>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-2">

          {/* ================= SISI KIRI: SIDEBAR NAVIGASI & AVATAR ================= */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">

            {/* Premium Avatar Card */}
            <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e11d48] via-purple-500 to-amber-500 opacity-80"></div>

              <div className="relative z-10 flex flex-col items-center gap-3 w-full">
                <div
                  className="relative cursor-pointer w-28 h-28 rounded-full border-4 border-white shadow-xl ring-4 ring-slate-50 hover:ring-[#e11d48]/20 transition-all duration-500 overflow-hidden flex items-center justify-center bg-slate-100 group/avatar"
                  onClick={() => fileInputRef.current.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                  ) : (
                    <FaUserCircle className="text-slate-300 w-full h-full" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                    <FaCamera size={20} className="text-[#e11d48] mb-1.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Ubah<br/>Foto</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <div className="mt-2 w-full">
                  <h3 className="font-black text-slate-900 text-lg tracking-tight truncate px-2">{name || 'Rider HGI'}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Vertical Navigation Tabs */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-3 shadow-sm flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'personal' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'personal' ? 'bg-slate-800 text-[#e11d48]' : 'bg-white border border-slate-200'}`}>
                  <FaUser size={12} />
                </div>
                {t('tab_personal') || 'Data Pribadi'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('garage')}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'garage' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'garage' ? 'bg-slate-800 text-amber-500' : 'bg-white border border-slate-200'}`}>
                  <FaWrench size={12} />
                </div>
                {t('tab_garage') || 'Garasi Virtual'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'security' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeTab === 'security' ? 'bg-slate-800 text-emerald-500' : 'bg-white border border-slate-200'}`}>
                  <FaShieldAlt size={12} />
                </div>
                {t('tab_security') || 'Keamanan'}
              </button>
            </div>
          </div>

          {/* ================= SISI KANAN: FORM KONTEN DINAMIS ================= */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden min-h-[500px]">
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 space-y-8 flex flex-col h-full justify-between">

                {/* --- TAB 1: PERSONAL INFO --- */}
                {activeTab === 'personal' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="border-b border-slate-100 pb-5">
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                        <span className="w-2 h-2 bg-[#e11d48] rounded-full"></span>
                        {t('tab_personal') || 'Informasi Profil Pribadi'}
                      </h2>
                      <p className="text-[10px] font-medium text-slate-400 mt-1.5 uppercase tracking-widest">Perbarui data dirimu untuk mempermudah proses pengiriman.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="flex flex-col gap-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('fullname_label') || 'Nama Lengkap'}</label>
                        <div className="relative flex items-center group">
                          <FaUser className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={13} />
                          <input type="text" className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-4 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-red-500/10 text-slate-900 font-bold transition-all outline-none" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('email_label') || 'Alamat Email'}</label>
                        <div className="relative flex items-center group">
                          <FaEnvelope className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={13} />
                          <input type="email" className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-4 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-red-500/10 text-slate-700 font-mono font-bold transition-all outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('phone_label') || 'Nomor WhatsApp'}</label>
                        <div className="relative flex items-center group">
                          <FaPhone className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={13} />
                          <input type="text" className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-4 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-red-500/10 text-slate-900 font-mono font-bold transition-all outline-none" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0812XXXXXXXX" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('birthdate_label') || 'Tanggal Lahir'}</label>
                        <div className="relative flex items-center group">
                          <FaCalendarAlt className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={13} />
                          <input type="date" className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-4 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-red-500/10 text-slate-900 font-bold transition-all outline-none" value={birthdate} onChange={e => setBirthdate(e.target.value)} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('gender_label') || 'Jenis Kelamin'}</label>
                        <div className="relative flex items-center group">
                          <FaVenusMars className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={13} />
                          <select className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-4 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-red-500/10 text-slate-900 font-bold transition-all outline-none appearance-none cursor-pointer" value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="">-- Pilih Identitas --</option>
                            <option value="Laki-laki">{t('gender_male') || 'Laki-laki'}</option>
                            <option value="Perempuan">{t('gender_female') || 'Perempuan'}</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('address_label') || 'Alamat Pengiriman Utama'}</label>
                        <div className="relative flex items-start group">
                          <FaMapMarkerAlt className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={13} />
                          <textarea rows="3" className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-4 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-red-500/10 text-slate-800 font-medium transition-all outline-none resize-none leading-relaxed" value={address} onChange={e => setAddress(e.target.value)} placeholder="Detail jalan, nomor rumah, blok, RT/RW, dan kodepos..." />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 2: GARAGE SPECS --- */}
                {activeTab === 'garage' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="border-b border-slate-100 pb-5 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          {t('tab_garage') || 'Spesifikasi Garasi Virtual'}
                        </h2>
                        <p className="text-[10px] font-medium text-slate-400 mt-1.5 uppercase tracking-widest">Digunakan untuk rekomendasi Part Plug & Play.</p>
                      </div>
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-200">Opsional</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('motor_brand_label') || 'Merek Motor'} & Tipe</label>
                        <div className="relative flex items-center group">
                          <FaMotorcycle className="absolute left-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={14} />
                          <input type="text" className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-4 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-slate-900 font-bold transition-all outline-none" value={motorType} onChange={e => setMotorType(e.target.value)} placeholder={t('gl100_placeholder') || 'Contoh: Honda Tiger Revo'} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('motor_year_label') || 'Tahun Produksi'}</label>
                        <input type="number" className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl px-5 py-4 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-slate-900 font-mono font-bold transition-all outline-none" value={motorYear} onChange={e => setMotorYear(e.target.value)} placeholder={t('motor_year_placeholder') || 'Contoh: 2012'} />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('motor_cc_label') || 'Kapasitas Mesin (CC)'}</label>
                        <input type="text" className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl px-5 py-4 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 text-slate-900 font-bold transition-all outline-none" value={motorCc} onChange={e => setMotorCc(e.target.value)} placeholder={t('motor_cc_placeholder') || 'Contoh: 200 CC'} />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 3: SECURITY --- */}
                {activeTab === 'security' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="border-b border-slate-100 pb-5">
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2.5">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        {t('tab_security') || 'Keamanan Akun'}
                      </h2>
                      <p className="text-[10px] font-medium text-slate-400 mt-1.5 uppercase tracking-widest">Ubah kata sandi untuk mengamankan akses akunmu.</p>
                    </div>

                    <div className="flex flex-col gap-2 text-xs">
                      <label className="font-black text-slate-400 uppercase tracking-widest ml-1">{t('password_label') || 'Kata Sandi Baru'}</label>
                      <div className="relative flex items-center group">
                        <FaLock className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={13} />
                        <input type="password" placeholder={t('password_placeholder') || 'Kosongkan jika tidak ingin mengubah sandi'} className="w-full bg-slate-50/50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-4 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-slate-900 font-bold transition-all outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                      </div>
                    </div>

                    <div className="text-[10px] bg-emerald-50/50 border border-emerald-100/80 p-4 rounded-2xl flex items-center gap-2.5 font-medium text-emerald-700 shadow-sm mt-4">
                      <FaCheckCircle className="flex-shrink-0 text-emerald-500" size={16} />
                      <span className="leading-relaxed">{t('security_status') || 'Autentikasi akunmu dilindungi dengan enkripsi mutakhir. Pastikan tidak membagikan kata sandi kepada siapapun.'}</span>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="mt-10 border border-rose-200 bg-rose-50/30 rounded-3xl p-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-400 to-red-600"></div>
                      <h3 className="text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <FaExclamationTriangle size={14} /> {t('danger_zone') || 'Zona Berbahaya'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium mb-5 leading-relaxed max-w-sm">{t('delete_account_desc') || 'Menghapus akun akan menghilangkan seluruh riwayat pesanan, poin HGI, dan voucher secara permanen.'}</p>
                      <button type="button" className="text-[10px] font-black text-rose-600 border-2 border-rose-200 hover:bg-rose-600 hover:border-rose-600 hover:text-white px-5 py-2.5 rounded-xl transition-all tracking-widest uppercase active:scale-95">
                        {t('delete_btn') || 'Hapus Akun Permanen'}
                      </button>
                    </div>
                  </div>
                )}

                {/* AREA TOMBOL SAVE GLOBAL */}
                <div className="pt-8 mt-auto">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto md:float-right bg-[#e11d48] hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-600/30 transition-all flex items-center justify-center gap-2.5 tracking-widest text-[11px] uppercase active:scale-[0.98]"
                  >
                    <FaSave size={14} /> {loading ? t('saving_changes') || 'Menyimpan...' : t('save_account_changes') || 'Simpan Pembaruan'}
                  </button>
                  <div className="clear-both"></div>
                </div>

              </form>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProfileSettings;
