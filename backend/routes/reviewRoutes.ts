import { Router } from 'express';
import { addReview, getReviews, deleteReview } from '../controllers/reviewController';

const router = Router();

// POST /api/reviews/:productId
router.post('/:productId', addReview);

// GET /api/reviews/:productId
router.get('/:productId', getReviews);

// DELETE /api/reviews/delete/:id
router.delete('/delete/:id', deleteReview);

export default router;
