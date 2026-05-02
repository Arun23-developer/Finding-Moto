import mongoose, { Document, Model, Schema } from 'mongoose';

export type VisitorMessageStatus = 'NEW' | 'READ';

export interface IVisitorMessage extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: VisitorMessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const visitorMessageSchema = new Schema<IVisitorMessage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 15,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['NEW', 'READ'],
      default: 'NEW',
      index: true,
    },
  },
  { timestamps: true }
);

visitorMessageSchema.index({ createdAt: -1 });
visitorMessageSchema.index({ email: 1, createdAt: -1 });

const VisitorMessage: Model<IVisitorMessage> = mongoose.model<IVisitorMessage>(
  'VisitorMessage',
  visitorMessageSchema
);

export default VisitorMessage;
