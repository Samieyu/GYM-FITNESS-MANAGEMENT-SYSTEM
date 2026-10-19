import { Request, Response, NextFunction } from 'express';
import { CheckinsService } from './checkins.service';
import { scanCheckinSchema } from './checkins.validation';

export class CheckinsController {
  private service = new CheckinsService();

  /**
   * GET /api/v1/checkins/my-qr
   * Generates a 60-second dynamic rotating HMAC-signed QR token for the logged-in member.
   */
  getMyQrPass = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const memberId = user.userId || user.id;
      const qrPass = await this.service.generateMemberQrPass(memberId);
      res.status(200).json({
        status: 'success',
        data: qrPass,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/checkins/scan
   * Process a QR scan or manual member check-in (Reception & Admin only).
   */
  scanCheckin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const staffId = user.userId || user.id;
      const validated = scanCheckinSchema.parse(req.body);
      const result = await this.service.processCheckinScan({
        scannedData: validated.scannedData,
        scannedByUserId: staffId,
        checkinType: validated.checkinType,
        allowOverride: validated.allowOverride,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/checkins/recent
   * View live check-in events log for today (Reception & Admin only).
   */
  getRecentCheckins = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 25;
      const records = await this.service.getRecentCheckins(limit);
      res.status(200).json({
        status: 'success',
        data: records,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/checkins/my-history
   * Member view of their past check-in attendance records.
   */
  getMyHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const memberId = user.userId || user.id;
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const history = await this.service.getMemberCheckinHistory(memberId, limit);
      res.status(200).json({
        status: 'success',
        data: history,
      });
    } catch (err) {
      next(err);
    }
  };
}
