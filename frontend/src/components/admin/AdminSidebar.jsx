import {
  FaChartPie, FaBox, FaTags, FaCopyright, FaShoppingCart,
  FaUsers, FaWarehouse, FaTicketAlt, FaBullhorn, FaImage,
  FaNewspaper, FaStar, FaFileAlt, FaCog, FaSignOutAlt
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
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-[#0f172a] text-gray-400 h-screen fixed top-0 left-0 flex flex-col justify-between border-r border-slate-800 z-20">
      <div>
        <div className="p-6 border-b border-slate-800">
          <div className="text-xl font-heading font-extrabold text-[#e11d48] tracking-tighter">
            MOTOPART <span className="text-white text-xs font-sans font-medium px-2 py-0.5 bg-slate-800 rounded ml-1">ADMIN</span>
          </div>
        </div>
        <nav className="p-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-[#e11d48] text-white font-bold shadow-md'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <div onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-500 transition-all cursor-pointer">
          <FaSignOutAlt />
          <span>Keluar Akun</span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
