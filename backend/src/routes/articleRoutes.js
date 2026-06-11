import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getArticles, createArticle, deleteArticle } from '../controllers/articleController.js';

const router = express.Router();

// =========================================================================
// CONFIG MULTER: Diarahkan masuk ke sub-folder uploads/articles/ 🔥
// =========================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 🛠️ FIX JALUR: Kita arahkan spesifik ke dalam folder uploads/articles
    const dir = 'uploads/articles/';

    // Jika folder 'uploads' atau 'articles' belum dibuat, Node.js langsung merakitnya secara rekursif
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Penamaan file tetap aman menggunakan timestamp waktu unik
    cb(null, `article-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadArticleFile = multer({ storage: storage });

// =========================================================================
// JALUR ROUTING API ARTIKEL HGI SPEED
// =========================================================================
router.get('/articles', getArticles);
router.post('/articles', uploadArticleFile.single('image'), createArticle);
router.delete('/articles/:id', deleteArticle);

export default router;
