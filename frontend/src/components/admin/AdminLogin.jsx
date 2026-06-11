import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal melakukan login');
      }

      // Jika sukses, simpan token keamanan dan data admin di localStorage browser
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));

      // Tendang admin masuk ke halaman dashboard utama
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans antialiased">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/40">

        {/* Header Form */}
        <div className="text-center mb-8">
          <div className="text-2xl font-heading font-extrabold text-[#e11d48] tracking-tighter uppercase">
            MOTO<span className="text-white">PART</span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 uppercase tracking-wider font-semibold">
            Control Panel Login
          </p>
        </div>

        {/* Notifikasi Eror Jikalau Gagal */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2 mb-6">
            <FaExclamationCircle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Input Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Admin</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-[#e11d48] transition-colors gap-3">
              <FaEnvelope className="text-slate-500 text-sm" />
              <input
                type="email"
                placeholder="masukkan email resmi..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full outline-none text-sm text-white placeholder-slate-600"
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Kata Sandi</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-[#e11d48] transition-colors gap-3">
              <FaLock className="text-slate-500 text-sm" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent w-full outline-none text-sm text-white placeholder-slate-700"
                required
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e11d48] hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Memvalidasi Akun...' : 'MASUK SEKARANG'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
