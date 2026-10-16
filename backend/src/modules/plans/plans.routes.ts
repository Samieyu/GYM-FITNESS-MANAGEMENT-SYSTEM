import { Router } from 'express';
import { plansController } from './plans.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();

// Public routes (members & visitors can browse active membership plans)
router.get('/', (req, res, next) => plansController.getPublicPlans(req, res, next));
router.get('/:id', (req, res, next) => plansController.getPlanById(req, res, next));

// Admin-only routes (Business Rule 1: Only admin creates and prices membership plans)
router.get('/admin/all', authGuard, roleGuard('admin'), (req, res, next) =>
  plansController.getAllPlans(req, res, next)
);

router.post('/', authGuard, roleGuard('admin'), (req, res, next) =>
  plansController.createPlan(req, res, next)
);

router.put('/:id', authGuard, roleGuard('admin'), (req, res, next) =>
  plansController.updatePlan(req, res, next)
);

router.post('/upload-image', authGuard, roleGuard('admin'), (req, res, next) =>
  plansController.uploadImage(req, res, next)
);

export const plansRouter = router;
