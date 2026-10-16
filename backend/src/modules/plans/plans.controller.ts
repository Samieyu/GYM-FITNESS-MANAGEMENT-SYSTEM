import { Request, Response, NextFunction } from 'express';
import { plansService } from './plans.service';
import { createPlanSchema, updatePlanSchema, uploadPlanImageSchema } from './plans.validation';
import { AuthenticatedRequest } from '../../shared/middlewares/authGuard';

export class PlansController {
  async getPublicPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await plansService.getPublicPlans();
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await plansService.getAllPlansForAdmin();
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const plan = await plansService.getPlanById(id);
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createPlanSchema.parse(req.body);
      const adminId = req.user!.userId;
      const ipAddress = req.ip;

      const plan = await plansService.createPlan(validated, adminId, ipAddress);
      res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validated = updatePlanSchema.parse(req.body);
      const adminId = req.user!.userId;
      const ipAddress = req.ip;

      const plan = await plansService.updatePlan(id, validated, adminId, ipAddress);
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = uploadPlanImageSchema.parse(req.body);
      const result = await plansService.uploadImage(validated.imageBase64, validated.imageName);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const plansController = new PlansController();
