import { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { FaMotorcycle, FaUndo } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

// Array tahun tetap kita pertahankan di frontend demi efisiensi
const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

const MotorFilter = ({ onFilterSearch, onReset }) => {
  // 1. State untuk menampung data master brand asli dari database backend
  const [brands, setBrands] = useState([]);

  // State pilihan filter penampung user
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const { t } = useTranslation(); // 👈 2. PANGGIL FUNGSI TRANSLATE

  // 2. Ambil data master brand dari API backend saat komponen pertama kali dimuat
  useEffect(() => {
    fetch(`${BASE_URL}/api/brands`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setBrands(resData.data || []);
        }
      })
      .catch((err) => console.error("Gagal memuat master brand di filter:", err));
  }, []);

  const handleBrandChange = (e) => {
    setSelectedBrandId(e.target.value);
    setSelectedType(''); // Otomatis reset pilihan tipe jika merk/brand berganti
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onFilterSearch) {
      // Mengirimkan parameter ID brand, teks tipe, dan tahun ke handler utama di CustomerHome.jsx
      onFilterSearch(selectedBrandId, selectedType, selectedYear);
    }
  };

  const handleClear = () => {
    setSelectedBrandId('');
    setSelectedType('');
    setSelectedYear('');
    if (onReset) {
      onReset(); // Mengembalikan katalog produk utama ke kondisi tanpa filter
    }
  };

  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <Container>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">

          {/* Sisi Kiri: Teks Informasi & Tombol Reset Cepat */}
          <div className="z-10 flex-1">
            <h3 className="font-heading text-xl font-bold text-[#0f172a] tracking-tight uppercase mb-2">
              {t('choose_your_motorcycle')}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-3">
              {t('filter_desc')}
            </p>

            {/* Tombol Reset Filter hanya muncul jika ada filter yang aktif */}
            {/* Menggunakan !! untuk memastikan nilainya boolean agar aman dari render angka 0 */}
            {(!!selectedBrandId || !!selectedType || !!selectedYear) && (
              <button
                onClick={handleClear}
                className="text-xs text-[#e11d48] font-bold flex items-center gap-1.5 hover:text-red-700 transition-colors underline decoration-dotted"
              >
                <FaUndo size={10} /> {t('reset_search')}
              </button>
            )}
          </div>

          {/* Sisi Tengah: Form Dropdown Sinkronisasi API */}
          <form onSubmit={handleSearch} className="z-10 w-full md:w-auto flex flex-col sm:flex-row items-center gap-4 flex-[2]">

            {/* Dropdown Merk (DATA BACKEND REAL-TIME 🛠️) */}
            <div className="w-full relative">
              <select
                value={selectedBrandId}
                onChange={handleBrandChange}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#e11d48] transition-colors cursor-pointer"
                required
              >
                <option value="">{t('select_brand')}</option>
                {brands.map((br) => (
                  <option key={br.id} value={br.id}>
                    {br.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Tipe Motor */}
            <div className="w-full">
              <input
                type="text"
                placeholder={t('write_type')}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={!selectedBrandId}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#e11d48] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 font-medium font-sans"
              />
            </div>

            {/* Dropdown Tahun */}
            <div className="w-full">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-3 outline-none focus:border-[#e11d48] transition-colors cursor-pointer"
              >
                <option value="">{t('select_year')}</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Tombol Eksekusi Kirim Parameter */}
            <button
              type="submit"
              disabled={!selectedBrandId}
              className="w-full sm:w-auto bg-[#e11d48] text-white text-sm font-bold px-8 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md whitespace-nowrap active:scale-95"
            >
              {t('search_parts')}
            </button>
          </form>

          {/* Ilustrasi Motor di Pojok Kanan (Hiasan Latar Belakang) */}
          <div className="hidden lg:block opacity-5 absolute right-[-20px] bottom-[-20px] text-[180px] text-[#0f172a] pointer-events-none transform -rotate-12 select-none">
            <FaMotorcycle />
          </div>

        </div>
      </Container>
    </section>
  );
};

export default MotorFilter;
