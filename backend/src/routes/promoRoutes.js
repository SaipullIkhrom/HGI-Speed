import express from 'express';
import { getPromos, claimPromo, createPromo, deletePromo } from '../controllers/promoController.js';

const router = express.Router();

router.get('/promos', getPromos);
router.post('/promos/claim', claimPromo); // 🛠️ Tambahkan rute penanganan klaim ini

router.post('/promos/create', createPromo);
router.delete('/promos/:id', deletePromo);

export default router;
