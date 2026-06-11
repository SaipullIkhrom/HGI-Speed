import express from 'express';
import {
  getReviews,
  createReview,
  deleteReview,
  checkReviewStatus // 🛠️ FIX 1: Impor fungsi pengecekan anti-spam yang baru kita buat
} from '../controllers/reviewController.js';
import { getProductReviews } from '../controllers/productController.js';

import multer from 'multer';
import path from 'path';

const router = express.Router();

// Konfigurasi penyimpanan file foto/video ulasan ke folder uploads/reviews
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reviews/');
  },
  filename: (req, file, cb) => {
    cb(null, 'review-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ==========================================
// REGISTRASI RUTE MANAJEMEN ULASAN MOTOPART
// ==========================================

// 1. Ambil semua data ulasan lengkap dengan data pembeli & produk (GET) 🛠️
router.get('/', getReviews);

// 2. Simpan ulasan baru beserta lampiran media dari pembeli (POST)
router.post('/', upload.single('media'), createReview);

// 3. Hapus ulasan dari publik untuk moderasi admin (DELETE) 🛠️
router.delete('/:id', deleteReview);

// 4. Ambil ulasan spesifik per produk untuk halaman depan detail produk (GET) ⚡
router.get('/product/:id', getProductReviews);

// 5. Cek status ulasan per order_id untuk mengunci tombol di frontend (GET) 🔒
router.get('/check/:id', checkReviewStatus); // 🛠️ FIX 2: Daftarkan jalurnya di sini!

export default router;
