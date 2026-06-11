import express from 'express';
import { getStockStatus, updateQuickStock } from '../controllers/stockController.js';

const router = express.Router();

router.get('/stock', getStockStatus);
router.put('/stock/restock/:id', updateQuickStock);

export default router;
