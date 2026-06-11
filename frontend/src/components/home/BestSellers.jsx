import { useState, useEffect } from 'react';
import { Container } from '../layout/Container';
import { FaCartPlus, FaHeart, FaRegHeart, FaFire, FaStar } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from "../../config/api";

const BestSellers = () => {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  // 🛠️ INISIALISASI HOOKS GLOBAL
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // State lokal khusus untuk menampung 5 produk terlaris saja
  const [bestProducts, setBestProducts] = useState([]);

  useEffect(() => {
    // 🛠️ FIX SAFETY NETWORK: Gunakan AbortController untuk memotong koneksi fetch jika user pindah halaman
    const controller = new AbortController();
    const signal = controller.signal;

    const loadBestSellers = async () => {
      try {
       const res = await fetch(`${BASE_URL}/api/products/best-sellers`, {
       signal
       });

const resData = await res.json();

        if (resData.success && !signal.aborted) {
          setBestProducts(resData.data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Gagal mengambil data produk terlaris:', err);
        }
      }
    };

    loadBestSellers();

    // Jalankan fungsi cleanup pemutus sirkuit jaringan
    return () => {
      controller.abort();
    };
  }, []);

  if (bestProducts.length === 0) return null;

  return (
    <section className="py-10 bg-white">
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading text-xl font-bold text-[#0f172a] tracking-tight uppercase flex items-center gap-2">
            <FaFire className="text-[#e11d48]" /> {t('best_sellers_title')}
          </h3>
        </div>

        {/* Grid 5 Kolom Khusus Layar Laptop/Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {bestProducts.map((prod) => {
            const isFavorite = wishlist.some((item) => item.id === prod.id);
            const currentRating = prod.rating ? Number(prod.rating) : 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative"
              >
                {/* Badge Terlaris */}
                <div className="absolute top-3 left-3 z-10 bg-[#e11d48] text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase shadow-sm">
                  {t('best_seller_badge')}
                </div>

                {/* Tombol Wishlist */}
                <button
                  onClick={() => toggleWishlist(prod)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-sm border border-gray-100 transition-all active:scale-90 hover:bg-gray-50"
                >
                  {isFavorite ? (
                    <FaHeart className="text-[#e11d48] scale-105 transition-transform" />
                  ) : (
                    <FaRegHeart className="text-gray-400 hover:text-[#e11d48] transition-colors" />
                  )}
                </button>

                {/* AREA GAMBAR */}
                <div className="relative bg-gray-50 w-full pt-[100%] overflow-hidden border-b border-gray-100">
                  {prod.image ? (
                    <img
                      /* 🛠️ FIX JALUR: Dialihkan secara presisi ke subfolder /uploads/products/ */
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

                {/* DETAIL KONTEN */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    {/* SINKRONISASI BADGE BRAND & MOTOR */}
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded w-max mb-1.5">
                      {prod.brand_name || 'Universal'} {prod.motor_type || ''}
                    </p>

                    <h4 className="text-xs font-bold text-gray-700 line-clamp-2 mb-2 group-hover:text-[#e11d48] transition-colors leading-snug tracking-tight">
                      {prod.name}
                    </h4>

                    {/* STATS BAR RATING & TERJUAL */}
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
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
                  </div>

                  <div className="mt-2">
                    {/* 🛠️ OTOMATIS BERUBAH SESUAI KURS MATA UANG */}
                    <div className="text-sm font-black text-[#e11d48] font-mono mb-3">
                      {formatPrice(prod.price)}
                    </div>

                    <button
                      onClick={() => addToCart(prod)}
                      disabled={prod.stock <= 0}
                      className={`w-full text-white text-[11px] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
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

export default BestSellers;
