import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PaymentsController } from './payments.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new PaymentsController();

// Rate limiters for security
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    status: 'error',
    message: 'Too many checkout attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: {
    status: 'error',
    message: 'Webhook rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- CHAPA PAYMENT ROUTES ---
// Business Rule 3: Online payment initialization (Member only)
router.post(
  '/chapa/initialize',
  checkoutLimiter,
  authGuard,
  roleGuard('member'),
  controller.initializeChapa
);

// Business Rule 3: Direct Chapa transaction verification (returns from checkout)
router.get(
  '/chapa/verify/:txRef',
  checkoutLimiter,
  authGuard,
  controller.verifyChapa
);

// Business Rule 3: Chapa verified webhook endpoint (Public, rate limited, signature verified in service)
router.post(
  '/chapa/webhook',
  webhookLimiter,
  controller.handleChapaWebhook
);

// --- MANUAL PAYMENTS (Business Rule 4: Reception and Admin) ---
router.post(
  '/manual',
  authGuard,
  roleGuard('admin', 'reception'),
  controller.recordManual
);

// --- MEMBER PAYMENT HISTORY & ACTIVE MEMBERSHIP ---
router.get(
  '/my-history',
  authGuard,
  roleGuard('member'),
  controller.getMyHistory
);

// --- ADMIN & RECEPTION PAYMENT LIST ---
router.get(
  '/admin/all',
  authGuard,
  roleGuard('admin', 'reception'),
  controller.getAllPayments
);

export default router;
