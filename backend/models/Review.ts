import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto வரும்
  }
);

// 🔥 ஒரே user ஒரே productக்கு ஒரு review மட்டும்
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", ReviewSchema);