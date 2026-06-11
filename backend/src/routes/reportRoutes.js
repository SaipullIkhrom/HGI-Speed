import express from 'express';
import { getAdvancedReports } from '../controllers/reportController.js';
const router = express.Router();

router.get('/reports/advanced', getAdvancedReports);

export default router;
