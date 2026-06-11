import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getAllCustomers, deleteCustomer, checkMemberEligibility, joinMember, updateCustomerProfile
} from '../controllers/customerController.js';

const router = express.Router();

// --- KONFIGURASI ENGINE PENYIMPANAN AVATAR ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/'); // File foto profil akan masuk ke folder ini
  },
  filename: (req, file, cb) => {
    // Format nama file: avatar-timestamp.ekstensi
    cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Rute manajemen pelanggan
router.get('/customers', getAllCustomers);
router.delete('/customers/:id', deleteCustomer);
router.get('/customers/eligibility', checkMemberEligibility);
router.post('/customers/join', joinMember);

// 🛠️ INTEGRASIKAN MULTIPART/FORM-DATA DI SINI (Key pencarian file: 'avatar')
router.put('/customers/profile/update', upload.single('avatar'), updateCustomerProfile);

export default router;
