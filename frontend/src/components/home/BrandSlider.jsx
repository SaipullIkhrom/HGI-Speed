import { useState } from 'react';
import { Container } from '../layout/Container';
import { FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const brands = [
  { id: 1, name: 'Honda Genuine Parts', logo: '/icon/logo-honda.png' },
  { id: 2, name: 'Yamaha Genuine Parts', logo: '/icon/logo-yamaha.png' },
  { id: 3, name: 'Motul', logo: '/icon/logo-motul.png' },
  { id: 4, name: 'Pirelli', logo: '/icon/logo-pirelli.png' },
  { id: 5, name: 'GS Astra', logo: '/icon/logo-gs.png' },
  { id: 6, name: 'NGK Spark Plugs', logo: '/icon/logo-ngk.png' },
];

const BrandSlider = () => {
  const { t } = useTranslation(); 

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <Container>
        <div className="flex items-center gap-2 mb-6">
          <FaShieldAlt className="text-[#e11d48]" />
          <h3 className="font-heading text-sm font-bold text-gray-400 tracking-widest uppercase">
            {t('official_brand_partners')} {/* 👈 3. PASANG TEKS DINAMIS DI SINI */}
          </h3>
        </div>

        {/* Grid Sistem Responsif HGI SPEED */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-5">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </Container>
    </section>
  );
};

// 🛠️ SUB-KOMPONEN MANDIRI: Mengisolasi status error gambar agar penanganan fallback text 100% akurat
const BrandCard = ({ brand }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="bg-slate-50/80 rounded-2xl border border-slate-100/70 flex items-center justify-center relative overflow-hidden select-none cursor-pointer group aspect-video p-0 hover:bg-white hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300"
      title={brand.name}
    >
      {/* Kondisi Jika Gambar Aman dan Belum Error */}
      {brand.logo && !imgError ? (
        <img
          src={brand.logo}
          alt={brand.name}
          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)} // 👈 FIX MUTLAK: Mengubah state lewat React Virtual DOM secara aman
        />
      ) : (
        /* Teks Cadangan Premium Muncul Otomatis Jika Jalur File Gambar Rusak atau Kosong */
        <div className="absolute inset-0 flex flex-col items-center justify-center font-heading font-black text-[10px] sm:text-xs text-slate-400 tracking-tight text-center uppercase p-3 bg-slate-100/80 border border-transparent group-hover:text-[#e11d48] transition-colors">
          {brand.name}
        </div>
      )}
    </div>
  );
};

export default BrandSlider;
