import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 🛠️ 1. IMPOR KELOMPOK PRODUK
import {
  getProducts,
  getFlashSaleProducts,
  filterProductsByMotor,
  createProduct,
  updateProduct,
  deleteProduct,
  getBestSellers,
  getProductReviews
} from '../controllers/productController.js';

// 🛠️ 2. IMPOR KELOMPOK KATEGORI
import {
  getCategories,
  createCategory,
  deleteCategory
} from '../controllers/categoryController.js';

// 🛠️ 3. IMPOR KELOMPOK MEREK
import {
  getBrands,
  createBrand,
  deleteBrand
} from '../controllers/brandController.js';

const router = express.Router();

// =========================================================================
// CONFIGURASI MULTER MANDIRI KHUSUS PRODUK (Subfolder: uploads/products/) 🏎️💨
// =========================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 🛠️ FIX JALUR: Kita arahkan spesifik ke dalam subfolder products
    const dir = 'uploads/products/';

    // Jika folder belum ada, otomatis dirakit secara rekursif oleh Node.js
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Penamaan file menggunakan prefix product agar rapi
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadProductFile = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // Batasi maksimal 4MB per gambar part
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

// ==========================================
// ROUTE KELOMPOK PRODUK (PRODUCTS)
// ==========================================
router.get('/products', getProducts);
router.get('/products/flash-sale', getFlashSaleProducts);
router.get('/products/search-motor', filterProductsByMotor);

// 🛠️ SEKARANG MENGGUNAKAN UPLOAD KHUSUS SUBFOLDER PRODUCTS
router.post('/products', uploadProductFile.single('image'), createProduct);
router.put('/products/:id', uploadProductFile.single('image'), updateProduct);

router.delete('/products/:id', deleteProduct);
router.get('/products/best-sellers', getBestSellers);

// ==========================================
// ROUTE KELOMPOK KATEGORI (CATEGORIES)
// ==========================================
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

// ==========================================
// ROUTE KELOMPOK MEREK (BRANDS)
// ==========================================
router.get('/brands', getBrands);
router.post('/brands', createBrand);
router.delete('/brands/:id', deleteBrand);

export default router;
