import express from 'express';
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

// All seller routes require JWT + seller role
router.use(protect);
router.use(authorize('seller'));

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
