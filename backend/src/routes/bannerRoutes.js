import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getBanners, createBanner, deleteBanner } from '../controllers/bannerController.js';

const router = express.Router();

// 🛠️ CONFIGURASI MULTER MANDIRI KHUSUS BANNER (Subfolder: uploads/banners/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 🛠️ FIX JALUR: Kita arahkan spesifik ke dalam subfolder banners
    const dir = 'uploads/banners/';

    // Jika folder induk atau subfolder belum ada, otomatis dirakit rekursif
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `banner-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadBannerFile = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batasi maksimal 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya diperbolehkan mengunggah file gambar (.jpg, .jpeg, .png, .webp)!'));
    }
  }
});

// Jalur Rute API Banner
router.get('/banners', getBanners);
router.post('/banners', uploadBannerFile.single('image'), createBanner);
router.delete('/banners/:id', deleteBanner);

export default router;
