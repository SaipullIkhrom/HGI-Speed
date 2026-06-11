/* eslint-disable */
import { useState, useEffect } from 'react';
import { FaEye, FaSpinner, FaTimes, FaBoxOpen, FaUser, FaPhone, FaMapMarkerAlt, FaCogs, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk modal detail pesanan
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // 1. Ambil semua data pesanan dari backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/orders`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data pesanan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Ambil rincian produk pesanan berdasarkan order_id untuk modal pop-up
  const handleOpenDetail = async (order) => {
    setSelectedOrder(order);
    setLoadingItems(true);
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${order.id}/items`);
      const data = await res.json();
      if (data.success) {
        setOrderItems(data.data);
      }
    } catch (err) {
      console.error('Gagal memuat detail item pesanan:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  // 3. Update status pesanan ke backend berdasarkan tombol yang diklik
  const handleUpdateStatus = async (id, nextStatus) => {
    if (!window.confirm(`Ubah status pesanan #${id} menjadi "${nextStatus}"?`)) return;

    try {
      const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      console.log("Respon Backend:", data);

      if (data.success) {
        alert(data.message);

        // Update state lokal secara instan agar bodi tabel langsung berubah tanpa reload lambat
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, status: nextStatus } : order
          )
        );

        // Jika modal detail sedang terbuka, sinkronkan teks status di dalamnya juga
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder((prev) => ({ ...prev, status: nextStatus }));
        }
      } else {
        alert("Gagal: " + data.message);
      }
    } catch (err) {
      console.error('Error:', err);
      alert("Terjadi kesalahan koneksi saat memperbarui status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2">
          <FaSpinner className="animate-spin text-[#e11d48] text-3xl" />
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Memuat Data Transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 border-b border-slate-900 pb-4 flex items-center gap-2">
          🏎️ Panel Manajemen Pesanan Masuk
        </h2>

        {/* TABEL DATA PESANAN MASUK (DARK MODE STYLE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-955 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 text-center">ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Alamat Pengiriman</th>
                  <th className="p-4">Total Bayar</th>
                  <th className="p-4 text-center">Status Saat Ini</th>
                  <th className="p-4 text-center">Manajemen Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Belum ada pesanan suku cadang yang masuk.</td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const currentStatus = order.status ? order.status.trim().toLowerCase() : '';

                    return (
                      <tr key={order.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="p-4 text-center font-bold text-slate-500">#{order.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{order.customer_name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{order.customer_phone}</div>
                        </td>
                        <td className="p-4 max-w-xs truncate">{order.shipping_address}</td>
                        <td className="p-4 font-bold text-emerald-400">Rp {Number(order.total_payment).toLocaleString('id-ID')}</td>

                        {/* Status Badge Kebal Huruf Kapital */}
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            currentStatus === 'baru' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            currentStatus === 'proses' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                            currentStatus === 'pengiriman' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                            currentStatus === 'selesai' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}>
                            {order.status ? order.status.trim() : 'Kosong'}
                          </span>
                        </td>

                        {/* Kolom Aksi dengan 4 Tombol Utama + 1 Tombol Detail */}
                       <td className="p-4">
  <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xs mx-auto">

    {/* 1. Tombol Intip Detail */}
    <button
      onClick={() => handleOpenDetail(order)}
      className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded font-bold text-[10px] flex items-center gap-1 transition-all"
      title="Lihat Detail Barang"
    >
      <FaEye /> Detail
    </button>

    {/* Manajemen Kontrol Status - Terbuka Sepenuhnya Tanpa Blokir Disabled */}
    {currentStatus !== 'selesai' && currentStatus !== 'dibatalkan' && (
      <>
        {/* 2. Tombol Proses */}
        <button
          onClick={() => handleUpdateStatus(order.id, 'Proses')}
          className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded font-bold text-[10px] flex items-center gap-1 transition-all"
        >
          <FaCogs /> Proses
        </button>

        {/* 3. Tombol Kirim */}
        <button
          onClick={() => handleUpdateStatus(order.id, 'Pengiriman')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-bold text-[10px] flex items-center gap-1 transition-all"
        >
          <FaTruck /> Kirim
        </button>

        {/* 4. Tombol Selesaikan */}
        <button
          onClick={() => handleUpdateStatus(order.id, 'Selesai')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded font-bold text-[10px] flex items-center gap-1 transition-all"
        >
          <FaCheckCircle /> Selesai
        </button>

        {/* 5. Tombol Batalkan */}
        <button
          onClick={() => handleUpdateStatus(order.id, 'Dibatalkan')}
          className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded font-bold text-[10px] flex items-center gap-1 transition-all"
        >
          <FaTimesCircle /> Batalkan
        </button>
      </>
    )}

  </div>
</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DETAIL POP-UP */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-sm">

              {/* Header Modal */}
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <FaBoxOpen className="text-[#e11d48]" /> Rincian Belanja Pesanan #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => { setSelectedOrder(null); setOrderItems([]); }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Konten Utama Modal */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Info Profil Kiriman Singkat */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-800 rounded-xl text-xs text-slate-300">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2"><FaUser className="text-slate-500" /> <span className="font-bold text-white">{selectedOrder.customer_name}</span></p>
                    <p className="flex items-center gap-2"><FaPhone className="text-slate-500" /> {selectedOrder.customer_phone}</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <FaMapMarkerAlt className="text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed">{selectedOrder.shipping_address}</p>
                  </div>
                </div>

                {/* Bagian Loop Item Sparepart */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Item Suku Cadang Yang Dibeli:</h4>

                  {loadingItems ? (
                    <div className="py-8 flex justify-center items-center gap-2 text-xs text-slate-400">
                      <FaSpinner className="animate-spin text-[#e11d48]" /> Memuat item belanja...
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto pr-1">
                      {orderItems.map((item) => (
                        <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {item.product_image ? (
                                <img src={`${BASE_URL}/uploads/${item.product_image}`} alt={item.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[9px] text-slate-600 font-bold">NO IMG</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-white truncate">{item.product_name}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5 uppercase">{item.motor_brand} {item.motor_type}</p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-slate-200">Rp {item.price_at_purchase.toLocaleString('id-ID')}</div>
                            <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Jumlah: {item.quantity} Pcs</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtotal & Status Final */}
                <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400">Status Saat Ini: </span>
                    <span className="font-bold text-white uppercase ml-1">{selectedOrder.status ? selectedOrder.status.trim() : 'Kosong'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total Pembayaran</p>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">Rp {selectedOrder.total_payment.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrders;
