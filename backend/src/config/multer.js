import multer from 'multer';
import path from 'path';

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pastikan folder 'uploads' sudah kamu buat manual di root backend
  },
  filename: (req, file, cb) => {
    // Menghasilkan nama unik: timestamp + ekstensi file asli
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Filter tipe file yang diizinkan
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya diperbolehkan mengupload gambar (.jpg, .jpeg, .png, .webp)!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter
});

export default upload;
