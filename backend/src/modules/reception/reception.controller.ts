import { Request, Response, NextFunction } from 'express';
import { ReceptionService } from './reception.service';
import { walkinRegisterSchema } from './reception.validation';
import { BadRequestError } from '../../shared/errors/AppError';

export class ReceptionController {
  private service = new ReceptionService();

  registerWalkin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = walkinRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError('Validation error', parsed.error.flatten().fieldErrors);
      }

      const staffUser = (req as any).user;
      const result = await this.service.registerWalkinMember(
        { id: staffUser.userId || staffUser.id, email: staffUser.email },
        parsed.data,
        req.ip,
        req.headers['user-agent']
      );

      res.status(201).json({
        status: 'success',
        message: result.user.isNewUser
          ? 'Walk-in member registered, payment recorded, and invitation email sent!'
          : 'Existing member subscribed and offline payment recorded successfully!',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
