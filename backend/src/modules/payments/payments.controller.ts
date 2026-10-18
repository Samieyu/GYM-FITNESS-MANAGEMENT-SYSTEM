import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';
import { 
  initializeChapaPaymentSchema, 
  chapaWebhookSchema, 
  recordManualPaymentSchema, 
  paymentFilterSchema 
} from './payments.validation';
import { BadRequestError } from '../../shared/errors/AppError';

export class PaymentsController {
  private service = new PaymentsService();

  initializeChapa = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = initializeChapaPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError('Validation error', parsed.error.flatten().fieldErrors);
      }

      const user = (req as any).user;
      const result = await this.service.initializeChapaPayment(
        {
          id: user.userId || user.id,
          email: user.email,
          firstName: user.first_name || user.firstName || 'Member',
          lastName: user.last_name || user.lastName || '',
        },
        parsed.data.planId,
        parsed.data.returnUrl
      );

      res.status(200).json({
        status: 'success',
        message: 'Chapa checkout initialized successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  handleChapaWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = chapaWebhookSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError('Invalid webhook payload format', parsed.error.flatten().fieldErrors);
      }

      // Check Chapa signature header (support both x-chapa-signature and chapa-signature)
      const signature = (req.headers['x-chapa-signature'] || req.headers['chapa-signature']) as string | undefined;

      // Ensure we pass the raw string representation for HMAC-SHA256 calculation
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const result = await this.service.verifyAndProcessWebhook(rawBody, signature, parsed.data);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  recordManual = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = recordManualPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError('Validation error', parsed.error.flatten().fieldErrors);
      }

      const staffUser = (req as any).user;
      const result = await this.service.recordManualPayment(
        { id: staffUser.userId || staffUser.id, email: staffUser.email },
        parsed.data,
        req.ip,
        req.headers['user-agent']
      );

      res.status(201).json({
        status: 'success',
        message: 'Offline payment recorded and membership activated successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getMyActiveMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const userId = user.userId || user.id;
      const membership = await this.service.getMemberActiveMembership(userId);

      res.status(200).json({
        status: 'success',
        data: membership,
      });
    } catch (err) {
      next(err);
    }
  };

  getMyHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const userId = user.userId || user.id;
      const history = await this.service.getMemberPaymentHistory(userId);

      res.status(200).json({
        status: 'success',
        data: history,
      });
    } catch (err) {
      next(err);
    }
  };

  getAllPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = paymentFilterSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new BadRequestError('Invalid query parameters', parsed.error.flatten().fieldErrors);
      }

      const result = await this.service.getAllPayments(parsed.data);

      res.status(200).json({
        status: 'success',
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  };
}
