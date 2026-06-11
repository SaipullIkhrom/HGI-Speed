import db from '../config/db.js';

// ==========================================
// Fungsi Bantuan: Menghitung Rasio Pertumbuhan (%)
// ==========================================
const calculateGrowth = (current, prev) => {
  if (prev === 0) return { rate: current > 0 ? '+100%' : '0%', isUp: current >= 0 };
  const percent = Math.round(((current - prev) / prev) * 100);
  return {
    rate: `${percent > 0 ? '+' : ''}${percent}%`,
    isUp: percent >= 0
  };
};

// ==========================================
// 1. Ambil Ringkasan Statistik Dinamis Dashboard
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    const period = req.query.period || 'bulan';

    let currFilter = '';
    let prevFilter = '';

    // Menentukan batas waktu Query SQL berdasarkan filter frontend
    if (period === 'minggu') {
      currFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      prevFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'tahun') {
      currFilter = 'YEAR(created_at) = YEAR(NOW())';
      prevFilter = 'YEAR(created_at) = YEAR(NOW()) - 1';
    } else {
      currFilter = 'MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())';
      prevFilter = 'MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))';
    }

    // A. REVENUE (Total Penjualan) & LOGIKA TARGET 2 JUTA
    const [[currRevRow]] = await db.query(`SELECT COALESCE(SUM(total_payment), 0) AS total FROM orders WHERE status = 'Selesai' AND ${currFilter}`);
    const totalRevenue = Number(currRevRow.total);

    // Hitung persentase menuju kelipatan 2 Juta berikutnya
    // Jika revenue 1.000.000 -> Target 2.000.000 (Jarum 50%)
    // Jika revenue 2.500.000 -> Target 4.000.000 (Jarum 62%)
    const targetMilestone = (Math.floor(totalRevenue / 2000000) + 1) * 2000000;
    const revenueProgress = Math.round((totalRevenue / targetMilestone) * 100);

    // B. PESANAN BARU MASUK (FIX: Menghitung SEMUA pesanan masuk tanpa filter status agar pasti terbaca)
    const [[currPendRow]] = await db.query(`SELECT COUNT(*) AS count FROM orders WHERE ${currFilter}`);
    const [[prevPendRow]] = await db.query(`SELECT COUNT(*) AS count FROM orders WHERE ${prevFilter}`);

    const pendingOrders = currPendRow.count;
    const pendGrowth = calculateGrowth(pendingOrders, prevPendRow.count);

    // C. PELANGGAN BARU (FIX: Membaca user yang bukan admin atau role-nya kosong agar pasti terbaca)
    // Ganti bagian C di controller menjadi:
    const [[currCustRow]] = await db.query("SELECT COUNT(*) AS count FROM users WHERE (role = 'customer' OR role IS NULL)");

    const [[prevCustRow]] = await db.query(`SELECT COUNT(*) AS count FROM users WHERE (role = 'customer' OR role IS NULL) AND ${prevFilter}`);

    const newCustomers = currCustRow.count;
    const custGrowth = calculateGrowth(newCustomers, prevCustRow.count);

    // D. RASIO STOK PRODUK AMAN (Speedometer 3)
    const [[totalProdRow]] = await db.query("SELECT COUNT(*) AS count FROM products");
    const [[safeProdRow]] = await db.query("SELECT COUNT(*) AS count FROM products WHERE stock >= 5");

    const totalProducts = totalProdRow.count || 0;
    const safeProducts = safeProdRow.count || 0;
    const productSafeRate = totalProducts > 0 ? Math.round((safeProducts / totalProducts) * 100) : 0;

    // E. PRODUK STOK KRITIS (Tabel Bawah)
    const [lowStockProducts] = await db.query(
      "SELECT id, name, sku, stock, IF(stock <= 2, 'Kritis', 'Stok Tipis') AS status FROM products WHERE stock < 5 ORDER BY stock ASC LIMIT 5"
    );

    // F. GRAFIK BATANG DINAMIS (6 Bulan Terakhir)
    const [monthlyRows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%b') as month_name,
        MONTH(created_at) as month_num,
        COALESCE(SUM(total_payment), 0) as total
      FROM orders
      WHERE status = 'Selesai' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), month_name
      ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
    `);

    const chartData = monthlyRows.map(row => ({
      month: row.month_name,
      total: Number(row.total)
    }));

    // G. GRAFIK DONUT CINCIN (Menghitung rasio Selesai vs Proses berdasarkan filter waktu)
    const [statusRows] = await db.query(`
      SELECT
        SUM(CASE WHEN status = 'Selesai' THEN 1 ELSE 0 END) as selesai,
        SUM(CASE WHEN status IN ('Baru', 'Proses', 'Pengiriman', 'Pending') THEN 1 ELSE 0 END) as proses
      FROM orders
      WHERE ${currFilter}
    `);

    const countSelesai = statusRows[0].selesai || 0;
    const countProses = statusRows[0].proses || 0;
    const totalOrdersDonut = Number(countSelesai) + Number(countProses);
    const percentageSelesai = totalOrdersDonut > 0 ? Math.round((countSelesai / totalOrdersDonut) * 100) : 100;

    // --- KIRIM SEMUA DATA KE FRONTEND REACT ---
    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        revenueRate: `${revenueProgress}%`, // Ini yang membuat jarum bergerak per 2 juta!
        revenueIsUp: true, // Dibuat selalu true (hijau) karena sifatnya mengejar target

        pendingOrders,
        pendingRate: pendGrowth.rate,
        pendingIsUp: pendGrowth.isUp,

        totalProducts: safeProducts,
        productRate: `${productSafeRate}%`,
        productIsUp: productSafeRate >= 50, // Merah jika produk aman di bawah 50%

        totalCustomers: newCustomers,
        customerRate: custGrowth.rate,
        customerIsUp: custGrowth.isUp
      },
      lowStockProducts,
      chartData,
      statusCircle: {
        countSelesai,
        countProses,
        percentageSelesai
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: 'Gagal memuat statistik dashboard: ' + error.message });
  }
};

// ==========================================
// 2. Ambil 5 Transaksi Terbaru (Widget)
// ==========================================
export const getRecentOrders = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, customer_name, total_payment, status FROM orders ORDER BY id DESC LIMIT 5');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat transaksi terbaru: ' + error.message });
  }
};
