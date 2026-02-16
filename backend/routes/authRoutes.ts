import express, { Router } from 'express';
import { register, login, googleAuth, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

export default router;
