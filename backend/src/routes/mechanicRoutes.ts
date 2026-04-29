import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/auth';
import {
  getMechanicDashboard,
  getProfile,
  updateProfile,
  getOverview,
  getMechanicReviews,
  getServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/mechanicController';
import { uploadImageBuffer } from '../utils/cloudinary';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.toLowerCase().startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image files are allowed'));
  },
});

// All mechanic routes require JWT + mechanic role
router.use(protect);
router.use(authorize('mechanic'));

// Overview
router.get('/dashboard', getMechanicDashboard);
router.get('/overview', getOverview);
router.get('/reviews', getMechanicReviews);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Services CRUD
router.get('/services', getServices);
router.post('/services/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    const imageUrl = await uploadImageBuffer(req.file.buffer, 'finding-moto/services');
    res.json({ success: true, data: { url: imageUrl } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    res.status(500).json({ success: false, message });
  }
});
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

export default router;
