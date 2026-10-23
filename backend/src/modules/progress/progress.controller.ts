import { Request, Response, NextFunction } from 'express';
import { ProgressService } from './progress.service';
import { logProgressMetricSchema, trainerCommentSchema } from './progress.validation';
import { BadRequestError, ForbiddenError } from '../../shared/errors/AppError';

export class ProgressController {
  private service = new ProgressService();

  logMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const parsed = logProgressMetricSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError('Validation error', parsed.error.flatten().fieldErrors);
      }

      const metric = await this.service.logMetric(user.userId, parsed.data);
      res.status(201).json({
        status: 'success',
        message: 'Progress metric logged successfully',
        data: metric,
      });
    } catch (err) {
      next(err);
    }
  };

  getMyMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const result = await this.service.getMemberMetrics(user.userId);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getMemberMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { memberId } = req.params;

      if (user.role === 'member' && user.userId !== memberId) {
        throw new ForbiddenError('You can only view your own progress records');
      }

      const result = await this.service.getMemberMetrics(memberId);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  addTrainerComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const parsed = trainerCommentSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError('Validation error', parsed.error.flatten().fieldErrors);
      }

      const updated = await this.service.addTrainerFeedback(id, user.userId, user.role, parsed.data.comment);
      res.status(200).json({
        status: 'success',
        message: 'Feedback comment posted and emailed to member',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };

  getAssignedMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const members = await this.service.getAssignedMembers(user.userId, user.role);
      res.status(200).json({
        status: 'success',
        data: members,
      });
    } catch (err) {
      next(err);
    }
  };
}
