import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCogs, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../config/api";

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 🛡️ SESSION GUARD
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Tampilkan pesan sukses sebentar lalu redirect
        alert(data.message);
        navigate('/login');
      } else {
        setErrorMsg(data.message || t('register_failed'));
      }
    } catch {
      setErrorMsg(t('auth_conn_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4 relative overflow-hidden selection:bg-[#e11d48] selection:text-white">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] w-full max-w-md space-y-8 relative z-10">

        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-1.5 text-3xl font-black text-[#0f172a] tracking-tighter mb-2">
            <FaCogs className="text-[#e11d48]" /> MOTO<span className="text-[#e11d48] italic">PART</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">{t('register_title')}</h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed px-4">{t('register_subtitle')}</p>
        </div>

        {/* Notifikasi Error Inline */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium animate-fadeIn shadow-sm">
            <FaExclamationTriangle size={14} className="flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">

          <div className="flex flex-col gap-1.5">
            <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('fullname_label')}</label>
            <div className="relative flex items-center group">
              <FaUser className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={14} />
              <input
                type="text"
                placeholder="Nama"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#e11d48] focus:bg-white text-xs text-slate-800 font-medium transition-all shadow-sm focus:ring-4 focus:ring-[#e11d48]/5"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('email_label')}</label>
            <div className="relative flex items-center group">
              <FaEnvelope className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={14} />
              <input
                type="email"
                placeholder="nama@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-[#e11d48] focus:bg-white text-xs text-slate-800 font-medium transition-all shadow-sm focus:ring-4 focus:ring-[#e11d48]/5"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-black text-slate-400 uppercase tracking-wider ml-1">{t('password_label')}</label>
            <div className="relative flex items-center group">
              <FaLock className="absolute left-4 text-slate-400 group-focus-within:text-[#e11d48] transition-colors" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-3.5 outline-none focus:border-[#e11d48] focus:bg-white text-xs text-slate-800 font-medium transition-all shadow-sm focus:ring-4 focus:ring-[#e11d48]/5"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f172a] hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black py-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-slate-500/30 transition-all active:scale-[0.98] tracking-widest uppercase mt-2 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2"><FaCogs className="animate-spin" /> {t('processing_btn')}</span>
            ) : t('register_btn')}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            {t('has_account_text')} <span onClick={() => navigate('/login')} className="text-[#e11d48] font-black cursor-pointer hover:underline transition-all">{t('login_link')}</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
