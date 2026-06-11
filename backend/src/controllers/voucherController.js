import db from '../config/db.js';

export const getVouchers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vouchers ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVoucher = async (req, res) => {
  const { code, discount_type, discount_value, min_purchase, expiry_date, usage_limit } = req.body;
  try {
    await db.query(
      'INSERT INTO vouchers (code, discount_type, discount_value, min_purchase, expiry_date, usage_limit) VALUES (?, ?, ?, ?, ?, ?)',
      [code.toUpperCase(), discount_type, discount_value, min_purchase, expiry_date, usage_limit]
    );
    res.json({ success: true, message: 'Voucher berhasil dibuat!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    await db.query('DELETE FROM vouchers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Voucher dihapus!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
