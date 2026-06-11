import express from 'express';
import { register, login, updateProfile, uploadAvatar } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', uploadAvatar.single('avatar'), updateProfile);

export default router;
