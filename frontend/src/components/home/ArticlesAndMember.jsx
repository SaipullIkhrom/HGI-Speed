import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../layout/Container';
import { FaChevronRight, FaAward, FaRegCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

const ArticlesAndMember = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // 1. Ambil data autentikasi user dari localStorage secara konsisten & aman
  const localUserData = localStorage.getItem('user');
  const user = localUserData ? JSON.parse(localUserData) : null;
  const activeUserId = user ? user.id : null;

  // 2. State Management HGI SPEED
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState({ totalOrders: 0, isEligible: false });
  const [userRole, setUserRole] = useState(user?.role || 'customer');

  useEffect(() => {
    // Bangun pembatal jaringan otomatis untuk mencegah memory leak saat unmount
    const controller = new AbortController();
    const signal = controller.signal;

    // 1. Ambil Data Jurnal/Artikel Edukasi
    const fetchArticles = async () => {
      try {
       const res = await fetch(`${BASE_URL}/api/articles?limit=2`, { signal });
        const resData = await res.json();
        if (resData.success && !signal.aborted) {
          setArticles(resData.data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Gagal memuat artikel ke homepage:", err);
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    // 2. Ambil Data Hitungan Transaksi Selesai via customerController
    const fetchMemberStatus = async () => {
      if (!activeUserId) return;
      try {
        const res = await fetch(`${BASE_URL}/api/members/check?userId=${activeUserId}`, { signal });
        const resData = await res.json();
        if (resData.success && !signal.aborted) {
          setEligibility({
            totalOrders: resData.totalOrders || 0,
            isEligible: resData.isEligible || false
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Gagal memuat status kelayakan member:", err);
        }
      }
    };

    fetchArticles();
    fetchMemberStatus();

    return () => {
      controller.abort(); // Potong koneksi fetch detik itu juga saat pindah rute!
    };
  }, [activeUserId]);

  // 🛠️ Fungsi Aksi Klik Tombol Klaim Kartu Member VIP
  const handleRegisterMember = async () => {
    if (!activeUserId) {
      alert(t('login_first_member'));
      return;
    }

    if (!eligibility.isEligible) return;

    try {
      const res = await fetch(`${BASE_URL}/api/members/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: activeUserId })
      });
      const resData = await res.json();

      if (resData.success) {
        alert(t('member_success'));

        // Perbarui data lokal agar persist saat di-refresh browser
        const updatedUser = { ...user, role: 'member' };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setUserRole('member'); // Ubah status secara instan di UI
      } else {
        alert(resData.message);
      }
    } catch (err) {
      console.error("Gagal memproses pendaftaran member:", err);
      alert(t('network_error'));
    }
  };

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-900 relative overflow-hidden text-slate-200">
      {/* Efek Cahaya Latar Samar / Ambient Light */}
      <div className="absolute left-[-10%] top-[-10%] w-[40rem] h-[40rem] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* SISI KIRI: ARTIKEL & JURNAL EDUKASI */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-end mb-8 border-b border-slate-900 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-4 bg-[#e11d48] rounded-full"></div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {t('research_edu')}
                    </h3>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">
                    {t('journal_title')} HGI SPEED
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/articles')} // Integrasi navigasi rute lengkap
                  className="group text-[11px] font-black text-slate-400 hover:text-white flex items-center gap-1.5 transition-all uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl shadow-md"
                >
                  {t('see_all')} <FaChevronRight size={7} className="group-hover:translate-x-0.5 transition-transform text-[#e11d48]" />
                </button>
              </div>

              {/* INDIKATOR LOADING SKELETON GAYA DARK MODE */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="animate-pulse bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl h-72"></div>
                  <div className="animate-pulse bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl h-72"></div>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-500 italic font-mono">{t('no_articles')}</p>
                </div>
              ) : (
                /* GRID DATA DINAMIS DARI DATABASE */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => navigate(`/articles/${art.id}`)} // Arahkan ke detail pembacaan artikel
                      className="flex flex-col bg-slate-900/30 border border-slate-900 p-4 rounded-2xl hover:border-slate-800 hover:bg-slate-900/60 hover:shadow-xl transition-all duration-300 cursor-pointer group relative"
                    >
                      {/* Frame Gambar Indikator Backend */}
                      <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-900 relative mb-4">
                        <img
                          src={art.image ? `${BASE_URL}/uploads/articles/${art.image}` : 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23'}
                          alt={art.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-95 group-hover:brightness-110"
                        />
                        <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[9px] font-black uppercase text-amber-400 px-2.5 py-1 rounded-lg tracking-wider shadow-md">
                          {art.category || 'Mekanikal'}
                        </span>
                      </div>

                      <div className="flex flex-col justify-between flex-grow">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold font-mono uppercase">
                            <FaRegCalendarAlt size={10} className="text-[#e11d48]" />
                            <span>{new Date(art.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors line-clamp-2 leading-snug tracking-tight">
                            {art.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-black text-[#e11d48] mt-4 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-4px] group-hover:translate-x-0">
                          {t('read_article')} <FaArrowRight size={8} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SISI KANAN: BANNER GABUNG MEMBER (VIP RACING LOOK) */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 h-full flex flex-col justify-between relative overflow-hidden group shadow-2xl border border-slate-800/80 backdrop-blur-md">
              {/* Ornamen siluet cahaya sirkuit */}
              <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-gradient-to-tr from-[#e11d48]/10 to-transparent rounded-full group-hover:scale-125 transition-transform duration-700 blur-xl"></div>
              <div className="absolute -left-12 -top-12 w-32 h-32 bg-red-600/5 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="w-11 h-11 bg-gradient-to-br from-[#e11d48] to-red-700 rounded-xl flex items-center justify-center text-lg text-white mb-6 shadow-lg shadow-red-950/40 border border-red-500/20">
                  <FaAward className="animate-pulse text-sm" />
                </div>

                <span className="text-[9px] font-black uppercase tracking-widest text-[#e11d48] bg-red-950/40 border border-red-900/30 px-2.5 py-1 rounded-md">
                  {t('vip_benefits')}
                </span>

                <h3 className="text-xl font-black tracking-tight mt-4 mb-2.5 uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  {t('join_member')} <br />HGI <span className="text-[#e11d48]">SPEED</span>
                </h3>

                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  {t('member_desc')}
                </p>
              </div>

              {/* LOGIKA INTERAKTIF PROGRESS BAR & ACTION BUTTON */}
              <div className="relative z-10 mt-8 space-y-3">
                {userRole === 'member' || userRole === 'admin' ? (
                  <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center py-3.5 rounded-xl text-xs font-black tracking-wider uppercase">
                    {t('your_account')} {userRole === 'admin' ? t('admin_bypass') : t('vip_member')}
                  </div>
                ) : (
                  <>
                    {/* Progress Transaksi Menuju Angka 50 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
                        <span>{t('transaction_progress')}</span>
                        <span>{eligibility.totalOrders} / 50</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-[#e11d48] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((eligibility.totalOrders / 50) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={handleRegisterMember}
                      disabled={!eligibility.isEligible}
                      className={`w-full text-white text-xs font-black py-3.5 rounded-xl transition-all shadow-xl uppercase tracking-widest ${
                        eligibility.isEligible
                          ? 'bg-[#e11d48] hover:bg-red-700 active:scale-[0.98] shadow-red-950/30'
                          : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800/60 shadow-none'
                      }`}
                    >
                      {eligibility.isEligible ? t('claim_vip') : t('member_locked')}
                    </button>
                  </>
                )}
                <p className="text-[9px] text-center text-slate-500 font-medium font-mono">
                  {userRole === 'member' || userRole === 'admin'
                    ? t('benefit_active')
                    : t('finish_shopping_to_unlock')}
                </p>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};


export default ArticlesAndMember;
