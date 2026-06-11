import db from '../config/db.js';

// =========================================================================
// 1. AMBIL SEMUA DATA ULASAN + JOIN DATA PEMBELI & PRODUK (UNTUK ADMIN & USER 🛠️)
// =========================================================================
export const getReviews = async (req, res) => {
  const { user_id } = req.query; // Menangkap filter parameter user_id dari frontend jika ada
  try {
    let query = `
      SELECT
        r.id, r.order_id, r.product_id, r.rating, r.comment, r.media_url, r.created_at,
        o.order_number, o.customer_name, o.user_id,
        p.name AS product_name, p.image AS product_image
      FROM reviews r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ` AND o.user_id = ?`;
      params.push(Number(user_id));
    }

    query += ` ORDER BY r.id DESC`;

    const [rows] = await db.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data ulasan dari database: ' + error.message
    });
  }
};

// =========================================================================
// 2. SIMPAN ULASAN BARU DARI PELANGGAN + AUTO UPDATE RATING PRODUK (AKURAT ⚡)
// =========================================================================
export const createReview = async (req, res) => {
  // 🛠️ Tangkap product_id secara eksplisit dari body request FormData frontend
  const { order_id, product_id, rating, comment } = req.body;
  const mediaFile = req.file ? req.file.filename : null;

  if (!order_id || !product_id || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Data ulasan tidak lengkap!' });
  }

  try {
    // 1. Masukkan data ulasan baru lengkap dengan product_id agar tidak mengunci massal
    const insertQuery = `
      INSERT INTO reviews (order_id, product_id, rating, comment, media_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(insertQuery, [order_id, product_id, rating, comment, mediaFile]);

    // 2. Hitung rata-rata rating (AVG) terisolasi murni hanya untuk product_id ini
    const [avgResult] = await db.query(`
      SELECT AVG(rating) as averageRating
      FROM reviews
      WHERE product_id = ?
    `, [product_id]);

    const newAverage = avgResult[0].averageRating ? parseFloat(avgResult[0].averageRating).toFixed(1) : 0;

    // 3. Update kolom rating di tabel products secara real-time!
    await db.query(
      'UPDATE products SET rating = ? WHERE id = ?',
      [newAverage, product_id]
    );

    res.status(201).json({
      success: true,
      message: 'Ulasan suku cadang berhasil disimpan and rating produk diperbarui!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan ulasan ke database: ' + error.message
    });
  }
};

// =========================================================================
// 3. HAPUS ULASAN (MODERASI ADMIN 🛠️)
// =========================================================================
export const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    // Ambil data product_id terlebih dahulu sebelum dihapus untuk trigger kalkulasi ulang
    const [reviewData] = await db.query('SELECT product_id FROM reviews WHERE id = ?', [id]);

    if (reviewData.length === 0) {
      return res.status(404).json({ success: false, message: 'Data ulasan tidak ditemukan!' });
    }

    const productId = reviewData[0].product_id;

    // Eksekusi hapus ulasan dari database
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);

    // Recalculate rating produk setelah ada ulasan yang dihapus admin
    const [avgResult] = await db.query(`
      SELECT AVG(rating) as averageRating FROM reviews WHERE product_id = ?
    `, [productId]);

    const newAverage = avgResult[0].averageRating ? parseFloat(avgResult[0].averageRating).toFixed(1) : 0;
    await db.query('UPDATE products SET rating = ? WHERE id = ?', [newAverage, productId]);

    res.status(200).json({ success: true, message: 'Ulasan berhasil dihapus dari publik!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus ulasan: ' + error.message });
  }
};

// =========================================================================
// 4. AMBIL ULASAN PELANGGAN PER PRODUK (UNTUK DETAIL KATALOG USER ✨)
// =========================================================================
export const getProductReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        r.id, r.order_id, r.rating, r.comment, r.media_url, r.created_at,
        o.customer_name,
        u.avatar AS customer_avatar
      FROM reviews r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.id DESC
    `;

    const [rows] = await db.query(query, [id]);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat ulasan produk: ' + error.message });
  }
};

// =========================================================================
// 5. API PENGECEKAN STATUS ANTI-SPAM RATING (MENDUKUNG FILTER PER PRODUK 🔒)
// =========================================================================
export const checkReviewStatus = async (req, res) => {
  const { id } = req.params; // order_id dari params rute url
  const { product_id } = req.query; // product_id didapat via query string (?product_id=...)

  try {
    let query = 'SELECT COUNT(*) as total FROM reviews WHERE order_id = ?';
    const params = [id];

    // Jika frontend mengirimkan filter product_id, validasi status ulasan secara spesifik
    if (product_id) {
      query += ' AND product_id = ?';
      params.push(Number(product_id));
    }

    const [rows] = await db.query(query, params);
    const hasReviewed = rows[0].total > 0;

    res.status(200).json({
      success: true,
      reviewed: hasReviewed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memeriksa status manifes ulasan: ' + error.message
    });
  }
};
