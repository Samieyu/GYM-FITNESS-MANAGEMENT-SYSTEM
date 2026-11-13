import dotenv from 'dotenv';
import path from 'path';

// Robustly load backend/.env
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  frontendUrl:
    process.env.FRONTEND_URL ||
    (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
      ? process.env.CORS_ORIGIN.split(',')
          .map((o) => o.trim())
          .find((o) => o.startsWith('http')) || 'https://sweatbox.pages.dev'
      : process.env.NODE_ENV === 'production'
      ? 'https://sweatbox.pages.dev'
      : 'http://localhost:5173'),

  db: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'gym_user',
    password: process.env.DB_PASSWORD || 'gym_password',
    database: process.env.DB_NAME || 'gym_db',
    ssl: process.env.DB_SSL === 'true' || !!process.env.DATABASE_URL,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  qr: {
    hmacSecret: process.env.QR_HMAC_SECRET || 'dev_qr_hmac_secret_change_me',
    validitySeconds: 60,
  },

  smtp: {
    host: process.env.SMTP_HOST || '127.0.0.1',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Gym System <no-reply@gymfitness.local>',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    // Never fall back to SMTP_FROM here because Resend rejects unverified domains like @gmail.com or .local
    from: process.env.RESEND_FROM || 'POWERZONE Fitness <onboarding@resend.dev>',
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    fromEmail: process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER || '',
    fromName: process.env.BREVO_FROM_NAME || 'POWERZONE Fitness',
  },

  chapa: {
    secretKey: process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-placeholder',
    publicKey: process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-placeholder',
    webhookSecret: process.env.CHAPA_WEBHOOK_SECRET || 'chapa_webhook_secret_placeholder',
    baseUrl: process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
};
