import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminRecentOrders = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data 5 transaksi terbaru dari backend
  useEffect(() => {
    fetch(`${BASE_URL}/api/orders/dashboard/recent`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setRecentOrders(resData.data);
        }
      })
      .catch((err) => console.error('Gagal mengambil data transaksi terbaru:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <FaSpinner className="animate-spin text-[#e11d48]" />
        <span>Memuat data invoice terbaru...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 mt-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">🛒 Riwayat Transaksi Terbaru</h3>
        <span className="text-xs text-slate-400 cursor-default">5 Aktivitas Terakhir</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="pb-3">No. Invoice</th>
              <th className="pb-3">Nama Pembeli</th>
              <th className="pb-3">Total Belanja</th>
              <th className="pb-3 text-right">Status Transaksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-slate-500 font-medium">
                  Belum ada invoice transaksi masuk hari ini.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="text-slate-300 hover:bg-slate-800/20 transition-colors">
                  {/* FIX: Format nomor ID dari DB menjadi string invoice yang gahar (ex: ID 1 jadi MP-TRX-0001) */}
                  <td className="py-3.5 font-mono text-[#e11d48] font-bold uppercase">
                    MP-TRX-{String(order.id).padStart(4, '0')}
                  </td>
                  <td className="py-3.5 font-medium text-white">{order.customer_name}</td>
                  <td className="py-3.5 font-mono">Rp {Number(order.total_payment).toLocaleString('id-ID')}</td>
                  <td className="py-3.5 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wide ${
                      order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      order.status === 'Diproses' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {order.status === 'Pending' ? 'Baru' : order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRecentOrders;
