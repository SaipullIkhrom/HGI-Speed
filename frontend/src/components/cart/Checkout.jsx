import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import { Container } from '../layout/Container';
import { FaUser, FaPhone, FaMapMarkerAlt, FaShoppingBag, FaArrowLeft, FaCheckCircle, FaShieldAlt, FaMoneyBillWave, FaUniversity, FaQrcode, FaTruck, FaLock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from "../../config/api";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const [shippingData, setShippingData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');

  const totalPayment = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex flex-col justify-between font-sans text-slate-700 selection:bg-[#e11d48] selection:text-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 max-w-sm relative overflow-hidden border border-slate-100/80">
            {/* Top accent stripe */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-[#e11d48] to-rose-600"></div>
            {/* Decorative circle bg */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-red-50 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-slate-50 rounded-full opacity-80"></div>

            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-rose-100 text-[#e11d48] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100/80">
                <FaShoppingBag size={28} />
              </div>
              <h3 className="text-slate-900 font-black uppercase text-sm tracking-tight mb-2.5">{t('empty_checkout_title')}</h3>
              <p className="text-slate-400 text-xs mb-8 leading-relaxed px-2">{t('empty_checkout_desc')}</p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-slate-900 hover:bg-[#e11d48] text-white text-[11px] font-black py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-[#e11d48]/30 active:scale-95 uppercase tracking-widest"
              >
                {t('back_to_home')}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const localUser = localStorage.getItem('user');
    const parsedUser = localUser ? JSON.parse(localUser) : null;
    const activeUserId = parsedUser ? parsedUser.id : null;

    const orderPayload = {
      user_id: activeUserId,
      customer_name: shippingData.name,
      customer_phone: shippingData.phone,
      shipping_address: shippingData.address,
      total_payment: totalPayment,
      payment_method: paymentMethod,
      items: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        alert(`${t('checkout_success_alert')}[${paymentMethod}]${t('checkout_success_alert_2')}`);
        clearCart();
        navigate('/profile');
      } else {
        alert(`${t('checkout_fail_alert')}${resData.message}`);
      }
    } catch (error) {
      console.error('Eror saat memproses checkout:', error);
      alert(t('network_error'));
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    {
      id: 'COD',
      icon: <FaMoneyBillWave size={16} />,
      label: t('pay_cod'),
      desc: t('pay_cod_desc'),
    },
    {
      id: 'Transfer Bank',
      icon: <FaUniversity size={16} />,
      label: t('pay_transfer'),
      desc: t('pay_transfer_desc'),
    },
    {
      id: 'QRIS',
      icon: <FaQrcode size={16} />,
      label: t('pay_qris'),
      desc: t('pay_qris_desc'),
    },
  ];

  const infoBoxContent = {
    COD: { color: 'amber', emoji: '💡', label: 'Info COD', text: t('info_cod') },
    'Transfer Bank': { color: 'blue', emoji: '🏦', label: 'Info Transfer', text: t('info_transfer') },
    QRIS: { color: 'emerald', emoji: '📱', label: 'Info QRIS', text: t('info_qris') },
  };

  const infoColorMap = {
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };

  const currentInfo = infoBoxContent[paymentMethod];

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col font-sans text-slate-700 selection:bg-[#e11d48] selection:text-white">
      <Navbar />

      <main className="flex-grow py-10 md:py-14">
        <Container>

          {/* Back Button */}
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-2.5 text-[10px] font-black text-slate-500 hover:text-[#e11d48] mb-8 transition-all duration-200 group tracking-widest bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:border-red-100"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200 text-[#e11d48]" />
            {t('back_to_cart')}
          </button>

          {/* Stepper */}
          <div className="flex items-center gap-0 mb-10 max-w-sm bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm overflow-hidden">
            {[
              { step: 1, label: t('step_cart'), active: false, done: true },
              { step: 2, label: t('step_checkout'), active: true, done: false },
              { step: 3, label: t('step_done'), active: false, done: false },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl flex-1 justify-center transition-all duration-300 ${
                  item.active
                    ? 'bg-[#e11d48] shadow-lg shadow-red-200/50'
                    : item.done
                    ? 'bg-slate-50'
                    : ''
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-black flex-shrink-0 ${
                    item.active ? 'bg-white/20 text-white' : item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {item.done ? '✓' : item.step}
                  </span>
                  <span className={`text-[10px] font-black tracking-tight whitespace-nowrap ${
                    item.active ? 'text-white' : item.done ? 'text-slate-500' : 'text-slate-300'
                  }`}>{item.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-3 h-[2px] bg-slate-100 flex-shrink-0 mx-0.5"></div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ─── LEFT COLUMN: FORM ─── */}
            <div className="lg:col-span-7 space-y-5">

              {/* Shipping Info Card */}
              <div className="bg-white border border-slate-100/80 rounded-[2rem] overflow-hidden shadow-sm shadow-slate-200/50">
                {/* Card Header */}
                <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-100/80">
                    <FaTruck size={14} className="text-[#e11d48]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">{t('shipping_info_title')}</h2>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{t('shipping_info_desc')}</p>
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder} className="px-7 py-6 space-y-5">

                  {/* Name Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] ml-0.5">{t('fullname_label')}</label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-4 w-7 h-7 flex items-center justify-center text-slate-400 group-focus-within:text-[#e11d48] transition-colors">
                        <FaUser size={11} />
                      </div>
                      <input
                        name="name"
                        type="text"
                        placeholder={t('fullname_placeholder')}
                        value={shippingData.name}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200/80 group-hover:border-slate-300 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-800 placeholder-slate-300 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-[#e11d48]/10 outline-none transition-all duration-200 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] ml-0.5">{t('phone_label')}</label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-4 w-7 h-7 flex items-center justify-center text-slate-400 group-focus-within:text-[#e11d48] transition-colors">
                        <FaPhone size={11} />
                      </div>
                      <input
                        name="phone"
                        type="text"
                        placeholder={t('phone_placeholder')}
                        value={shippingData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200/80 group-hover:border-slate-300 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-800 placeholder-slate-300 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-[#e11d48]/10 outline-none transition-all duration-200 font-mono font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] ml-0.5">{t('address_label')}</label>
                    <div className="relative flex items-start group">
                      <div className="absolute left-4 top-3.5 w-7 h-7 flex items-center justify-center text-slate-400 group-focus-within:text-[#e11d48] transition-colors">
                        <FaMapMarkerAlt size={11} />
                      </div>
                      <textarea
                        name="address"
                        rows="3"
                        placeholder={t('address_placeholder')}
                        value={shippingData.address}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200/80 group-hover:border-slate-300 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-800 placeholder-slate-300 focus:border-[#e11d48] focus:bg-white focus:ring-4 focus:ring-[#e11d48]/10 outline-none transition-all duration-200 font-medium resize-none leading-relaxed"
                        required
                      />
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="pt-5 mt-2 border-t border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] ml-0.5 block mb-4">{t('payment_method_title')}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {paymentOptions.map((opt) => {
                        const isActive = paymentMethod === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setPaymentMethod(opt.id)}
                            className={`relative rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all duration-300 overflow-hidden ${
                              isActive
                                ? 'bg-[#e11d48] shadow-xl shadow-[#e11d48]/25 scale-[1.03]'
                                : 'bg-slate-50 border border-slate-200/80 hover:border-slate-300 hover:bg-white hover:shadow-md'
                            }`}
                          >
                            {/* Active glow */}
                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            )}

                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                              isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                            }`}>
                              {opt.icon}
                            </div>

                            <div>
                              <h4 className={`text-[11px] font-black leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>{opt.label}</h4>
                              <p className={`text-[9px] mt-0.5 font-medium leading-relaxed ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{opt.desc}</p>
                            </div>

                            {/* Check badge */}
                            <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              isActive ? 'border-white bg-white/20' : 'border-slate-200'
                            }`}>
                              {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Info Box */}
                  <div className={`p-4 rounded-2xl border text-[11px] leading-relaxed transition-all duration-300 ${infoColorMap[currentInfo.color]}`}>
                    {currentInfo.emoji} <strong>{currentInfo.label}:</strong> {currentInfo.text}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full overflow-hidden bg-slate-900 hover:bg-[#e11d48] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-[11px] py-4.5 py-[14px] rounded-2xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-[#e11d48]/30 active:scale-[0.99] tracking-widest uppercase mt-2 group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          {t('process_tx')}
                        </>
                      ) : (
                        <>
                          <FaLock size={10} className="opacity-60" />
                          {t('confirm_order')} — {paymentMethod}
                        </>
                      )}
                    </span>
                  </button>

                </form>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: ORDER SUMMARY ─── */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">

              {/* Order Review Card */}
              <div className="bg-white border border-slate-100/80 rounded-[2rem] overflow-hidden shadow-sm shadow-slate-200/50">

                {/* Card Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center border border-red-100/80">
                      <FaShoppingBag size={12} className="text-[#e11d48]" />
                    </div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{t('review_items')}</h3>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {cart.length} item{cart.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Items List */}
                <div className="px-4 py-3 max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {cart.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl flex justify-between items-start gap-3 text-xs bg-slate-50/60 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group">
                      <div className="min-w-0 space-y-1.5 flex-1">
                        <h4 className="font-bold text-slate-800 truncate group-hover:text-[#e11d48] transition-colors leading-tight text-[11px]">{item.name}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[8px] font-black uppercase text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-sm">
                            {item.motor_brand || 'Universal'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold font-mono">
                            {t('qty')}: {item.quantity}×
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-slate-800 font-mono flex-shrink-0 text-right text-[11px]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary Footer */}
                <div className="px-6 py-5 border-t border-slate-100 space-y-3 bg-slate-50/40">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>{t('payment_system')}</span>
                    <span className="text-slate-700 font-black uppercase tracking-wider font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] shadow-sm">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>{t('original_guarantee')}</span>
                    <span className="text-emerald-600 font-black flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-[9px]">
                      <FaCheckCircle size={9} /> {t('original_100')}
                    </span>
                  </div>

                  {/* Total Block */}
                  <div className="bg-gradient-to-br from-[#e11d48] to-rose-600 rounded-2xl p-4 mt-3 flex justify-between items-center shadow-lg shadow-red-200/40">
                    <div>
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest block">{t('total_basic')}</span>
                      <span className="text-[9px] font-bold text-white/50 block mt-0.5 uppercase">{t('excl_shipping')}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-xl font-black font-mono block leading-none tracking-tight">
                        {formatPrice(totalPayment)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-white border border-slate-100/80 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 flex-shrink-0">
                  <FaShieldAlt size={14} className="text-[#e11d48]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wide">{t('security_title')}</h4>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed mt-0.5">{t('security_desc')}</p>
                </div>
              </div>

            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
