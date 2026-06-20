import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaCommentAlt, FaCalendarAlt, FaFileInvoice, FaPenSquare, FaBox } from 'react-icons/fa';
import { Container } from "../layout/Container";
import ReviewModal from '../tools/ReviewModal';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

const ReviewHistory = () => {
  const navigate = useNavigate();
  const [itemsToReview, setItemsToReview] = useState([]);
  const [myArrivedReviews, setMyArrivedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(0);

  const { t } = useTranslation(); 

  const localUserData = localStorage.getItem('user');
  const user = localUserData ? JSON.parse(localUserData) : null;
  const activeUserId = user ? user.id : null;

  // SIKLUS UTAMA: Mengambil data per item transaksi langsung dari rute join terpisah
  useEffect(() => {
    const loadReviewCenterData = async () => {
      if (!activeUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Tarik data riwayat transaksi per produk & arsip ulasan secara paralel
        const [transactionsRes, reviewsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/transactions/history?user_id=${activeUserId}`),
          fetch(`${BASE_URL}/api/reviews?user_id=${activeUserId}`)
        ]);

        const transactionsData = await transactionsRes.json();
        const reviewsData = await reviewsRes.json();

        if (transactionsData.success && reviewsData.success) {
          const allPurchasedProducts = transactionsData.data || [];
          const explicitReviews = reviewsData.data || [];

          // 2. Saring hanya produk yang status nota induknya sudah 'Selesai'
          const completedProducts = allPurchasedProducts.filter(item => item.status === 'Selesai');

          // 3. Kunci Status Ulasan: Cek rating masuk database per kombinasi produk + nota
          const productsWithReviewStatus = await Promise.all(
            completedProducts.map(async (item) => {
              try {
                const checkRes = await fetch(`${BASE_URL}/api/reviews/check/${item.order_id}?product_id=${item.product_id}`);
                const checkData = await checkRes.json();
                return { ...item, alreadyReviewed: !!checkData.reviewed };
              } catch {
                return { ...item, alreadyReviewed: false };
              }
            })
          );

          // 4. Dorong ke state komponen yang belum diulas secara individual
          setItemsToReview(productsWithReviewStatus.filter(item => !item.alreadyReviewed));
          setMyArrivedReviews(explicitReviews);
        }
      } catch (err) {
        console.error("Gagal menyinkronkan data review center per produk:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReviewCenterData();
  }, [activeUserId, triggerFetch]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans text-center">
        <p className="text-xs text-slate-400">{t('please_login')}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/60 min-h-screen font-sans pb-16 text-slate-700 selection:bg-[#e11d48] selection:text-white">
      <Container className="max-w-3xl pt-8 space-y-6">

        {/* Tombol Kembali ke Profil */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-slate-900 transition-all tracking-widest bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95"
        >
          <FaArrowLeft className="text-[#e11d48]" /> {t('back_to_profile')}
        </button>

        {/* Header Dashboard Review */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md text-white">
          <h1 className="text-base font-black flex items-center gap-2 uppercase tracking-wider">
            <FaCommentAlt className="text-[#e11d48]" /> {t('review_center_title')}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
            {t('review_center_desc')}
          </p>
        </div>

        {/* PANEL 1: DAFTAR YANG MENUNGGU RATING BARU (MANDIRI PER BARANG) */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span> {t('waiting_for_review')} ({itemsToReview.length})
          </h3>

          {loading ? (
            <p className="text-xs text-slate-400 italic animate-pulse">{t('connecting_to_server')}</p>
          ) : itemsToReview.length === 0 ? (
            <div className="text-center py-6 bg-white border border-dashed rounded-2xl text-slate-400 text-[11px] font-mono">
              {t('all_reviewed')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {itemsToReview.map((item, index) => (
                <div key={`${item.order_id}-${item.product_id}-${index}`} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-xs gap-4 hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* 📸 FOTO PRODUK DAFTAR TUNGGU */}
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 p-1 flex items-center justify-center relative shadow-sm">
                      {item.product_image || item.image ? (
                        <img
                          src={`${BASE_URL}/uploads/products/${item.product_image || item.image}`}
                          alt={item.product_name || t('fallback_product')}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none'; // Sembunyikan gambar jika broken link
                            e.target.nextSibling.style.display = 'flex'; // Munculkan ikon cadangan
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"
                        style={{ display: (item.product_image || item.image) ? 'none' : 'flex' }}
                      >
                        <FaBox size={18} />
                      </div>
                    </div>

                    {/* Info Detail Nota & Barang */}
                    <div className="min-w-0">
                      <span className="font-mono font-black text-slate-900 block truncate text-xs">
                        {item.product_name || t('fallback_product')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                        {t('receipt_label')} <strong className="text-slate-600 font-mono">{item.order_number}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-200 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex-shrink-0"
                  >
                    <FaPenSquare size={12} /> {t('rating_part_btn')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PANEL 2: ARSIP HISTORI RATING YANG SUDAH TERKUNCI PERMANEN 🔒 */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-3 bg-slate-400 rounded-full"></span> {t('locked_reviews_archive')} ({myArrivedReviews.length})
          </h3>

          <div className="space-y-3.5">
            {!loading && myArrivedReviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl border-l border-b border-slate-200/40">
                  🔒 {t('locked_badge')}
                </div>
                <div className="flex gap-3.5 items-center">
                  {/* 📸 FOTO PRODUK ARSIP ULASAN */}
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 p-1 flex items-center justify-center relative shadow-inner">
                    {rev.product_image || rev.image ? (
                      <img
                        src={`${BASE_URL}/uploads/products/${rev.product_image || rev.image}`}
                        className="w-full h-full object-cover rounded-lg"
                        alt={rev.product_name || t('fallback_product')}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"
                      style={{ display: (rev.product_image || rev.image) ? 'none' : 'flex' }}
                    >
                      <FaBox size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs tracking-tight">{rev.product_name || t('fallback_product')}</h3>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono font-bold mt-0.5">
                      <span className="text-slate-500"><FaFileInvoice className="inline mr-0.5 text-[#e11d48]" size={10} /> {rev.order_number || `INV-ORD-${rev.order_id}`}</span>
                      <span><FaCalendarAlt className="inline mr-0.5" size={9} /> {rev.created_at ? new Date(rev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, Math.max(1, rev.rating)))].map((_, idx) => (
                    <FaStar key={idx} size={10} className="text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/40 p-2.5 rounded-xl border border-slate-100">
                  "{rev.comment || t('no_review_text')}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </Container>

      {/* RENDER MODAL RATING DENGAN PASOKAN DATA FOTO PRODUK SECARA REAL-TIME */}
      {activeModalItem && (
        <ReviewModal
          order={{
            id: activeModalItem.order_id,
            order_number: activeModalItem.order_number,
            product_id: activeModalItem.product_id,
            product_name: activeModalItem.product_name,
            product_image: activeModalItem.product_image || activeModalItem.image, // 🛠️ PASOKAN FOTO AMAN KE MODAL
            alreadyReviewed: activeModalItem.alreadyReviewed
          }}
          onClose={() => setActiveModalItem(null)}
          onReviewSuccess={() => {
            setActiveModalItem(null);
            setTriggerFetch(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export default ReviewHistory;
