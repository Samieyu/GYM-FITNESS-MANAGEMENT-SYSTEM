import { Router } from 'express';
import { ReceptionController } from './reception.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new ReceptionController();

// Rule 10: Front Desk Walk-In Member Registration
router.post(
  '/walk-in',
  authGuard,
  roleGuard('admin', 'reception'),
  controller.registerWalkin
);

export default router;
