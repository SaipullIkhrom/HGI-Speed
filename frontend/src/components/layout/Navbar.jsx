import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaHeart, FaUser, FaTruck, FaMapMarkerAlt, FaBars, FaCogs, FaTimes, FaSignOutAlt, FaThLarge, FaGlobe } from 'react-icons/fa';
import { Container } from "./Container";
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist?.length || 0;

  const { currencies, selectedCurrency, changeCurrency } = useCurrency();
  const { t, i18n } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const localUserData = localStorage.getItem('user');
  const user = localUserData ? JSON.parse(localUserData) : null;
  const abortControllerRef = useRef(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const loadCategories = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/categories`, { signal });
        const resData = await res.json();
        if (resData.success && !signal.aborted) {
          setCategories(resData.data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Gagal memuat kategori di navbar:', err);
        }
      }
    };

    loadCategories();
    return () => abortControllerRef.current?.abort();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Keluar dari akun HGI SPEED, Pul?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
      window.location.reload();
    }
  };

  const handleSearchAction = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (searchKeyword) params.append('search', searchKeyword.trim());

    setIsMobileMenuOpen(false);
    navigate(`/products?${params.toString()}`);
  };

  const handleQuickFilter = (type, value) => {
    setIsMobileMenuOpen(false);
    if (type === 'all') navigate('/products');
    else if (type === 'promo') {
      navigate('/?promo=true');
      setTimeout(() => {
        const flashSaleElement = document.getElementById('flash-sale-section');
        if (flashSaleElement) flashSaleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    else if (type === 'brand') navigate('/?official=true');
    else if (type === 'category') navigate(`/?category=${value}`);
  };

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100 font-sans select-none">

      {/* SECTION 1: TOP HEADERBAR */}
      <div className="hidden sm:flex bg-slate-950 text-slate-400 py-2 text-[11px] font-medium border-b border-slate-900">
        <Container className="flex justify-between items-center w-full">
          <div className="flex gap-5">
            <span className="hover:text-white cursor-pointer transition-colors">{t('download_app')}</span>
            <span className="hover:text-white cursor-pointer transition-colors">{t('tech_support')}</span>
            <span className="hover:text-white cursor-pointer transition-colors">{t('about')}</span>
          </div>
          <div className="flex gap-5 items-center font-semibold">
            <span onClick={() => navigate('/cek-ongkir')} className="flex items-center gap-1.5 cursor-pointer hover:text-[#e11d48] transition-colors">
              <FaTruck size={12} /> {t('check_shipping')}
            </span>
            <span onClick={() => navigate('/profile')} className="flex items-center gap-1.5 cursor-pointer hover:text-[#e11d48] transition-colors border-r border-slate-800 pr-5">
              <FaMapMarkerAlt size={11} /> {t('track_order')}
            </span>

            {/* 🛠️ DROPDOWN BAHASA (ID/EN) */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800/80 group">
              <span className="text-slate-400 font-black text-[10px] group-hover:text-[#e11d48] transition-colors">A/文</span>
              <select
                value={i18n.language?.substring(0, 2) || 'id'}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-transparent text-slate-300 font-black text-[10px] uppercase outline-none cursor-pointer border-none py-0.5 focus:text-white"
              >
                <option value="id" className="bg-slate-900 text-white">ID</option>
                <option value="en" className="bg-slate-900 text-white">EN</option>
              </select>
            </div>

            {/* DROPDOWN SELECTOR KURS */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800/80 group">
              <FaGlobe size={10} className="text-slate-400 group-hover:text-[#e11d48] transition-colors" />
              <select
                value={selectedCurrency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="bg-transparent text-slate-300 font-black text-[10px] uppercase outline-none cursor-pointer border-none py-0.5 focus:text-white"
              >
                {currencies.map((curr) => (
                  <option key={curr.id} value={curr.code} className="bg-slate-900 text-white font-medium normal-case">
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Container>
      </div>

      {/* SECTION 2: MAIN AREA NAV */}
      <div className="py-3 bg-white">
        <Container className="flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-2.5">
            <button
              className="sm:hidden text-slate-800 text-lg p-1.5 active:scale-90 transition-transform rounded-xl hover:bg-slate-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes className="text-[#e11d48]" /> : <FaBars />}
            </button>
            <div onClick={() => navigate('/')} className="text-lg md:text-xl font-black tracking-tighter cursor-pointer flex items-center gap-1 group">
              <FaCogs className="text-[#e11d48] group-hover:rotate-180 transition-transform duration-1000 text-base md:text-lg" />
              <span className="text-slate-950">HGI</span>
              <span className="text-[#e11d48] italic font-extrabold tracking-tight">SPEED</span>
            </div>
          </div>

          <form onSubmit={handleSearchAction} className="hidden sm:flex flex-1 items-center bg-slate-50 rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#e11d48] focus-within:bg-white transition-all max-w-2xl shadow-inner">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white px-3 py-2 text-xs border-r border-slate-200 outline-none text-slate-800 hover:bg-slate-50 cursor-pointer font-extrabold h-full transition-colors"
            >
              <option value="">{t('all_categories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name} className="text-slate-900 font-medium">{cat.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t('search_placeholder')}
              className="flex-1 bg-transparent px-4 py-2 outline-none text-xs text-slate-800 placeholder-slate-400 font-medium"
            />
            <button type="submit" className="bg-[#e11d48] text-white px-5 py-3 hover:bg-red-700 active:scale-95 transition-all h-full flex items-center">
              <FaSearch size={12} />
            </button>
          </form>

          <div className="flex items-center gap-3.5 md:gap-5 text-slate-800">
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="bg-amber-500/10 text-amber-600 border border-amber-200 hover:bg-amber-600 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition-all tracking-tight uppercase shadow-sm">
                🛠️ {t('admin_panel')}
              </button>
            )}

            <div onClick={() => navigate('/wishlist')} className="relative cursor-pointer hover:text-[#e11d48] p-1.5 hover:bg-rose-50 rounded-xl transition-all group">
              <FaHeart size={18} className="group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#e11d48] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow animate-bounce">{wishlistCount}</span>}
            </div>

            <div onClick={() => navigate('/cart')} className="relative cursor-pointer hover:text-[#e11d48] p-1.5 hover:bg-rose-50 rounded-xl transition-all group">
              <FaShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-slate-950 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow">{cartCount}</span>}
            </div>

            <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4 py-0.5">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img src={`${BASE_URL}/uploads/profiles/${user.avatar}`} alt="Avatar" className="w-7 h-7 rounded-full object-cover border border-slate-200 cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate('/profile')} />
                  ) : (
                    <div onClick={() => navigate('/profile')} className="p-2 bg-slate-100 hover:bg-rose-50 rounded-xl text-slate-700 hover:text-[#e11d48] cursor-pointer"><FaUser size={12} /></div>
                  )}
                  <div onClick={() => navigate('/profile')} className="text-right hidden md:block cursor-pointer group">
                    <p className="text-[11px] font-black text-slate-950 truncate max-w-[90px] group-hover:text-[#e11d48] transition-colors leading-tight">Hi, {user.name ? user.name.split(' ')[0] : 'Ipul'}</p>
                    <p className="text-[8px] text-slate-400 capitalize font-black tracking-widest">{user.role || 'Member'}</p>
                  </div>
                  <button onClick={handleLogout} className="text-[10px] bg-slate-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-[#e11d48] px-2.5 py-1.5 rounded-xl font-black transition-all uppercase tracking-wider flex items-center gap-1">
                    <FaSignOutAlt size={10} /> {t('logout')}
                  </button>
                </div>
              ) : (
                <div onClick={() => navigate('/login')} className="flex items-center gap-1.5 cursor-pointer bg-slate-950 text-white px-3.5 py-1.5 rounded-xl hover:bg-red-600 transition-all font-black text-[11px] uppercase tracking-widest shadow">
                  <FaUser size={10} /> <span>{t('login')}</span>
                </div>
              )}
            </div>
          </div>
        </Container>

        <div className="px-4 mt-2 sm:hidden">
          <form onSubmit={handleSearchAction} className="flex items-center bg-slate-50 rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#e11d48] focus-within:bg-white transition-all shadow-inner">
            <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder={t('search_placeholder')} className="flex-1 bg-transparent px-4 py-2.5 outline-none text-xs text-slate-800 placeholder-slate-400 font-medium" />
            <button type="submit" className="bg-[#e11d48] text-white px-4 py-2.5 text-xs h-full flex items-center"><FaSearch size={11} /></button>
          </form>
        </div>
      </div>

      {/* SECTION 3: SUB-NAVIGATION */}
      <div className={`sm:block ${isMobileMenuOpen ? 'block bg-slate-50/90 border-t border-slate-100 backdrop-blur' : 'hidden'} bg-white py-2 text-[11px] font-black text-slate-500 uppercase tracking-wider border-t border-slate-50`}>
        <Container className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center w-full">
          <span onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} className="text-[#e11d48] hover:text-red-700 py-1 cursor-pointer font-black flex items-center gap-1">⚡ {t('home')}</span>
          <span onClick={() => handleQuickFilter('all')} className="hover:text-[#e11d48] py-1 cursor-pointer transition-colors flex items-center gap-1"><FaThLarge size={10} /> {t('all_products')}</span>
          <span onClick={() => handleQuickFilter('promo')} className="hover:text-[#e11d48] py-1 cursor-pointer transition-colors text-orange-500 font-bold">⚡ {t('promo')}</span>
          <span onClick={() => handleQuickFilter('brand')} className="hover:text-[#e11d48] py-1 cursor-pointer transition-colors">🏁 {t('official_brand')}</span>

          {/* MOBILE TOGGLES */}
          {isMobileMenuOpen && (
            <div className="w-full pt-2.5 border-t border-slate-200/60 sm:hidden flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium normal-case italic">{t('language')}:</span>
                <select value={i18n.language?.substring(0, 2) || 'id'} onChange={(e) => i18n.changeLanguage(e.target.value)} className="bg-slate-100 border border-slate-200 text-slate-800 font-black px-3 py-1.5 rounded-xl text-[10px] outline-none uppercase">
                  <option value="id">ID</option>
                  <option value="en">EN</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium normal-case italic">{t('global_currency')}:</span>
                <select value={selectedCurrency} onChange={(e) => changeCurrency(e.target.value)} className="bg-slate-100 border border-slate-200 text-slate-800 font-black px-3 py-1.5 rounded-xl text-[10px] outline-none">
                  {currencies.map((curr) => <option key={curr.id} value={curr.code}>{curr.code} ({curr.symbol})</option>)}
                </select>
              </div>
            </div>
          )}

          {isMobileMenuOpen && categories.length > 0 && (
            <div className="w-full pt-2 border-t border-slate-200/60 sm:hidden space-y-2">
              <p className="text-[10px] text-slate-400 tracking-normal font-medium italic">{t('category_label')}</p>
              <div className="grid grid-cols-2 gap-1.5 text-left text-slate-600 normal-case font-bold">
                {categories.map((cat) => (
                  <span key={cat.id} onClick={() => handleQuickFilter('category', cat.name)} className="p-1.5 bg-white rounded-lg border border-slate-100 hover:text-[#e11d48]">{cat.name}</span>
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </nav>
  );
};

export default Navbar;
