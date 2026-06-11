import { Container } from "./Container";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaInstagram, FaFacebook, FaYoutube, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // 👈 1. IMPORT TRANSLATOR

const Footer = () => {
  const { t } = useTranslation(); // 👈 2. PANGGIL FUNGSI TRANSLATE

  return (
    <footer className="bg-[#0f172a] text-slate-400 text-sm border-t border-slate-800/80 font-sans">
      {/* Bagian Atas Footer */}
      <div className="py-16 border-b border-slate-800/50">
        <Container className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Kolom 1: Tentang Toko & Branding */}
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-black text-[#e11d48] tracking-tighter uppercase font-heading">
              HGI<span className="text-white">SPEED</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-medium">
              {t('footer_about_desc')}
            </p>
            <div className="flex gap-2.5 text-white mt-3">
              <span className="w-9 h-9 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 flex items-center justify-center hover:bg-[#e11d48] hover:border-[#e11d48] hover:scale-110 transition-all duration-300 cursor-pointer shadow-sm"><FaInstagram size={15} /></span>
              <span className="w-9 h-9 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 flex items-center justify-center hover:bg-[#e11d48] hover:border-[#e11d48] hover:scale-110 transition-all duration-300 cursor-pointer shadow-sm"><FaFacebook size={15} /></span>
              <span className="w-9 h-9 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 flex items-center justify-center hover:bg-[#e11d48] hover:border-[#e11d48] hover:scale-110 transition-all duration-300 cursor-pointer shadow-sm"><FaYoutube size={15} /></span>
            </div>
          </div>

          {/* Kolom 2: Belanja */}
          <div>
            <h4 className="text-white font-black mb-5 font-heading text-xs tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1 h-3 bg-[#e11d48] rounded-full"></span> {t('footer_explore')}
            </h4>
            <ul className="flex flex-col gap-3 text-xs font-medium">
              <li className="hover:text-[#e11d48] cursor-pointer transition-all duration-300 flex items-center gap-1 group hover:translate-x-1">
                <FaChevronRight size={8} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" /> {t('footer_cat_all')}
              </li>
              <li className="hover:text-[#e11d48] cursor-pointer transition-all duration-300 flex items-center gap-1 group hover:translate-x-1">
                <FaChevronRight size={8} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" /> {t('footer_cat_flash')}
              </li>
              <li className="hover:text-[#e11d48] cursor-pointer transition-all duration-300 flex items-center gap-1 group hover:translate-x-1">
                <FaChevronRight size={8} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" /> {t('footer_cat_oil')}
              </li>
              <li className="hover:text-[#e11d48] cursor-pointer transition-all duration-300 flex items-center gap-1 group hover:translate-x-1">
                <FaChevronRight size={8} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" /> {t('footer_cat_promo')}
              </li>
            </ul>
          </div>

          {/* Kolom 3: Bantuan */}
          <div>
            <h4 className="text-white font-black mb-5 font-heading text-xs tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1 h-3 bg-[#e11d48] rounded-full"></span> {t('footer_help')}
            </h4>
            <ul className="flex flex-col gap-3 text-xs font-medium">
              <li className="hover:text-[#e11d48] cursor-pointer transition-all duration-300 flex items-center gap-1 group hover:translate-x-1">
                <FaChevronRight size={8} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" /> {t('footer_help_shipping')}
              </li>
              <li className="hover:text-[#e11d48] cursor-pointer transition-all duration-300 flex items-center gap-1 group hover:translate-x-1">
                <FaChevronRight size={8} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" /> {t('footer_help_cekongkir')}
              </li>
              <li className="hover:text-[#e11d48] cursor-pointer transition-all duration-300 flex items-center gap-1 group hover:translate-x-1">
                <FaChevronRight size={8} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" /> {t('footer_help_warranty')}
              </li>
              <li className="hover:text-[#e11d48] cursor-pointer transition-all duration-300 flex items-center gap-1 group hover:translate-x-1">
                <FaChevronRight size={8} className="text-slate-600 group-hover:text-[#e11d48] transition-colors" /> {t('footer_help_terms')}
              </li>
            </ul>
          </div>

          {/* Kolom 4: Kontak */}
          <div className="flex flex-col gap-3.5 text-xs font-medium">
            <h4 className="text-white font-black mb-1 font-heading text-xs tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-1 h-3 bg-[#e11d48] rounded-full"></span> {t('footer_contact')}
            </h4>
            <div className="flex items-start gap-3 leading-relaxed">
              <FaMapMarkerAlt className="text-[#e11d48] mt-0.5 flex-shrink-0" size={13} />
              <span className="text-slate-400">Jl. Raya Pamulang No. 09, Tangerang Selatan</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <FaPhoneAlt className="text-[#e11d48] flex-shrink-0" size={12} />
              <span className="text-slate-400">+62 812-3456-7890</span>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-[#e11d48] flex-shrink-0" size={12} />
              <span className="text-slate-400">support@hgispeed.com</span>
            </div>
          </div>

        </Container>
      </div>

      {/* Bagian Bawah Footer (Hak Cipta) */}
      <div className="py-5 bg-[#090d16] text-center text-xs border-t border-slate-900 font-mono text-slate-500">
        <Container>
          <p>&copy; {new Date().getFullYear()} HGI SPEED Indonesia. All Rights Reserved.</p>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
