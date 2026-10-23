import { Router } from 'express';
import { ProgressController } from './progress.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new ProgressController();

// 1. Member: Log weight & measurements
router.post('/', authGuard, roleGuard('member'), controller.logMetric);

// 2. Member: Get own progress history & summary
router.get('/my', authGuard, roleGuard('member'), controller.getMyMetrics);

// 3. Trainer & Admin: Get members with latest metric summaries
router.get('/members', authGuard, roleGuard('trainer', 'admin'), controller.getAssignedMembers);

// 4. Trainer, Admin, or Member (own): View specific member's progress history
router.get('/member/:memberId', authGuard, controller.getMemberMetrics);

// 5. Trainer & Admin: Post coaching feedback comment on a metric entry
router.post('/:id/comment', authGuard, roleGuard('trainer', 'admin'), controller.addTrainerComment);

export default router;
