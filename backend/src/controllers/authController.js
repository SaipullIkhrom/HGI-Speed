import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = 'KUNCI_RAHASIA_MOTOR_MOTOPART_JWT';

// ==========================================
// 🛠️ KONFIGURASI STORAGE MULTER (FOTO PROFIL)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profiles/';
    // Jika folder tujuan belum ada, buat secara otomatis
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Format penamaan file: profile-iduser-timestamp.ekstensi
    cb(null, `profile-${req.body.id || 'user'}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Middleware untuk memvalidasi file upload khusus gambar
export const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Batasi ukuran maksimal file (2MB)
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya diperbolehkan mengunggah file gambar (.jpg, .jpeg, .png)!'));
    }
  }
});


// ==========================================
// 📝 1. DAFTAR AKUN (Register Customer)
// ==========================================
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Semua data wajib diisi!' });
  }

  try {
    // Cek apakah email sudah terdaftar
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
    }

    // Enkripsi password biar aman di DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "customer")',
      [name, email, hashedPassword]
    );

    res.status(201).json({ success: true, message: 'Akun MotoPart berhasil dibuat! Silakan Login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================================
// 🔑 2. MASUK AKUN (Login Semua Role)
// ==========================================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Email atau password salah!' });
    }

    const user = users[0];

    // Cek kecocokan password (mendukung teks mentah untuk admin default & bcrypt untuk user baru)
    let isMatch = false;
    if (password === user.password) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Email atau password salah!' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar // Menyertakan data avatar saat login sukses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================================
// ⚙️ 3. UPDATE PROFIL & FOTO (Avatar)
// ==========================================
export const updateProfile = async (req, res) => {
  const { id, name, email, password } = req.body;

  try {
    // Ambil data user lama dari database
    const [currentUser] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (currentUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Pertahankan password lama jika kolom input password kosong
    let finalPassword = currentUser[0].password;
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      finalPassword = await bcrypt.hash(password, salt);
    }

    // Ambil nama file foto lama jika tidak ada unggahan baru
    let avatarName = currentUser[0].avatar;
    if (req.file) {
      avatarName = req.file.filename; // Ganti dengan nama file baru hasil tangkapan Multer

      // OPSIONAL: Hapus file foto lama di folder agar server tidak kepenuhan cache/sampah file
      if (currentUser[0].avatar && fs.existsSync(`uploads/profiles/${currentUser[0].avatar}`)) {
        fs.unlinkSync(`uploads/profiles/${currentUser[0].avatar}`);
      }
    }

    // Eksekusi pembaruan data ke tabel MySQL
    await db.query(
      'UPDATE users SET name = ?, email = ?, password = ?, avatar = ? WHERE id = ?',
      [name, email, finalPassword, avatarName, id]
    );

    // Tarik data profil terbaru untuk dikirim balik sebagai respon LocalStorage
    const [updatedUser] = await db.query('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Profil MotoPart kamu berhasil diperbarui!',
      user: updatedUser[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui info profil: ' + error.message });
  }
};
