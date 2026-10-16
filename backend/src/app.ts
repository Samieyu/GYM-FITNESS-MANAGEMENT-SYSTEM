import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './shared/middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';

import path from 'path';
import { plansRouter } from './modules/plans/plans.routes';

const app: Application = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Static uploads serving (for plan images uploaded from local storage)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    message: 'Gym & Fitness Management System API',
    endpoints: {
      health: '/health',
      apiV1: config.apiPrefix,
    },
  });
});

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// Root API Welcome Endpoint
app.get(`${config.apiPrefix}`, (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Gym & Fitness Management System API',
    version: '1.0.0',
    docs: `${config.apiPrefix}/docs`,
  });
});

// API Modules
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/plans`, plansRouter);

// Centralized Error Handler
app.use(errorHandler);

export default app;
