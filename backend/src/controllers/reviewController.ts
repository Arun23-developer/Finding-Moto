import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

// Add Review
export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const buyerId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    if (!rating || rating < 1 || rating > 5 || !comment?.trim()) {
      res.status(400).json({ message: 'Rating (1-5) and comment are required' });
      return;
    }

    const product = await Product.findById(productId).select('_id');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Only buyers who received the item can review it.
    const deliveredOrder = await Order.findOne({
      buyer: buyerId,
      status: 'delivered',
      'items.product': new mongoose.Types.ObjectId(productId),
    }).select('_id');

    if (!deliveredOrder) {
      res.status(403).json({ message: 'You can review only delivered purchases' });
      return;
    }

    const existing = await Review.findOne({ productId, buyer: buyerId });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment.trim();
      const updated = await existing.save();
      res.json(updated);
      return;
    }

    const newReview = new Review({
      productId,
      buyer: buyerId,
      rating,
      comment: comment.trim(),
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

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    const reviews = await Review.find({ productId }).sort({
      createdAt: -1,
    }).populate('buyer', 'firstName lastName avatar');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

// Get logged-in buyer reviews
export const getMyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const buyerId = req.user!._id;

    const reviews = await Review.find({ buyer: buyerId })
      .sort({ createdAt: -1 })
      .select('productId rating comment createdAt updatedAt')
      .lean();

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your reviews', error });
  }
};

// Delete Review
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid review ID' });
      return;
    }

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = review.buyer.toString() === req.user!._id.toString();
    if (!isAdmin && !isOwner) {
      res.status(403).json({ message: 'Not authorized to delete this review' });
      return;
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};
