import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle, FaBoxOpen, FaSignOutAlt, FaCogs, FaChevronRight,
  FaMapMarkerAlt, FaArrowLeft, FaCheckCircle, FaShoppingBag,
  FaCommentMedical, FaCoins, FaTicketAlt, FaMotorcycle, FaHeadset, FaStar
} from 'react-icons/fa';
import { Container } from '../components/layout/Container';
import OrderTrackingModal from '../components/tools/OrderTrackingModal';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../context/CurrencyContext';
import { BASE_URL } from "../config/api";

const Profile = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- STATE UNTUK SLIDER BACKGROUND ---
  const [currentBg, setCurrentBg] = useState(0);

  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const localUserData = localStorage.getItem('user');
  const user = localUserData ? JSON.parse(localUserData) : null;
  const activeUserId = user ? user.id : null;

  // --- GAMBAR SLIDESHOW BACKGROUND PREMIUM ---
  const bgImages = [
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2070&auto=format&fit=crop", // Detail Mesin
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop", // Suasana Garasi
    "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=2070&auto=format&fit=crop"  // Siluet Motor Sport
  ];

  // --- EFFECT: LOGIKA AUTO SLIDE (Ganti tiap 5 detik) ---
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [bgImages.length]);

  // --- EFFECT: FETCH RIWAYAT PESANAN ---
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchUserOrders = async () => {
      if (!activeUserId) return setLoadingOrders(false);

      try {
        if (isMounted) setLoadingOrders(true);
        const res = await fetch(`${BASE_URL}/api/transactions/history?user_id=${activeUserId}`, { signal: controller.signal });
        const resData = await res.json();
        if (resData.success && isMounted) setOrders(resData.data || []);
      } catch (error) {
        if (error.name !== 'AbortError') console.error("Gagal memuat riwayat pesanan:", error);
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };

    fetchUserOrders();
    return () => { isMounted = false; controller.abort(); };
  }, [activeUserId]);

  const handleLogout = () => {
    if (confirm(t('logout_confirm') || 'Yakin ingin keluar dari akunmu?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      window.location.reload();
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-sans text-center px-4 bg-slate-50">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full blur-xl opacity-60 animate-pulse"></div>
          <FaUserCircle className="relative text-slate-200 text-7xl bg-white rounded-full shadow-xl" />
        </div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{t('not_logged_in_title') || 'Akses Ditolak'}</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed font-medium">{t('not_logged_in_desc') || 'Silakan masuk ke akunmu terlebih dahulu untuk melihat dashboard profil.'}</p>
        <button onClick={() => navigate('/login')} className="mt-8 bg-slate-900 hover:bg-[#e11d48] text-white font-black text-[11px] px-8 py-4 rounded-2xl shadow-lg hover:shadow-red-500/30 transition-all uppercase tracking-widest active:scale-95">
          {t('login_now_btn') || 'Masuk Sekarang'}
        </button>
      </div>
    );
  }

  const totalSpent = orders.filter(o => o.status === 'Selesai').reduce((acc, curr) => acc + Number(curr.item_subtotal || curr.price || 0), 0);

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-24 text-slate-700 selection:bg-[#e11d48] selection:text-white select-none relative z-0">

      {/* =========================================================
          LUXURY AUTO-SLIDING BACKGROUND
      ========================================================= */}
      <div className="absolute top-0 left-0 right-0 h-[340px] bg-slate-950 overflow-hidden -z-10 rounded-b-[2rem] shadow-2xl">
        {/* Array Gambar dengan Efek Crossfade (Memudar Alus) */}
        {bgImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Garage Background"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentBg ? 'opacity-40' : 'opacity-0'
            }`}
          />
        ))}

        {/* Overlay Gradients supaya UI di depannya tetap terbaca jelas */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-transparent to-[#e11d48]/30 mix-blend-multiply"></div>
        <div className="absolute -left-32 -top-32 w-[500px] h-[500px] bg-[#e11d48]/20 rounded-full blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent opacity-90"></div>
      </div>
      {/* ========================================================= */}

      <Container className="max-w-6xl pt-8 sm:pt-12 space-y-6 px-4 sm:px-6">

        {/* BREADCRUMB / BACK BUTTON */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-white transition-all group tracking-widest bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-white/30 px-4 py-2.5 rounded-2xl shadow-sm active:scale-95 w-max"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform text-[#e11d48]" />
          <span className="uppercase">{t('back_to_home_caps') || 'KEMBALI KE BERANDA'}</span>
        </button>

        {/* ===== 1. SULTAN PROFILE HEADER ===== */}
        <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden group mt-2">

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e11d48] via-purple-500 to-amber-500 opacity-80"></div>

          <div className="relative flex-shrink-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#e11d48] to-amber-400 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-slate-200 to-white shadow-xl z-10">
              {user.avatar ? (
                <img
                  src={`${BASE_URL}/uploads/profiles/${user.avatar}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white"
                />
              ) : (
                <FaUserCircle className="w-full h-full text-slate-200 bg-white rounded-full border-4 border-white" />
              )}
              <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-white shadow-md z-20 ${user.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left z-10 w-full lg:w-auto">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 mb-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{user.name}</h2>
              <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm w-max mx-auto lg:mx-0 ${user.role === 'admin' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-900 border-slate-700 text-white'}`}>
                {user.role === 'admin' ? <FaCogs size={10} /> : <FaStar size={10} className="text-amber-400" />}
                {user.role === 'admin' ? 'Admin System' : 'Verified Member'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs font-mono font-medium text-slate-500">
              <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{user.email}</span>
              <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{user.phone || 'No. HP Belum Disetel'}</span>
            </div>

            <div className="pt-5 flex gap-3 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/profile/settings')}
                className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-[#e11d48] px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/20 active:scale-95 flex items-center gap-2"
              >
                <span>Pengaturan Akun</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white bg-white hover:bg-slate-900 border border-slate-200 hover:border-slate-900 rounded-xl transition-all duration-300 shadow-sm active:scale-95"
                title="Keluar"
              >
                <FaSignOutAlt size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4 z-10 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <div className="bg-white border border-slate-100 p-4 sm:p-5 rounded-2xl shadow-sm min-w-[130px] flex-shrink-0 flex flex-col justify-between group hover:border-amber-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Poin HGI</p>
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FaCoins size={10} /></div>
              </div>
              <h4 className="text-xl font-black font-mono text-slate-800">2,450</h4>
            </div>

            <div className="bg-white border border-slate-100 p-4 sm:p-5 rounded-2xl shadow-sm min-w-[130px] flex-shrink-0 flex flex-col justify-between group hover:border-[#e11d48]/30 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Voucher</p>
                <div className="w-6 h-6 rounded-full bg-red-50 text-[#e11d48] flex items-center justify-center group-hover:scale-110 transition-transform"><FaTicketAlt size={10} /></div>
              </div>
              <h4 className="text-xl font-black font-mono text-slate-800">3 <span className="text-xs text-slate-400 font-sans tracking-normal font-bold">Aktif</span></h4>
            </div>
          </div>
        </div>

        {/* ===== 2. MAIN CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-2">

          {/* ====== KOLOM KIRI: WIDGETS ====== */}
          <div className="lg:col-span-4 space-y-6">

            {/* DARK MODE VIRTUAL GARAGE WIDGET */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-slate-800 to-transparent rounded-bl-full opacity-50"></div>
              <FaMotorcycle className="absolute -right-2 -bottom-2 text-slate-800/80 text-7xl transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-slate-900 bg-[#e11d48] px-2.5 py-1 rounded-md uppercase tracking-widest shadow-md shadow-red-500/20">
                    Garasi Virtual
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>

                {user.motor_type ? (
                  <div className="space-y-1 mt-2">
                    <h3 className="text-xl font-black text-white tracking-tight">{user.motor_type}</h3>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Kapasitas</span>
                        <span className="text-xs text-white font-mono font-bold">{user.motor_cc || '?'} CC</span>
                      </div>
                      <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Tahun</span>
                        <span className="text-xs text-white font-mono font-bold">{user.motor_year || '?'}</span>
                      </div>
                    </div>
                    <button onClick={() => navigate('/profile/settings')} className="mt-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-1 group/btn">
                      Sesuaikan Data <FaChevronRight size={8} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs text-slate-400 font-medium mb-5 leading-relaxed pr-6">Sinkronisasi data motor untuk mendapatkan rekomendasi part Plug & Play otomatis.</p>
                    <button
                      onClick={() => navigate('/profile/settings')}
                      className="w-full bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-slate-100 transition-colors shadow-lg active:scale-95"
                    >
                      + Tambah Motor
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ELEGANT NAVIGATION MENU */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-3 shadow-sm">
              <div className="px-4 pt-3 pb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Akun</span>
              </div>

              <div className="space-y-1">
                <div onClick={() => navigate('/cart')} className="flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
                      <FaShoppingBag className="text-slate-400 group-hover:text-slate-700" size={12} />
                    </div>
                    Keranjang Belanja
                  </div>
                  <FaChevronRight className="text-slate-300 group-hover:text-slate-500 text-[10px]" />
                </div>

                <div onClick={() => { orders.length > 0 ? setSelectedOrder({ ...orders[0], id: orders[0].order_id || orders[0].id }) : alert(t('no_active_orders_alert')); }} className="flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
                      <FaBoxOpen className="text-slate-400 group-hover:text-slate-700" size={12} />
                    </div>
                    Lacak Pesanan Terakhir
                  </div>
                  <FaChevronRight className="text-slate-300 group-hover:text-slate-500 text-[10px]" />
                </div>

                <div onClick={() => navigate('/profile/reviews-history')} className="flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
                      <FaCommentMedical className="text-slate-400 group-hover:text-slate-700" size={12} />
                    </div>
                    Riwayat Ulasan Part
                  </div>
                  <FaChevronRight className="text-slate-300 group-hover:text-slate-500 text-[10px]" />
                </div>

                <div className="flex items-center justify-between p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:border-slate-200 group-hover:shadow-sm transition-all">
                      <FaHeadset className="text-slate-400 group-hover:text-slate-700" size={12} />
                    </div>
                    Bantuan Mekanik
                  </div>
                  <FaChevronRight className="text-slate-300 group-hover:text-slate-500 text-[10px]" />
                </div>

                {user.role === 'admin' && (
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <div onClick={() => navigate('/admin')} className="flex items-center justify-between p-3.5 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100/50 border border-amber-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                          <FaCogs className="text-amber-500" size={12} />
                        </div>
                        Dashboard Admin
                      </div>
                      <FaChevronRight className="text-amber-400 text-[10px]" />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ====== KOLOM KANAN: RIWAYAT TRANSAKSI ====== */}
          <div className="lg:col-span-8 space-y-4">

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#e11d48] rounded-full"></span>
                  Riwayat Belanja
                </h3>
                <p className="text-[10px] font-medium text-slate-400 mt-1">Pantau status pengiriman komponen pesananmu di sini.</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Dibelanjakan</p>
                <p className="text-lg font-black text-slate-800 font-mono tracking-tight">{formatPrice(totalSpent)}</p>
              </div>
            </div>

            {loadingOrders ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-white border border-slate-100 rounded-[1.5rem] w-full"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center py-20 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-3xl mb-4 shadow-inner">
                  <FaBoxOpen />
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Belum Ada Transaksi</h4>
                <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">Garasi belanjamu masih kosong. Ayo cari part modifikasi pertamamu sekarang!</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-6 text-[10px] font-black text-white bg-slate-900 hover:bg-[#e11d48] uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg hover:shadow-red-500/20 transition-all active:scale-95"
                >
                  Jelajahi Katalog Part
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((item, index) => {
                  const itemPrice = Number(item.item_subtotal || item.price || 0);
                  const isDone = item.status === 'Selesai';
                  const isShipping = item.status === 'Pengiriman';

                  return (
                    <div
                      key={`${item.order_id}-${item.product_id || index}`}
                      className="bg-white border border-slate-100 rounded-[1.5rem] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-200 transition-all duration-300 group"
                    >
                      {/* Produk Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-100/80 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 relative group-hover:scale-105 transition-transform duration-300">
                        {item.product_image || item.image ? (
                          <img
                            src={`${BASE_URL}/uploads/products/${item.product_image || item.image}`}
                            alt=""
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 font-mono">HGI</span>
                        )}
                      </div>

                      {/* Detail Transaksi */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-mono font-black text-slate-500 text-[9px] tracking-widest bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                            #{item.order_number}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${isDone ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : isShipping ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                            {item.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-[#e11d48] transition-colors mb-2">
                          {item.product_name || 'Komponen Sparepart'}
                        </h4>

                        <div className="flex items-end gap-3 text-[10px]">
                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">Kuantitas</p>
                            <p className="font-black text-slate-700 font-mono">{item.quantity || 1} Pcs</p>
                          </div>
                          <div className="w-px h-6 bg-slate-100"></div>
                          <div>
                            <p className="text-slate-400 font-medium mb-0.5">Subtotal</p>
                            <p className="font-black text-[#e11d48] font-mono tracking-tight">{formatPrice(itemPrice)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Aksi Kanan */}
                      <div className="w-full sm:w-auto flex-shrink-0 pt-3 sm:pt-0 border-t border-slate-50 sm:border-t-0 mt-2 sm:mt-0">
                        {isDone ? (
                          <button
                            onClick={() => navigate('/profile/reviews-history')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:border-emerald-200 transition-all shadow-sm active:scale-95"
                          >
                            <FaCheckCircle size={12} className={isDone ? "text-emerald-500" : ""} />
                            Beri Ulasan
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedOrder({ ...item, id: item.order_id })}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-[#e11d48] text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95"
                          >
                            <FaMapMarkerAlt size={11} /> Lacak Kurir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </Container>

      {/* MODAL LACAK PESANAN */}
      {selectedOrder && (
        <OrderTrackingModal
          order={selectedOrder}
          close={() => setSelectedOrder(null)}
          onOrderStatusUpdate={(orderId, newStatus) => {
            setOrders(prevOrders =>
              prevOrders.map(ord => ord.order_id === orderId ? { ...ord, status: newStatus } : ord)
            );
          }}
        />
      )}
    </div>
  );
};

export default Profile;
