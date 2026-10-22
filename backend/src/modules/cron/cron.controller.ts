import { Request, Response, NextFunction } from 'express';
import { CronService } from './cron.service';

export class CronController {
  private service = new CronService();

  triggerManualExpiryCheck = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.service.processMembershipExpirations();

      res.status(200).json({
        status: 'success',
        message: 'Membership expiration and reminder job executed successfully',
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  };
}
