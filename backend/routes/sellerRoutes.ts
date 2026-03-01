import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, authorize } from '../middleware/auth';
import {
  getOverview,
  getAnalytics,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getProfile,
  updateProfile,
} from '../controllers/sellerController';

const router = express.Router();

// ── Multer config for product image uploads ────────────────────────────────
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
  },
});

// All seller routes require JWT + seller role
router.use(protect);
router.use(authorize('seller'));

// Image upload endpoint
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }
  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.json({ success: true, data: { url: imageUrl } });
});

// Overview & analytics
router.get('/overview', getOverview);
router.get('/analytics', getAnalytics);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Products
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
