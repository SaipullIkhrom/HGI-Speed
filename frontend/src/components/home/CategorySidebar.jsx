import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaTags, FaThLarge } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation(); // 👈 2. PANGGIL FUNGSI TRANSLATE

  const activeCategory = searchParams.get('category') || '';

  // 1. AMBIL DATA KATEGORI LIVE DARI BACKEND DENGAN ABORT CONTROLLER
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/categories`, { signal: controller.signal });
        const resData = await res.json();
        if (resData.success && isMounted) {
          setCategories(resData.data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Gagal memuat kategori di sidebar:", err);
        }
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // 2. LOGIKA HANDLER FILTER SAAT KATEGORI DI-KLIK
  const handleCategoryClick = (catName) => {
    const newParams = new URLSearchParams(searchParams);
    if (catName) {
      newParams.set('category', catName);
    } else {
      newParams.delete('category'); // Jika klik "Semua Suku Cadang", hapus filter kategori dari URL
    }
    setSearchParams(newParams);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 sticky top-24">
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-3">
        <FaTags className="text-[#e11d48]" size={12} /> {t('category_sidebar_title')}
      </h4>

      <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none text-xs">
        {/* Pilihan 1: Semua Kategori */}
        <button
          onClick={() => handleCategoryClick('')}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-all w-full text-left ${
            activeCategory === ''
              ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20 scale-[1.02]'
              : 'bg-gray-50 text-slate-600 hover:bg-gray-100/80 hover:text-slate-900'
          }`}
        >
          <FaThLarge size={11} className={activeCategory === '' ? 'text-[#e11d48]' : 'text-gray-400'} />
          <span>{t('all_spare_parts')}</span>
        </button>

        {/* Render Dinamis List Kategori */}
        {loadingCategories ? (
          <div className="space-y-2 py-2 animate-pulse w-full hidden lg:block">
            <div className="h-9 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-9 bg-gray-100 rounded-xl w-full"></div>
          </div>
        ) : (
          categories.map((cat) => {
            const isCurrentActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-all w-full text-left group ${
                  isCurrentActive
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20 scale-[1.02]'
                    : 'bg-gray-50 text-slate-600 hover:bg-gray-100/80 hover:text-[#e11d48]'
                }`}
              >
                {/* Catatan: Nama kategori dari DB dibiarkan utuh agar query backend tetap cocok */}
                <span className="truncate">{cat.name}</span>
                <span className={`text-[10px] font-mono hidden lg:inline-block px-1.5 py-0.5 rounded ${
                  isCurrentActive ? 'bg-[#e11d48] text-white' : 'bg-gray-200/60 text-slate-500 group-hover:bg-red-50 group-hover:text-[#e11d48]'
                }`}>
                  ⚙️
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;
