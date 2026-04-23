import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  createServiceOrder,
  getBuyerServiceOrders,
  getMechanicServiceOrders,
  updateServiceOrderStatus,
} from '../controllers/serviceOrderController';

const router = express.Router();

router.use(protect);

router.post('/', authorize('buyer'), createServiceOrder);
router.get('/my', authorize('buyer'), getBuyerServiceOrders);
router.get('/mechanic', authorize('mechanic'), getMechanicServiceOrders);
router.put('/:id/status', authorize('buyer', 'mechanic'), updateServiceOrderStatus);

export default router;
