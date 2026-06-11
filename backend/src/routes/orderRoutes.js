import express from 'express';
// 1. Jalur khusus untuk fungsi operasional transaksi harian
import {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  getOrderDetails
} from '../controllers/orderController.js';

// 2. Jalur baru untuk fungsi analitik data dashboard admin
import {
  getDashboardStats,
  getRecentOrders
} from '../controllers/dashboardController.js';

const router = express.Router();

// ==========================================
// RUTE ANALITIK DASHBOARD (ADMIN)
// ==========================================
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent', getRecentOrders);

// ==========================================
// RUTE OPERASIONAL TRANSAKSI
// ==========================================
router.get('/', getAllOrders);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);

// 🛠️ FIX JALUR API: Ubah dari '/:id/items' menjadi '/:id' agar klop dengan fetch frontend!
router.get('/:id', getOrderDetails);

export default router;
