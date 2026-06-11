import express from 'express';
import { getPromos, createPromo, deletePromo } from '../controllers/promoController.js';
const router = express.Router();

router.get('/promos', getPromos);
router.post('/promos', createPromo);
router.delete('/promos/:id', deletePromo);

export default router;
