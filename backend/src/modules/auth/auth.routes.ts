import { Router, Request, Response, NextFunction } from 'express';
import { config } from '../../config';
import { authController } from './auth.controller';
import {
  registerMemberSchema,
  loginSchema,
  verifyEmailSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  registerStaffSchema,
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

router.get(
  '/email-diagnostic',
  authController.getEmailDiagnostic
);

router.get('/test-resend', async (req: Request, res: Response) => {
  const to = (req.query.to as string) || 'samiwm63@gmail.com';
  if (!config.resend.apiKey) {
    return res.status(400).json({ error: 'RESEND_API_KEY is not configured on server' });
  }

  const attempts: any[] = [];
  const senders = [
    config.resend.from || 'POWERZONE Fitness <onboarding@resend.dev>',
    'POWERZONE Fitness <onboarding@resend.dev>',
    'onboarding@resend.dev',
  ];

  for (const sender of senders) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resend.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: [to],
          subject: 'POWERZONE Fitness — Test Email Delivery',
          html: `<div style="font-family:sans-serif;padding:20px;background:#111;color:#eee;"><h2>POWERZONE Fitness Delivery Test</h2><p>Recipient: ${to}</p><p>Timestamp: ${new Date().toISOString()}</p></div>`,
        }),
      });
      const data = await response.json();
      attempts.push({ sender, status: response.status, ok: response.ok, data });
      if (response.ok) break;
    } catch (e: any) {
      attempts.push({ sender, error: e.message });
    }
  }

  res.status(200).json({ success: true, to, attempts });
});

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

router.put('/profile-photo', authGuard, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { photoUrl } = req.body;
    const updated = await authService.updateProfilePhoto(req.user!.userId, photoUrl || null);
    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        firstName: updated.first_name,
        lastName: updated.last_name,
        photoUrl: updated.photo_url,
      },
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

// Admin Staff Management Endpoints (Admin access only)
router.get(
  '/admin/staff',
  authGuard,
  roleGuard('admin'),
  authController.getStaff
);

router.post(
  '/admin/register-staff',
  authGuard,
  roleGuard('admin'),
  validateBody(registerStaffSchema),
  authController.registerStaff
);

export default router;
