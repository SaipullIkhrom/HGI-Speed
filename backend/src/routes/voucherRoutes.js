import express from 'express';
import { getVouchers, createVoucher, deleteVoucher } from '../controllers/voucherController.js';
const router = express.Router();

router.get('/vouchers', getVouchers);
router.post('/vouchers', createVoucher);
router.delete('/vouchers/:id', deleteVoucher);

export default router;
