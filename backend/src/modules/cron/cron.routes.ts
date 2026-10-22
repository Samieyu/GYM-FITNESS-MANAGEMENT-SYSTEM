import { Router } from 'express';
import { CronController } from './cron.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new CronController();

// Admin on-demand trigger for membership expiration & reminder check
router.post(
  '/admin/run-expiry-check',
  authGuard,
  roleGuard('admin'),
  controller.triggerManualExpiryCheck
);

export default router;
