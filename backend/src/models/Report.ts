import mongoose, { Document, Model, Schema } from 'mongoose';

export const REPORT_CATEGORIES = ['ACCOUNT', 'PRODUCT', 'SERVICE', 'DELIVERY'] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = ['PENDING', 'RESOLVED', 'REJECTED'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_ACTIONS = ['NONE', 'RESOLVED', 'REJECTED', 'BLOCKED_ACCOUNT'] as const;
export type ReportAdminAction = (typeof REPORT_ACTIONS)[number];

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  category: ReportCategory;
  reason: string;
  status: ReportStatus;
  adminAction: ReportAdminAction;
  adminNotes?: string | null;
  reviewedBy?: mongoose.Types.ObjectId | null;
  reviewedAt?: Date | null;

  reportedBy: mongoose.Types.ObjectId;
  reportedUser: mongoose.Types.ObjectId;

  reportedProduct?: mongoose.Types.ObjectId | null;
  reportedService?: mongoose.Types.ObjectId | null;
  reportedDelivery?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    category: {
      type: String,
      enum: REPORT_CATEGORIES,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: 'PENDING',
      index: true,
    },
    adminAction: {
      type: String,
      enum: REPORT_ACTIONS,
      default: 'NONE',
    },
    adminNotes: {
      type: String,
      default: null,
      trim: true,
      maxlength: 1000,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },

    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    reportedProduct: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    reportedService: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    reportedDelivery: {
      type: Schema.Types.ObjectId,
      ref: 'Delivery',
      default: null,
    },
  },
  { timestamps: true }
);

reportSchema.index({ category: 1, status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, status: 1, createdAt: -1 });

const Report: Model<IReport> = mongoose.model<IReport>('Report', reportSchema);

export default Report;
