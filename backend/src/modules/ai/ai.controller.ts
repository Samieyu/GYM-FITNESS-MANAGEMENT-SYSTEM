import { Request, Response, NextFunction } from 'express';
import { AiService } from './ai.service';
import { BadRequestError } from '../../shared/errors/AppError';

const aiService = new AiService();

export class AiController {
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { question } = req.body;
      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        throw new BadRequestError('A question string is required');
      }

      const user = (req as any).user;
      const response = await aiService.askFitnessCoach(question.trim(), {
        name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined,
        role: user?.role,
      });

      res.status(200).json({
        success: true,
        data: {
          answer: response,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async explainExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const { exerciseName } = req.body;
      if (!exerciseName || typeof exerciseName !== 'string') {
        throw new BadRequestError('exerciseName is required');
      }

      const data = await aiService.explainExercise(exerciseName.trim());
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getMyProgressSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const memberId = user.userId || user.id;
      const summary = await aiService.generateMemberProgressSummary(memberId);
      res.status(200).json({ success: true, data: { summary } });
    } catch (err) {
      next(err);
    }
  }

  async getMemberProgressSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      if (!memberId) {
        throw new BadRequestError('memberId is required');
      }
      const summary = await aiService.generateMemberProgressSummary(memberId);
      res.status(200).json({ success: true, data: { summary } });
    } catch (err) {
      next(err);
    }
  }
}
