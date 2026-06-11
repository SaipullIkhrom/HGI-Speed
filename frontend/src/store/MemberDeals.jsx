// src/pages/MemberDeals.jsx
import Navbar from '../components/layout/Navbar';
import { Container } from '../components/layout/Container';

const MemberDeals = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-12">
        <Container>
          <div className="bg-gradient-to-r from-slate-900 to-red-900 rounded-3xl p-8 text-white mb-10 shadow-xl">
            <h1 className="text-3xl font-black uppercase tracking-tighter">VIP Member SPEED Club 🏁</h1>
            <p className="text-red-200 mt-2">Selamat datang, Member! Nikmati harga khusus yang tidak terlihat oleh tamu biasa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-yellow-200 shadow-sm">
              <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Kupon Aktif</span>
              <h3 className="text-lg font-bold mt-2">Gratis Ongkir Se-Indonesia</h3>
              <p className="text-gray-400 text-xs mt-1">Gunakan kode: <span className="font-mono font-bold text-gray-800">HGISPEEDFREE</span></p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Cashback</span>
              <h3 className="text-lg font-bold mt-2">Poin Belanja 2x Lipat</h3>
              <p className="text-gray-400 text-xs mt-1">Otomatis aktif untuk setiap pembelian suku cadang mesin.</p>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default MemberDeals;
