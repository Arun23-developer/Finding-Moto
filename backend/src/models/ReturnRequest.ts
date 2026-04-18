import mongoose, { Document, Model, Schema } from 'mongoose';

export const RETURN_REASONS = [
  'Damaged Product',
  'Wrong Product Delivered',
  'Product Quality Issue',
  'Not as Described',
  'Defective Product',
  'Other',
] as const;

export const RETURN_REQUEST_STATUSES = [
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_REJECTED',
  'RETURN_PICKUP_ASSIGNED',
  'RETURN_PICKED_UP',
  'RETURN_IN_TRANSIT',
  'RETURN_DELIVERED',
  'REFUND_INITIATED',
  'REFUND_COMPLETED',
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number];
export type ReturnRequestStatus = (typeof RETURN_REQUEST_STATUSES)[number];

export interface IReturnBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  branchName?: string;
  ifscOrSwiftCode?: string;
}

export interface IReturnPickupAddress {
  fullAddress: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface IReturnStatusHistory {
  status: ReturnRequestStatus;
  changedAt: Date;
  note?: string;
}

export interface IReturnRequest extends Document {
  _id: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  reason: ReturnReason;
  referencePhotos: string[];
  bankDetails: IReturnBankDetails;
  pickupAddress: IReturnPickupAddress;
  comments?: string;
  status: ReturnRequestStatus;
  statusHistory: IReturnStatusHistory[];
  assigned_agent_id?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const returnBankDetailsSchema = new Schema<IReturnBankDetails>(
  {
    accountHolderName: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    branchName: { type: String, trim: true, default: '' },
    ifscOrSwiftCode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const returnPickupAddressSchema = new Schema<IReturnPickupAddress>(
  {
    fullAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const returnRequestSchema = new Schema<IReturnRequest>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: RETURN_REASONS,
      required: true,
    },
    referencePhotos: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => Array.isArray(value) && value.length > 0,
        message: 'At least one reference photo is required',
      },
    },
    bankDetails: {
      type: returnBankDetailsSchema,
      required: true,
    },
    pickupAddress: {
      type: returnPickupAddressSchema,
      required: true,
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: RETURN_REQUEST_STATUSES,
      default: 'RETURN_REQUESTED',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: RETURN_REQUEST_STATUSES,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          trim: true,
          default: '',
        },
      },
    ],
    assigned_agent_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

returnRequestSchema.index({ order: 1, buyer: 1 }, { unique: true });

const ReturnRequest: Model<IReturnRequest> = mongoose.model<IReturnRequest>('ReturnRequest', returnRequestSchema);

export default ReturnRequest;
