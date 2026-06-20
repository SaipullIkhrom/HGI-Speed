import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from '../layout/Container';
import {
  FaCartPlus,
  FaHeart,
  FaRegHeart,
  FaSearch,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import CategorySidebar from './CategorySidebar';
import PromoBanner from './PromoBanner';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from '../../config/api';

const AllProducts = ({ products = [] }) => {
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const isPromoMode = searchParams.get('promo') === 'true';
  const activeCategory = searchParams.get('category') || '';

  const filteredProducts = products.filter((prod) => {
    const hasDiscount =
      prod.discount_percentage && Number(prod.discount_percentage) > 0;
    if (isPromoMode && !hasDiscount) return false;

    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.brand_name &&
        prod.brand_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prod.motor_type &&
        prod.motor_type.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  return (
    <section className="py-14 bg-white border-t border-gray-100 select-none">
      <Container>

        {/* ── TOPBAR ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-900 tracking-tight">
              {isPromoMode ? t('promo_title') : t('all_products_title')}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-normal">
              {isPromoMode ? t('promo_desc') : t('all_products_desc')}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder={t('search_local_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full bg-gray-50 border border-gray-200 text-xs
                pl-9 pr-4 py-2.5 rounded-xl
                focus:outline-none focus:border-gray-400 focus:bg-white
                text-gray-700 transition-all duration-200
              "
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-350 text-[11px]" />
          </div>
        </div>

        {/* ── PROMO BANNER ── */}
        <PromoBanner />

        {/* ── MAIN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar */}
          <div className="lg:col-span-3 w-full lg:sticky lg:top-24">
            <CategorySidebar />
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-9 w-full">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 border border-gray-100 rounded-2xl max-w-sm mx-auto">
                <p className="text-sm font-medium text-gray-800">
                  {t('product_not_found')}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed px-6">
                  {t('product_not_found_desc')}{' '}
                  {activeCategory && `("${activeCategory}")`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((prod) => {
                  const isFavorite = wishlist.some(
                    (item) => item.id === prod.id
                  );
                  const currentRating = prod.rating
                    ? Number(prod.rating)
                    : 0;
                  const originalPrice = Number(prod.price) || 0;
                  const discountPercent =
                    Number(prod.discount_percentage) || 0;
                  const finalPrice =
                    originalPrice -
                    (originalPrice * discountPercent) / 100;
                  const inStock = prod.stock > 0;

                  return (
                    <div
                      key={prod.id}
                      className="
                        bg-white rounded-2xl border border-gray-100
                        hover:border-gray-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]
                        overflow-hidden transition-all duration-300
                        group flex flex-col relative
                      "
                    >
                      {/* ── Discount badge ── */}
                      {discountPercent > 0 && (
                        <span
                          className="
                            absolute top-3 left-3 z-10
                            bg-[#B8272C] text-white
                            text-[9px] font-medium tracking-wide
                            px-2 py-0.5 rounded-md
                          "
                        >
                          -{discountPercent}%
                        </span>
                      )}

                      {/* ── Wishlist button ── */}
                      <button
                        onClick={() => toggleWishlist(prod)}
                        className="
                          absolute top-3 right-3 z-10
                          w-7 h-7 rounded-full
                          bg-white border border-gray-150
                          flex items-center justify-center
                          text-xs transition-all duration-200
                          hover:border-gray-300 active:scale-95
                          shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                        "
                        aria-label="Toggle wishlist"
                      >
                        {isFavorite ? (
                          <FaHeart className="text-[#B8272C]" size={11} />
                        ) : (
                          <FaRegHeart
                            className="text-gray-350 group-hover:text-gray-500 transition-colors"
                            size={11}
                          />
                        )}
                      </button>

                      {/* ── Product image ── */}
                      <div className="relative bg-gray-50 w-full pt-[100%] border-b border-gray-100">
                        {prod.image ? (
                          <img
                            src={`${BASE_URL}/uploads/products/${prod.image}`}
                            alt={prod.name}
                            className="
                              absolute inset-0 w-full h-full object-cover p-3
                              group-hover:scale-[1.03] transition-transform duration-500
                            "
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider text-center px-4">
                              {prod.name.substring(0, 20)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ── Product details ── */}
                      <div className="p-4 flex flex-col flex-grow">

                        {/* Brand / motor tag */}
                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mb-2">
                          {prod.brand_name || 'Universal'}
                          {prod.motor_type ? ` · ${prod.motor_type}` : ''}
                        </p>

                        {/* Name */}
                        <h4 className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug tracking-tight mb-3 group-hover:text-gray-900 transition-colors">
                          {prod.name}
                        </h4>

                        {/* Rating & sold */}
                        <div className="flex items-center gap-2 mb-2.5 text-[10px]">
                          {currentRating > 0 ? (
                            <div className="flex items-center gap-1 text-amber-600 font-medium">
                              <FaStar size={9} className="text-amber-400" />
                              <span>{currentRating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-350 italic text-[9px]">
                              {t('no_reviews')}
                            </span>
                          )}
                          <span className="text-gray-200">·</span>
                          <span className="text-gray-400">
                            {t('sold')}{' '}
                            <span className="font-semibold text-gray-600">
                              {prod.sold || 0}
                            </span>
                          </span>
                        </div>

                        {/* Stock */}
                        <div className="flex items-center gap-1 text-[10px] mb-4">
                          {inStock ? (
                            <>
                              <FaCheckCircle
                                size={9}
                                className="text-emerald-500"
                              />
                              <span className="text-gray-500">
                                {t('remaining')}{' '}
                                <span className="font-semibold text-gray-700 tabular-nums">
                                  {prod.stock}
                                </span>{' '}
                                {t('pcs')}
                              </span>
                            </>
                          ) : (
                            <>
                              <FaTimesCircle
                                size={9}
                                className="text-red-400"
                              />
                              <span className="text-red-400 font-medium">
                                {t('out_of_stock')}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Price + CTA — pinned to bottom */}
                        <div className="mt-auto">
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-sm font-semibold text-gray-900 tabular-nums tracking-tight">
                              {formatPrice(finalPrice)}
                            </span>
                            {discountPercent > 0 && (
                              <span className="text-[10px] text-gray-350 line-through tabular-nums">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              addToCart({ ...prod, price: finalPrice })
                            }
                            disabled={!inStock}
                            className={`
                              w-full text-[11px] font-medium py-2.5 rounded-xl
                              flex items-center justify-center gap-1.5
                              transition-all duration-200 tracking-wide border
                              ${
                                inStock
                                  ? `
                                    bg-white border-gray-200 text-gray-700
                                    hover:bg-gray-900 hover:border-gray-900 hover:text-white
                                    active:scale-95
                                  `
                                  : `
                                    bg-gray-50 border-gray-100 text-gray-300
                                    cursor-not-allowed
                                  `
                              }
                            `}
                          >
                            <FaCartPlus size={11} />
                            {inStock ? t('buy') : t('out_of_stock')}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </Container>
    </section>
  );
};

export default AllProducts;
