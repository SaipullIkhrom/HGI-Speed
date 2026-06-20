import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerHome from './store/CustomerHome';
import AdminDashboard from './components/admin/AdminDashboard';
import Login from './client/Login';
import Register from './client/Register';
import Cart from './components/cart/Cart';
import Wishlist from './components/cart/Wishlist';
import Checkout from './components/cart/Checkout';
import Profile from './store/Profile';
import ProfileSettings from './store/ProfileSettings';
import ReviewHistory from './components/cart/ReviewHistory';
import MemberDeals from './store/MemberDeals';


// 1. KOMPONEN PROTEKSI RUTE ADMIN (GUARD - STERIL DARI ENVELOPE TRY/CATCH JSX) //

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const localUserData = localStorage.getItem('user');

  let isAuthorized = false;

  if (token && localUserData) {
    try {
      const user = JSON.parse(localUserData);
      if (user.role === 'admin') {
        isAuthorized = true;
      }
    } catch {
      isAuthorized = false;
    }
  }

  if (!isAuthorized) {
    alert('Akses Ditolak: Halaman ini khusus untuk Admin HGI SPEED!');
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 2. KOMPONEN PROTEKSI RUTE MEMBER (GUARD - STERIL DARI ENVELOPE TRY/CATCH JSX) //

const ProtectedMemberRoute = ({ children }) => {
  const localUserData = localStorage.getItem('user');

  let isAuthorized = false;

  if (localUserData) {
    try {
      const user = JSON.parse(localUserData);
      if (user.role === 'member' || user.role === 'admin') {
        isAuthorized = true;
      }
    } catch {
      isAuthorized = false;
    }
  }

  if (!isAuthorized) {
    alert('Akses Terbatas: Halaman ini khusus untuk Member Resmi HGI SPEED.');
    return <Navigate to="/" replace />;
  }

  return children;
};

// 3. GERBANG UTAMA ROUTING UTUH HGI SPEED //

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Sisi Pembeli (Customer) */}
        <Route path="/" element={<CustomerHome />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Rute Profile, Pengaturan Akun, & Arsip Ulasan */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/settings" element={<ProfileSettings />} />

        {/* 🛠️ FIX UTAMA: Sekarang ReviewHistory bisa langsung diakses bebas oleh semua User/Role */}
        <Route path="/profile/reviews-history" element={<ReviewHistory />} />

        {/* Rute Autentikasi Sistem */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute Sisi Manajemen Garasi (Admin Dashboard) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* Rute Eksklusif VIP Member SPEED Club */}
        <Route
          path="/member-exclusive"
          element={
            <ProtectedMemberRoute>
              <MemberDeals />
            </ProtectedMemberRoute>
          }
        />

        {/* Shortcut Fallback Link Ngawur */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
