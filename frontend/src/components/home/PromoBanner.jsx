import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaGift, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

const PromoBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const { t } = useTranslation(); // 👈 2. PANGGIL FUNGSI TRANSLATE

  const isPromoMode = searchParams.get('promo') === 'true';

  // 1. FETCH DATA BANNER AKTIF DARI BACKEND HGI SPEED
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchBanners = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/banners`, { signal: controller.signal });
        const resData = await res.json();

        if (resData.success && isMounted) {
          setBanners(resData.data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Gagal memuat banner promosi backend:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanners();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // 🛠️ FIX LOADING SKELETON: Tampilkan 2 Kotak Berdampingan Aspek Rasio 16:9 (Aspect Video)
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="w-full aspect-video bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="w-full aspect-video bg-slate-200/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // JIKA KOSONG: Sembunyikan kontainer agar layout katalog naik rapi
  if (banners.length === 0) return null;

  // 🛠️ FILTER DATA: Ambil maksimal 2 banner teratas dari array data backend
  const displayBanners = banners.slice(0, 2);

  return (
    // Grid otomatis: 1 kolom di HP (vertikal tumpuk), langsung berubah jadi 2 kolom sejajar di tablet/PC
    <div className={`grid grid-cols-1 ${displayBanners.length > 1 ? 'md:grid-cols-2' : ''} gap-4 mb-6 select-none`}>
      {displayBanners.map((banner, index) => (
        <div
          key={banner.id || index}
          className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/60 shadow-sm group relative animate-fadeIn transition-all duration-300 hover:shadow-md hover:border-slate-700/80"
        >

          {/* 🛠️ ASPEK RASIO 16:9 SECARA PRESISI: Mengunci foto di posisi cover penuh */}
          {banner.image ? (
            <img
              src={`${BASE_URL}/uploads/banners/${banner.image}`}
              alt={banner.title || "HGI SPEED Promo"}
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-[1.02] transition-transform duration-700"
            />
          ) : (
            // Fallback Gradasi Warna Dinamis jika admin belum mengisi gambar di backend
            <div className={`absolute inset-0 bg-gradient-to-br ${
              index === 0
                ? 'from-[#e11d48]/90 via-slate-950 to-slate-950'
                : 'from-slate-900 via-slate-950 to-black'
            }`} />
          )}

          {/* Lapisan Lembut Gelap Gradasi Teks Bawah */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

          {/* KONTEN TEKS & LAYER INFO DI ATAS FOTO */}
          <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-6 text-white z-10">

            {/* Sektor Atas: Badge Promosi */}
            <div className="flex justify-between items-start">
              <span className="inline-flex items-center gap-1 bg-[#e11d48] text-white font-black text-[8px] md:text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm">
                <FaGift size={8} /> {banner.badge || (isPromoMode ? t('flash_discount') : t('crazy_promo'))}
              </span>
            </div>

            {/* Sektor Bawah: Judul, Deskripsi, dan Tombol Sinkron */}
            <div className="flex items-end justify-between gap-4 border-t border-white/5 pt-3 bg-gradient-to-t from-black/50 p-2 rounded-xl backdrop-blur-[2px]">
              <div className="space-y-0.5 min-w-0 flex-1">
                <h3 className="text-xs md:text-sm font-black tracking-tight uppercase text-white font-heading truncate">
                  {banner.title || t('exclusive_garage_promo')}
                </h3>
                <p className="text-[10px] text-slate-300 font-medium line-clamp-1">
                  {banner.description || t('exclusive_promo_desc')}
                </p>
              </div>

              {banner.link && (
                <a
                  href={banner.link}
                  className="w-max bg-white hover:bg-[#e11d48] hover:text-white text-slate-950 font-black text-[9px] md:text-[10px] px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1 uppercase tracking-wider flex-shrink-0"
                >
                  <span>{t('claim')}</span>
                  <FaChevronRight size={6} />
                </a>
              )}
            </div>

          </div>

          {/* Garis Aksen List Racing Bawah */}
          <div className={`absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r ${
            index === 0 ? 'from-[#e11d48] via-red-500' : 'from-amber-500 via-yellow-400'
          } to-transparent`} />
        </div>
      ))}
    </div>
  );
};

export default PromoBanner;
