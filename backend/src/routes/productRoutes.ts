// ─── Product Routes — Arun ──────────────────────────────────────────────────
import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { uploadImageBuffer } from '../utils/cloudinary';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const isImageMime = file.mimetype.toLowerCase().startsWith('image/');

    if (isImageMime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

// All product routes require JWT + seller or mechanic role
router.use(protect);
router.use(authorize('seller', 'mechanic'));

// Image upload endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    const imageUrl = await uploadImageBuffer(req.file.buffer, 'finding-moto/products');
    res.json({ success: true, data: { url: imageUrl } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    res.status(500).json({ success: false, message });
  }
});

// Product CRUD
router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
