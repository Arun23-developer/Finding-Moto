import { Request, Response } from "express";
import Review from "../models/Review";
import mongoose from "mongoose";

// ✅ CREATE REVIEW
export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    const review = new Review({
      productId,
      userId: req.user.id,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error creating review" });
  }
};

// ✅ GET REVIEWS BY PRODUCT
export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// ✅ UPDATE REVIEW
export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only owner can update
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Error updating review" });
  }
};

// ✅ DELETE REVIEW
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
};

// ✅ GET AVERAGE RATING
export const getAverageRating = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const result = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    res.json(result[0] || { averageRating: 0, totalReviews: 0 });
  } catch (error) {
    res.status(500).json({ message: "Error calculating rating" });
  }
};