import { useState, useEffect } from 'react';
import {
  FaArrowUp, FaArrowDown, FaRegBell,
  FaCalendarAlt, FaBoxOpen, FaTachometerAlt, FaClock
} from 'react-icons/fa';
import AdminCharts from './AdminCharts';
import AdminRecentOrders from './AdminRecentOrders';
import { BASE_URL } from "../../config/api";

// --- KOMPONEN SPEEDOMETER KHUSUS MOTO-THEME ---
const SpeedometerGauge = ({ label, value, rate, isUp }) => {
  const rawNum = parseInt(rate.replace(/[^0-9.-]/g, '')) || 0;
  const clampNum = Math.min(Math.max(rawNum, 0), 100);
  const needleAngle = -90 + (clampNum * 1.8);

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-[2rem] flex flex-col items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-slate-900/20 hover:border-slate-600/50 transition-all duration-300 relative overflow-hidden group">
      {/* Efek Glow di belakang speedometer */}
      <div className={`absolute top-10 w-28 h-28 blur-[40px] rounded-full opacity-20 transition-all duration-700 group-hover:opacity-50 ${isUp ? 'bg-emerald-500' : 'bg-[#e11d48]'}`}></div>

      <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] z-10">{label}</span>

      {/* SVG Analog Gauge */}
      <div className="relative w-36 h-24 mt-5 z-10">
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible drop-shadow-xl">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="16" strokeLinecap="round" />

          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={isUp ? '#10b981' : '#e11d48'}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * (clampNum / 100))}
            className="transition-all duration-1000 ease-out"
          />

          {/* Redline Accent */}
          <path d="M 150 45 A 80 80 0 0 1 180 100" fill="none" stroke="#e11d48" strokeWidth="4" opacity="0.4" />

          {/* Needle */}
          <polygon
            points="96,100 104,100 100,20"
            fill="#f8fafc"
            style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: '100px 100px', transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />

          {/* Center Pin */}
          <circle cx="100" cy="100" r="10" fill="#f8fafc" className="shadow-2xl" />
          <circle cx="100" cy="100" r="4" fill="#0f172a" />
        </svg>

        {/* Rate Badge */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm ${isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {isUp ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />} {rate}
          </span>
        </div>
      </div>

      <span className="text-xl font-black text-white tracking-tight mt-6 font-mono z-10">{value}</span>
    </div>
  );
};

