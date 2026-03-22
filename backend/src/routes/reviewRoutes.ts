import { Router } from 'express';
import { addReview, getReviews, getMyReviews, deleteReview } from '../controllers/reviewController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// POST /api/reviews/:productId
router.post('/:productId', protect, authorize('buyer'), addReview);

// GET /api/reviews/my
router.get('/my', protect, authorize('buyer'), getMyReviews);

// GET /api/reviews/:productId
router.get('/:productId', getReviews);

// DELETE /api/reviews/delete/:id
router.delete('/delete/:id', protect, deleteReview);

export default router;
