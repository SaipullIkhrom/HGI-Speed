import { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { FaTint, FaCircleNotch, FaBatteryFull, FaSlidersH, FaCogs, FaBox } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

// Fungsi Fallback Ikon Lama
const getIconFallback = (name) => {
  switch (name.toLowerCase()) {
    case 'oli': return <FaTint className="text-red-500" />;
    case 'ban': return <FaCircleNotch className="text-gray-700" />;
    case 'aki': return <FaBatteryFull className="text-green-500" />;
    case 'rem': return <FaSlidersH className="text-blue-500" />;
    case 'mesin': return <FaCogs className="text-amber-600" />;
    default: return <FaBox className="text-gray-400" />;
  }
};

const PopularCategories = () => {
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation(); // 👈 2. PANGGIL FUNGSI TRANSLATE

  useEffect(() => {
    fetch(`${BASE_URL}/api/categories`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setCategories(resData.data || []);
      })
      .catch((err) => console.error('Gagal mengambil kategori:', err));
  }, []);

  return (
    <section className="py-8 bg-white border-y border-gray-100 font-sans">
      <Container>
        <h3 className="font-heading text-xl font-black text-[#0f172a] mb-6 tracking-tight uppercase flex items-center gap-2">
          {/* 👈 3. PASANG TEKS DINAMIS DI SINI */}
          <span className="w-1.5 h-3.5 bg-[#e11d48] rounded-full"></span> {t('popular_categories')}
        </h3>

        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-4 md:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col items-center p-3 sm:p-4 rounded-2xl border border-gray-50 hover:border-[#e11d48] hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 cursor-pointer group text-center w-full sm:w-28 bg-white"
            >
              {/* Lingkaran Gambar Kategori Dinamis */}
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:bg-red-50 transition-colors overflow-hidden border border-gray-100 relative shadow-inner">
                {cat.image ? (
                  <img
                    src={`${BASE_URL}/uploads/categories/${cat.image}`}
                    alt={cat.name}
                    className="w-full h-full object-cover p-2.5 transition-transform duration-300 group-hover:scale-110 z-10 relative"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallbackDiv = e.target.nextSibling;
                      if (fallbackDiv) {
                        fallbackDiv.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}

                {/* Komponen Penampung Ikon Cadangan */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-xl transition-colors"
                  style={{ display: cat.image ? 'none' : 'flex' }}
                >
                  {getIconFallback(cat.name)}
                </div>
              </div>

              <h5 className="font-bold text-xs md:text-sm text-[#0f172a] group-hover:text-[#e11d48] transition-colors truncate w-full tracking-tight">
                {cat.name}
              </h5>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default PopularCategories;
