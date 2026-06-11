import { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { FaCartPlus, FaHeart, FaRegHeart, FaStar, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from "../../config/api";

const FlashSale = () => {
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(8110);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  // 🛠️ INISIALISASI HOOKS GLOBAL
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // 1. AMBIL DATA PRODUK FLASH SALE DENGAN ABORT CONTROLLER STERIL
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const loadFlashSales = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/products/flash-sale`, { signal });
        const resData = await res.json();

        if (isMounted && resData.success) {
          setProducts(resData.data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Gagal mengambil produk flash sale:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFlashSales();

    return () => {
      isMounted = false;
      controller.abort(); // Potong jalur fetch secara instan saat unmount!
    };
  }, []);

  // 2. TIMER HITUNG MUNDUR (COUNTDOWN)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return { h, m, s };
  };

  const { h, m, s } = formatTime(timeLeft);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-xs font-mono">
        <FaSpinner className="animate-spin text-[#e11d48]" /> {t('sync_flash_sale')}
      </div>
    );
  }

  if (products.length === 0) return null; // Sembunyikan seksi jika tidak ada produk promo

  return (
    <section id="flash-sale-section" className="py-12 bg-gray-50 border-t border-gray-100 select-none">
      <Container>

        {/* HEADER SEKSl FLASH SALE & COUNTDOWN TIMER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h3 className="font-heading text-xl font-black text-[#e11d48] tracking-tight uppercase flex items-center gap-2">
              {t('flash_sale_title')}
            </h3>
            <div className="flex items-center gap-1 text-white font-mono font-bold text-xs md:text-sm">
              <span className="bg-[#0f172a] px-2.5 py-1 rounded-lg shadow-sm">{h}</span>
              <span className="text-[#0f172a] font-sans">:</span>
              <span className="bg-[#0f172a] px-2.5 py-1 rounded-lg shadow-sm">{m}</span>
              <span className="text-[#0f172a] font-sans">:</span>
              <span className="bg-[#0f172a] px-2.5 py-1 rounded-lg shadow-sm">{s}</span>
            </div>
          </div>
          <button className="text-xs md:text-sm font-bold text-[#e11d48] hover:text-red-700 transition-colors border border-red-100 hover:bg-red-50/50 px-3 py-1.5 rounded-xl uppercase tracking-wider">
            {t('see_all_promo')}
          </button>
        </div>

        {/* GRID KATALOG PRODUK DISKON */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {products.map((prod) => {
            // Kalkulasi harga final setelah diskon persen secara aman
            const originalPrice = Number(prod.price) || 0;
            const discountPercent = Number(prod.discount_percentage) || 0;
            const finalPrice = originalPrice - (originalPrice * discountPercent / 100);

            const isFavorite = wishlist.some((item) => item.id === prod.id);
            const currentRating = prod.rating ? Number(prod.rating) : 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative"
              >
                {/* Badge Presentase Diskon */}
                <span className="absolute top-3 left-3 bg-[#e11d48] text-white text-[10px] font-black px-2 py-0.5 rounded-md z-10 shadow-sm font-mono">
                  -{discountPercent}%
                </span>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(prod)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-sm border border-gray-100/60 transition-all active:scale-90 hover:bg-gray-50"
                >
                  {isFavorite ? (
                    <FaHeart className="text-[#e11d48] scale-105 transition-transform" />
                  ) : (
                    <FaRegHeart className="text-gray-400 hover:text-[#e11d48] transition-colors" />
                  )}
                </button>

                {/* IMAGE FRAME */}
                <div className="relative bg-gray-50 w-full pt-[100%] overflow-hidden border-b border-gray-100">
                  {prod.image ? (
                    <img
                      src={`${BASE_URL}/uploads/products/${prod.image}`}
                      alt={prod.name}
                      className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 p-2"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-400 bg-gray-100 p-4 text-center uppercase">
                      {prod.name.substring(0, 15)}...
                    </div>
                  )}
                </div>

                {/* DETAIL PRODUK */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    {/* SINKRONISASI BADGE BRAND & MOTOR TIPE */}
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded w-max mb-1.5">
                      {prod.brand_name || 'Universal'} {prod.motor_type || ''}
                    </p>

                    <h4 className="text-xs font-bold text-gray-700 line-clamp-2 group-hover:text-[#e11d48] transition-colors leading-snug tracking-tight mb-2">
                      {prod.name}
                    </h4>

                    {/* STATS BAR RATING & VOLUME TERJUAL */}
                    <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500">
                      {currentRating > 0 ? (
                        <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200/40">
                          <FaStar className="text-amber-400" size={10} />
                          <span>{currentRating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-[9px] italic">{t('not_reviewed_yet')}</div>
                      )}

                      <span className="text-gray-300">|</span>

                      <span className="font-medium text-gray-500">
                        {t('sold')} <span className="font-bold text-gray-700">{prod.sold || 0}</span>
                      </span>
                    </div>

                    {/* STOK INFO TERSISA */}
                    <div className="flex items-center gap-1 text-[10px] mb-3">
                      {prod.stock > 0 ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                          <FaCheckCircle size={10} />
                          <span>{t('remaining')} <span className="font-bold font-mono">{prod.stock}</span> {t('pcs')}</span>
                        </div>
                      ) : (
                        <span className="text-red-500 font-bold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                          {t('out_of_stock')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KOTAK HARGA DISKON & ADDTOCART CONTROLLER */}
                  <div>
                    <div className="flex flex-col gap-0.5 mb-3">
                      <span className="text-sm font-black text-[#e11d48] font-mono leading-none">
                        {/* 🛠️ OTOMATIS BERUBAH SESUAI KURS & NEGARA */}
                        {formatPrice(finalPrice)}
                      </span>
                      <span className="text-[10px] text-gray-400 line-through font-mono">
                        {/* 🛠️ OTOMATIS BERUBAH SESUAI KURS & NEGARA */}
                        {formatPrice(originalPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart({ ...prod, price: finalPrice })}
                      disabled={prod.stock <= 0}
                      className={`w-full text-white text-[11px] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm uppercase tracking-wider ${
                        prod.stock > 0
                          ? 'bg-gray-900 hover:bg-[#e11d48] active:scale-95'
                          : 'bg-gray-300 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <FaCartPlus size={11} /> {prod.stock > 0 ? t('buy') : t('out_of_stock')}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default FlashSale;
