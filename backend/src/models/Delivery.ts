import mongoose, { Document, Model, Schema } from 'mongoose';

export const DELIVERY_STATUSES = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface IDeliveryStatusHistory {
  status: DeliveryStatus;
  changedAt: Date;
}

export interface IDelivery extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  status: DeliveryStatus;
  statusHistory: IDeliveryStatusHistory[];
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const deliverySchema = new Schema<IDelivery>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: DELIVERY_STATUSES,
      default: 'ASSIGNED',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: DELIVERY_STATUSES,
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Delivery: Model<IDelivery> = mongoose.model<IDelivery>('Delivery', deliverySchema);

export default Delivery;
