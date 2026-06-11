import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle, FaBoxOpen, FaSignOutAlt, FaCogs, FaChevronRight,
  FaMapMarkerAlt, FaArrowLeft, FaCheckCircle, FaShoppingBag,
  FaCommentMedical, FaCoins, FaTicketAlt, FaMotorcycle, FaHeadset
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

  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const localUserData = localStorage.getItem('user');
  const user = localUserData ? JSON.parse(localUserData) : null;
  const activeUserId = user ? user.id : null;

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
    if (confirm(t('logout_confirm'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      window.location.reload();
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-sans text-center px-4">
        <FaUserCircle className="text-slate-300 text-6xl mb-3 animate-pulse" />
        <h3 className="text-base font-black text-[#0f172a] uppercase tracking-tight">{t('not_logged_in_title')}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">{t('not_logged_in_desc')}</p>
        <button onClick={() => navigate('/login')} className="mt-5 bg-[#e11d48] hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-red-100 transition-all uppercase tracking-widest active:scale-95">
          {t('login_now_btn')}
        </button>
      </div>
    );
  }

  const totalSpent = orders.filter(o => o.status === 'Selesai').reduce((acc, curr) => acc + Number(curr.item_subtotal || curr.price || 0), 0);

  return (
    <div className="bg-slate-50/60 min-h-screen font-sans pb-24 text-slate-700 selection:bg-[#e11d48] selection:text-white select-none">

      {/* Background Aksen Garasi Premium */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-slate-900 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-[#e11d48]/20 rounded-full blur-[100px]"></div>
      </div>

      <Container className="max-w-5xl pt-8 sm:pt-10 space-y-5 px-4 sm:px-6">

        {/* TOMBOL KEMBALI */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] font-black text-slate-300 hover:text-white transition-all group tracking-widest bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl shadow-sm active:scale-95 w-max"
        >
          <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform text-[#e11d48]" />
          <span className="hidden xs:inline">{t('back_to_home_caps')}</span>
          <span className="xs:hidden">Back</span>
        </button>

        {/* ===== 1. HEADER KARTU SULTAN ===== */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row items-center gap-6 sm:gap-8 text-center lg:text-left relative overflow-hidden">

          {/* Avatar */}
          <div className="relative flex-shrink-0 z-10 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#e11d48] to-purple-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
            {user.avatar ? (
              <img
                src={`${BASE_URL}/uploads/profiles/${user.avatar}`}
                alt="Profile"
                className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-lg z-10"
              />
            ) : (
              <FaUserCircle className="relative text-slate-300 bg-white rounded-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-4 border-white shadow-lg z-10" />
            )}
            <span className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-md z-20 ${user.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </div>

          {/* Info User */}
          <div className="flex-1 space-y-2 z-10 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center lg:justify-start">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">{user.name}</h2>
              <span className={`inline-block self-center sm:self-auto px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${user.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-transparent'}`}>
                {user.role === 'admin' ? 'Admin System' : 'VIP Pro Member'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono font-medium break-all sm:break-normal">
              {user.email}
              <span className="hidden sm:inline"> • {user.phone || 'No. HP Belum Disetel'}</span>
            </p>
            <p className="sm:hidden text-[11px] text-slate-400 font-mono">{user.phone || 'No. HP Belum Disetel'}</p>

            <div className="pt-3 flex gap-2 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/profile/settings')}
                className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                ⚙️ {t('profile_settings_btn')}
              </button>
              <button
                onClick={handleLogout}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <FaSignOutAlt size={12} />
              </button>
            </div>
          </div>

          {/* Panel Statistik */}
          <div className="flex gap-3 sm:gap-4 z-10 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none snap-x snap-mandatory lg:snap-none">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-orange-500/20 min-w-[100px] sm:min-w-[120px] flex-shrink-0 snap-start">
              <FaCoins className="mb-1.5 sm:mb-2 opacity-80" size={16} />
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-90">{t('hgi_points')}</p>
              <h4 className="text-lg sm:text-xl font-black font-mono mt-0.5 sm:mt-1">2,450</h4>
            </div>
            <div className="bg-gradient-to-br from-[#e11d48] to-rose-600 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-rose-500/20 min-w-[100px] sm:min-w-[120px] flex-shrink-0 snap-start">
              <FaTicketAlt className="mb-1.5 sm:mb-2 opacity-80" size={16} />
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-90">{t('active_vouchers')}</p>
              <h4 className="text-lg sm:text-xl font-black font-mono mt-0.5 sm:mt-1">3 {t('vouchers_available')}</h4>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-blue-500/20 min-w-[120px] sm:min-w-[140px] flex-shrink-0 snap-start">
              <FaShoppingBag className="mb-1.5 sm:mb-2 opacity-80" size={16} />
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-90">{t('total_transactions')}</p>
              <h4 className="text-xs sm:text-sm font-black font-mono mt-0.5 sm:mt-1 pt-0.5 sm:pt-1.5">{formatPrice(totalSpent)}</h4>
            </div>
          </div>
        </div>

        {/* ===== 2. GRID KONTEN UTAMA ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">

          {/* ====== KOLOM KIRI: WIDGET & NAVIGASI ====== */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6">

            {/* Widget Garasi Virtual */}
            <div className="bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-0"></div>
              <FaMotorcycle className="absolute right-4 top-4 text-slate-100 text-5xl -z-0 group-hover:scale-110 transition-transform" />

              <div className="relative z-10">
                <span className="text-[10px] font-black text-[#e11d48] bg-red-50 px-2.5 py-1 rounded-md uppercase tracking-widest block w-max mb-3">
                  {t('virtual_garage')}
                </span>
                {user.motor_type ? (
                  <>
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">{user.motor_type}</h3>
                    <p className="text-[10px] text-slate-400 font-mono font-bold mt-1">CC: {user.motor_cc || '?'} | Tahun: {user.motor_year || '?'}</p>
                    <button className="mt-4 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 border-b-2 border-slate-200 hover:border-slate-800 pb-0.5 transition-colors">
                      Edit Spesifikasi →
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-400 font-medium mb-4 leading-relaxed">Daftarkan motor modifikasimu untuk rekomendasi sparepart PNP.</p>
                    <button
                      onClick={() => navigate('/profile/settings')}
                      className="w-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      {t('add_motorcycle_btn')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Menu Navigasi Toko */}
            <div className="bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 sm:px-2.5 block mb-3">{t('store_activity')}</span>

              <div
                onClick={() => navigate('/cart')}
                className="flex items-center justify-between p-3 sm:p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <FaShoppingBag className="text-slate-400 group-hover:text-[#e11d48] flex-shrink-0" size={14} />
                  {t('shopping_cart')}
                </span>
                <FaChevronRight className="text-slate-300 group-hover:text-slate-500 text-[10px] flex-shrink-0" />
              </div>

              <div
                onClick={() => { orders.length > 0 ? setSelectedOrder({ ...orders[0], id: orders[0].order_id || orders[0].id }) : alert(t('no_active_orders_alert')); }}
                className="flex items-center justify-between p-3 sm:p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <FaBoxOpen className="text-slate-400 group-hover:text-[#e11d48] flex-shrink-0" size={14} />
                  {t('track_latest_order')}
                </span>
                <FaChevronRight className="text-slate-300 group-hover:text-slate-500 text-[10px] flex-shrink-0" />
              </div>

              <div
                onClick={() => navigate('/profile/reviews-history')}
                className="flex items-center justify-between p-3 sm:p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group border-t border-slate-100 pt-3 mt-1"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <FaCommentMedical className="text-slate-400 group-hover:text-[#e11d48] flex-shrink-0" size={14} />
                  {t('my_review_history')}
                </span>
                <FaChevronRight className="text-slate-300 group-hover:text-slate-500 text-[10px] flex-shrink-0" />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group">
                <span className="flex items-center gap-2 sm:gap-3">
                  <FaHeadset className="text-slate-400 group-hover:text-[#e11d48] flex-shrink-0" size={14} />
                  {t('mechanic_support')}
                </span>
                <FaChevronRight className="text-slate-300 group-hover:text-slate-500 text-[10px] flex-shrink-0" />
              </div>

              {user.role === 'admin' && (
                <div
                  onClick={() => navigate('/admin')}
                  className="flex items-center justify-between p-3 sm:p-3.5 text-xs font-bold text-amber-600 hover:bg-amber-50/50 rounded-xl cursor-pointer transition-colors group border-t border-dashed border-slate-200 mt-2 pt-4"
                >
                  <span className="flex items-center gap-2 sm:gap-3">
                    <FaCogs className="text-amber-500 flex-shrink-0" size={14} />
                    {t('admin_dashboard')}
                  </span>
                  <FaChevronRight className="text-amber-400 text-[10px] flex-shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* ====== KOLOM KANAN: RIWAYAT BELANJA ====== */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-sm space-y-5 sm:space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#e11d48] rounded-full flex-shrink-0"></span>
              <span>📦 {t('your_transaction_history')}</span>
            </h3>

            {loadingOrders ? (
              <div className="space-y-4 py-4 animate-pulse">
                <div className="h-24 bg-slate-50 border border-slate-100 rounded-2xl w-full"></div>
                <div className="h-24 bg-slate-50 border border-slate-100 rounded-2xl w-full"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 sm:py-16 text-slate-400 gap-3">
                <div className="p-5 sm:p-6 bg-slate-50 rounded-full text-slate-300 text-3xl border border-slate-100 shadow-inner">
                  <FaBoxOpen />
                </div>
                <p className="text-sm font-black text-slate-800 mt-2 uppercase tracking-tight">{t('no_transaction_title')}</p>
                <p className="text-xs text-slate-400 max-w-sm text-center leading-relaxed px-4">{t('no_transaction_desc')}</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 text-xs font-black text-white bg-[#e11d48] hover:bg-red-700 uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {t('start_shopping_parts')}
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {orders.map((item, index) => {
                  const itemPrice = Number(item.item_subtotal || item.price || 0);
                  return (
                    <div
                      key={`${item.order_id}-${item.product_id || index}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white border border-slate-100 rounded-2xl gap-4 sm:gap-5 text-xs hover:border-[#e11d48]/40 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 group"
                    >
                      {/* Info Produk */}
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Gambar Produk */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 p-1.5 flex items-center justify-center relative shadow-inner group-hover:border-slate-200 transition-colors">
                          {item.product_image || item.image ? (
                            <img
                              src={`${BASE_URL}/uploads/products/${item.product_image || item.image}`}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-[10px] font-black text-slate-300 font-mono">HGI</span>
                          )}
                        </div>

                        {/* Detail */}
                        <div className="min-w-0 space-y-1 sm:space-y-1.5 flex-1">
                          {/* Badge Order & Status */}
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="font-mono font-black text-slate-900 text-[10px] sm:text-[11px] tracking-tight bg-slate-100 px-2 py-0.5 rounded">
                              {item.order_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-wider ${item.status === 'Selesai' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : item.status === 'Pengiriman' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Nama Produk */}
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate group-hover:text-[#e11d48] transition-colors pr-2">
                            {item.product_name || t('fallback_part_name')}
                          </h4>

                          {/* Qty & Subtotal */}
                          <p className="text-[10px] text-slate-500 font-medium pt-0.5 flex flex-wrap items-center gap-x-1">
                            <span>{t('quantity')}:</span>
                            <span className="font-bold text-slate-800 font-mono">{item.quantity || 1} Pcs</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span>{t('subtotal')}:</span>
                            <span className="font-black font-mono text-[#e11d48] text-[11px] sm:text-xs">{formatPrice(itemPrice)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Tombol Aksi */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        {item.status === 'Selesai' ? (
                          <button
                            onClick={() => navigate('/profile/reviews-history')}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-black text-[10px] uppercase tracking-wider border border-slate-200 hover:border-emerald-200 transition-all active:scale-95 shadow-sm"
                          >
                            <FaCheckCircle className="text-emerald-500" size={13} />
                            {t('manage_part_review')}
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedOrder({ ...item, id: item.order_id })}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-[#e11d48] text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-95"
                          >
                            <FaMapMarkerAlt size={13} />
                            {t('track_courier_map')}
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
