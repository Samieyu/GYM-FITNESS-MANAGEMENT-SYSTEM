import { Router, Request, Response, NextFunction } from 'express';
import { authController } from './auth.controller';
import {
  registerMemberSchema,
  loginSchema,
  verifyEmailSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  validateBody,
  validateQuery,
} from './auth.validation';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';
import { authRateLimiter } from '../../shared/middlewares/rateLimiter';
import { authService } from './auth.service';

const router = Router();

// Public Auth Endpoints
router.post(
  '/register',
  authRateLimiter,
  validateBody(registerMemberSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  authController.login
);

router.get(
  '/verify-email',
  validateQuery(verifyEmailSchema),
  authController.verifyEmail
);

router.post(
  '/verify-email',
  validateBody(verifyEmailSchema),
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authRateLimiter,
  validateBody(requestPasswordResetSchema),
  authController.resendVerification
);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  '/logout',
  authController.logout
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(requestPasswordResetSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

// Protected Auth Endpoints
router.get('/me', authGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// RBAC Test Verification Endpoint
router.get('/admin-check', authGuard, roleGuard('admin'), (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin: RBAC authorization granted.',
  });
});

export default router;
