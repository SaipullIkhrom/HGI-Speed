import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaFolderOpen, FaMoneyBillWave, FaBoxOpen, FaPercent, FaCloudUploadAlt, FaFileAlt, FaTags } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // 🛠️ State baru untuk menampung daftar brand dari backend
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    discount: 0,
    brand_id: '', // 🛠️ Diubah dari 'brand' teks biasa menjadi 'brand_id' hasil relasi database
    type: '',
    year: '',
    category_id: ''
  });

  const fetchProducts = () => {
    fetch(`${BASE_URL}/api/products`)
      .then(res => res.json())
      .then(resData => { if (resData.success) setProducts(resData.data); });
  };

  const fetchCategories = () => {
    fetch(`${BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(resData => { if (resData.success) setCategories(resData.data); });
  };

  const fetchBrands = () => {
    // 🛠️ Fungsi fetch data brand asli untuk sinkronisasi relasi AdminBrands.jsx
    fetch(`${BASE_URL}/api/brands`)
      .then(res => res.json())
      .then(resData => { if (resData.success) setBrands(resData.data); });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands(); // 🛠️ Picu load data brand saat komponen pertama kali dipasang
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('price', Number(formData.price));
    dataToSend.append('stock', Number(formData.stock));
    dataToSend.append('discount_percentage', Number(formData.discount));
    dataToSend.append('brand_id', formData.brand_id); // 🛠️ Kirim ID brand relasi ke backend
    dataToSend.append('motor_type', formData.type);
    dataToSend.append('motor_year', formData.year);
    dataToSend.append('category_id', formData.category_id);

    if (imageFile) dataToSend.append('image', imageFile);

    try {
      const response = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        body: dataToSend
      });

      if (response.ok) {
        alert('Produk Suku Cadang Baru Berhasil Ditambahkan ke Katalog!');
        setFormData({ name: '', price: '', stock: '', discount: 0, brand_id: '', type: '', year: '', category_id: '' });
        setImageFile(null);
        setImagePreview(null);
        document.getElementById('product-image-input').value = '';
        fetchProducts();
      } else {
        alert('Gagal menambahkan data produk baru.');
      }
    } catch (error) {
      console.error("Gagal menyimpan produk:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus produk ini dari katalog?')) {
      await fetch(`${BASE_URL}/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const calculatedFinalPrice = formData.price - (formData.price * (formData.discount || 0) / 100);

  // 🛠️ Cari nama brand yang sedang dipilih secara dinamis untuk Live Preview
  const selectedBrandObj = brands.find(b => Number(b.id) === Number(formData.brand_id));
  const previewBrandName = selectedBrandObj ? selectedBrandObj.name : 'Merek';

  return (
    <div className="space-y-10 animate-fadeIn text-slate-200 font-sans">

      {/* 1. Header Modern */}
      <div className="relative p-6 bg-gradient-to-r from-slate-900 via-slate-800/40 to-transparent border border-slate-800/80 rounded-3xl backdrop-blur-xl">
        <div className="absolute -right-10 -top-20 w-52 h-52 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 uppercase">
          Admin Produk
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
          Input komoditas suku cadang mutakhir dan manajemen entri ekosistem MotoPart.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

        {/* 2. Form Tambah Produk (Col-Span 2) */}
        <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-md shadow-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-4">
            <div className="w-2 h-5 bg-[#e11d48] rounded-full"></div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <FaPlus className="text-[#e11d48] text-[10px]" /> Form Tambah Produk
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">

            {/* Nama & Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider ml-1">Nama Suku Cadang</label>
                <input name="name" type="text" placeholder="Contoh: Piston Kit FIM GL Series..." value={formData.name} onChange={handleInputChange} className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-white focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]/20 outline-none transition-all" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider ml-1">Kelompok Kategori</label>
                <div className="relative flex items-center">
                  <FaFolderOpen className="absolute left-4 text-xs text-[#e11d48]" />
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]/20 outline-none w-full appearance-none cursor-pointer" required>
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Harga, Stok & Diskon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider ml-1">Harga Pokok</label>
                <div className="relative flex items-center">
                  <FaMoneyBillWave className="absolute left-4 text-slate-500 text-xs" />
                  <input name="price" type="number" placeholder="Rp" value={formData.price} onChange={handleInputChange} className="bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#e11d48] outline-none w-full" required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider ml-1">Kuantitas Awal Stok</label>
                <div className="relative flex items-center">
                  <FaBoxOpen className="absolute left-4 text-slate-500 text-xs" />
                  <input name="stock" type="number" placeholder="0 Pcs" value={formData.stock} onChange={handleInputChange} className="bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#e11d48] outline-none w-full" required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider ml-1">Alokasi Diskon</label>
                <div className="relative flex items-center">
                  <FaPercent className="absolute left-4 text-slate-500 text-[10px]" />
                  <input name="discount" type="number" max="100" placeholder="0 %" value={formData.discount} onChange={handleInputChange} className="bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#e11d48] outline-none w-full" />
                </div>
              </div>
            </div>

            {/* 🛠️ Kesesuaian Motor & Dropdown Pilihan Merek Komponen */}
            <div className="bg-slate-950/30 border border-slate-800/60 p-4 rounded-2xl space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Spesifikasi Kompatibilitas Unit</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* 🛠️ DROPDOWN BRAND DINAMIS (Menggantikan text input brand lama) */}
                <div className="relative flex items-center">
                  <FaTags className="absolute left-3 text-slate-500 text-[11px]" />
                  <select name="brand_id" value={formData.brand_id} onChange={handleInputChange} className="bg-slate-950/90 border border-slate-800/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-[#e11d48] w-full appearance-none cursor-pointer" required>
                    <option value="">-- Pilih Merek --</option>
                    {brands.map((br) => (
                      <option key={br.id} value={br.id}>{br.name}</option>
                    ))}
                  </select>
                </div>

                <input name="type" type="text" placeholder="Tipe (ex: Tiger / CB)" value={formData.type} onChange={handleInputChange} className="bg-slate-950/90 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-slate-700" />
                <input name="year" type="text" placeholder="Tahun Produksi" value={formData.year} onChange={handleInputChange} className="bg-slate-950/90 border border-slate-800/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-slate-700" />
              </div>
            </div>

            {/* Input Media Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-400 uppercase tracking-wider ml-1">Dokumentasi Gambar Suku Cadang</label>
              <div className="relative group flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-800 hover:border-[#e11d48]/40 rounded-2xl bg-slate-950/30 transition-all cursor-pointer">
                <input id="product-image-input" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500 group-hover:text-slate-300 transition-colors">
                  <FaCloudUploadAlt size={22} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" />
                  <p className="text-[10px] font-medium font-mono">{imageFile ? imageFile.name : "Klik / Tarik file gambar suku cadang ke area ini"}</p>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#e11d48] hover:bg-red-700 text-white font-black py-3.5 rounded-xl text-xs tracking-widest uppercase shadow-xl shadow-red-950/20 active:scale-[0.99] transition-all">
              Tambahkan Produk baru
            </button>
          </form>
        </div>

        {/* 3. Live Card Preview (Col-Span 1) */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl p-5 shadow-2xl space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 text-slate-400 uppercase font-black tracking-widest text-[10px] pb-2 border-b border-slate-800">
            <FaFileAlt size={10} className="text-amber-500" /> Preview Visual Katalog
          </div>
          <div className="w-full h-44 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative group">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview Produk" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="text-center text-slate-600 text-[10px] font-mono px-4">
                [ Belum Ada Dokumentasi Foto Diunggah ]
              </div>
            )}
            {formData.discount > 0 && (
              <span className="absolute top-3 right-3 bg-[#e11d48] text-white font-black text-[9px] px-2 py-0.5 rounded-md shadow-md animate-pulse">
                -{formData.discount}% DISKON
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white truncate">{formData.name || 'Nama Suku Cadang MotoPart'}</h4>
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-tight">
              {previewBrandName} {formData.type || 'Tipe'} {formData.year ? `(${formData.year})` : ''}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Harga Jual Konsumen</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                Rp {document ? Number(calculatedFinalPrice || 0).toLocaleString('id-ID') : '0'}
              </span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Ketersediaan</span>
              <span className="text-xs font-bold text-slate-300 font-mono">{formData.stock || 0} Pcs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabel Logistik Suku Cadang */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-4">
          <div className="w-2 h-5 bg-amber-500 rounded-full"></div>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">
            Inventori Manifes Terdaftar
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-4 pl-2">Informasi Produk Suku Cadang</th>
                <th className="pb-4">Mekanisme Volume Gudang</th>
                <th className="pb-4 text-center">Status Operasional</th>
                <th className="pb-4 text-right pr-2">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 text-slate-300">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-600 font-mono">
                    [ Belum ada data manifes logistik suku cadang terdaftar ]
                  </td>
                </tr>
              ) : (
                products.map(p => {
                  const stockNum = Number(p.stock || 0);
                  let stockStatus = 'Aman';
                  let badgeStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';

                  if (stockNum === 0) {
                    stockStatus = 'Habis';
                    badgeStyle = 'bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black';
                  } else if (stockNum <= 5) {
                    stockStatus = 'Kritis';
                    badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/10 transition-all group">
                      <td className="py-4 pl-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-[#e11d48] transition-colors">{p.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">
                            {/* 🛠️ Render properti brand_name yang dikirim backend hasil JOIN tabel brands */}
                            {p.brand_name || 'Universal'} {p.motor_type} {p.motor_year ? `(${p.motor_year})` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 font-mono">
                        <span className="text-slate-200 font-bold">{p.stock} Pcs</span>
                        <span className="text-slate-600 text-[11px] block mt-0.5">Mata Rantai Utama</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] uppercase tracking-wide font-black ${badgeStyle}`}>
                          {stockStatus}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-slate-600 hover:text-rose-500 bg-slate-950 border border-slate-800/80 hover:border-rose-500/30 p-2.5 rounded-xl transition-all inline-flex items-center"
                          title="Hapus Suku Cadang"
                        >
                          <FaTrash size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminProducts;
