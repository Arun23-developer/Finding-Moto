import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

const toNotificationFilter = (req: AuthRequest) => {
  const filter: Record<string, unknown> = {
    recipient: req.user!._id,
    role: req.user!.role,
  };

  const category = typeof req.query.category === 'string' ? req.query.category : '';
  const unreadOnly = req.query.unreadOnly === 'true';

  if (category && category !== 'all') filter.category = category;
  if (unreadOnly) filter.read = false;

  return filter;
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 80, 200);
    const notifications = await Notification.find(toNotificationFilter(req))
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user!._id,
      role: req.user!.role,
      read: false,
    });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid notification id' });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user!._id, role: req.user!.role },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { recipient: req.user!._id, role: req.user!.role, read: false },
      { read: true }
    );

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid notification id' });
      return;
    }

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user!._id,
      role: req.user!.role,
    });

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('deleteNotification error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};

export const clearNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.deleteMany({ recipient: req.user!._id, role: req.user!.role });
    res.json({ success: true, message: 'Notifications cleared' });
  } catch (error) {
    console.error('clearNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
};
