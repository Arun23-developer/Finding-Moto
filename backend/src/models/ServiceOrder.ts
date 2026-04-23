import mongoose, { Document, Schema, Model } from 'mongoose';
import { SERVICE_ORDER_STATUSES, type ServiceOrderStatus } from '../utils/serviceOrderStatus';

export interface IServiceOrder extends Document {
  _id: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  mechanic: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  serviceName: string;
  servicePrice: number;
  bookingDate: Date;
  notes?: string;
  status: ServiceOrderStatus;
  statusHistory: { status: ServiceOrderStatus; changedAt: Date; note?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceOrderSchema = new Schema<IServiceOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mechanic: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    serviceName: { type: String, required: true },
    servicePrice: { type: Number, required: true, min: 0 },
    bookingDate: { type: Date, required: true },
    notes: { type: String, default: '' },
    status: { type: String, required: true, enum: SERVICE_ORDER_STATUSES, default: 'SERVICE_ORDER_PLACED' },
    statusHistory: [
      {
        status: { type: String, enum: SERVICE_ORDER_STATUSES, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

serviceOrderSchema.index({ buyer: 1 });
serviceOrderSchema.index({ mechanic: 1 });
serviceOrderSchema.index({ service: 1 });
serviceOrderSchema.index({ status: 1 });

const ServiceOrder: Model<IServiceOrder> = mongoose.model<IServiceOrder>('ServiceOrder', serviceOrderSchema);
export default ServiceOrder;
