import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import dashboardRoutes from './src/routes/dashboardRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import stockRoutes from './src/routes/stockRoutes.js';
import voucherRoutes from './src/routes/voucherRoutes.js';
import promoRoutes from './src/routes/promoRoutes.js';
import bannerRoutes from './src/routes/bannerRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import articleRoutes from './src/routes/articleRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import currencyRoutes from './src/routes/currencyRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; 
// ==========================================
// MIDDLEWARE GLOBAL
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SINKRONISASI ASSET GAMBAR (Biar semua subfolder uploads bisa diakses front-end)
app.use('/uploads', express.static('uploads'));
app.use('/uploads/products', express.static('uploads/products')); // 🛠️ Tambahan folder produk
app.use('/uploads/banners', express.static('uploads/banners'));   // 🛠️ Tambahan folder banner
app.use('/uploads/articles', express.static('uploads/articles')); // 🛠️ Tambahan folder artikel
app.use('/uploads/reviews', express.static('uploads/reviews'));

// ==========================================
// REGISTRASI JALUR RUTING UTAMA (REST API)
// ==========================================
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', transactionRoutes);
app.use('/api', currencyRoutes);
app.use('/api', productRoutes);
app.use('/api', customerRoutes);
app.use('/api', stockRoutes);
app.use('/api', voucherRoutes);
app.use('/api', promoRoutes);
app.use('/api', bannerRoutes);
app.use('/api', reportRoutes);
app.use('/api', articleRoutes);

// ==========================================
// INITIAL TESTING ENDPOINT
// ==========================================
app.get('/', (req, res) => {
    res.send({ success: true, message: "Server Toko Sparepart HGI SPEED Berjalan Lancar!" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