const AdminDashboardContent = () => {
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('bulan');
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // 🛠️ FIX: Tambahkan state statusCircle agar Donut Chart cincin bisa merender datanya
  const [chartData, setChartData] = useState([]);
  const [statusCircle, setStatusCircle] = useState(null);

  const [stats, setStats] = useState([
    { label: 'Total Penjualan', value: 'Rp 0', rate: '0%', isUp: true },
    { label: 'Total Pesanan', value: '0 Order', rate: '0%', isUp: true },
    { label: 'Produk Aktif', value: '0 Item', rate: '0%', isUp: true },
    { label: 'Pelanggan Baru', value: '0', rate: '0%', isUp: true },
  ]);

  // Waktu saat ini untuk Header
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/orders/dashboard/stats?period=${timeFilter}`);
        const resData = await res.json();

        if (isMounted && resData && resData.success) {
          const revenue = resData.stats?.totalRevenue || 0;
          const pending = resData.stats?.pendingOrders || 0;
          const products = resData.stats?.totalProducts || 0;
          const customers = resData.stats?.totalCustomers || 0;

          setStats([
            {
              label: 'Total Penjualan',
              value: `Rp ${Number(revenue).toLocaleString('id-ID')}`,
              rate: resData.stats?.revenueRate || '0%',
              isUp: resData.stats?.revenueIsUp !== false
            },
            {
              label: 'Pesanan Baru',
              value: `${pending} Order`,
              rate: resData.stats?.pendingRate || '0%',
              isUp: resData.stats?.pendingIsUp !== false
            },
            {
              label: 'Rasio Stok Aman',
              value: `${products} Item`,
              rate: resData.stats?.productRate || '100%',
              isUp: resData.stats?.productIsUp !== false
            },
            {
              label: 'Pelanggan Baru',
              value: `${customers} User`,
              rate: resData.stats?.customerRate || '0%',
              isUp: resData.stats?.customerIsUp !== false
            },
          ]);

          setLowStockProducts(resData.lowStockProducts || []);
          setChartData(resData.chartData || []);
          setStatusCircle(resData.statusCircle || null); // 🛠️ FIX: Set state status cincin
        }
      } catch (err) {
        console.error('Gagal mengambil analitik dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [timeFilter]);

  return (
    <div className="text-slate-100 font-sans relative">

      {/* Background Accent (Opsional: Memberi nuansa cyber/garage) */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#e11d48]/5 to-transparent -z-10 pointer-events-none blur-3xl"></div>

      {/* 1. Top Header Dashboard & Filter */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#e11d48]">
            <FaTachometerAlt size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard Panel</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Ringkasan Analitik
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-medium">
            <FaClock className="text-slate-500" />
            <span>{today}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Dropdown Filter Waktu Premium */}
          <div className="relative flex items-center bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-1 shadow-sm flex-1 xl:flex-none hover:border-slate-500/50 transition-colors">
            <div className="absolute left-4 text-[#e11d48] pointer-events-none">
              <FaCalendarAlt size={13} />
            </div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-white uppercase tracking-widest pl-10 pr-6 py-3 outline-none cursor-pointer appearance-none"
            >
              <option value="minggu" className="bg-slate-900 text-slate-200">Performa Minggu Ini</option>
              <option value="bulan" className="bg-slate-900 text-slate-200">Performa Bulan Ini</option>
              <option value="tahun" className="bg-slate-900 text-slate-200">Performa Tahun Ini</option>
            </select>
            <div className="absolute right-4 pointer-events-none text-slate-400 text-[10px]">▼</div>
          </div>

          <div className="w-12 h-12 bg-slate-800/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-slate-700/50 text-slate-300 cursor-pointer hover:text-white hover:bg-slate-700 transition-all relative shadow-sm flex-shrink-0">
            <FaRegBell size={16} />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#e11d48] border-2 border-slate-800 rounded-full animate-pulse shadow-[0_0_10px_#e11d48]"></span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4 bg-slate-800/20 backdrop-blur-sm rounded-[2rem] border border-slate-700/30 shadow-inner">
          <div className="relative">
            <div className="absolute inset-0 border-t-2 border-[#e11d48] rounded-full animate-spin"></div>
            <FaTachometerAlt className="text-slate-600 text-4xl p-2" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e11d48] animate-pulse">Sinkronisasi Telemetri...</span>
        </div>
      ) : (
        <>
          {/* 2. Grid KPI Speedometer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <SpeedometerGauge
                key={i}
                label={stat.label}
                value={stat.value}
                rate={stat.rate}
                isUp={stat.isUp}
              />
            ))}
          </div>

          {/* 3. Komponen Grafik Dinamis (Kirim statusCircle ke sini) */}
          <AdminCharts chartData={chartData} statusCircle={statusCircle} />

          {/* 4. Area Data Tabel Stok Peringatan */}
          <div className="grid grid-cols-1 gap-6 mt-8">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[2rem] p-6 md:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Peringatan Stok Suku Cadang
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase tracking-widest text-[10px] bg-slate-900/50">
                      <th className="p-4 rounded-l-xl">Nama Komponen</th>
                      <th className="p-4">SKU / Kode</th>
                      <th className="p-4">Sisa Stok</th>
                      <th className="p-4 text-right rounded-r-xl">Status Tanggap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {lowStockProducts.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-10 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-2">
                              <FaBoxOpen size={20} />
                            </div>
                            <span className="font-bold text-sm text-slate-300">Stok Aman Terkendali</span>
                            <span className="text-[10px] font-medium max-w-xs">Semua inventaris suku cadang garasi berada di atas ambang batas (5 Pcs).</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      lowStockProducts.map((prod) => {
                        const currentStatus = prod.status ? prod.status.trim() : 'Stok Tipis';
                        return (
                          <tr key={prod.id} className="text-slate-300 hover:bg-slate-700/30 transition-colors group">
                            <td className="p-4 font-bold text-white group-hover:text-[#e11d48] transition-colors flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-500 group-hover:border-[#e11d48]/50 group-hover:text-[#e11d48] transition-colors">
                                <FaBoxOpen size={12} />
                              </div>
                              {prod.name}
                            </td>
                            <td className="p-4 font-mono text-slate-500 uppercase">{prod.sku}</td>
                            <td className={`p-4 font-black font-mono text-sm ${prod.stock <= 2 ? 'text-rose-500' : 'text-amber-400'}`}>
                              {prod.stock} Pcs
                            </td>
                            <td className="p-4 text-right">
                              <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm ${
                                currentStatus === 'Kritis' || currentStatus === 'Habis'
                                  ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/10 text-rose-400 border border-rose-500/30'
                                  : 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${currentStatus === 'Kritis' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`}></span>
                                {currentStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Komponen Tabel Transaksi Terbaru */}
            <AdminRecentOrders />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardContent;
