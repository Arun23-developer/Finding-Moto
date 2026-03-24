import { Request, Response } from "express";
import Review from "../models/Review";
import mongoose from "mongoose";

//  Add Review (with user + duplicate check)
export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, comment, userId, userName } = req.body;
    const { productId } = req.params;

    //  validation
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    //  check duplicate review
    const existing = await Review.findOne({ productId, userId });
    if (existing) {
      res.status(400).json({ message: "You already reviewed this product" });
      return;
    }

    const newReview = new Review({
      productId,
      userId,
      userName,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: "Error adding review", error });
  }
};


//  Get Reviews + Average Rating
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).sort({
      createdAt: -1,
    });

    //  calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0;

    res.json({
      reviews,
      averageRating: avgRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};


// Delete Review
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error });
  }
};


//  Update Review (EDIT feature )
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({ message: "Invalid rating" });
      return;
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      { rating, comment },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error });
  }
};