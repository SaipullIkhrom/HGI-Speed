import db from '../config/db.js';

// 1. AMBIL SEMUA PRODUK UNTUK MANAJEMEN STOK
export const getStockStatus = async (req, res) => {
  try {
    // Mengambil id, nama, kode, stok, dan relasi merk/kategori
    const queryStr = `
      SELECT p.id, p.name, p.stock, p.price, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.stock ASC
    `;
    const [products] = await db.query(queryStr);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memuat manajemen stok: ' + error.message });
  }
};

// 2. UPDATE ATAU TAMBAH STOK SECARA CEPAT (QUICK RESTOCK)
export const updateQuickStock = async (req, res) => {
  const { id } = req.params;
  const { additionalStock } = req.body; // Jumlah stok baru yang ingin ditambahkan

  if (!additionalStock || isNaN(additionalStock) || additionalStock <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah penambahan stok harus berupa angka positif!' });
  }

  try {
    // Ambil stok lama terlebih dahulu
    const [product] = await db.query('SELECT stock, name FROM products WHERE id = ?', [id]);
    if (product.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const newStock = parseInt(product[0].stock) + parseInt(additionalStock);

    // Update stok baru ke database
    await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);

    res.status(200).json({
      success: true,
      message: `Stok produk "${product[0].name}" berhasil ditambah! Stok sekarang: ${newStock} pcs.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal melakukan restock: ' + error.message });
  }
};
