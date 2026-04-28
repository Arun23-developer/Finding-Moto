import express from 'express';
import { protect } from '../middleware/auth';
import { createReport } from '../controllers/reportController';

const router = express.Router();

router.use(protect);

// Create a new report
router.post('/', createReport);

export default router;
