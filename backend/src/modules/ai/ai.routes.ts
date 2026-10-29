import { Router } from 'express';
import { AiController } from './ai.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new AiController();

// 1. Fitness Q&A Coach
router.post('/chat', authGuard, controller.chat);

// 2. Exercise Form Explanations
router.post('/explain', authGuard, controller.explainExercise);

// 3. Member's own AI Progress Summary
router.get('/progress-summary', authGuard, roleGuard('member'), controller.getMyProgressSummary);

// 4. Trainer / Admin inspect any member's AI Progress Summary
router.get('/progress-summary/:memberId', authGuard, roleGuard('trainer', 'admin'), controller.getMemberProgressSummary);

export default router;
