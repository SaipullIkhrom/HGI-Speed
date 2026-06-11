import { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaBoxes, FaReceipt, FaShoppingBag, FaDownload, FaUserShield } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import { BASE_URL } from "../../config/api";

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [summary, setSummary] = useState({ gross_revenue: 0, total_orders: 0, critical_items: 0 });
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operator, setOperator] = useState({ name: 'Memuat...', role: 'Staff' });

  useEffect(() => {
    let isMounted = true;

    const fetchReportData = async () => {
      setLoading(true);
      // 🛠️ FIX: Kosongkan data lama setiap kali tab berpindah!
      // Ini mencegah tab Alur Distribusi macet akibat membaca sisa cache dari Neraca Keuangan
      setReportList([]);

      try {
        const res = await fetch(`${BASE_URL}/api/reports/advanced?type=${activeTab}`);
        const resData = await res.json();

        if (isMounted && resData.success) {
          setSummary(resData.summary);
          setReportList(resData.data);
          if (resData.operator) setOperator(resData.operator);
        }
      } catch (err) {
        console.error("Gagal menarik data laporan:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReportData();
    return () => { isMounted = false; };
  }, [activeTab]);

  const downloadPDFDirect = () => {
    // 🛠️ FIX: Hitung ID unik di dalam fungsi (bukan di dalam JSX render)
    const uniqueReportId = Math.floor(Date.now() / 10000);
    const formattedDate = new Date().toLocaleString('id-ID');

    // Pasang teksnya langsung ke elemen HTML sebelum dicetak
    const idTarget = document.getElementById('pdf-report-id');
    const timeTarget = document.getElementById('pdf-download-time');
    if (idTarget) idTarget.innerText = `#REP-${uniqueReportId}`;
    if (timeTarget) timeTarget.innerText = formattedDate;

    const element = document.getElementById('hidden-pdf-template');

    // Tampilkan elemen ke DOM agar dapat dipindai engine html2pdf
    element.style.display = 'block';

    const options = {
      margin:       [12, 12, 12, 12],
      filename:     `Laporan_${activeTab}_HGI_SPEED.pdf`,
      image:        { type: 'jpeg', quality: 0.99 },
      html2canvas:  { scale: 2.5, useCORS: true, backgroundColor: '#ffffff', letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save().then(() => {
      // Sembunyikan kembali elemen dari layout web
      element.style.display = 'none';
    });
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">

      {/* HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight uppercase">
            <FaFileInvoiceDollar className="text-[#e11d48]" /> Ekspor Eksekutif Laporan
          </h1>
          {/* 🛠️ REVISI: Nama toko diperbarui menjadi HGI Speed */}
          <p className="text-xs text-slate-400 mt-0.5">Sistem kompilasi data pembukuan dan inventori cerdas HGI Speed.</p>
        </div>

        <button
          onClick={downloadPDFDirect}
          className="bg-[#e11d48] hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-red-950/40 hover:shadow-red-900/60 transition-all border border-red-500/20 active:scale-95"
        >
          <FaDownload /> GENERATE EXECUTIVE PDF
        </button>
      </div>

      {/* METRIK STATISTIK UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-emerald-500/5 text-7xl font-black group-hover:scale-110 transition-transform duration-300">Rp</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Penjualan Selesai</div>
          <div className="text-xl font-black text-emerald-400 mt-1.5">Rp {Number(summary.gross_revenue).toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 text-7xl font-black group-hover:scale-110 transition-transform duration-300">#</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Arus Trafik Pesanan</div>
          <div className="text-xl font-black text-white mt-1.5">{summary.total_orders} Invoice Masuk</div>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-rose-500/5 text-7xl font-black group-hover:scale-110 transition-transform duration-300">!</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Limit Opname Gudang</div>
          <div className="text-xl font-black text-rose-500 mt-1.5">{summary.critical_items} Item Kritis</div>
        </div>
      </div>

      {/* FILTER TAB NAVIGATOR */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 max-w-2xl gap-1">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-all duration-200 ${activeTab === 'transactions' ? 'bg-slate-800 text-white border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FaReceipt size={13} /> Neraca Keuangan
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-all duration-200 ${activeTab === 'orders' ? 'bg-slate-800 text-white border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FaShoppingBag size={13} /> Alur Distribusi
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-all duration-200 ${activeTab === 'products' ? 'bg-slate-800 text-white border border-slate-700 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <FaBoxes size={13} /> Status Inventori
        </button>
      </div>

      {/* TAMPILAN DASHBOARD TABEL ELEGAN */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/60 flex justify-between items-center text-xs">
          <span className="font-bold tracking-wider text-slate-400 uppercase">Arsip Lembar Kerja Aktual</span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 rounded-lg text-slate-400 border border-slate-800"><FaUserShield className="text-[#e11d48]"/> {operator.name}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase border-b border-slate-800/60">
                {activeTab === 'transactions' && (<><th className="p-4">ID TRX</th><th className="p-4">Tanggal Pembayaran</th><th className="p-4">Status</th><th className="p-4 text-right">Nominal</th></>)}
                {activeTab === 'orders' && (<><th className="p-4">ID ORDER</th><th className="p-4">Nama Pelanggan</th><th className="p-4">Kurir Logistik</th><th className="p-4 text-right">Status</th></>)}
                {activeTab === 'products' && (<><th className="p-4">SKU / KODE</th><th className="p-4">Nama Suku Cadang</th><th className="p-4">Kategori</th><th className="p-4 text-center">Stok</th><th className="p-4 text-right">Kondisi</th></>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Sinkronisasi database...</td></tr>
              ) : reportList.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">Belum ada riwayat data tercatat.</td></tr>
              ) : (
                reportList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 text-slate-300 transition-colors">
                    {activeTab === 'transactions' && (
                      <>
                        <td className="p-4 font-mono text-slate-500">#TRX-{item.id}</td>
                        <td className="p-4">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                        <td className="p-4"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold rounded text-[10px]">{item.status}</span></td>
                        <td className="p-4 text-right font-black text-white">Rp {Number(item.total_payment).toLocaleString('id-ID')}</td>
                      </>
                    )}
                    {activeTab === 'orders' && (
                      <>
                        <td className="p-4 font-mono text-slate-500">#ORD-{item.id}</td>
                        <td className="p-4 font-bold text-white">{item.customer_name}</td>
                        <td className="p-4 uppercase text-slate-400">{item.shipping_courier || 'Ambil Di Toko'}</td>
                        <td className="p-4 text-right"><span className={`px-2 py-0.5 font-bold rounded text-[10px] ${item.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{item.status}</span></td>
                      </>
                    )}
                    {activeTab === 'products' && (
                      <>
                        <td className="p-4 font-mono text-slate-500 uppercase">{item.sku}</td>
                        <td className="p-4 font-bold text-white">{item.name}</td>
                        <td className="p-4 text-slate-400">{item.category}</td>
                        <td className={`p-4 text-center font-bold ${item.stock <= 5 ? 'text-rose-500' : 'text-slate-300'}`}>{item.stock} Pcs</td>
                        <td className="p-4 text-right"><span className={`px-2 py-0.5 font-black rounded text-[10px] ${item.status_stok === 'Aman' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{item.status_stok}</span></td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🛠️ TEMPLATE DOKUMEN PDF (ARSITEKTUR PREMIUM UNTUK PENCETAKAN ENGINE HD) */}
      <div id="hidden-pdf-template" style={{ display: 'none' }} className="bg-white text-slate-900 font-sans">
        <div style={{ width: '100%', padding: '4mm', backgroundColor: '#ffffff' }}>

          {/* HEADER / KOP LAPORAN */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0', verticalAlign: 'middle' }}>
                  {/* 🛠️ REVISI: Nama Kop Utama Diperbarui Menjadi HGI SPEED */}
                  <h1 style={{ fontSize: '18pt', fontWeight: '800', margin: '0', color: '#0f172a', letterSpacing: '0.5px' }}>
                    HGI SPEED
                  </h1>
                  <p style={{ fontSize: '8.5pt', color: '#64748b', margin: '1.5mm 0 0 0', fontWeight: '500' }}>
                    Professional Motorcycle Parts & Custom Engineering Components
                  </p>
                </td>
                <td style={{ padding: '0', textAlign: 'right', verticalAlign: 'middle' }}>
                  <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '8pt', fontWeight: '800', padding: '1.5mm 3.5mm', borderRadius: '4px', textTransform: 'uppercase' }}>
                    Laporan Eksekutif
                  </div>
                  <p style={{ margin: '2mm 0 0 0', fontSize: '7.5pt', color: '#94a3b8', fontFamily: 'monospace' }}>
                  Arsip: <span id="pdf-report-id">Memuat...</span>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* GARIS PEMBATAS KOP */}
          <div style={{ width: '100%', height: '0.8mm', backgroundColor: '#0f172a', marginBottom: '5mm' }}></div>

          {/* METADATA INFORMASI */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3mm', fontSize: '8.5pt', color: '#334155', width: '50%', lineHeight: '1.4' }}>
                  <strong>Kategori Data:</strong> Kompilasi {activeTab === 'transactions' ? 'Neraca Keuangan' : activeTab === 'orders' ? 'Alur Distribusi Pesanan' : 'Inventori Manufaktur Gudang'}<br />
                  <strong>Periode Cetak:</strong> {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
                <td style={{ padding: '3mm', fontSize: '8.5pt', color: '#334155', width: '50%', textAlign: 'right', lineHeight: '1.4' }}>
                  <strong>Otoritas Operator:</strong> {operator.name}<br />
                  <strong>Jabatan Sistem:</strong> <span style={{ color: '#e11d48', fontWeight: '700' }}>{operator.role}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* TABEL DATA HD BLUE-PRINT */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', marginBottom: '8mm' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                {activeTab === 'transactions' && (
                  <>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>ID TRX</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>Waktu Penyelesaian</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>Status Finansial</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a', textAlign: 'right' }}>Nominal Bersih</th>
                  </>
                )}
                {activeTab === 'orders' && (
                  <>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>ID ORDER</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>Nama Pelanggan</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>Kurir Logistik</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a', textAlign: 'right' }}>Status Pengiriman</th>
                  </>
                )}
                {activeTab === 'products' && (
                  <>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>KODE SKU</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>Nama Suku Cadang</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a' }}>Kategori</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a', textAlign: 'center' }}>Stok</th>
                    <th style={{ padding: '2.5mm 3mm', fontWeight: '700', border: '1px solid #0f172a', textAlign: 'right' }}>Kondisi</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportList.map((item, idx) => (
                <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  {activeTab === 'transactions' && (
                    <>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', fontFamily: 'monospace', color: '#64748b' }}>#TRX-{item.id}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', color: '#334155' }}>{new Date(item.created_at).toLocaleString('id-ID')}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', fontWeight: '700', color: '#16a34a' }}>{item.status}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>Rp {Number(item.total_payment).toLocaleString('id-ID')}</td>
                    </>
                  )}
                  {activeTab === 'orders' && (
                    <>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', fontFamily: 'monospace', color: '#64748b' }}>#ORD-{item.id}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', fontWeight: '700', color: '#0f172a' }}>{item.customer_name}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', textTransform: 'uppercase', color: '#475569' }}>{item.shipping_courier || 'Ambil Di Toko'}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: '700', color: item.status === 'Selesai' ? '#16a34a' : '#d97706' }}>{item.status}</td>
                    </>
                  )}
                  {activeTab === 'products' && (
                    <>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', fontFamily: 'monospace', textTransform: 'uppercase', color: '#475569' }}>{item.sku}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', fontWeight: '700', color: '#0f172a' }}>{item.name}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', color: '#64748b' }}>{item.category}</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: '700', color: item.stock <= 5 ? '#dc2626' : '#334155' }}>{item.stock} Pcs</td>
                      <td style={{ padding: '2.5mm 3mm', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: '800', color: item.status_stok === 'Aman' ? '#16a34a' : '#dc2626' }}>{item.status_stok}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* FOOTER VALIDASI TANDA TANGAN */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10mm' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0', fontSize: '7pt', color: '#94a3b8', verticalAlign: 'bottom', width: '60%' }}>
                  * Dokumen kompilasi ini sah dan diterbitkan secara digital oleh sistem ERP HGI Speed.<br />
                  * Segala bentuk manipulasi data laporan keuangan akan terekam pada log keamanan pusat.
                </td>
                <td style={{ padding: '0', width: '40%', textAlign: 'center', fontSize: '8.5pt', color: '#334155' }}>
                  <p style={{ margin: '0' }}>Tangerang Selatan, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p style={{ margin: '1mm 0 0 0', color: '#94a3b8', fontSize: '7pt', fontStyle: 'italic' }}>Authorized Electronic Signature</p>
                  <br /><br /><br />
                  <p style={{ margin: '0', fontWeight: '700', color: '#0f172a', textDecoration: 'underline' }}>{operator.name}</p>
                  {/* 🛠️ REVISI: Nama Instansi Validasi diubah menjadi HGI SPEED */}
                  <p style={{ margin: '1mm 0 0 0', color: '#64748b', fontSize: '7.5pt', textTransform: 'uppercase', fontWeight: '600' }}>{operator.role} HGI SPEED</p>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
};

export default AdminReports;
