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
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans text-slate-600 select-none animate-fadeIn">
      <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row max-h-[95vh] h-[95vh] lg:h-[85vh]">

        {/* ================= SISI KIRI ================= */}
        <div className="w-full lg:w-[40%] p-6 lg:p-8 overflow-y-auto space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between bg-white relative">
          <div className="space-y-6">

            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div className="space-y-1.5">
                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
                <div className="flex items-center gap-2 text-slate-900 mt-1">
                  <FaReceipt size={14} className="text-slate-400" />
                  <h3 className="text-sm font-black font-mono tracking-tight uppercase">
                    {order.order_number || `INV/ORD/#${order.id}`}
                  </h3>
                </div>
              </div>
              <button onClick={close} className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 border border-slate-200 rounded-xl lg:hidden text-slate-400 transition-all">
                <FaTimes size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2">
                <FaShoppingBag className="text-[#e11d48]" size={12} /> {t('selected_parts') || 'Suku Cadang Dipesan'}
              </h4>

              {loadingItems ? (
                <div className="space-y-3 py-2">
                  <div className="h-16 bg-slate-100 rounded-2xl w-full animate-pulse"></div>
                  <div className="h-16 bg-slate-100 rounded-2xl w-full animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs hover:border-slate-300 transition-all duration-300 group">
                      <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl overflow-hidden flex-shrink-0 p-1 flex items-center justify-center relative shadow-sm">
                        {item.image ? (
                          <img src={`${BASE_URL}/uploads/products/${item.image}`} alt="" className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 font-mono">HGI</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h5 className="font-bold text-slate-800 group-hover:text-[#e11d48] transition-colors break-words leading-snug">
                          {item.product_name || item.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium mt-1.5 flex items-center flex-wrap gap-2">
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

            {/* FIX UTAMA: KARTU ALAMAT DIUBAH JADI TERANG */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl text-xs space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#e11d48]" />

              <div className="flex items-center gap-3 text-slate-800 relative z-10 pl-2">
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500"><FaUser size={12} /></div>
                <span className="font-black tracking-wide text-sm">{order.customer_name || 'Pelanggan HGI'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 font-mono relative z-10 pl-2">
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-500"><FaPhoneAlt size={10} /></div>
                <span className="font-bold tracking-wider">{order.customer_phone || 'Nomor tidak dicantumkan'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-auto">
            {order.status === 'Pengiriman' && (
              <button onClick={handleConfirmReceived} disabled={updating} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                <FaCheckCircle size={14} /> {updating ? 'Memproses...' : 'Pesanan Diterima'}
              </button>
            )}

            {order.status === 'Selesai' && (
              <button onClick={() => { close(); navigate('/profile/reviews-history'); }} className="w-full bg-slate-900 hover:bg-[#e11d48] text-white font-black text-xs py-4 rounded-xl transition-all shadow-lg hover:shadow-[#e11d48]/30 uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95">
                <FaCommentMedical size={14} /> Tulis Ulasan Part
              </button>
            )}
          </div>
        </div>

        {/* ================= SISI KANAN ================= */}
        <div className="flex-1 bg-slate-50 relative flex flex-col h-full overflow-y-auto lg:overflow-hidden">
          <div className="flex flex-col md:flex-row flex-1 min-h-[400px] lg:h-[65%] relative">
            <div className="w-full md:w-60 p-6 lg:p-8 bg-white border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto text-xs space-y-5 flex-shrink-0 z-20">
              <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2 mb-6">
                <FaClock size={12} className="text-[#e11d48]" /> Status Logistik
              </h4>

              <div className="relative pl-5 space-y-8 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {['Baru', 'Proses', 'Pengiriman', 'Selesai'].map((st, i) => {
                  const stepNames = { Baru: 'Pesanan Dibuat', Proses: 'Disiapkan Bengkel', Pengiriman: 'Dalam Perjalanan', Selesai: 'Paket Diterima' };
                  const isActive = order.status === st || (st === 'Baru' && order.status !== 'Baru') || (st === 'Proses' && (order.status === 'Pengiriman' || order.status === 'Selesai')) || (st === 'Pengiriman' && order.status === 'Selesai');
                  return (
                    <div key={i} className={`relative flex flex-col gap-1 ${!isActive ? 'opacity-40' : ''}`}>
                      <div className={`absolute -left-[25px] top-0 w-3.5 h-3.5 rounded-full border-2 border-white transition-all duration-500 shadow-sm ${order.status === st ? 'bg-[#e11d48] scale-125 ring-4 ring-red-100' : isActive ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <h5 className={`font-black text-[11px] uppercase tracking-wider ${order.status === st ? 'text-slate-900' : isActive ? 'text-slate-600' : 'text-slate-400'}`}>{stepNames[st]}</h5>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 h-full relative bg-slate-100 p-3 md:p-0 overflow-hidden group">
              <button onClick={close} className="absolute top-5 right-5 z-30 hidden lg:flex p-3 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-xl text-slate-400 shadow-lg hover:text-[#e11d48] transition-all duration-300">
                <FaTimes size={14} />
              </button>

              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-between py-16">
                <div className="absolute top-24 bottom-24 w-1 border-l-4 border-dashed border-[#e11d48]/60 animate-pulse"></div>
                <div className="bg-white p-4 rounded-full shadow-[0_10px_30px_rgba(225,29,72,0.3)] border-2 border-[#e11d48] relative transition-transform duration-500 group-hover:-translate-y-2">
                  <FaMotorcycle className="text-[#e11d48] text-3xl" />
                  <span className="absolute -top-3 -right-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">HGI SPEED</span>
                </div>
                <div className="bg-white p-4 rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.3)] border-2 border-blue-500 relative transition-transform duration-500 group-hover:translate-y-2">
                  <FaUser className="text-blue-500 text-2xl" />
                  <span className="absolute -bottom-3 -right-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md">Lokasi Kamu</span>
                </div>
              </div>

              <iframe title="Tracking Map" width="100%" height="100%" style={{ border: 0 }} className="rounded-2xl lg:rounded-none shadow-inner relative z-10 opacity-90 saturate-50 contrast-125" loading="lazy" allowFullScreen src={mapUrl}></iframe>
            </div>
          </div>

          <div className="bg-white border-t border-slate-100 p-6 lg:p-8 lg:h-[35%] overflow-y-auto flex flex-col justify-center space-y-4">
            <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FaMapMarkerAlt size={12} className="text-[#e11d48]" /> Detail Tujuan Pengiriman
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Penerima</p>
                <div className="space-y-1">
                  <p className="font-black text-slate-900 text-sm flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>{order.customer_name || 'Pelanggan'}</p>
                  <p className="font-mono text-slate-500 font-bold pl-4">{order.customer_phone || 'Nomor tidak dicantumkan'}</p>
                </div>
              </div>
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Alamat Lengkap</p>
                <p className="font-medium text-slate-700 leading-relaxed">{order.shipping_address || 'Alamat tidak dicantumkan'}</p>
              </div>
            </div>
            <div className="text-[10px] bg-red-50/50 border border-red-100 p-3 rounded-xl flex items-center justify-between font-medium mt-2">
              <span className="text-slate-500 flex items-center gap-2">Metode: <strong className="text-slate-900 uppercase font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{order.payment_method || 'COD'} GARASI</strong></span>
              <span className="text-[#e11d48] font-black animate-pulse flex items-center gap-1.5 uppercase tracking-widest"><span className="w-1.5 h-1.5 bg-[#e11d48] rounded-full"></span>Live Tracking Aktif</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
