import { useState } from 'react';
import { FaTruck, FaCrown, FaCheck, FaTicketAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // 👈 IMPORT TRANSLATOR
import { useCurrency } from '../../context/CurrencyContext'; // 👈 IMPORT KURS GLOBAL

const VoucherSidebar = () => {
  const [claimedVouchers, setClaimedVouchers] = useState([]);
  const { t } = useTranslation(); // 👈 PANGGIL TRANSLATOR
  const { formatPrice } = useCurrency(); // 👈 PANGGIL FORMAT KURS

  // Data voucher disinkronkan dengan fungsi t()
  const vouchers = [
    {
      id: 'VCH-REG-01',
      type: 'customer',
      icon: <FaTruck className="text-[#e11d48]" />,
      title: t('voucher_shipping_title'),
      desc: t('voucher_shipping_desc', { price: formatPrice(15000) }),
      tag: t('reguler'),
      subInfo: t('min_purchase', { price: formatPrice(50000) }),
    },
    {
      id: 'VCH-MMB-01',
      type: 'member',
      icon: <FaCrown className="text-amber-500" />,
      title: t('vip_member_title'),
      desc: t('vip_member_desc'),
      tag: t('vip_tag'),
      subInfo: t('vip_subinfo'),
    }
  ];

  const handleClaim = (id, title) => {
    if (claimedVouchers.includes(id)) return;
    setClaimedVouchers((prev) => [...prev, id]);
    alert(`Mantap Pul! Voucher "${title}" berhasil diamankan ke akunmu! 🏎️💨`);
  };

  return (
    <div className="col-span-1 lg:col-span-4 flex flex-col justify-between gap-3 md:gap-4 h-full">
      {vouchers.map((vch) => {
        const isClaimed = claimedVouchers.includes(vch.id);
        const isMember = vch.type === 'member';

        return (
          <div
            key={vch.id}
            className={`bg-white border rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 relative overflow-hidden group flex-1 w-full ${
              isMember
                ? 'border-amber-100 hover:border-amber-400 hover:shadow-amber-500/5 shadow-[0_4px_20px_rgba(245,158,11,0.02)]'
                : 'border-gray-100 hover:border-[#e11d48] hover:shadow-red-500/5 shadow-sm'
            }`}
          >
            {/* Ribbon/Badge Penanda */}
            <span className={`absolute top-0 right-0 text-[8px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-widest font-mono border-l border-b border-gray-100/50 transition-colors ${
              isClaimed
                ? 'bg-emerald-500 text-white border-emerald-600/20'
                : isMember
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-[#e11d48] group-hover:text-white'
            }`}>
              {isClaimed ? t('claimed') : vch.tag}
            </span>

            {/* Lingkaran Bingkai Icon */}
            <div className={`text-2xl md:text-3xl flex-shrink-0 transition-transform group-hover:scale-105 duration-300 p-3 rounded-2xl ${
              isMember ? 'bg-amber-50/60' : 'bg-gray-50 group-hover:bg-red-50/50'
            }`}>
              {vch.icon}
            </div>

            {/* Sektor Informasi */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <h5 className="font-extrabold text-xs md:text-sm text-slate-900 tracking-tight group-hover:text-[#e11d48] transition-colors flex items-center gap-1.5">
                {vch.title}
              </h5>
              <p className="text-[10px] md:text-xs font-semibold text-slate-700 truncate">
                {vch.desc}
              </p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2 gap-2">
                <p className="text-[9px] text-gray-400 font-medium tracking-normal truncate">
                  💡 {vch.subInfo}
                </p>
                <button
                  onClick={() => handleClaim(vch.id, vch.title)}
                  disabled={isClaimed}
                  className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 ${
                    isClaimed
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed shadow-none'
                      : isMember
                        ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95 shadow-sm shadow-amber-700/20'
                        : 'bg-slate-900 hover:bg-[#e11d48] text-white active:scale-95 shadow-sm'
                  }`}
                >
                  {isClaimed ? <FaCheck size={7} /> : <FaTicketAlt size={7} />}
                  <span>{isClaimed ? t('use') : t('claim')}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VoucherSidebar;
