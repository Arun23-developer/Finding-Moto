import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { authorize, protect } from '../middleware/auth';
import {
  createReturnRequest,
  getBuyerReturnRequests,
  getManagedReturnRequests,
  updateReturnRequestStatus,
  getAvailableDeliveryAgents,
  assignReturnDeliveryAgent,
  getDeliveryAgentReturnPickups,
  updateDeliveryAgentReturnStatus,
  completeReturnDelivery,
} from '../controllers/returnController';

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'returns');
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
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.gif', '.webp', '.jfif', '.avif', '.heic', '.heif']);
    if (file.mimetype.toLowerCase().startsWith('image/') || allowedExtensions.has(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  },
});

router.use(protect);

// Buyer routes
router.post('/', authorize('buyer'), upload.array('referencePhotos', 5), createReturnRequest);
router.get('/my', authorize('buyer'), getBuyerReturnRequests);

// Seller/Mechanic routes
router.get('/manage', authorize('seller', 'mechanic'), getManagedReturnRequests);
router.patch('/:id/status', authorize('seller', 'mechanic'), updateReturnRequestStatus);

// Delivery agent assignment (seller/mechanic only)
router.get('/agents/available', authorize('seller', 'mechanic'), getAvailableDeliveryAgents);
router.patch('/:id/assign-agent', authorize('seller', 'mechanic'), assignReturnDeliveryAgent);

// Delivery agent routes
router.get('/agent/pickups', authorize('delivery_agent'), getDeliveryAgentReturnPickups);
router.patch('/:id/agent-status', authorize('delivery_agent'), updateDeliveryAgentReturnStatus);
router.patch('/:id/complete-delivery', authorize('delivery_agent'), completeReturnDelivery);

export default router;
