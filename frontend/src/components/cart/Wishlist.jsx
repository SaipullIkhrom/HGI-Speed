import { useEffect } from 'react'; // 🛡️ FIX: Import useEffect di paling atas agar tidak error ESLint
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Container } from '../layout/Container';
import { FaTrash, FaCartPlus, FaHeartBroken, FaArrowLeft, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from "../../config/api";

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 🛠️ INISIALISASI HOOKS GLOBAL
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // =====================================================================
  // 🛡️ SECURITY FIX: BLOKIR AKSES WISHLIST JIKA BELUM LOGIN
  // =====================================================================
  useEffect(() => {
    const token = localStorage.getItem('token'); // Pastikan key sesuai dengan storage login tokomu

    if (!token) {
      alert('Akses ditolak! Kamu harus login terlebih dahulu untuk melihat wishlist.');
      navigate('/login');
    }
  }, [navigate]);
  // =====================================================================

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700 flex flex-col justify-between font-sans antialiased">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <Container>
          {/* HEADER SECTION */}
          <div className="flex items-center gap-4 border-b border-gray-200 pb-5 mb-8">
            <button
              onClick={() => navigate('/')}
              className="group p-3 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-700 transition-all shadow-sm active:scale-95 flex items-center justify-center"
              title={t('back_to_home')}
            >
              <FaArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FaHeart className="text-[#e11d48] text-lg animate-pulse" /> {t('wishlist_title')}
              </h2>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{t('wishlist_subtitle')}</p>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200/80 p-8 rounded-3xl flex flex-col items-center justify-center gap-5 max-w-md mx-auto shadow-sm animate-fadeIn">
              <div className="w-16 h-16 bg-red-50 text-[#e11d48] rounded-2xl flex items-center justify-center text-2xl border border-red-100 shadow-sm">
                <FaHeartBroken />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">{t('no_wishlist_title')}</h3>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                  {t('no_wishlist_desc')}
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="bg-[#e11d48] hover:bg-red-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 uppercase tracking-wider mt-2"
              >
                {t('find_components')}
              </button>
            </div>
          ) : (
            /* GRID 5 KOLOM RESPONSIF */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {wishlist.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col justify-between p-4 group hover:border-[#e11d48]/30 hover:shadow-xl transition-all duration-300 relative"
                >
                  {/* AREA FRAME GAMBAR PRODUK */}
                  <div className="relative bg-gray-50 w-full pt-[100%] rounded-xl overflow-hidden border border-gray-100 mb-4 shadow-inner">
                    {prod.image ? (
                      <img
                        src={`${BASE_URL}/uploads/products/${prod.image}`}
                        alt={prod.name}
                        className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 p-1"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-400 bg-gray-100 p-2 text-center uppercase tracking-tighter">
                        {prod.name.substring(0, 15)}...
                      </div>
                    )}
                  </div>

                  {/* DETAIL INFORMASI */}
                  <div className="space-y-1 mb-4 flex-grow">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded w-max">
                      {prod.motor_brand || 'Universal'} {prod.motor_type}
                    </p>
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-[#e11d48] transition-colors tracking-tight">
                      {prod.name}
                    </h4>
                    <div className="text-sm font-black text-[#e11d48] font-mono pt-1">
                      {formatPrice(prod.price)}
                    </div>
                  </div>

                  {/* TOMBOL AKSI */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { addToCart(prod); toggleWishlist(prod); }}
                      className="flex-1 bg-gray-900 hover:bg-[#e11d48] text-white text-[10px] py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 uppercase tracking-wider"
                    >
                      <FaCartPlus size={11} /> {t('buy_button')}
                    </button>
                    <button
                      onClick={() => toggleWishlist(prod)}
                      title={t('remove_from_wishlist')}
                      className="px-3.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all active:scale-90 shadow-sm"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
