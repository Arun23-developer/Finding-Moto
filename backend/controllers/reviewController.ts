import { Request, Response } from 'express';
import Review from '../models/Review';

// Add Review
export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const newReview = new Review({
      productId,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error });
  }
};

// Get Reviews by Product
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).sort({
      createdAt: -1,
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

// Delete Review
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};
