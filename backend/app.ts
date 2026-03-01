import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import config from './config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import sellerRoutes from './routes/sellerRoutes';
import mechanicRoutes from './routes/mechanicRoutes';

const app: Application = express();

// Middleware
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/mechanic', mechanicRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Finding Moto API is running' });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
