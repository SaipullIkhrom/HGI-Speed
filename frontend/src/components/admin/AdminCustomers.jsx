import { useState, useEffect } from 'react';
import { FaUsers, FaTrash, FaUserCircle, FaSearch } from
  'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. FIX: Logika ambil data utama menggunakan cleanup function (Anti Red Line)
  useEffect(() => {
    let isMounted = true;

    const loadCustomersData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/customers`);
        const data = await res.json();
        if (data.success && isMounted) {
          setCustomers(data.data);
        }
      } catch (err) {
        console.error(err);
        alert('Gagal mengambil data pelanggan dari server.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCustomersData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. FUNGSI REFRESH: Untuk memuat ulang tabel setelah aksi hapus secara aman
  const refreshCustomers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/customers`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error('Gagal memperbarui tabel pelanggan:', err);
    }
  };

  // 3. Fungsi Hapus Akun Pelanggan
  const handleDelete = async (id, name) => {
    if (confirm(`Apakah kamu yakin ingin menghapus permanen akun "${name}" dari database MotoPart?`)) {
      try {
        const res = await fetch(`${BASE_URL}/api/customers/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();

        alert(data.message);
        if (data.success) {
          refreshCustomers(); // Panggil fungsi refresh asinkron yang aman di sini
        }
      } catch (err) {
        console.error(err);
        alert('Gagal mengeksekusi penghapusan.');
      }
    }
  };

  // Filter Pencarian berdasarkan Nama atau Email
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-300">

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <FaUsers className="text-[#e11d48]" /> MANAJEMEN PELANGGAN
          </h1>
          <p className="text-xs text-slate-400 mt-1">Pantau total user terdaftar dan riwayat keaktifan garasi mereka</p>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-full sm:w-64">
          <FaSearch className="absolute left-3.5 text-slate-500 text-xs" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-[#e11d48] text-white transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 tracking-wider">MEMUAT DATA PELANGGAN MOTOPART...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Tidak ada data pelanggan yang cocok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4 w-16 text-center">User</th>
                  <th className="p-4">Informasi Profil</th>
                  <th className="p-4">Hak Akses (Role)</th>
                  <th className="p-4 text-center">Total Order</th>
                  <th className="p-4">Tanggal Gabung</th>
                  <th className="p-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors">

                    {/* Kolom Foto Profil */}
                    <td className="p-4 text-center">
                      {customer.avatar ? (
                        <img
                          src={`${BASE_URL}/uploads/profiles/${customer.avatar}`}
                          alt="User"
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 mx-auto"
                        />
                      ) : (
                        <FaUserCircle className="text-slate-700 text-2xl mx-auto" />
                      )}
                    </td>

                    {/* Kolom Nama & Email */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{customer.name}</div>
                      <div className="text-slate-500 text-[11px] font-mono mt-0.5">{customer.email}</div>
                    </td>

                    {/* Kolom Role */}
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                        customer.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {customer.role}
                      </span>
                    </td>

                    {/* Kolom Jumlah Transaksi */}
                    <td className="p-4 text-center font-bold font-mono text-slate-400">
                      {customer.total_orders}x
                    </td>

                    {/* Kolom Tanggal Terdaftar */}
                    <td className="p-4 text-slate-400 font-medium">
                      {new Date(customer.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>

                    {/* Kolom Tombol Hapus */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(customer.id, customer.name)}
                        disabled={customer.role === 'admin'}
                        className="p-2 bg-slate-800 hover:bg-rose-950/40 text-slate-500 hover:text-[#e11d48] border border-slate-700 hover:border-rose-900/60 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title={customer.role === 'admin' ? 'Akun Admin terlindungi' : 'Hapus Pelanggan'}
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
