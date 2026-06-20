import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTimes, FaClock, FaCheckCircle, FaShoppingBag,
  FaCommentMedical, FaUser, FaPhoneAlt, FaMapMarkerAlt,
  FaReceipt, FaMotorcycle
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from "../../config/api";

const OrderTrackingModal = ({ order, close, onOrderStatusUpdate }) => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    let isMounted = true;
    const fetchOrderItems = async () => {
      try {
        setLoadingItems(true);
        const res = await fetch(`${BASE_URL}/api/orders/${order.id}`);
        if (!res.ok) throw new Error(`${t('fetch_error')} (Status: ${res.status})`);
        const resData = await res.json();
        if (resData.success && isMounted) {
          const itemsArray = resData.data?.items || resData.data || [];
          setOrderItems(Array.isArray(itemsArray) ? itemsArray : []);
        }
      } catch (err) {
        console.error("Gagal memuat item belanjaan:", err.message);
        if (isMounted) setOrderItems([]);
      } finally {
        if (isMounted) setLoadingItems(false);
      }
    };
    if (order?.id) fetchOrderItems();
    return () => { isMounted = false; };
  }, [order, t]);

  if (!order) return null;

  const mapQuery = encodeURIComponent(order.shipping_address || 'Tangerang Selatan');
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const getStatusDetails = (status) => {
    switch (status) {
      case 'Baru': return { color: 'bg-blue-50 text-blue-600 border-blue-100', text: t('status_new') || 'Pesanan Baru' };
      case 'Proses': return { color: 'bg-amber-50 text-amber-600 border-amber-100', text: t('status_processing') || 'Sedang Diproses' };
      case 'Pengiriman': return { color: 'bg-purple-50 text-purple-600 border-purple-100', text: t('status_shipping') || 'Dalam Pengiriman' };
      case 'Selesai': return { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', text: t('status_completed') || 'Selesai' };
      default: return { color: 'bg-slate-50 text-slate-600 border-slate-100', text: status };
    }
  };

  const statusInfo = getStatusDetails(order.status);

  const handleConfirmReceived = async () => {
    if (!window.confirm(t('confirm_received_prompt') || 'Konfirmasi pesanan telah diterima?')) return;
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Selesai' })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        alert(t('manifest_updated') || 'Status pesanan berhasil diperbarui!');
        if (onOrderStatusUpdate) onOrderStatusUpdate(order.id, 'Selesai');
        close();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 font-sans text-slate-600 select-none animate-fadeIn overflow-y-auto">
      {/* Container Utama: Menggunakan h-auto pada mobile agar memanjang alami, dan h-[85vh] pada desktop luar */}
      <div className="bg-white w-full max-w-6xl rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row my-auto max-h-[none] lg:max-h-[90vh] h-auto lg:h-[85vh]">

        {/* ================= SISI KIRI: DETAIL INVOICE & PRODUK ================= */}
        <div className="w-full lg:w-[40%] p-5 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between bg-white relative shrink-0">
          <div className="space-y-5 sm:space-y-6">

            {/* Header Invoice */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
                <div className="flex items-center gap-2 text-slate-900 mt-1">
                  <FaReceipt size={13} className="text-slate-400 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-black font-mono tracking-tight uppercase truncate max-w-[180px] sm:max-w-none">
                    {order.order_number || `INV/ORD/#${order.id}`}
                  </h3>
                </div>
              </div>
              <button onClick={close} className="p-2 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-xl lg:hidden text-slate-400 transition-all">
                <FaTimes size={14} />
              </button>
            </div>

            {/* Daftar Suku Cadang */}
            <div className="space-y-3">
              <h4 className="font-black uppercase tracking-widest text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-2">
                <FaShoppingBag className="text-[#e11d48]" size={11} /> {t('selected_parts') || 'Suku Cadang Dipesan'}
              </h4>

              {loadingItems ? (
                <div className="space-y-2 py-1">
                  <div className="h-14 bg-slate-100 rounded-xl w-full animate-pulse"></div>
                  <div className="h-14 bg-slate-100 rounded-xl w-full animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[160px] sm:max-h-[200px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 sm:p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs hover:border-slate-300 transition-all duration-300 group">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white border border-slate-200 rounded-lg overflow-hidden flex-shrink-0 p-1 flex items-center justify-center relative shadow-sm">
                        {item.image ? (
                          <img src={`${BASE_URL}/uploads/products/${item.image}`} alt="" className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <span className="text-[9px] font-black text-slate-300 font-mono">HGI</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-800 group-hover:text-[#e11d48] transition-colors break-words line-clamp-2 md:line-clamp-none text-[11px] sm:text-xs leading-tight">
                          {item.product_name || item.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 flex items-center flex-wrap gap-x-2 gap-y-0.5">
                          <span>Qty: <strong className="text-slate-800 font-mono">{item.quantity || item.qty || 1}</strong> Pcs</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[#e11d48] font-black font-mono text-xs">{formatPrice(item.price || 0)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kartu Profil Singkat */}
            <div className="bg-slate-50 border border-slate-200/60 p-4 sm:p-5 rounded-xl sm:rounded-2xl text-xs space-y-3 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#e11d48]" />
              <div className="flex items-center gap-3 text-slate-800 relative z-10 pl-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><FaUser size={11} /></div>
                <span className="font-black tracking-wide text-xs sm:text-sm truncate">{order.customer_name || 'Pelanggan HGI'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 font-mono relative z-10 pl-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"><FaPhoneAlt size={10} /></div>
                <span className="font-bold tracking-wider text-[11px] sm:text-xs truncate">{order.customer_phone || 'Nomor tidak dicantumkan'}</span>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="pt-4 mt-4 sm:mt-6 lg:mt-auto">
            {order.status === 'Pengiriman' && (
              <button onClick={handleConfirmReceived} disabled={updating} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                <FaCheckCircle size={13} /> {updating ? 'Memproses...' : 'Pesanan Diterima'}
              </button>
            )}

            {order.status === 'Selesai' && (
              <button onClick={() => { close(); navigate('/profile/reviews-history'); }} className="w-full bg-slate-900 hover:bg-[#e11d48] text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-lg hover:shadow-[#e11d48]/20 uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                <FaCommentMedical size={13} /> Tulis Ulasan Part
              </button>
            )}
          </div>
        </div>

        {/* ================= SISI KANAN: MAPS, LOGISTIK & ALAMAT ================= */}
        <div className="flex-1 bg-slate-50 relative flex flex-col min-h-[450px] lg:min-h-0 h-auto lg:h-full overflow-hidden">

          {/* Top Row Sisi Kanan: Kombinasi Status Logistik & Google Maps */}
          <div className="flex flex-col sm:flex-row flex-1 min-h-[300px] lg:h-[65%] relative">

            {/* Timeline Progress */}
            <div className="w-full sm:w-48 md:w-56 p-5 sm:p-6 bg-white border-b sm:border-b-0 sm:border-r border-slate-100 overflow-y-auto text-xs space-y-4 flex-shrink-0">
              <h4 className="font-black uppercase tracking-widest text-[9px] text-slate-400 flex items-center gap-2 mb-4">
                <FaClock size={11} className="text-[#e11d48]" /> Status Logistik
              </h4>

              {/* Flex row di mobile kecil, vertikal di tablet/desktop */}
              <div className="relative pl-0 sm:pl-5 space-y-4 sm:space-y-7 flex flex-row sm:flex-col justify-between sm:justify-start gap-2 sm:gap-0 before:hidden sm:before:block before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
                {['Baru', 'Proses', 'Pengiriman', 'Selesai'].map((st, i) => {
                  const stepNames = { Baru: 'Dibuat', Proses: 'Bengkel', Pengiriman: 'Kurir', Selesai: 'Diterima' };
                  const isActive = order.status === st || (st === 'Baru' && order.status !== 'Baru') || (st === 'Proses' && (order.status === 'Pengiriman' || order.status === 'Selesai')) || (st === 'Pengiriman' && order.status === 'Selesai');

                  return (
                    <div key={i} className={`relative flex sm:flex-col items-center sm:items-start gap-1 shrink-0 ${!isActive ? 'opacity-30' : ''}`}>
                      {/* Titik indikator vertikal khusus layar tablet ke atas */}
                      <div className={`hidden sm:block absolute -left-[24px] top-0.5 w-3 h-3 rounded-full border-2 border-white transition-all duration-500 shadow-sm ${order.status === st ? 'bg-[#e11d48] scale-110 ring-4 ring-red-100' : isActive ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <h5 className={`font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-2 py-1 sm:p-0 rounded-md sm:bg-transparent ${order.status === st ? 'text-slate-900 bg-red-50 text-[#e11d48] sm:text-slate-900' : isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                        {stepNames[st]}
                      </h5>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Container Peta dengan Overlay Animasi */}
            <div className="flex-1 h-[250px] sm:h-auto relative bg-slate-100 overflow-hidden group">
              <button onClick={close} className="absolute top-4 right-4 Carver z-30 hidden lg:flex p-2.5 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-xl text-slate-400 shadow-lg hover:text-[#e11d48] transition-all duration-300">
                <FaTimes size={13} />
              </button>

              {/* Animasi Ikon Melayang */}
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-between py-10 sm:py-14">
                <div className="absolute top-16 bottom-16 w-0.5 border-l-2 border-dashed border-[#e11d48]/60 animate-pulse"></div>
                <div className="bg-white p-2.5 sm:p-3 rounded-full shadow-md border border-[#e11d48] relative transition-transform duration-500 group-hover:-translate-y-1">
                  <FaMotorcycle className="text-[#e11d48] text-lg sm:text-2xl" />
                  <span className="absolute -top-2 -right-6 bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow">HGI SPEED</span>
                </div>
                <div className="bg-white p-2.5 sm:p-3 rounded-full shadow-md border border-blue-500 relative transition-transform duration-500 group-hover:translate-y-1">
                  <FaUser className="text-blue-500 text-base sm:text-xl" />
                  <span className="absolute -bottom-2 -right-6 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow">User</span>
                </div>
              </div>

              <iframe title="Tracking Map" width="100%" height="100%" style={{ border: 0 }} className="shadow-inner relative z-10 opacity-90 saturate-50 contrast-125" loading="lazy" allowFullScreen src={mapUrl}></iframe>
            </div>
          </div>

          {/* Bottom Row Sisi Kanan: Manifes Alamat Lengkap */}
          <div className="bg-white border-t border-slate-100 p-5 sm:p-6 lg:h-[35%] overflow-y-auto flex flex-col justify-center space-y-3.5 shrink-0">
            <h4 className="font-black uppercase tracking-widest text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FaMapMarkerAlt size={11} className="text-[#e11d48]" /> Detail Tujuan Pengiriman
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Penerima</p>
                <div className="space-y-0.5">
                  <p className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{order.customer_name || 'Pelanggan'}</p>
                  <p className="font-mono text-slate-500 font-bold pl-3.5 text-[11px] sm:text-xs">{order.customer_phone || 'Nomor tidak dicantumkan'}</p>
                </div>
              </div>
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Alamat Lengkap</p>
                <p className="font-medium text-slate-700 leading-relaxed text-[11px] sm:text-xs break-words">{order.shipping_address || 'Alamat tidak dicantumkan'}</p>
              </div>
            </div>

            {/* Real-time Status Footer Bar */}
            <div className="text-[9px] sm:text-[10px] bg-red-50/50 border border-red-100/70 p-2.5 rounded-xl flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between font-medium">
              <span className="text-slate-500">Metode: <strong className="text-slate-900 uppercase font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{order.payment_method || 'COD'} GARASI</strong></span>
              <span className="text-[#e11d48] font-black animate-pulse flex items-center gap-1.5 uppercase tracking-widest text-[8px] sm:text-[9px]"><span className="w-1.5 h-1.5 bg-[#e11d48] rounded-full"></span>Live Tracking Aktif</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
