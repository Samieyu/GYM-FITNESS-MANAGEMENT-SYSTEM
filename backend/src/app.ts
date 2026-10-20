import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './shared/middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';

import path from 'path';
import { getUploadsDir } from './shared/utils/uploadPaths';
import { plansRouter } from './modules/plans/plans.routes';
import paymentsRouter from './modules/payments/payments.routes';
import membershipsRouter from './modules/payments/memberships.routes';
import checkinsRouter from './modules/checkins/checkins.routes';
import workoutsRouter from './modules/workouts/workouts.routes';

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
const uploadsDir = getUploadsDir();
app.use('/uploads', express.static(uploadsDir));

// Body Parsers with rawBody retention for webhook signature verification
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);
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
app.use(`${config.apiPrefix}/payments`, paymentsRouter);
app.use(`${config.apiPrefix}/memberships`, membershipsRouter);
app.use(`${config.apiPrefix}/checkins`, checkinsRouter);
app.use(`${config.apiPrefix}/workouts`, workoutsRouter);

// Centralized Error Handler
app.use(errorHandler);

export default app;
