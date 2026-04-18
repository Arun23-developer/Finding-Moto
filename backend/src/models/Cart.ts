import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICartItem extends Document {
  _id: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICartItem>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productImage: {
      type: String,
      default: '',
      trim: true,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.index({ buyer: 1, product: 1 }, { unique: true });

cartSchema.pre('save', function (next) {
  this.totalAmount = this.productPrice * this.quantity;
  next();
});

const Cart: Model<ICartItem> = mongoose.model<ICartItem>('Cart', cartSchema);

export default Cart;
