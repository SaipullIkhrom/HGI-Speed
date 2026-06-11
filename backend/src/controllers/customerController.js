import db from '../config/db.js';
import fs from 'fs';

// =========================================================================
// 1. AMBIL SEMBA DATA PELANGGAN (UNTUK TABEL ADMIN)
// =========================================================================
export const getAllCustomers = async (req, res) => {
  try {
    const queryStr = `
      SELECT
        u.id, u.name, u.email, u.role, u.avatar, u.created_at,
        COUNT(o.id) as total_orders
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'Selesai'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    const [customers] = await db.query(queryStr);
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pelanggan: ' + error.message });
  }
};

// =========================================================================
// 2. HAPUS AKUN PELANGGAN (KENDALI ADMIN)
// =========================================================================
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
    if (user.length > 0 && user[0].role === 'admin') {
      return res.status(400).json({ success: false, message: 'Demi keamanan, akun sesama Admin tidak boleh dihapus dari panel ini!' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Akun pelanggan berhasil didepak dari database!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus pelanggan: ' + error.message });
  }
};

// =========================================================================
// 3. CEK KELAYAKAN STATUS MEMBER (BARU 🛠️ - Untuk Progress Bar Pelanggan)
// =========================================================================
export const checkMemberEligibility = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID wajib disertakan!' });
    }

    // Menghitung jumlah transaksi berdasarkan relasi user_id dan status 'Selesai' yang valid
    const [rows] = await db.query(
      "SELECT COUNT(id) as total_orders FROM orders WHERE user_id = ? AND status = 'Selesai'",
      [userId]
    );

    const totalOrders = rows[0].total_orders || 0;
    const isEligible = totalOrders >= 50;

    res.status(200).json({
      success: true,
      totalOrders,
      requiredOrders: 50,
      isEligible
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memeriksa kelayakan member: ' + error.message });
  }
};

// =========================================================================
// 4. UPGRADE STATUS PELANGGAN MENJADI MEMBER (EKSEKUSI TOMBOL KLAIM FRONTEND)
// =========================================================================
export const joinMember = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID wajib dikirim!' });
  }

  try {
    const [user] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan!' });
    }

    if (user[0].role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin tidak bisa diubah menjadi role member!' });
    }

    // Validasi double-check jumlah order di sisi server demi keamanan data
    const [orderCheck] = await db.query(
      "SELECT COUNT(id) as total_orders FROM orders WHERE user_id = ? AND status = 'Selesai'",
      [userId]
    );

    if (orderCheck[0].total_orders < 50) {
      return res.status(400).json({
        success: false,
        message: `Transaksi baru mencapai ${orderCheck[0].total_orders}. Selesaikan 50 transaksi sukses dulu, Pul!`
      });
    }

    await db.query("UPDATE users SET role = 'member' WHERE id = ?", [userId]);

    res.status(200).json({
      success: true,
      message: 'Selamat! Akun Anda berhasil ditingkatkan menjadi Member VIP HGI SPEED 🏁'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal bergabung menjadi member: ' + error.message });
  }
};

// =========================================================================
// 5. UPDATE DATA PROFIL & GARASI + HANDLING AVATAR 🏁 (PERBAIKAN TOTAL)
// =========================================================================
export const updateCustomerProfile = async (req, res) => {
  try {
    // Jika menggunakan FormData, data teks akan mendarat di req.body
    const userId = req.body.id || req.user?.id;

    const {
      name, email, phone, address, gender, birthdate,
      motor_type, motor_year, motor_cc
    } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID wajib disertakan!' });
    }

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nama dan Email tidak boleh kosong!' });
    }

    // 1. Cek manifes user lama untuk urusan pembersihan avatar lama
    const [currentUser] = await db.query('SELECT avatar FROM users WHERE id = ?', [userId]);
    if (currentUser.length === 0) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan!' });
    }

    // 2. Tentukan nama avatar (Gunakan file baru dari Multer jika ada, atau pertahankan yang lama)
    let finalAvatar = currentUser[0].avatar;

    if (req.file) {
      finalAvatar = req.file.filename; // Nama acak file baru dari Multer

      // Hapus file gambar profil lama dari folder uploads/profiles jika ada
      const oldAvatarPath = `uploads/profiles/${currentUser[0].avatar}`;
      if (currentUser[0].avatar && fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // 3. EKSEKUSI QUERY SQL: Menyimpan data teks beserta nama file avatar baru
    const updateQuery = `
      UPDATE users
      SET
        name = ?,
        email = ?,
        phone = ?,
        address = ?,
        gender = ?,
        birthdate = ?,
        motor_type = ?,
        motor_year = ?,
        motor_cc = ?,
        avatar = ?
      WHERE id = ?
    `;

    await db.query(updateQuery, [
      name,
      email,
      phone || null,
      address || null,
      gender || null,
      birthdate || null,
      motor_type || null,
      motor_year ? Number(motor_year) : null,
      motor_cc || null,
      finalAvatar, // Kolom avatar aman diperbarui 🛠️
      userId
    ]);

    // 4. Ambil ulang data user terbaru yang sudah sinkron
    const [[updatedUser]] = await db.query(
      "SELECT id, name, email, phone, address, gender, DATE_FORMAT(birthdate, '%Y-%m-%d') as birthdate, motor_type, motor_year, motor_cc, role, avatar FROM users WHERE id = ?",
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Manifes profil, garasi, dan avatar HGI SPEED berhasil diperbarui!',
      user: updatedUser
    });

  } catch (error) {
    console.error("Error pada updateCustomerProfile:", error.message);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil: ' + error.message });
  }
};
