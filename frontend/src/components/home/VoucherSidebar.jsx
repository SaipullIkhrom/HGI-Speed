import { useState, useEffect } from 'react';
import { FaTruck, FaCrown, FaCheck, FaTicketAlt, FaPercentage, FaCopy, } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { BASE_URL } from "../../config/api";

const PromoAndVoucherSidebar = () => {
  useTranslation();
  const { formatPrice } = useCurrency();

  // Ambil manifes user aktif untuk isolasi storage klaim promo
  const localUserData = localStorage.getItem('user');
  const user = localUserData ? JSON.parse(localUserData) : null;
  const storageKey = user ? `claimed_promos_user_${user.id}` : 'claimed_promos_guest';

  // --- STATE MANAGEMENT DATA DARI BACKEND ---
  const [promos, setPromos] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [loadingVouchers, setLoadingVouchers] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Lazy State Initialization untuk penahan riwayat klaim promo harian
  const [claimedPromos, setClaimedPromos] = useState(() => {
    const localClaimed = localStorage.getItem(storageKey);
    return localClaimed ? JSON.parse(localClaimed) : [];
  });

  // --- 1. EFFECT: FETCH LIVE PROMO (DARI ADMIN PROMOS / DATABASE) ---
  useEffect(() => {
    const fetchLivePromos = async () => {
      try {
        setLoadingPromos(true);
        const url = user?.id ? `${BASE_URL}/api/promos?userId=${user.id}` : `${BASE_URL}/api/promos`;
        const res = await fetch(url);
        const resData = await res.json();

        if (resData.success) {
          setPromos(resData.data || []);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data promo harian:", error);
      } finally {
        setLoadingPromos(false);
      }
    };

    fetchLivePromos();
  }, [user?.id]);

  // --- 2. EFFECT: FETCH LIVE VOUCHER (DARI ADMIN VOUCHERS / DATABASE) ---
  useEffect(() => {
    const fetchLiveVouchers = async () => {
      try {
        setLoadingVouchers(true);
        const res = await fetch(`${BASE_URL}/api/vouchers`);
        const resData = await res.json();

        if (resData.success) {
          setVouchers(resData.data || []);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data kupon voucher:", error);
      } finally {
        setLoadingVouchers(false);
      }
    };

    fetchLiveVouchers();
  }, []);

  // --- 3. LOGIKA COPY KODE VOUCHER TO CLIPBOARD ---
  const handleCopyCode = (id, codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- 4. LOGIKA KLAIM PROMO LANGSUNG KE MYSQL ---
  const handleClaimPromo = async (promoId, promoName) => {
    if (!user) {
      alert('Akses Ditolak: Kamu harus login terlebih dahulu untuk mengklaim program promo HGI SPEED!');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/promos/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, promoId: promoId })
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        const updatedClaims = [...claimedPromos, promoId];
        setClaimedPromos(updatedClaims);
        localStorage.setItem(storageKey, JSON.stringify(updatedClaims));

        alert(resData.message || `Promo "${promoName}" berhasil diaktifkan ke akunmu! 🏁`);
      } else {
        alert(resData.message || 'Gagal mengklaim promo harian.');
      }
    } catch (error) {
      console.error("Error pada network jaringan klaim promo:", error);
      alert('Terjadi kendala jaringan saat memproses permintaan klaim promo.');
    }
  };

  return (
    <div className="col-span-1 lg:col-span-4 flex flex-col justify-start gap-5 h-full max-h-[85vh] overflow-y-auto pr-1 pb-4 scrollbar-none">

      {/* ================= SEKTOR 1: LIVE PROMO (BISA DIKLAIM LANGSUNG) ================= */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#e11d48] rounded-full animate-pulse"></span>
          🔥 PROMO AKTIF HARI INI (KLIK KLAIM)
        </h4>

        {loadingPromos ? (
          <div className="space-y-2">
            <div className="h-24 bg-white border border-gray-100 rounded-3xl w-full animate-pulse"></div>
          </div>
        ) : promos.length === 0 ? (
          <div className="p-5 bg-white border border-dashed border-gray-200 rounded-3xl text-center text-[11px] font-bold text-gray-400">
            📭 Belum ada program promo kilat saat ini, Pul.
          </div>
        ) : (
          promos.map((prm) => {
            const isPromoClaimed = prm.is_claimed === 1 || claimedPromos.includes(prm.id);

            return (
              <div
                key={prm.id}
                className={`bg-white border rounded-3xl p-4 flex items-center gap-4 transition-all duration-300 relative overflow-hidden group w-full ${
                  isPromoClaimed
                    ? 'border-emerald-100 bg-emerald-50/5 shadow-sm'
                    : 'border-gray-100 hover:border-[#e11d48] hover:shadow-md hover:shadow-slate-200/50'
                }`}
              >
                <span className={`absolute top-0 right-0 text-[8px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-widest font-mono ${
                  isPromoClaimed ? 'bg-emerald-500 text-white' : 'bg-rose-50 text-[#e11d48] border-l border-b border-rose-100/40'
                }`}>
                  {isPromoClaimed ? 'AKTIF' : `${prm.discount_percentage}% OFF`}
                </span>

                <div className="text-xl md:text-2xl flex-shrink-0 p-3 rounded-2xl bg-red-50/50">
                  <FaPercentage className="text-[#e11d48]" />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <h5 className="font-extrabold text-xs md:text-sm text-slate-900 tracking-tight truncate">
                    {prm.name}
                  </h5>
                  <p className="text-[10px] md:text-xs font-semibold text-slate-500 leading-tight">
                    Diskon potongan harga sebesar <span className="font-mono text-slate-900 font-bold">-{prm.discount_percentage}%</span> otomatis memotong total tagihan belanjaan.
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2 gap-2">
                    <p className="text-[8px] text-gray-400 font-mono flex items-center gap-1">
                      📅 s/d {prm.end_date ? new Date(prm.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Selesai'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleClaimPromo(prm.id, prm.name)}
                      disabled={isPromoClaimed}
                      className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 ${
                        isPromoClaimed
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-[#e11d48] text-white active:scale-95'
                      }`}
                    >
                      {isPromoClaimed ? <FaCheck size={7} /> : <FaTicketAlt size={7} />}
                      <span>{isPromoClaimed ? 'Gunakan' : 'Klaim'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= SEKTOR 2: LIVE KODE VOUCHER (SALIN KODE KETIK MANUAL) ================= */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
          🎟️ VOUCHER TOKO (SALIN KODE & KETIK MANUAL)
        </h4>

        {loadingVouchers ? (
          <div className="space-y-2">
            <div className="h-24 bg-white border border-gray-100 rounded-3xl w-full animate-pulse"></div>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-5 bg-white border border-dashed border-gray-200 rounded-3xl text-center text-[11px] font-bold text-gray-400">
            🎟️ Belum ada kupon voucher aktif yang diterbitkan oleh admin.
          </div>
        ) : (
          vouchers.map((vch) => {
            const isCopied = copiedId === vch.id;

            // Pengondisian ikon kosmetik otomatis berdasarkan nominal potongan di database
            const isVipVoucher = vch.discount_value >= 50000 || vch.discount_type === 'percentage';

            // Format nominal diskon (Persentase vs Rupiah murni sesuai SQL data)
            const formattedValue = vch.discount_type === 'percentage'
              ? `${vch.discount_value}%`
              : formatPrice(vch.discount_value);

            return (
              <div
                key={vch.id}
                className={`bg-white border rounded-3xl p-4 flex items-center gap-4 transition-all duration-300 relative overflow-hidden group w-full ${
                  isVipVoucher
                    ? 'border-amber-100 hover:border-amber-400'
                    : 'border-gray-100 hover:border-[#e11d48]'
                }`}
              >
                <span className={`absolute top-0 right-0 text-[8px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-widest font-mono border-l border-b border-gray-100/30 ${
                  isVipVoucher ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  KODE VOUCHER
                </span>

                <div className={`text-xl md:text-2xl flex-shrink-0 p-3 rounded-2xl ${isVipVoucher ? 'bg-amber-50/60' : 'bg-gray-50'}`}>
                  {isVipVoucher ? (
                    <FaCrown className="text-amber-500" />
                  ) : (
                    <FaTruck className="text-[#e11d48]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <h5 className="font-extrabold text-xs md:text-sm text-slate-900 tracking-tight">
                    {isVipVoucher ? 'Potongan Belanja Spesial' : 'Subsidi Distribusi Ongkir'}
                  </h5>
                  <p className="text-[10px] md:text-xs font-semibold text-slate-500 leading-tight">
                    Dapatkan diskon potongan <strong className="text-slate-900 font-mono">{formattedValue}</strong> dengan klaim kode manual saat checkout.
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2 gap-2">
                    <div className="text-[9px] text-gray-400 font-medium truncate">
                      💡 Min. Belanja: <span className="font-bold font-mono text-slate-600">{formatPrice(vch.min_purchase || 0)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Boks Penampil Kode Voucher */}
                      <div className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono text-[9px] font-black text-slate-700 uppercase tracking-wide select-all">
                        {vch.code}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(vch.id, vch.code)}
                        className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 ${
                          isCopied
                            ? 'bg-emerald-500 text-white'
                            : isVipVoucher
                              ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                              : 'bg-slate-900 hover:bg-[#e11d48] text-white active:scale-95'
                        }`}
                      >
                        {isCopied ? <FaCheck size={7} /> : <FaCopy size={7} />}
                        <span>{isCopied ? 'Selesai' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default PromoAndVoucherSidebar;
