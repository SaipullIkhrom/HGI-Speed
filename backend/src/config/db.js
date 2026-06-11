import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Membuat pool koneksi menggunakan data dari file .env
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_motopart',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tes koneksi saat server pertama kali berjalan
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Berhasil terhubung ke database MySQL (db_motopart)!');
    connection.release();
  } catch (error) {
    console.error('❌ Gagal terhubung ke database MySQL:', error.message);
  }
})();

export default db;
