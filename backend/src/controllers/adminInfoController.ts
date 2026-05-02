import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notifyRole } from '../utils/notifications';
import type { NotificationRole } from '../models/Notification';

const ALLOWED_TARGET_ROLES: NotificationRole[] = ['seller', 'mechanic', 'delivery_agent', 'buyer'];

export const sendInfoToUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, title, message } = req.body as {
      role?: NotificationRole;
      title?: string;
      message?: string;
    };

    if (!role || !ALLOWED_TARGET_ROLES.includes(role)) {
      res.status(400).json({ success: false, message: 'Select a valid user role.' });
      return;
    }

    const cleanTitle = title?.trim().slice(0, 120);
    const cleanMessage = message?.trim().slice(0, 500);

    if (!cleanTitle) {
      res.status(400).json({ success: false, message: 'Information title is required.' });
      return;
    }

    if (!cleanMessage) {
      res.status(400).json({ success: false, message: 'Information message is required.' });
      return;
    }

    await notifyRole(role, {
      category: 'ADMIN_ALERT',
      title: cleanTitle,
      message: cleanMessage,
      link: role === 'buyer' ? '/buyer/notifications' : role === 'delivery_agent' ? '/delivery/notifications' : `/${role}/notification`,
      metadata: {
        source: 'admin_information',
        sentBy: req.user!._id,
        targetRole: role,
      },
    });

    res.json({ success: true, message: `Information sent to ${role.replace('_', ' ')} users.` });
  } catch (error) {
    console.error('sendInfoToUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to send information message.' });
  }
};
