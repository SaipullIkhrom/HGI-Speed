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
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'garage', 'security'

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
  if (avatarFile) formData.append('avatar', avatarFile); // Mengirim file gambar mentah 📸

  try {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/api/customers/profile/update`, {
      method: 'PUT',
      body: formData // Kirim body berupa objek FormData (tanpa header Content-Type JSON)
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
    <div className="bg-slate-50/60 min-h-screen font-sans pb-16 pt-8 text-slate-700 selection:bg-[#e11d48] selection:text-white">
      <Container className="max-w-5xl space-y-6">

        {/* Tombol Kembali */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-slate-900 transition-all group tracking-widest bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 w-max"
        >
          <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform text-[#e11d48]" />
          {t('back_to_profile')}
        </button>

        {/* BUNGKUSAN UTAMA: GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

          {/* ================= SISI KIRI: SIDEBAR NAVIGASI & AVATAR ================= */}
          <div className="md:col-span-1 space-y-4">

            {/* Kartu Profil Mini (Avatar) */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e11d48] to-purple-600"></div>

              <div className="relative z-10 flex flex-col items-center gap-2 group/avatar mt-2">
                <div
                  className="relative cursor-pointer w-24 h-24 rounded-full border-4 border-white shadow-xl ring-2 ring-slate-100 group-hover/avatar:ring-[#e11d48] transition-all duration-300 overflow-hidden flex items-center justify-center bg-slate-100"
                  onClick={() => fileInputRef.current.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                  ) : (
                    <FaUserCircle className="text-slate-300 w-full h-full" />
                  )}
                  <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                    <FaCamera size={16} className="text-[#e11d48] mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{t('change_avatar')}</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              <h3 className="font-black text-slate-800 text-sm mt-3 tracking-tight">{name || 'Rider HGI'}</h3>
              <p className="text-[10px] font-bold font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 mt-1">{user.role}</p>
            </div>

            {/* Menu Tab Vertikal */}
            <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'personal' ? 'bg-[#e11d48] text-white shadow-md shadow-red-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <FaUser size={14} /> {t('tab_personal')}
              </button>
              <button
                onClick={() => setActiveTab('garage')}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'garage' ? 'bg-[#e11d48] text-white shadow-md shadow-red-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <FaWrench size={14} /> {t('tab_garage')}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <FaShieldAlt size={14} /> {t('tab_security')}
              </button>
            </div>
          </div>

          {/* ================= SISI KANAN: FORM KONTEN DINAMIS ================= */}
          <div className="md:col-span-3">
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

                {/* --- TAB 1: PERSONAL INFO --- */}
                {activeTab === 'personal' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <FaUser className="text-[#e11d48]" /> {t('tab_personal')}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('fullname_label')}</label>
                        <div className="relative flex items-center group">
                          <FaUser className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48]" size={12} />
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-800 font-bold transition-all outline-none" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('email_label')}</label>
                        <div className="relative flex items-center group">
                          <FaEnvelope className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48]" size={12} />
                          <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-600 font-mono font-bold transition-all outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('phone_label')}</label>
                        <div className="relative flex items-center group">
                          <FaPhone className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48]" size={12} />
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-800 font-mono font-bold transition-all outline-none" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0812XXXXXXXX" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('birthdate_label')}</label>
                        <div className="relative flex items-center group">
                          <FaCalendarAlt className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48]" size={12} />
                          <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-800 font-bold transition-all outline-none" value={birthdate} onChange={e => setBirthdate(e.target.value)} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('gender_label')}</label>
                        <div className="relative flex items-center group">
                          <FaVenusMars className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48]" size={12} />
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-800 font-bold transition-all outline-none appearance-none cursor-pointer" value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="">-- Pilih --</option>
                            <option value="Laki-laki">{t('gender_male')}</option>
                            <option value="Perempuan">{t('gender_female')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('address_label')}</label>
                        <div className="relative flex items-start group">
                          <FaMapMarkerAlt className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#e11d48]" size={12} />
                          <textarea rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-800 font-medium transition-all outline-none resize-none" value={address} onChange={e => setAddress(e.target.value)} placeholder="Detail jalan, nomor rumah, RT/RW..." />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 2: GARAGE SPECS --- */}
                {activeTab === 'garage' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                      <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <FaWrench className="text-[#e11d48]" /> {t('tab_garage')}
                      </h2>
                      <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Opsional</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('motor_brand_label')} & Tipe</label>
                        <div className="relative flex items-center group">
                          <FaMotorcycle className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48]" size={14} />
                          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-800 font-bold transition-all outline-none" value={motorType} onChange={e => setMotorType(e.target.value)} placeholder={t('gl100_placeholder')} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('motor_year_label')}</label>
                        <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-800 font-mono font-bold transition-all outline-none" value={motorYear} onChange={e => setMotorYear(e.target.value)} placeholder={t('motor_year_placeholder')} />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('motor_cc_label')}</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:border-[#e11d48] focus:bg-white text-slate-800 font-bold transition-all outline-none" value={motorCc} onChange={e => setMotorCc(e.target.value)} placeholder={t('motor_cc_placeholder')} />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 3: SECURITY --- */}
                {activeTab === 'security' && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <FaShieldAlt className="text-slate-900" /> {t('tab_security')}
                      </h2>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('password_label')}</label>
                      <div className="relative flex items-center group">
                        <FaLock className="absolute left-4 text-slate-400 group-focus-within:text-slate-900" size={12} />
                        <input type="password" placeholder={t('password_placeholder')} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 focus:border-slate-900 focus:bg-white text-slate-800 font-bold transition-all outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                      </div>
                    </div>

                    <div className="text-[10px] bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center gap-2 font-medium text-emerald-600 shadow-sm">
                      <FaCheckCircle className="flex-shrink-0" size={14} />
                      <span>{t('security_status')}</span>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="mt-8 border border-red-200 bg-red-50/30 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                      <h3 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-1">
                        <FaExclamationTriangle /> {t('danger_zone')}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium mb-4">{t('delete_account_desc')}</p>
                      <button type="button" className="text-[10px] font-black text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition-all tracking-widest uppercase">
                        {t('delete_btn')}
                      </button>
                    </div>
                  </div>
                )}

                {/* AREA TOMBOL SAVE GLOBAL */}
                <div className="pt-6 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto md:float-right bg-[#e11d48] hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black px-8 py-3.5 rounded-xl shadow-md shadow-red-100 hover:shadow-xl hover:shadow-red-200/50 transition-all flex items-center justify-center gap-2 tracking-widest text-[10px] uppercase active:scale-[0.98]"
                  >
                    <FaSave size={14} /> {loading ? t('saving_changes') : t('save_account_changes')}
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
