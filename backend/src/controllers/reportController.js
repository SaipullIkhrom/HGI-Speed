import db from '../config/db.js';

export const getAdvancedReports = async (req, res) => {
  const { type } = req.query;

  try {
    // 1. Ambil Ringkasan Angka Utama
    const [revenueRow] = await db.query("SELECT COALESCE(SUM(total_payment), 0) as total FROM orders WHERE status = 'Selesai'");
    const [ordersCount] = await db.query("SELECT COUNT(id) as count FROM orders");
    const [criticalStock] = await db.query("SELECT COUNT(id) as count FROM products WHERE stock <= 5");

    const summary = {
      gross_revenue: revenueRow[0].total,
      total_orders: ordersCount[0].count,
      critical_items: criticalStock[0].count
    };

    // 2. 🛠️ AMBIL DATA OPERATOR / ADMIN YANG SEDANG LOGIN
    // Jika sistem login kamu menaruh id user di req.user.id
    let operatorName = "Sistem Otomatis";
    let operatorRole = "Admin Utama";

    if (req.user && req.user.id) {
      const [userRow] = await db.query("SELECT name, role FROM users WHERE id = ?", [req.user.id]);
      if (userRow.length > 0) {
        operatorName = userRow[0].name;
        operatorRole = userRow[0].role;
      }
    } else {
      // Sementara jika belum pasang middleware token, kita ambil data admin pertama di DB
      const [defaultAdmin] = await db.query("SELECT name, role FROM users WHERE role = 'admin' LIMIT 1");
      if (defaultAdmin.length > 0) {
        operatorName = defaultAdmin[0].name;
        operatorRole = defaultAdmin[0].role;
      }
    }

    // 3. Ambil data list berdasarkan type (Kodingan kueri yang kemarin tetap sama)
    let reportData = [];
    if (type === 'transactions') {
      const [rows] = await db.query("SELECT id, created_at, total_payment, status FROM orders WHERE status = 'Selesai' ORDER BY created_at DESC");
      reportData = rows;
    } else if (type === 'orders') {
      const [rows] = await db.query("SELECT id, customer_name, shipping_courier, status, created_at FROM orders ORDER BY created_at DESC");
      reportData = rows;
    } else if (type === 'products') {
  // 🛠️ SINKRONISASI TOTAL: Menggabungkan tabel produk (products) dengan tabel kategori (categories)
  const [rows] = await db.query(`
    SELECT
      p.id,
      COALESCE(p.name, 'Tanpa Nama') as name,
      COALESCE(p.sku, 'BELUM ADA SKU') as sku,
      COALESCE(p.stock, 0) as stock,
      COALESCE(c.name, 'Belum Diatur') as category, -- <-- Mengambil nama asli kategori dari tabel categories
      CASE
        WHEN p.stock = 0 THEN 'Habis'
        WHEN p.stock <= 5 THEN 'Kritis'
        ELSE 'Aman'
      END as status_stok
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `);
  reportData = rows;
}
    // 4. KIRIM DATA OPERATOR KE FRONTEND
    return res.status(200).json({
      success: true,
      summary,
      operator: {
        name: operatorName,
        role: operatorRole
      },
      data: reportData
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
