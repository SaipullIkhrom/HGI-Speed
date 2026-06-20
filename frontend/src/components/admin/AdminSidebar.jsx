import { useState } from 'react';
import {
  FaChartPie, FaBox, FaTags, FaCopyright, FaShoppingCart,
  FaUsers, FaWarehouse, FaTicketAlt, FaBullhorn, FaImage,
  FaNewspaper, FaStar, FaFileAlt, FaCog, FaSignOutAlt,
  FaBars, FaTimes
} from 'react-icons/fa';

const menuItems = [
  { id: 'Dashboard', text: 'Dashboard', icon: <FaChartPie /> },
  { id: 'Produk', text: 'Produk', icon: <FaBox /> },
  { id: 'Kategori', text: 'Kategori', icon: <FaTags /> },
  { id: 'Merek', text: 'Merek', icon: <FaCopyright /> },
  { id: 'Pesanan', text: 'Pesanan', icon: <FaShoppingCart /> },
  { id: 'Pelanggan', text: 'Pelanggan', icon: <FaUsers /> },
  { id: 'Stok', text: 'Stok', icon: <FaWarehouse /> },
  { id: 'Voucher', text: 'Voucher', icon: <FaTicketAlt /> },
  { id: 'Promo', text: 'Promo', icon: <FaBullhorn /> },
  { id: 'Banner', text: 'Banner', icon: <FaImage /> },
  { id: 'Artikel', text: 'Artikel', icon: <FaNewspaper /> },
  { id: 'Review', text: 'Review', icon: <FaStar /> },
  { id: 'Laporan', text: 'Laporan', icon: <FaFileAlt /> },
  { id: 'Pengaturan', text: 'Pengaturan', icon: <FaCog /> },
];

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  // State untuk mengontrol buka/tutup sidebar di perangkat mobile
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.reload();
  };

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsOpen(false); // Otomatis menutup menu setelah diklik (khusus mobile)
  };

  return (
    <>
      {/* ================= HEADER BAR ATAS (Hanya Muncul di Mobile/Tablet) ================= */}
      <header className="lg:hidden w-full bg-[#0f172a] h-16 fixed top-0 left-0 flex items-center justify-between px-6 border-b border-slate-800 z-30">
        <div className="text-lg font-heading font-extrabold text-[#e11d48] tracking-tighter">
          MOTOPART <span className="text-white text-[10px] font-sans font-medium px-1.5 py-0.5 bg-slate-800 rounded ml-1">ADMIN</span>
        </div>

        {/* Tombol Hamburger dengan animasi mikro skala */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 active:scale-95 transition-all outline-none"
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </header>

      {/* ================= BACKDROP OVERLAY (Efek Gelap Saat Menu Mobile Terbuka) ================= */}
      <div
        onClick={() => setIsOpen(false)}
        className={`lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ================= COMPACT ADMISSIONS SIDEBAR COMPONENT ================= */}
      <aside
        className={`w-64 bg-[#0f172a] text-gray-400 h-screen fixed top-0 left-0 flex flex-col justify-between border-r border-slate-800 z-20 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header Sidebar (Disembunyikan di mobile karena sudah ada Top Header Bar) */}
          <div className="hidden lg:block p-6 border-b border-slate-800">
            <div className="text-xl font-heading font-extrabold text-[#e11d48] tracking-tighter">
              MOTOPART <span className="text-white text-xs font-sans font-medium px-2 py-0.5 bg-slate-800 rounded ml-1">ADMIN</span>
            </div>
          </div>

          {/* Area Navigasi Menu - Dengan Padding Atas Khusus Mobile agar Tidak Tertutup Header */}
          <nav className="p-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-160px)] mt-16 lg:mt-0 scrollbar-thin scrollbar-thumb-slate-800">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#e11d48] text-white font-bold shadow-lg shadow-red-500/20 translate-x-1'
                    : 'hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <span className={`text-base transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar (Tombol Keluar Akun) */}
        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
          <div
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-500 transition-all duration-200 cursor-pointer"
          >
            <FaSignOutAlt className="text-base" />
            <span>Keluar Akun</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
