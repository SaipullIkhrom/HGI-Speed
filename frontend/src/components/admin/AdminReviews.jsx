import { useState, useEffect } from 'react';
import { FaStar, FaTrash, FaCommentSlash, FaRegCalendarAlt, FaFileInvoice, FaEye } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Menggunakan pattern Fetching yang aman dari kebocoran memori (Memory Leak)
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/reviews`);
        const data = await res.json();
        if (isMounted && data.success) {
          setReviews(data.data || []);
        }
      } catch (err) {
        console.error("Gagal memuat ulasan pelanggan di admin:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReviews();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus ulasan pembeli ini dari publik, Pul?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Gagal menghapus ulasan:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300 selection:bg-[#e11d48] selection:text-white">

      {/* 1. Header Moderasi */}
      <div className="relative p-6 bg-gradient-to-r from-slate-900 via-slate-800/40 to-transparent border border-slate-800/80 rounded-3xl backdrop-blur-xl">
        <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-wider uppercase">
          <FaCommentSlash className="text-[#e11d48]" /> MODERASI ULASAN PEMBELI
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
          Pantau feedback real-time, rating bintang, and media bukti unboxing komponen dari pelanggan MotoPart.
        </p>
      </div>

      {/* 2. Container Tabel Manifes */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-5">Identitas Pembeli & Produk</th>
                <th className="p-4">Skala Rating</th>
                <th className="p-4">Komentar & Media Bukti</th>
                <th className="p-4 text-center pr-5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center font-medium font-mono text-slate-500 animate-pulse">
                    Sinkronisasi data ulasan pelanggan...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-600 font-mono">
                    [ Belum ada kiriman ulasan komoditas dari pembeli ]
                  </td>
                </tr>
              ) : (
                reviews.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/20 transition-colors group">

                    {/* Kolom 1: Informasi Pelanggan dan Item Komponen */}
                    <td className="p-4 pl-5 space-y-1.5">
                      <div>
                        <div className="font-black text-white group-hover:text-[#e11d48] transition-colors text-sm max-w-xs truncate leading-tight">
                          {r.product_name || 'Komponen Suku Cadang'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">
                          👤 Penerima: {r.customer_name || 'Pembeli MotoPart'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 text-[9px] text-slate-500 font-mono font-medium">
                        <span className="flex items-center gap-1">
                          <FaFileInvoice className="text-slate-600" /> {r.order_number || `INV-ID-${r.order_id}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaRegCalendarAlt className="text-slate-600" /> {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                      </div>
                    </td>

                    {/* Kolom 2: Rating Bintang */}
                    <td className="p-4 vertical-align-middle">
                      <div className="flex flex-col gap-1">
                        <div className="flex text-amber-400 gap-0.5">
                          {[...Array(Math.min(5, Math.max(1, r.rating)))].map((_, idx) => (
                            <FaStar key={idx} size={12} />
                          ))}
                        </div>
                        <span className="text-[9px] text-amber-500/80 font-mono font-black uppercase tracking-wider">
                          Poin: {r.rating} / 5
                        </span>
                      </div>
                    </td>

                    {/* Kolom 3: Komentar Teks & Media Thumbnail Fisik */}
                    <td className="p-4 space-y-3 max-w-md">
                      <p className="text-slate-300 break-words leading-relaxed font-medium">
                        {r.comment || 'Tanpa isi komentar teks.'}
                      </p>

                      {/* FILTER RENDER MEDIA: Muncul hanya jika ada media_url dari database 🖼️ */}
                      {r.media_url && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center group/media shadow-inner">
                          {r.media_url.endsWith('.mp4') || r.media_url.endsWith('.mov') ? (
                            <video
                              src={`${BASE_URL}/uploads/reviews/${r.media_url}`}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={`${BASE_URL}/uploads/reviews/${r.media_url}`}
                              alt="Bukti Fisik"
                              className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                            />
                          )}
                          {/* Tombol Preview Overlay Mini */}
                          <a
                            href={`${BASE_URL}/uploads/reviews/${r.media_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
                          >
                            <FaEye size={10} /> Lihat
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Kolom 4: Aksi Hapus */}
                    <td className="p-4 text-center pr-5">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-slate-600 hover:text-rose-500 bg-slate-950 border border-slate-800 hover:border-rose-500/30 p-3 rounded-xl transition-all inline-flex items-center active:scale-90"
                        title="Hapus Ulasan dari Publik"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminReviews;
