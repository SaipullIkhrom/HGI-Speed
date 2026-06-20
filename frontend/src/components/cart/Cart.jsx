import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Container } from '../layout/Container';
import {
  FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft,
  FaChevronRight, FaShieldAlt, FaTag, FaTicketAlt, FaTimesCircle, FaSpinner
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from "../../config/api";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  // --- STATE UNTUK VOUCHER & PROMO ---
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [loadingVoucher, setLoadingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  const totalPayment = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  // --- LOGIKA PERHITUNGAN DISKON ---
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.discount_type === 'percentage') {
      discountAmount = totalPayment * (appliedDiscount.discount_value / 100);
    } else {
      discountAmount = appliedDiscount.discount_value;
    }
  }

  // Pastikan total akhir tidak minus
  const finalPayment = Math.max(0, totalPayment - discountAmount);

  // --- SECURITY FIX: BLOKIR AKSES JIKA BELUM LOGIN ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Akses ditolak! Kamu harus login dulu untuk melihat keranjang belanja.');
      navigate('/login');
    }
  }, [navigate]);

  // --- FUNGSI VALIDASI & APLIKASI VOUCHER ---
  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setLoadingVoucher(true);
    setVoucherError('');

    try {
      // Ambil seluruh data voucher dari backend untuk dicocokkan kodenya
      const res = await fetch(`${BASE_URL}/api/vouchers`);
      const resData = await res.json();

      if (resData.success) {
        const foundVoucher = resData.data.find(v => v.code.toUpperCase() === voucherInput.toUpperCase());

        if (!foundVoucher) {
          setVoucherError('Kode voucher tidak ditemukan atau tidak valid.');
        } else if (totalPayment < foundVoucher.min_purchase) {
          setVoucherError(`Minimal belanja untuk voucher ini adalah ${formatPrice(foundVoucher.min_purchase)}.`);
        } else if (new Date(foundVoucher.expiry_date) < new Date()) {
          setVoucherError('Kode voucher ini sudah kedaluwarsa.');
        } else {
          // Voucher Valid! Aplikasikan ke state
          setAppliedDiscount(foundVoucher);
          setVoucherInput('');
        }
      }
    } catch (error) {
      console.error("Gagal memvalidasi voucher:", error);
      setVoucherError('Kendala jaringan saat mengecek voucher.');
    } finally {
      setLoadingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedDiscount(null);
    setVoucherError('');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col font-sans antialiased text-slate-700 selection:bg-[#e11d48] selection:text-white">
      <Navbar />

      <main className="flex-grow py-10 md:py-14">
        <Container>

          {/* ── PAGE HEADER ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="group w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl text-slate-400 hover:text-slate-700 transition-all shadow-sm active:scale-95 flex items-center justify-center flex-shrink-0"
                title={t('back_to_home')}
              >
                <FaArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              </button>
              <div>
                <p className="text-[9px] font-black text-[#e11d48] uppercase tracking-[0.2em] mb-0.5">Store</p>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                  {t('cart_title') || 'KERANJANG BELANJA'}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{t('cart_subtitle') || 'Periksa kembali part pilihanmu sebelum checkout.'}</p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="self-start sm:self-auto group inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-[#e11d48] bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 px-4 py-2.5 rounded-2xl transition-all duration-200 shadow-sm"
              >
                <FaTrash size={9} className="transition-transform group-hover:rotate-12 duration-200" />
                {t('empty_cart_btn') || 'KOSONGKAN'}
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

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">{t('cart_empty_title') || 'KERANJANG MASIH KOSONG'}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-8 max-w-[240px]">
                {t('cart_empty_desc') || 'Belum ada part motor yang ditambahkan. Yuk, cari kebutuhan garasimu sekarang!'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-slate-900 hover:bg-[#e11d48] text-white text-[11px] font-black px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-[#e11d48]/30 active:scale-95 uppercase tracking-widest"
              >
                {t('start_shopping') || 'MULAI BELANJA'}
              </button>
            </div>

          ) : (
            /* ── MAIN GRID (MODERN 5-COL LAYOUT) ── */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

              {/* ─── LEFT GRID: DAFTAR PART BELANJAAN (60%) ─── */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    {totalItems} {totalItems > 1 ? 'items' : 'item'} {t('in_cart') || 'di keranjang'}
                  </span>
                  <div className="h-px flex-1 bg-slate-200/80 mx-4"></div>
                </div>

                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-200/60 transition-all duration-300 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row items-stretch">

                        {/* Gambar Produk */}
                        <div className="w-full sm:w-40 h-40 sm:h-auto bg-slate-50/80 flex items-center justify-center relative overflow-hidden border-b sm:border-b-0 sm:border-r border-slate-100 flex-shrink-0">
                          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '10px 10px' }}></div>
                          {item.image ? (
                            <img
                              src={`${BASE_URL}/uploads/products/${item.image}`}
                              alt={item.name}
                              className="relative w-full h-full max-h-36 sm:max-h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-400 p-2 text-center bg-slate-100 uppercase tracking-tighter" style={{ display: item.image ? 'none' : 'flex' }}>
                            {item.name.substring(0, 10)}...
                          </div>
                        </div>

                        {/* Detail Produk & Kontrol */}
                        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-w-0">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="text-sm font-black text-slate-900 group-hover:text-[#e11d48] transition-colors duration-200 leading-tight truncate flex-1">
                                {item.name}
                              </h4>
                              <button onClick={() => removeFromCart(item.id)} className="sm:hidden text-slate-300 hover:text-red-500 p-1 transition-colors">
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

                          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                            {/* Stepper Kuantitas */}
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                <FaMinus size={8} />
                              </button>
                              <span className="w-9 text-center text-xs font-black text-slate-800 font-mono">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                                <FaPlus size={8} />
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider leading-none mb-0.5">Subtotal</p>
                                <p className="text-sm font-black text-[#e11d48] font-mono leading-none">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                              <button onClick={() => removeFromCart(item.id)} className="hidden sm:flex w-8 h-8 items-center justify-center text-slate-300 hover:text-white bg-white hover:bg-[#e11d48] border border-slate-200 hover:border-[#e11d48] rounded-xl transition-all duration-200 active:scale-95 shadow-sm">
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

              {/* ─── RIGHT GRID: ORDER SUMMARY & VOUCHER (40%) ─── */}
              <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24">
                <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">

                  {/* Header Ringkasan */}
                  <div className="px-6 pt-6 pb-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-2">{t('shopping_summary') || 'RINGKASAN BELANJA'}</h3>
                    <div className={`text-2xl font-black font-mono tracking-tight ${appliedDiscount ? 'text-emerald-500' : 'text-slate-900'}`}>
                      {formatPrice(finalPayment)}
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                      {t('total_items', { count: totalItems })}
                    </p>
                  </div>

                  {/* ── SEKTOR INPUT VOUCHER / PROMO ── */}
                  <div className="px-6 pt-5 pb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                      <FaTicketAlt className="text-amber-500" /> Makin Hemat Pakai Promo
                    </label>

                    {!appliedDiscount ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ketik kode voucher..."
                            value={voucherInput}
                            onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]/20 transition-all"
                          />
                          <button
                            onClick={handleApplyVoucher}
                            disabled={loadingVoucher || !voucherInput.trim()}
                            className="bg-slate-900 hover:bg-[#e11d48] text-white font-black text-[10px] px-5 rounded-xl uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
                          >
                            {loadingVoucher ? <FaSpinner className="animate-spin" size={12} /> : 'Terapkan'}
                          </button>
                        </div>
                        {voucherError && (
                          <p className="text-[9px] font-bold text-[#e11d48] bg-rose-50 px-3 py-1.5 rounded-lg">
                            {voucherError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">{appliedDiscount.code}</p>
                            <p className="text-[9px] text-emerald-600 font-medium leading-none mt-0.5">Berhasil diterapkan!</p>
                          </div>
                        </div>
                        <button onClick={handleRemoveVoucher} className="text-emerald-400 hover:text-emerald-700 p-2 transition-colors" title="Hapus Voucher">
                          <FaTimesCircle size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rincian Harga */}
                  <div className="px-6 py-5 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Subtotal Produk</span>
                      <span className="font-bold text-slate-700 font-mono">{formatPrice(totalPayment)}</span>
                    </div>

                    {appliedDiscount && (
                      <div className="flex justify-between items-center text-xs animate-fadeIn">
                        <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                          Potongan Voucher
                        </span>
                        <span className="font-black text-emerald-500 font-mono">- {formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Metode Logistik</span>
                      <span className="text-slate-600 font-black text-[8px] uppercase tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        GARASI COD
                      </span>
                    </div>

                    {/* Garis Pembatas Putus-putus */}
                    <div className="flex items-center gap-1 py-1">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div key={i} className="w-1 h-0.5 bg-slate-200 rounded-full flex-1"></div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Total Pembayaran</span>
                      <span className="text-xl font-black text-[#e11d48] font-mono">
                        {formatPrice(finalPayment)}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Lanjut Checkout */}
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => navigate('/checkout')}
                      className="w-full relative overflow-hidden bg-slate-900 hover:bg-[#e11d48] text-white font-black text-[11px] py-4 rounded-2xl transition-all duration-300 shadow-md active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2 group"
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"></span>
                      <span>Lanjut Checkout</span>
                      <FaChevronRight size={8} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    </button>
                  </div>
                </div>

                {/* Box Keamanan */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 bg-red-50 text-[#e11d48] rounded-xl flex items-center justify-center border border-red-100 flex-shrink-0">
                    <FaShieldAlt size={13} />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                    Transaksi dilindungi enkripsi SSL. Keamanan data pelanggan dijamin sepenuhnya oleh HGI SPEED.
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
