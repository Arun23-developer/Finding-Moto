import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  getOverview,
} from '../controllers/mechanicController';

const router = express.Router();

// All mechanic routes require JWT + mechanic role
router.use(protect);
router.use(authorize('mechanic'));

// Overview
router.get('/overview', getOverview);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
