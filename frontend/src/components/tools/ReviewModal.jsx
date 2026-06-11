import { useState } from 'react';
import { FaStar, FaCloudUploadAlt, FaTimes, FaCheckCircle, FaTrash, FaShieldAlt, FaBox } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../config/api";

const ReviewModal = ({ order, onClose, onReviewSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 🛠️ INISIALISASI HOOKS GLOBAL
  const { t } = useTranslation();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (mediaFiles.length + files.length > 3) {
      alert(t('max_upload_alert'));
      return;
    }
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('order_id', order.id);
    formData.append('product_id', order.product_id);
    formData.append('rating', rating);
    formData.append('comment', comment);

    if (mediaFiles.length > 0) {
      formData.append('media', mediaFiles[0]);
    }

    try {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setIsSuccess(true);
        if (onReviewSuccess) {
          onReviewSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        alert(`${t('review_save_failed')} ${resData.message}`);
      }
    } catch (error) {
      console.error('Error saat submit ulasan:', error);
      alert(t('review_network_error'));
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess || order?.alreadyReviewed) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-4 border border-emerald-100 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full -z-0 pointer-events-none"></div>

          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-lg shadow-emerald-100/50 animate-bounce relative z-10">
            <FaCheckCircle size={30} />
          </div>

          <div className="space-y-1.5 relative z-10">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{t('review_locked_title')}</h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              {t('review_thanks_1')} <strong className="text-slate-800">{order.product_name}</strong> {t('review_thanks_2')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-2.5 rounded-xl uppercase tracking-wider transition-all"
          >
            {t('close_window')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-slate-700 selection:bg-[#e11d48] selection:text-white animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-5 border border-slate-100/80 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-none">

        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#e11d48] to-purple-600"></div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-6 p-2 text-slate-400 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 active:scale-90"
        >
          <FaTimes size={11} />
        </button>

        {/* Header Modal */}
        <div className="text-center space-y-1 pt-2 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 text-[9px] bg-red-50 text-[#e11d48] font-black px-3 py-1 rounded-md border border-red-100/60 uppercase tracking-widest">
            <FaShieldAlt size={9} /> {t('garage_accreditation')}
          </span>

          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight pt-2">
            {t('give_part_rating')}
          </h3>

          {/* 📸 BARU: FRAME FOTO PRODUK DINAMIS DI DALAM MODAL */}
          <div className="w-16 h-16 bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden p-1 flex items-center justify-center shadow-sm mt-3 relative group">
            {order.product_image || order.image ? (
              <img
                src={`${BASE_URL}/uploads/products/${order.product_image || order.image}`}
                alt=""
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"
              style={{ display: (order.product_image || order.image) ? 'none' : 'flex' }}
            >
              <FaBox size={20} />
            </div>
          </div>

          <p className="text-xs font-black text-slate-800 block mt-2 px-1 truncate max-w-[280px]">
            {order.product_name}
          </p>

          <p className="text-[9px] text-slate-400 font-mono font-black bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded-md inline-block mt-1">
            {t('receipt')} {order.order_number}
          </p>
        </div>

        <form onSubmit={handleSubmitReview} className="space-y-4">

          {/* Interactive Star Rating Box */}
          <div className="flex flex-col items-center gap-2 py-4 bg-gradient-to-b from-slate-50/50 to-slate-50 border border-slate-100 rounded-2xl shadow-inner">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('mechanic_satisfaction')}</label>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, index) => {
                const currentRating = index + 1;
                return (
                  <label key={index} className="cursor-pointer transform hover:scale-110 active:scale-95 transition-all">
                    <input
                      type="radio"
                      name="rating"
                      value={currentRating}
                      className="hidden"
                      onClick={() => setRating(currentRating)}
                    />
                    <FaStar
                      size={32}
                      className="transition-colors duration-200 drop-shadow-sm"
                      color={currentRating <= (hoverRating || rating) ? '#fbbf24' : '#e2e8f0'}
                      onMouseEnter={() => setHoverRating(currentRating)}
                      onMouseLeave={() => setHoverRating(null)}
                    />
                  </label>
                );
              })}
            </div>
            <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-md uppercase tracking-wide mt-1">
              {rating === 5 ? t('rating_5') : rating === 4 ? t('rating_4') : rating === 3 ? t('rating_3') : rating === 2 ? t('rating_2') : t('rating_1')}
            </span>
          </div>

          {/* Textarea Input Review */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{t('review_comment_label')}</label>
            <textarea
              rows="3"
              placeholder={t('review_comment_placeholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 focus:border-[#e11d48] focus:ring-1 focus:ring-[#e11d48]/20 outline-none transition-all resize-none leading-relaxed font-medium shadow-sm"
              required
            />
          </div>

          {/* Media Upload Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{t('media_attachment_label')}</label>

            <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-5 hover:bg-slate-50/40 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group bg-white shadow-sm">
              <FaCloudUploadAlt size={24} className="text-slate-300 group-hover:text-[#e11d48] transition-colors" />
              <span className="text-[11px] font-black text-slate-700 tracking-tight">{t('choose_file')}</span>
              <span className="text-[9px] text-slate-400 font-medium">{t('media_guideline')}</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            {/* Render Preview Media Dinamis */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2 p-2 bg-slate-50 border border-slate-100 rounded-2xl">
                {mediaFiles.map((file, index) => {
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center group shadow-sm">
                      {file.type.startsWith('video/') ? (
                        <video src={previewUrl} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          removeMedia(index);
                          URL.revokeObjectURL(previewUrl);
                        }}
                        className="absolute top-1 right-1 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow"
                      >
                        <FaTrash size={9} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e11d48] hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs py-4 rounded-xl transition-all shadow-md active:scale-[0.99] tracking-widest uppercase shadow-red-100 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? t('sync_review') : t('send_review')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
