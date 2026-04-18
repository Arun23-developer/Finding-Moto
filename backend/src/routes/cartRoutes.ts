import express from 'express';
import { addCartItem, getCartItems, removeCartItem, updateCartItemQuantity } from '../controllers/cartController';
import { authorize, protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(authorize('buyer'));

router.get('/', getCartItems);
router.post('/', addCartItem);
router.patch('/:id', updateCartItemQuantity);
router.delete('/:id', removeCartItem);

export default router;
