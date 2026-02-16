import express, { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  verifyOTP,
  resendOTP,
  getMe,
  updateProfile,
  checkApprovalStatus,
  getPendingApprovals,
  approveUser,
  getAllUsers,
  toggleUserActive
} from '../controllers/authController';
import { protect, authorize } from '../middleware/auth';

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

// Admin-only routes
router.get('/admin/pending', protect, authorize('admin'), getPendingApprovals);
router.put('/admin/approve/:userId', protect, authorize('admin'), approveUser);
router.get('/admin/users', protect, authorize('admin'), getAllUsers);
router.put('/admin/toggle-active/:userId', protect, authorize('admin'), toggleUserActive);

export default router;
