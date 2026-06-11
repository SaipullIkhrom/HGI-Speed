import express from 'express';
import { getCurrencies, updateExchangeRates } from '../controllers/currencyController.js';

const router = express.Router();

router.get('/currencies', getCurrencies);
router.post('/currencies/refresh', updateExchangeRates); // Akses ini untuk update kurs via Postman / Admin panel

export default router;
