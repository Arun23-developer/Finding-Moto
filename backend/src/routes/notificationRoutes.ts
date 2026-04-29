import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controllers/notificationController';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.delete('/clear', clearNotifications);
router.patch('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);

export default router;
