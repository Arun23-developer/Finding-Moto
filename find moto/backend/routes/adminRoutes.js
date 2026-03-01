import express from 'express';
import {
    adminLogin,
    getDashboardStats,
    getUsers,
    blockUser,
    deleteUser,
    getPendingSellers,
    approveSeller,
    getProducts,
    getOrders
} from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for admin login
router.post('/login', adminLogin);

// Protected routes (Admin only)
router.use(protectAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);

// Sellers
router.get('/sellers/pending', getPendingSellers);
router.put('/sellers/:id/approve', approveSeller);

// Products
router.get('/products', getProducts);

// Orders
router.get('/orders', getOrders);

export default router;
