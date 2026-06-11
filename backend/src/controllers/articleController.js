import db from '../config/db.js';
import fs from 'fs';

export const getArticles = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createArticle = async (req, res) => {
  const { title, content, author } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Judul dan isi artikel wajib diisi!' });
  }

  // Membuat URL slug sederhana dari judul
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    await db.query(
      'INSERT INTO articles (title, slug, content, image, author) VALUES (?, ?, ?, ?, ?)',
      [title, slug, content, image, author || 'Admin MotoPart']
    );
    res.json({ success: true, message: 'Artikel baru berhasil diterbitkan!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const [article] = await db.query('SELECT image FROM articles WHERE id = ?', [req.params.id]);
    if (article.length > 0 && article[0].image) {
      if (fs.existsSync(`uploads/${article[0].image}`)) {
        fs.unlinkSync(`uploads/${article[0].image}`);
      }
    }
    await db.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Artikel berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
