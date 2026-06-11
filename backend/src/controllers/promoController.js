import db from '../config/db.js';

export const getPromos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM promos ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

export const deletePromo = async (req, res) => {
  try {
    await db.query('DELETE FROM promos WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Promo berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
