import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import mongoose from 'mongoose';
import path from 'path';
import config from './config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import sellerRoutes from './routes/sellerRoutes';
import mechanicRoutes from './routes/mechanicRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import serviceOrderRoutes from './routes/serviceOrderRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';
import publicRoutes from './routes/publicRoutes';
import chatRoutes from './routes/chatRoutes';
import aiRoutes from './routes/aiRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import cartRoutes from './routes/cartRoutes';
import returnRoutes from './routes/returnRoutes';
import reportRoutes from './routes/reportRoutes';

const app: Application = express();

// Middleware
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use(compression({ threshold: 1024 }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded images as static files
const backendUploadsDir = path.join(__dirname, '..', 'uploads');
const legacyUploadsDir = path.join(__dirname, '..', '..', 'uploads');

app.use('/uploads', express.static(backendUploadsDir));
app.use('/uploads', express.static(legacyUploadsDir));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Finding Moto API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api', (req: Request, res: Response, next) => {
  if (req.path === '/health') {
    next();
    return;
  }

  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again shortly.',
    });
    return;
  }

  next();
});

// Routes
app.use('/api/public', publicRoutes);       // Public â€” No auth required (products/mechanics browsing)
app.use('/api/auth', authRoutes);          // Raakul â€” User Management
app.use('/api/seller', sellerRoutes);      // Thulax â€” Seller Dashboard
app.use('/api/mechanic', mechanicRoutes);  // Thulax â€” Mechanic Dashboard
app.use('/api/products', productRoutes);   // Arun   â€” Product Management
app.use('/api/orders', orderRoutes);       // Saran  â€” Order Management
app.use('/api/service-orders', serviceOrderRoutes); // New service order lifecycle
app.use('/api/admin', adminRoutes);        // Sujani â€” Admin Dashboard
app.use('/api/reviews', reviewRoutes);     // Sivaganga â€” Rating & Review
app.use('/api/chat', chatRoutes);          // Chat â€” Real-time messaging
app.use('/api/ai', aiRoutes);              // AI assistant â€” Gemini-powered
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/reports', reportRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
