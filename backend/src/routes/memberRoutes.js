import express from 'express';
import { checkMemberEligibility, upgradeToMember } from '../controllers/memberController.js';

const router = express.Router();

// Kita kirim ID user lewat query string (?userId=...) atau parameter bodi agar fleksibel tanpa middleware
router.get('/check', checkMemberEligibility);
router.post('/upgrade', upgradeToMember);

export default router;
