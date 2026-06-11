import db from '../config/db.js';

// 1. Ambil Kategori Suku Cadang
export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Tambah Kategori Baru
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi!' });

    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ success: true, message: 'Kategori baru berhasil ditambahkan!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Hapus Kategori
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan!' });
    }

    res.status(200).json({ success: true, message: 'Kategori berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus! Pastikan tidak ada produk yang menggunakan kategori ini.' });
  }
};
