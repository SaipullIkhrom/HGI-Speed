import express from 'express';
import { createTransaction, getTransactionHistory } from '../controllers/transactionController.js';

const router = express.Router();

router.post('/transactions', createTransaction);
router.get('/transactions/history', getTransactionHistory);

export default router;
