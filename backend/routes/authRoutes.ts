// ─── Auth Routes — Raakul ───────────────────────────────────────────────────
import express, { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  verifyOTP,
  resendOTP,
  getMe,
  updateProfile,
  changePassword,
  checkApprovalStatus,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/approval-status', checkApprovalStatus);

// Protected routes (any authenticated user)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
