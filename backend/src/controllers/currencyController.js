import db from '../config/db.js';

// =========================================================================
// 1. AMBIL SEMUA DAFTAR MATA UANG YANG AKTIF
// =========================================================================
export const getCurrencies = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM currencies ORDER BY code ASC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data mata uang: ' + error.message });
  }
};

// =========================================================================
// 2. AUTO-REFRESH KURS MATA UANG (SINKRONISASI API REAL-TIME)
// =========================================================================
export const updateExchangeRates = async (req, res) => {
  try {
    // Kita gunakan API gratis dari exchangerate-api dengan base IDR
    const response = await fetch('https://open.er-api.com/v6/latest/IDR');
    const data = await response.json();

    if (data.result === 'success') {
      const rates = data.rates; // Berisi data kurs: { USD: 0.000062, SGD: 0.000084, ... }

      // Ambil semua mata uang yang terdaftar di database kita saat ini
      const [currencies] = await db.query('SELECT code FROM currencies WHERE code != "IDR"');

      // Update satu per satu rate mata uang asing di database secara otomatis
      for (const curr of currencies) {
        if (rates[curr.code]) {
          await db.query(
            'UPDATE currencies SET exchange_rate = ? WHERE code = ?',
            [rates[curr.code], curr.code]
          );
        }
      }

      res.status(200).json({ success: true, message: 'Kurs mata uang berhasil diperbarui ke global terbaru!' });
    } else {
      throw new Error('Respon API Kurs gagal.');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal sinkronisasi kurs otomatis: ' + error.message });
  }
};
