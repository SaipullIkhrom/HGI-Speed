import db from '../config/db.js';
import fs from 'fs';

// =========================================================================
// 1. AMBIL DATA PRODUK DENGAN FILTER DINAMIS (INTEGRASI NAVBAR HGI SPEED ⚡)
// =========================================================================
export const getProducts = async (req, res) => {
  const { promo, category, search, official } = req.query;

  try {
    let queryStr = `
      SELECT p.*, b.name AS brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (promo === 'true') {
      queryStr += ' AND p.discount_percentage > 0';
    }

    if (category) {
      queryStr += ' AND p.motor_type LIKE ?';
      queryParams.push(`%${category}%`);
    }

    if (search) {
      queryStr += ' AND (p.name LIKE ? || p.sku LIKE ? || p.motor_type LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (official === 'true') {
      queryStr += " AND (b.name = 'HGI' || p.brand_id IS NOT NULL)";
    }

    queryStr += ' ORDER BY p.id DESC';

    const [rows] = await db.query(queryStr, queryParams);

    res.status(200).json({
      success: true,
      message: 'Manifes katalog produk berhasil disinkronkan!',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal memfilter data produk backend: ' + error.message
    });
  }
};

// =========================================================================
// 2. AMBIL PRODUK KHUSUS FLASH SALE (UNTUK TAMPILAN HALAMAN DEPAN USER)
// =========================================================================
export const getFlashSaleProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE discount_percentage > 0 ORDER BY discount_percentage DESC'
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 3. FILTER PRODUK BERDASARKAN SPESIFIKASI MOTOR
// =========================================================================
export const filterProductsByMotor = async (req, res) => {
  try {
    const { brand_id, type, year } = req.query;
    let sql = `
      SELECT p.*, b.name AS brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (brand_id) { sql += ' AND p.brand_id = ?'; queryParams.push(brand_id); }
    if (type) { sql += ' AND p.motor_type LIKE ?'; queryParams.push(`%${type}%`); }
    if (year) { sql += ' AND p.motor_year = ?'; queryParams.push(year); }

    sql += ' ORDER BY p.id DESC';
    const [rows] = await db.query(sql, queryParams);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 4. TAMBAH PRODUK BARU
// =========================================================================
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, discount_percentage, brand_id, motor_type, motor_year, category_id, rating } = req.body;

    if (!name || !price || !stock) {
      return res.status(400).json({ success: false, message: 'Nama, harga, dan stok wajib diisi!' });
    }

    const autoSku = `MP-${Math.floor(Date.now() / 1000)}`;
    const image = req.file ? req.file.filename : null;
    const productRating = rating ? parseFloat(rating) : 0.0;

    const query = `
      INSERT INTO products (name, price, stock, discount_percentage, brand_id, motor_type, motor_year, sku, image, category_id, rating, sold)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;

    const [result] = await db.query(query, [
      name, Number(price), Number(stock), Number(discount_percentage) || 0,
      brand_id ? Number(brand_id) : null, motor_type || null, motor_year || null, autoSku, image, category_id || null, productRating
    ]);

    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan!', productId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 5. UPDATE DATA PRODUK
// =========================================================================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, discount_percentage, brand_id, motor_type, motor_year, category_id, rating } = req.body;

    const [currentProduct] = await db.query('SELECT image, rating FROM products WHERE id = ?', [id]);
    if (currentProduct.length === 0) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan!' });

    let image = currentProduct[0].image;
    if (req.file) {
      image = req.file.filename;
      if (currentProduct[0].image && fs.existsSync(`uploads/${currentProduct[0].image}`)) {
        fs.unlinkSync(`uploads/${currentProduct[0].image}`);
      }
    }

    const updatedRating = rating !== undefined ? parseFloat(rating) : currentProduct[0].rating;

    const query = `
      UPDATE products
      SET name = ?, price = ?, stock = ?, discount_percentage = ?, brand_id = ?, motor_type = ?, motor_year = ?, image = ?, category_id = ?, rating = ?
      WHERE id = ?
    `;

    await db.query(query, [
      name, Number(price), Number(stock), Number(discount_percentage) || 0,
      brand_id ? Number(brand_id) : null, motor_type || null, motor_year || null, image, category_id || null, updatedRating, id
    ]);

    res.status(200).json({ success: true, message: 'Data produk berhasil diperbarui!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 6. HAPUS PRODUK
// =========================================================================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [product] = await db.query('SELECT image FROM products WHERE id = ?', [id]);
    if (product.length > 0 && product[0].image && fs.existsSync(`uploads/${product[0].image}`)) {
      fs.unlinkSync(`uploads/${product[0].image}`);
    }
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Produk berhasil deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 7. AMBIL PRODUK TERLARIS (SINKRONISASI RELASI BRAND COCOK DENGAN FRONTEND 🛠️)
// =========================================================================
export const getBestSellers = async (req, res) => {
  try {
    const queryStr = `
      SELECT p.*, b.name AS brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.sold > 20
      ORDER BY p.sold DESC
      LIMIT 5
    `;
    const [rows] = await db.query(queryStr);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 8. AMBIL ULASAN PELANGGAN PER PRODUK (UNTUK DETAIL KATALOG USER ✨)
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
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.product_id = ?
      GROUP BY r.id
      ORDER BY r.id DESC
    `;

    const [rows] = await db.query(query, [id]);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat ulasan produk: ' + error.message });
  }
};
