import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaTags, FaThLarge, FaChevronRight, FaMotorcycle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const { t } = useTranslation();

  // Membaca kategori yang sedang aktif dari URL (misal: ?category=Mesin)
  const activeCategory = searchParams.get('category') || '';

  // 1. AMBIL DATA KATEGORI LIVE DARI BACKEND DENGAN ABORT CONTROLLER
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        if (isMounted) setLoadingCategories(true);
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
      newParams.delete('category'); // Hapus filter jika "Semua Suku Cadang" diklik
    }
    setSearchParams(newParams);
  };

  return (
    <div className="bg-white/90 backdrop-blur-2xl border border-slate-100 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 sticky top-28 z-10 hidden md:block">

      {/* Header Sidebar */}
      <div className="border-b border-slate-100/80 pb-4 flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]">
            <FaTags size={12} />
          </div>
          {t('category_sidebar_title') || 'Kategori Part'}
        </h4>
      </div>

      {/* List Kategori Container */}
      <div className="flex flex-col gap-2">

        {/* Tombol "Semua Kategori" */}
        <button
          onClick={() => handleCategoryClick('')}
          className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 w-full text-left group ${
            activeCategory === ''
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1'
              : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <FaThLarge size={14} className={`${activeCategory === '' ? 'text-[#e11d48]' : 'text-slate-300 group-hover:text-slate-400'} transition-colors`} />
            <span className="text-xs uppercase tracking-wider">{t('all_spare_parts') || 'Semua Katalog'}</span>
          </div>
          {activeCategory === '' && <div className="w-1.5 h-1.5 rounded-full bg-[#e11d48] shadow-[0_0_8px_#e11d48]"></div>}
        </button>

        {/* Separator Tipis */}
        <div className="w-full h-px bg-gradient-to-r from-slate-100 via-slate-100 to-transparent my-1"></div>

        {/* Render Dinamis List Kategori Backend */}
        {loadingCategories ? (
          <div className="space-y-2.5 animate-pulse w-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 bg-slate-50 rounded-2xl border border-slate-100/50 w-full"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Kategori Kosong
          </div>
        ) : (
          categories.map((cat) => {
            const isCurrentActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 w-full text-left group relative overflow-hidden ${
                  isCurrentActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-x-1'
                    : 'bg-transparent text-slate-600 hover:bg-rose-50/50 hover:text-[#e11d48]'
                }`}
              >
                {/* Accent Background Hover untuk efek premium */}
                {!isCurrentActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-50/0 via-rose-50/0 to-rose-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <FaMotorcycle size={14} className={`${isCurrentActive ? 'text-slate-400' : 'text-slate-200 group-hover:text-[#e11d48]/50'} transition-colors`} />
                  <span className="text-xs truncate capitalize tracking-wide">{cat.name}</span>
                </div>

                <div className="relative z-10">
                  {isCurrentActive ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#e11d48] shadow-[0_0_8px_#e11d48] animate-pulse"></div>
                  ) : (
                    <FaChevronRight size={10} className="text-slate-300 group-hover:text-[#e11d48] group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategorySidebar;
