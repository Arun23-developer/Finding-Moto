import mongoose from 'mongoose';
import Notification, { NotificationCategory, NotificationRole } from '../models/Notification';
import User from '../models/User';
import { emitToUser } from './socket';

interface CreateNotificationInput {
  recipient?: string | mongoose.Types.ObjectId | null;
  role: NotificationRole;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification({
  recipient,
  role,
  category,
  title,
  message,
  link,
  metadata,
}: CreateNotificationInput) {
  if (!recipient) return null;

  const notification = await Notification.create({
    recipient,
    role,
    category,
    title,
    message,
    link,
    metadata: metadata || {},
  });

  emitToUser(notification.recipient.toString(), 'notification:new', {
    _id: notification._id,
    recipient: notification.recipient,
    role: notification.role,
    category: notification.category,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    read: notification.read,
    metadata: notification.metadata,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  });

  return notification;
}

export async function notifyRole(
  role: NotificationRole,
  input: Omit<CreateNotificationInput, 'recipient' | 'role'>
) {
  const users = await User.find({ role, isActive: true }).select('_id');
  await Promise.all(
    users.map((user) =>
      createNotification({
        ...input,
        recipient: user._id,
        role,
      })
    )
  );
}
