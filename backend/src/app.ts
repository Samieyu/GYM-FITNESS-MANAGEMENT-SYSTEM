import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './shared/middlewares/errorHandler';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

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

// Centralized Error Handler
app.use(errorHandler);

export default app;
