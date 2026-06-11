import { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { FaShieldAlt, FaTruck, FaPercentage, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import VoucherSidebar from './VoucherSidebar';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🛠️ INISIALISASI HOOKS GLOBAL
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // Slide Data menggunakan fungsi t() dinamis
  const slides = [
    {
      id: 1,
      image: "/icon/Motorcycle1.jpg",
      label: t('slide_1_label'),
      title: t('slide_1_title'),
      desc: t('slide_1_desc'),
    },
    {
      id: 2,
      image: "/icon/Motorcycle2.jpg",
      label: t('slide_2_label'),
      title: t('slide_2_title'),
      desc: t('slide_2_desc'),
    },
    {
      id: 3,
      image: "/icon/Motorcycle3.jpg",
      label: t('slide_3_label'),
      title: t('slide_3_title'),
      desc: t('slide_3_desc'),
    },
    {
      id: 4,
      image: "/icon/Motorcycle4.jpg",
      label: t('slide_4_label'),
      title: t('slide_4_title'),
      desc: t('slide_4_desc'),
    },
    {
      id: 5,
      image: "/icon/Motorcycle5.jpg",
      label: t('slide_5_label'),
      title: t('slide_5_title'),
      desc: t('slide_5_desc'),
    }
  ];

  // LOGIKA UTAMA SWIPER AUTO-SWAP
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section className="py-4 md:py-6 select-none">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* ==================== 🛠️ SISI KIRI: VOUCHERSIDEBAR ==================== */}
          <div className="col-span-1 lg:col-span-3 h-full">
            <VoucherSidebar />
          </div>

          {/* ==================== SISI TENGAH: MAIN AUTO-SLIDER SWIPER ==================== */}
          <div className="col-span-1 lg:col-span-6 relative rounded-3xl overflow-hidden h-[280px] sm:h-[350px] md:h-[420px] lg:h-auto min-h-[350px] bg-slate-200 group shadow-sm">
            {/* Render Slides */}
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  alt="Slide Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-12 text-white">
                  <h4 className="text-[#e11d48] font-bold text-xs md:text-sm mb-2 tracking-widest uppercase">
                    {slide.label}
                  </h4>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-heading font-extrabold mb-3 md:mb-5 leading-tight whitespace-pre-line">
                    {slide.title}
                  </h2>
                  <p className="text-xs opacity-80 max-w-sm hidden sm:block leading-relaxed line-clamp-2 mb-4">
                    {slide.desc}
                  </p>
                  <button className="bg-[#e11d48] w-fit px-5 py-2 md:px-8 md:py-3 text-xs rounded-full font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-900/30 uppercase tracking-wider">
                    {t('buy')}
                  </button>
                </div>
              </div>
            ))}

            {/* Navigasi Panah */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#e11d48]">
              <FaChevronLeft size={12} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#e11d48]">
              <FaChevronRight size={12} />
            </button>

            {/* Indikator Titik (Dots) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 transition-all rounded-full ${index === currentSlide ? "w-8 bg-[#e11d48]" : "w-2 bg-white/50"}`}
                />
              ))}
            </div>
          </div>

          {/* ==================== SISI KANAN: FEATUREBOX KLAIM PROMO ==================== */}
          <div className="col-span-1 lg:col-span-3 flex flex-col justify-between gap-3 md:gap-4 h-full">
            <FeatureBox
              icon={<FaTruck className="text-[#e11d48]" />}
              title={t('feat_1_title')}
              // 🛠️ TRIK INTERPOLASI: Menggabungkan format harga ke dalam teks terjemahan!
              desc={t('feat_1_desc', { price: formatPrice(50000) })}
              tag="Claim"
              subInfo={t('feat_1_sub')}
            />
            <FeatureBox
              icon={<FaCheckCircle className="text-emerald-500" />}
              title={t('feat_2_title')}
              desc={t('feat_2_desc')}
              tag="Safe"
              subInfo={t('feat_2_sub')}
            />
            <FeatureBox
              icon={<FaPercentage className="text-amber-500" />}
              title={t('feat_3_title')}
              desc={t('feat_3_desc')}
              tag="Limit"
              subInfo={t('feat_3_sub')}
            />
            <FeatureBox
              icon={<FaShieldAlt className="text-indigo-500" />}
              title={t('feat_4_title')}
              desc={t('feat_4_desc')}
              tag="Fast"
              subInfo={t('feat_4_sub')}
            />
          </div>

        </div>
      </Container>
    </section>
  );
};

// Sub-Komponen FeatureBox Terdekorasi Padat
const FeatureBox = ({ icon, title, desc, tag, subInfo }) => (
  <div className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-4 hover:border-[#e11d48] hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 cursor-default group flex-1 w-full relative overflow-hidden">
    <span className="absolute top-0 right-0 bg-slate-100 group-hover:bg-[#e11d48] text-slate-500 group-hover:text-white text-[8px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-widest font-mono border-l border-b border-gray-100/50 transition-colors">
      {tag}
    </span>

    <div className="text-2xl md:text-3xl flex-shrink-0 transition-transform group-hover:scale-110 duration-300 p-3 bg-gray-50 rounded-2xl group-hover:bg-red-50/50 transition-colors">
      {icon}
    </div>

    <div className="min-w-0 flex-1 space-y-0.5">
      <h5 className="font-extrabold text-xs md:text-sm text-slate-900 tracking-tight group-hover:text-[#e11d48] transition-colors">
        {title}
      </h5>
      <p className="text-[10px] md:text-xs font-semibold text-slate-700 truncate">
        {desc}
      </p>
      <p className="text-[9px] text-gray-400 font-medium tracking-normal border-t border-gray-100 pt-1 mt-1 group-hover:border-red-100/40 transition-colors">
        💡 {subInfo}
      </p>
    </div>
  </div>
);

export default Hero;
