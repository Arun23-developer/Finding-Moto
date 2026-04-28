// ─── Admin Routes — Sujani ──────────────────────────────────────────────────
import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  getPendingApprovals,
  approveUser,
  getAllUsers,
  getUserById,
  toggleUserActive,
  getAdminOverview,
  getAdminProducts,
  getAdminOrders,
  getAdminServices,
  getAdminReviews,
} from '../controllers/adminController';
import {
  adminBlockReportedAccount,
  adminGetReport,
  adminListReports,
  adminUpdateReportStatus,
} from '../controllers/reportController';

const router = express.Router();

// All admin routes require JWT + admin role
router.use(protect);
router.use(authorize('admin'));

// Overview
router.get('/overview', getAdminOverview);

// Management routes
router.get('/products', getAdminProducts);
router.get('/orders', getAdminOrders);
router.get('/services', getAdminServices);
router.get('/reviews', getAdminReviews);

// User management
router.get('/pending', getPendingApprovals);
router.put('/approve/:userId', approveUser);
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/toggle-active/:userId', toggleUserActive);

// Reports
router.get('/reports', adminListReports);
router.get('/reports/:reportId', adminGetReport);
router.put('/reports/:reportId/status', adminUpdateReportStatus);
router.put('/reports/:reportId/block', adminBlockReportedAccount);

export default router;
