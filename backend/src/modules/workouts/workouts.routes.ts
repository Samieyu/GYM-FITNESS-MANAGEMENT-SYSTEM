import { Router } from 'express';
import { WorkoutsController } from './workouts.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new WorkoutsController();

// 1. Exercise Library (All authenticated users)
router.get('/exercises', authGuard, controller.getExercises);

// 2. Member: Request AI-generated routine (Business Rules 10 & 11)
router.post('/request-ai', authGuard, roleGuard('member'), controller.requestAiWorkout);

// 3. Member: Active workout routine & plan history
router.get('/my-active', authGuard, roleGuard('member'), controller.getMyActiveWorkout);
router.get('/my-plans', authGuard, roleGuard('member'), controller.getMyWorkoutHistory);

// 4. Trainer & Admin: Pending drafts queue (Business Rule 11)
router.get('/trainer/pending', authGuard, roleGuard('trainer', 'admin'), controller.getPendingDrafts);
router.get('/trainer/all', authGuard, roleGuard('trainer', 'admin'), controller.getAllPlans);

// 5. Trainer & Admin: Custom routine builder
router.post('/trainer/custom', authGuard, roleGuard('trainer', 'admin'), controller.createCustomPlan);

// 6. Trainer & Admin: Approve and activate routine (Business Rule 11 Approval Gate)
router.put('/:id/approve', authGuard, roleGuard('trainer', 'admin'), controller.approvePlan);

// 7. View specific plan by ID
router.get('/:id', authGuard, controller.getPlanById);

export default router;
