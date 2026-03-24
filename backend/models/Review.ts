import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;   //  added
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    userId: {                         //  NEW FIELD
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    userName: {
      type: String,
      required: true,
      trim: true,
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
    timestamps: true,
  }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;