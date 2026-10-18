import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new PaymentsController();

// GET /api/v1/memberships/my-active (Member only)
router.get(
  '/my-active',
  authGuard,
  roleGuard('member'),
  controller.getMyActiveMembership
);

export default router;
