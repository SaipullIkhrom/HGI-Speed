import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Container } from '../layout/Container';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaChevronRight, FaShieldAlt, FaTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from "../../config/api";
const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const totalPayment = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  // =====================================================================
  // 🛡️ SECURITY FIX: BLOKIR AKSES JIKA BELUM LOGIN
  // =====================================================================
  useEffect(() => {
    // Cek apakah ada data token/user di localStorage (sesuaikan dengan nama penyimpanan loginmu)
    const token = localStorage.getItem('token');

    if (!token) {
      // Opsi: Bisa kasih alert biar user nggak kaget kenapa tiba-tiba pindah
      alert('Akses ditolak! Kamu harus login dulu untuk melihat keranjang belanja.');

      // Tendang langsung ke halaman login
      navigate('/login');
    }
  }, [navigate]);
  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col font-sans antialiased text-slate-700 selection:bg-[#e11d48] selection:text-white">
      <Navbar />

      <main className="flex-grow py-10 md:py-14">
        <Container>

          {/* ── PAGE HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <button
                /* 🛠️ FIX NAVIGASI: Diubah dari navigate(-1) menjadi beralih mutlak ke Beranda ('/')
                  Ini mencegah user terjebak dalam loop balik ke halaman checkout.
                */
                onClick={() => navigate('/')}
                className="group w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl text-slate-400 hover:text-slate-700 transition-all shadow-sm active:scale-95 flex items-center justify-center flex-shrink-0"
                title={t('back_to_home')}
              >
                <FaArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              </button>
              <div>
                <p className="text-[9px] font-black text-[#e11d48] uppercase tracking-[0.2em] mb-0.5">Store</p>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                  {t('cart_title')}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{t('cart_subtitle')}</p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="self-start sm:self-auto group inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-[#e11d48] bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 px-4 py-2.5 rounded-2xl transition-all duration-200 shadow-sm"
              >
                <FaTrash size={9} className="transition-transform group-hover:rotate-12 duration-200" />
                {t('empty_cart_btn')}
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            /* ── EMPTY STATE ── */
            <div className="flex flex-col items-center justify-center py-24 max-w-sm mx-auto text-center animate-fadeIn">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-100 rounded-[2.5rem] rotate-6 opacity-40"></div>
                <div className="relative w-28 h-28 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-slate-200/60">
                  <FaShoppingBag size={40} className="text-slate-200" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#e11d48] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-[8px] text-white font-black">0</span>
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">{t('cart_empty_title')}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-8 max-w-[240px]">
                {t('cart_empty_desc')}
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-slate-900 hover:bg-[#e11d48] text-white text-[11px] font-black px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-[#e11d48]/30 active:scale-95 uppercase tracking-widest"
              >
                {t('start_shopping')}
              </button>
            </div>

          ) : (
            /* ── MAIN GRID ── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

              {/* ─── LEFT: CART ITEMS ─── */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    {totalItems} {totalItems > 1 ? 'items' : 'item'} {t('in_cart') || 'di keranjang'}
                  </span>
                  <div className="h-px flex-1 bg-slate-200/80 mx-4"></div>
                </div>

                {/* Cart Item Cards */}
                <div className="space-y-3.5">
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-200/60 transition-all duration-300 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row items-stretch">

                        {/* Product Image Panel */}
                        <div className="w-full sm:w-36 h-36 sm:h-auto bg-slate-50/80 flex items-center justify-center relative overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-100 flex-shrink-0">
                          <div className="absolute inset-0 opacity-[0.02]"
                            style={{
                              backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                              backgroundSize: '10px 10px'
                            }}
                          ></div>

                          {item.image ? (
                            <img
                              src={`${BASE_URL}/uploads/products/${item.image}`}
                              alt={item.name}
                              className="relative w-full h-full max-h-32 sm:max-h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-400 p-2 text-center bg-slate-100 uppercase tracking-tighter"
                            style={{ display: item.image ? 'none' : 'flex' }}
                          >
                            {item.name.substring(0, 10)}...
                          </div>

                          <div className="absolute top-3 left-3 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                            <span className="text-[8px] font-black text-slate-400 font-mono">{index + 1}</span>
                          </div>
                        </div>

                        {/* Product Info Panel */}
                        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-w-0">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="text-sm font-black text-slate-900 group-hover:text-[#e11d48] transition-colors duration-200 leading-tight truncate flex-1">
                                {item.name}
                              </h4>
                              {/* Mobile Delete Button */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="sm:hidden text-slate-300 hover:text-red-500 p-1 transition-colors"
                                title={t('remove_item')}
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                                <FaTag size={6} className="text-slate-400" />
                                {item.motor_brand} {item.motor_type}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-400 font-mono">
                              {formatPrice(item.price)} <span className="text-[9px] font-normal font-sans">/ pcs</span>
                            </div>
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">

                            {/* Qty Stepper */}
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title={t('decrease_qty')}
                              >
                                <FaMinus size={8} />
                              </button>
                              <span className="w-9 text-center text-xs font-black text-slate-800 font-mono">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title={t('increase_qty')}
                              >
                                <FaPlus size={8} />
                              </button>
                            </div>

                            {/* Price / Subtotal display on Desktop */}
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider leading-none mb-0.5">Subtotal</p>
                                <p className="text-sm font-black text-[#e11d48] font-mono leading-none">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="hidden sm:flex w-8 h-8 items-center justify-center text-slate-300 hover:text-white bg-white hover:bg-[#e11d48] border border-slate-200 hover:border-[#e11d48] rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
                                title={t('remove_item')}
                              >
                                <FaTrash size={9} />
                              </button>
                            </div>

                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── RIGHT: ORDER SUMMARY ─── */}
              <div className="space-y-4 lg:sticky lg:top-24">
                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">

                  {/* Card Header */}
                  <div className="px-6 pt-6 pb-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">{t('shopping_summary')}</h3>
                    <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      {formatPrice(totalPayment)}
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                      {t('total_items', { count: totalItems })}
                    </p>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="px-6 py-5 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">{t('total_items', { count: totalItems })}</span>
                      <span className="font-bold text-slate-700 font-mono">{formatPrice(totalPayment)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">{t('logistics_method')}</span>
                      <span className="text-emerald-600 font-black text-[8px] uppercase tracking-wider bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded-md">
                        {t('auto_cod')}
                      </span>
                    </div>

                    {/* Dotted separator line */}
                    <div className="flex items-center gap-1 py-1">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="w-1 h-0.5 bg-slate-200 rounded-full flex-1"></div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{t('total_payment')}</span>
                      <span className="text-base font-black text-[#e11d48] font-mono">
                        {formatPrice(totalPayment)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Actions */}
                  <div className="px-6 pb-6 space-y-2.5">
                    <button
                      onClick={() => navigate('/checkout')}
                      className="w-full relative overflow-hidden bg-slate-900 hover:bg-[#e11d48] text-white font-black text-[11px] py-4 rounded-2xl transition-all duration-300 shadow-md active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2 group"
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"></span>
                      <span>{t('continue_checkout')}</span>
                      <FaChevronRight size={8} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    </button>
                  </div>

                </div>

                {/* Security Jaminan Trust Box */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 bg-red-50 text-[#e11d48] rounded-xl flex items-center justify-center border border-red-100 flex-shrink-0">
                    <FaShieldAlt size={13} />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                    {t('security_guarantee')}
                  </p>
                </div>

              </div>
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
