import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminDashboardContent from './AdminDashboardContent';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminBrands from './AdminBrands';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminStocks from './AdminStock';
import AdminVouchers from './AdminVouchers';
import AdminPromos from './AdminPromos';
import AdminBanners from './AdminBanners';
import AdminArticles from './AdminArticles';
import AdminReviews from './AdminReviews';
import AdminReports from './AdminReports';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':  return <AdminDashboardContent />;
      case 'Produk':     return <AdminProducts />;
      case 'Kategori':   return <AdminCategories />;
      case 'Merek':      return <AdminBrands />;
      case 'Pesanan':    return <AdminOrders />;
      case 'Pelanggan':  return <AdminCustomers />;
      case 'Stok':       return <AdminStocks />;
      case 'Voucher':    return <AdminVouchers />;
      case 'Promo':      return <AdminPromos />;
      case 'Banner':     return <AdminBanners />;
      case 'Artikel':    return <AdminArticles />;
      case 'Review':     return <AdminReviews />;
      case 'Laporan':    return <AdminReports />;
      case 'Pengaturan': return <AdminSettings />;
      default:           return <AdminDashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans antialiased flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 min-w-0 md:ml-64 p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
