import { useState, useEffect } from 'react';
import { FaSearch, FaBoxes, FaSpinner, FaEdit, FaTimes, FaPrint, FaCheckCircle } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminStock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk kontrol modal form edit stok
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', sku: '', stock: '', price: '' });

  // State untuk penampung data Invoice cetak PDF
  const [invoiceData, setInvoiceData] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(0);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/products`);
        const resData = await res.json();
        if (isMounted && resData && resData.success) {
          setProducts(resData.data || []);
        }
      } catch (err) {
        console.error('Gagal mengambil data stok produk:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [triggerFetch]);

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      sku: prod.sku || '',
      stock: prod.stock || 0,
      price: prod.price || 0
    });
    setInvoiceData(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          stock: Number(formData.stock),
          price: Number(formData.price)
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setInvoiceData({
          invoiceNumber: `STK-${Date.now().toString().slice(-6)}`,
          adminName: 'Administrator MotoPart',
          date: new Date().toLocaleString('id-ID'),
          productName: formData.name,
          sku: formData.sku || `SP-${editingProduct.id}`,
          oldStock: editingProduct.stock,
          newStock: formData.stock,
          oldPrice: editingProduct.price,
          newPrice: formData.price
        });

        alert('Data Inventori Stok Berhasil Diperbarui!');
        setTriggerFetch(prev => prev + 1);
      } else {
        alert(resData.message || 'Gagal memperbarui inventori gudang.');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Terjadi kegagalan koneksi ke server backend.');
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const filteredProducts = products.filter((prod) => {
    const nameMatch = prod.name ? prod.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const skuMatch = prod.sku ? prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return nameMatch || skuMatch;
  });

  return (
    <div className="text-slate-100 font-sans space-y-8 print:bg-white print:text-black">

      {/* AREA UTAMA (Sembunyikan saat mode print PDF aktif) */}
      <div className="print:hidden space-y-6">
        {/* Header Informasi */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <FaBoxes className="text-[#e11d48]" /> Kontrol Stok & Penyesuaian Harga
            </h2>
            <p className="text-xs text-slate-400 mt-1">Klik ikon edit kuning pada baris tabel untuk melakukan penyesuaian stok gudang.</p>
          </div>

          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Cari nama barang / SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-[#e11d48] transition-all"
            />
            <FaSearch className="absolute left-3 top-3.5 text-slate-500 text-xs" />
          </div>
        </div>

        {/* Form Overlay Modal Penyesuaian Stok */}
        {editingProduct && (
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 shadow-2xl animate-fadeIn">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <FaEdit /> Form Update Logistik Produk #{editingProduct.id}
                </h3>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg text-xs">
                  <FaTimes /> Cancel
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-500 font-bold uppercase">Nama Item</label>
                  <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500 font-bold uppercase">Jumlah Stok Baru</label>
                    <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-amber-500" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500 font-bold uppercase">Harga Jual Baru (Rp)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-amber-500" required />
                  </div>
                </div>
                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all">
                  SIMPAN PERUBAHAN & GENERATE INVOICE
                </button>
              </form>
            </div>

            {/* LIVE PREVIEW INVOICE HASIL UPDATE */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 flex flex-col justify-between min-h-[220px]">
              {invoiceData ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                        <FaCheckCircle /> UPDATE BERHASIL
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">{invoiceData.invoiceNumber}</p>
                    </div>
                    <button onClick={handlePrintInvoice} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all">
                      <FaPrint /> Cetak Dokumen / Save PDF
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-[11px] text-slate-400 font-mono">
                    <div>Penanggung Jawab:</div><div className="text-white text-right font-sans">{invoiceData.adminName}</div>
                    <div>Waktu Eksekusi:</div><div className="text-white text-right">{invoiceData.date}</div>
                    <div>Suku Cadang:</div><div className="text-white text-right truncate font-sans">{invoiceData.productName}</div>
                    <div>Riwayat Stok:</div><div className="text-right font-bold"><span className="text-rose-500">{invoiceData.oldStock}</span> ➔ <span className="text-emerald-400">{invoiceData.newStock} Pcs</span></div>
                    <div>Riwayat Harga:</div><div className="text-right font-bold"><span className="text-rose-500">Rp {invoiceData.oldPrice.toLocaleString()}</span> ➔ <span className="text-emerald-400">Rp {invoiceData.newPrice.toLocaleString()}</span></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center my-auto text-slate-600 gap-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-center">Invoice Logistik Belum Tersedia</p>
                  <p className="text-[10px] text-slate-700 text-center max-w-xs">Selesaikan pengisian data form di samping kiri untuk mengunduh bukti fisik penyesuaian stok.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabel Utama Penampil Semua Stok */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
              <FaSpinner className="animate-spin text-[#e11d48]" /> Loading data gudang...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-3 pl-2">ID</th>
                    <th className="pb-3">Nama Suku Cadang</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Merek / Tipe</th>
                    <th className="pb-3">Harga</th>
                    <th className="pb-3">Stok</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right pr-2">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan="8" className="py-6 text-center text-slate-500">Katalog kosong / tidak ditemukan.</td></tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const stockNum = Number(prod.stock || 0);
                      let statusLabel = 'Aman';
                      let badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      let stockColor = 'text-white';

                      if (stockNum === 0) {
                        statusLabel = 'Habis';
                        badgeClass = 'bg-rose-600 text-white font-bold';
                        stockColor = 'text-rose-500 line-through';
                      } else if (stockNum <= 5) {
                        statusLabel = 'Kritis';
                        badgeClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                        stockColor = 'text-rose-400 font-bold';
                      } else if (stockNum <= 15) {
                        statusLabel = 'Menipis';
                        badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                        stockColor = 'text-amber-400';
                      }

                      return (
                        <tr key={prod.id} className="text-slate-300 hover:bg-slate-800/20 transition-colors">
                          <td className="py-3.5 pl-2 font-mono text-slate-500">#{prod.id}</td>
                          <td className="py-3.5 font-medium text-white max-w-xs truncate">{prod.name}</td>
                          <td className="py-3.5 font-mono text-slate-400 uppercase">{prod.sku || '-'}</td>
                          <td className="py-3.5 text-slate-500">{prod.motor_brand || 'Universal'} - {prod.motor_type || 'All'}</td>
                          <td className="py-3.5 font-bold text-slate-200">Rp {Number(prod.price || 0).toLocaleString('id-ID')}</td>
                          <td className={`py-3.5 ${stockColor}`}>{stockNum} Pcs</td>
                          <td className="py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${badgeClass}`}>{statusLabel}</span>
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <button onClick={() => handleEditClick(prod)} className="text-amber-500 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-all" title="Sesuaikan Stok Item">
                              <FaEdit size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* AREA KHUSUS INVOICE DOKUMEN CETAK PDF */}
      {invoiceData && (
        <div className="hidden print:block bg-white text-black p-8 font-mono text-xs space-y-6">
          <div className="border-b-2 border-black pb-4 text-center">
            <h1 className="text-xl font-bold tracking-wider">MOTOPART WORKSHOP MOTO SERVICE</h1>
            <p className="text-[10px]">Sistem Manajemen Logistik & Pusat Suku Cadang Terpusat</p>
            <p className="text-[10px] font-bold mt-1">BERITA ACARA PENYESUAIAN INVENTORI STOK GUDANG</p>
          </div>

          <div className="flex justify-between">
            <div>
              <p><strong>No. Dokumen :</strong> {invoiceData.invoiceNumber}</p>
              <p><strong>Operator     :</strong> {invoiceData.adminName}</p>
            </div>
            <div className="text-right">
              <p><strong>Tanggal Cetak :</strong> {invoiceData.date}</p>
              <p><strong>Status Aturan :</strong> VALIDASI DATABASE</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-black my-4">
            <thead>
              <tr className="bg-gray-200 border-b border-black">
                <th className="p-2 border-r border-black">Spesifikasi Item</th>
                <th className="p-2 border-r border-black text-center">Kondisi Lama</th>
                <th className="p-2 text-center">Kondisi Baru</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="p-2 border-r border-black">
                  <p className="font-bold font-sans">{invoiceData.productName}</p>
                  <p className="text-[10px]">SKU: {invoiceData.sku}</p>
                </td>
                <td className="p-2 border-r border-black text-center text-red-600 font-bold">
                  <p>{invoiceData.oldStock} Pcs</p>
                  <p>Rp {invoiceData.oldPrice.toLocaleString()}</p>
                </td>
                <td className="p-2 text-center text-green-600 font-bold bg-gray-50">
                  <p>{invoiceData.newStock} Pcs</p>
                  <p>Rp {invoiceData.newPrice.toLocaleString()}</p>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="pt-12 flex justify-between text-center">
            <div className="w-48">
              <p>Mengetahui,</p>
              <p className="mt-16 border-t border-black pt-1">Kepala Gudang Logistik</p>
            </div>
            <div className="w-48">
              <p>Petugas Pelaksana,</p>
              <p className="mt-16 border-t border-black pt-1">{invoiceData.adminName}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminStock;
