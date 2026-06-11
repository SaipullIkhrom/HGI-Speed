import db from '../config/db.js';
import fs from 'fs';

export const getBanners = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req, res) => {
  const { title, link_url } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!image) {
    return res.status(400).json({ success: false, message: 'File gambar banner wajib diunggah!' });
  }

  try {
    await db.query(
      'INSERT INTO banners (title, image, link_url) VALUES (?, ?, ?)',
      [title, image, link_url || '#']
    );
    res.json({ success: true, message: 'Banner promosi baru berhasil dipasang!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const [banner] = await db.query('SELECT image FROM banners WHERE id = ?', [req.params.id]);
    if (banner.length > 0 && banner[0].image) {
      if (fs.existsSync(`uploads/${banner[0].image}`)) {
        fs.unlinkSync(`uploads/${banner[0].image}`);
      }
    }
    await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Banner berhasil dilepas!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
