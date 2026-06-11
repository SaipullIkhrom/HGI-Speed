import { FaCircle } from 'react-icons/fa';

const AdminCharts = ({ chartData = [], statusCircle }) => {
  // A. LOGIKA TINGGI GRAFIK
  const totals = chartData.map(d => Number(d.total || 0));
  const maxAmount = totals.length > 0 ? Math.max(...totals, 1) : 1;

  // Petakan data secara bersih ke state
  const dynamicChart = chartData.map(item => {
    const currentTotal = Number(item.total || 0);
    const percentageHeight = Math.round((currentTotal / maxAmount) * 100);
    const finalHeight = percentageHeight < 15 ? 15 : percentageHeight;

    return {
      month: item.month || '-',
      amountStr: `Rp ${currentTotal.toLocaleString('id-ID')}`,
      heightPercent: `${finalHeight}%`
    };
  });

  // B. LOGIKA STATUS CINCIN (DONUT CHART)
  const orderStatus = {
    countSelesai: statusCircle?.countSelesai || 0,
    countProses: statusCircle?.countProses || 0,
    percentageSelesai: typeof statusCircle?.percentageSelesai !== 'undefined' ? statusCircle.percentageSelesai : 100
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 font-sans">
      {/* Kiri: Grafik Tren Penjualan Dinamis (Col 8) */}
      <div className="lg:col-span-8 bg-slate-800/40 border border-slate-700/60 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="text-[#e11d48]">📈</span> Grafik Penjualan
          </h3>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md font-bold border border-emerald-500/20 uppercase tracking-widest">
            Live Data
          </span>
        </div>

        {/* Kontainer Grafik Batang */}
        <div className="flex items-end justify-between h-48 px-4 border-b border-slate-700 pb-2 gap-4">
          {dynamicChart.length === 0 ? (
            <div className="w-full text-center text-xs text-slate-500 pb-8">Menunggu data grafik...</div>
          ) : (
            dynamicChart.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  style={{ height: data.heightPercent }}
                  className="w-full bg-gradient-to-t from-[#e11d48]/40 to-[#e11d48] rounded-t-lg group-hover:brightness-125 transition-all duration-500 relative shadow-lg shadow-red-900/10"
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl border border-slate-800 whitespace-nowrap">
                    {data.amountStr}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{data.month}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kanan: Persentase Status Order Dinamis (Col 4) */}
      <div className="lg:col-span-4 bg-slate-800/40 border border-slate-700/60 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">📦 Status Pesanan</h3>

        {/* Visual Cincin Donut */}
        <div className="flex justify-center items-center my-4">
          <div className="w-32 h-32 rounded-full border-[12px] border-slate-800 border-t-[#e11d48] border-r-emerald-500 flex items-center justify-center relative rotate-45 shadow-inner">
            <div className="-rotate-45 text-center">
              <span className="text-2xl font-black text-white font-mono">{orderStatus.percentageSelesai}%</span>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Selesai</p>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-col gap-3 mt-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <FaCircle className="text-[#e11d48] text-[8px]" /> Selesai / Kirim
            </span>
            <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">{orderStatus.countSelesai}</strong>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <FaCircle className="text-emerald-500 text-[8px]" /> Baru / Proses
            </span>
            <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">{orderStatus.countProses}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
