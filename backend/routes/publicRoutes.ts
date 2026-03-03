// ─── Public Routes — No authentication required ────────────────────────────
import express from 'express';
import {
  getPublicProducts,
  getPublicProduct,
  getTrendingProducts,
  getPublicMechanics,
  getPublicMechanicServices,
  getPublicAllServices,
} from '../controllers/publicController';

const router = express.Router();

// Products (public browsing)
router.get('/products/trending', getTrendingProducts);
router.get('/products/:id', getPublicProduct);
router.get('/products', getPublicProducts);

// Mechanics / Garages (public listing)
router.get('/mechanics', getPublicMechanics);

// Mechanic services (public)
router.get('/mechanics/:id/services', getPublicMechanicServices);
router.get('/services', getPublicAllServices);

export default router;
