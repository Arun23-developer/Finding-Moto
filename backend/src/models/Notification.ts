import mongoose, { Document, Model, Schema } from 'mongoose';

export type NotificationRole = 'admin' | 'buyer' | 'seller' | 'mechanic' | 'delivery_agent';

export type NotificationCategory =
  | 'REPORT'
  | 'COMPLAINT'
  | 'SYSTEM_ALERT'
  | 'ORDER'
  | 'LOW_STOCK'
  | 'RETURN'
  | 'REFUND'
  | 'SERVICE_REQUEST'
  | 'PARTS_ALERT'
  | 'DELIVERY_ASSIGNMENT'
  | 'PICKUP_REQUEST'
  | 'ADMIN_ALERT';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  role: NotificationRole;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'buyer', 'seller', 'mechanic', 'delivery_agent'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'REPORT',
        'COMPLAINT',
        'SYSTEM_ALERT',
        'ORDER',
        'LOW_STOCK',
        'RETURN',
        'REFUND',
        'SERVICE_REQUEST',
        'PARTS_ALERT',
        'DELIVERY_ASSIGNMENT',
        'PICKUP_REQUEST',
        'ADMIN_ALERT',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    link: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ role: 1, category: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
