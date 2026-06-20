import db from '../config/db.js';

// =========================================================================
// 1. AMBIL DAFTAR PROMO (DENGAN UTALITAS CEK STATUS KLAIM USER AKTIF) 🛠️
// =========================================================================
export const getPromos = async (req, res) => {
  // Tangkap userId dari query string (misal: /api/promos?userId=4) jika sudah login
  const { userId } = req.query;

  try {
    let queryStr = 'SELECT *, 0 as is_claimed FROM promos ORDER BY created_at DESC';
    let params = [];

    // Jika ada userId yang dikirim dari front-end, kita cek relasi klaimnya di database
    if (userId) {
      queryStr = `
        SELECT p.*,
               IF(up.id IS NOT NULL, 1, 0) as is_claimed
        FROM promos p
        LEFT JOIN user_promos up ON p.id = up.promo_id AND up.user_id = ?
        ORDER BY p.created_at DESC
      `;
      params = [userId];
    }

    const [rows] = await db.query(queryStr, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 2. PROSES EKSEKUSI KLAIM PROMO (BARU 🏁)
// =========================================================================
export const claimPromo = async (req, res) => {
  const { userId, promoId } = req.body;

  if (!userId || !promoId) {
    return res.status(400).json({ success: false, message: 'User ID dan Promo ID wajib disertakan!' });
  }

  try {
    // 1. Validasi ganda: Pastikan user belum pernah mengklaim promo ini sebelumnya
    const [existing] = await db.query(
      'SELECT id FROM user_promos WHERE user_id = ? AND promo_id = ?',
      [userId, promoId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Promo ini sudah kamu klaim sebelumnya, Pul!' });
    }

    // 2. Simpan manifes klaim ke tabel junction user_promos
    await db.query(
      'INSERT INTO user_promos (user_id, promo_id) VALUES (?, ?)',
      [userId, promoId]
    );

    res.json({ success: true, message: 'Selamat! Promo diskon berhasil diklaim ke akunmu! 🏎️💨' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengklaim promo: ' + error.message });
  }
};

// =========================================================================
// 3. TAMBAH PROMO BARU (KENDALI ADMIN)
// =========================================================================
export const createPromo = async (req, res) => {
  const { name, discount_percentage, start_date, end_date } = req.body;
  try {
    await db.query(
      'INSERT INTO promos (name, discount_percentage, start_date, end_date) VALUES (?, ?, ?, ?)',
      [name, discount_percentage, start_date, end_date]
    );
    res.json({ success: true, message: 'Promo harian berhasil diaktifkan!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 4. HAPUS PROMO (KENDALI ADMIN)
// =========================================================================
export const deletePromo = async (req, res) => {
  try {
    await db.query('DELETE FROM promos WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Promo berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
