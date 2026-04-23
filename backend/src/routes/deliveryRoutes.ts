import express from 'express';
import { protect, authorize } from '../middleware/auth';
import {
  assignDelivery,
  getDeliveryByOrderId,
  getDeliveryAgents,
  getMyDeliveries,
  updateDeliveryStatus,
} from '../controllers/deliveryController';

const router = express.Router();

router.use(protect);

router.get('/agents', authorize('seller', 'mechanic', 'admin'), getDeliveryAgents);
router.get('/by-order/:orderId', authorize('seller', 'mechanic', 'admin'), getDeliveryByOrderId);
router.post('/assign', authorize('seller', 'mechanic', 'admin'), assignDelivery);
router.get('/my', authorize('delivery_agent'), getMyDeliveries);
router.patch('/:id/status', authorize('delivery_agent'), updateDeliveryStatus);

export default router;
