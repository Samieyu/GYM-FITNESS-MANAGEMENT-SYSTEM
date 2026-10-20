import { Request, Response, NextFunction } from 'express';
import { WorkoutsService } from './workouts.service';
import { requestAiWorkoutSchema, createCustomWorkoutSchema } from './workouts.validation';

export class WorkoutsController {
  private service = new WorkoutsService();

  /**
   * GET /api/v1/workouts/exercises
   * List all exercises from the library
   */
  getExercises = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const exercises = await this.service.getExerciseLibrary();
      res.status(200).json({
        status: 'success',
        data: exercises,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/workouts/request-ai
   * Business Rules 10 & 11: Member requests AI-generated draft workout routine
   */
  requestAiWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const memberId = user.userId || user.id;
      const validated = requestAiWorkoutSchema.parse(req.body);

      const plan = await this.service.requestAiWorkoutPlan(memberId, validated);
      res.status(201).json({
        status: 'success',
        message: 'AI draft workout plan generated successfully. Awaiting trainer review and approval.',
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/workouts/my-active
   * Member retrieves currently active approved workout plan
   */
  getMyActiveWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const memberId = user.userId || user.id;
      const plan = await this.service.getMemberActiveWorkout(memberId);

      res.status(200).json({
        status: 'success',
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/workouts/my-plans
   * Member retrieves all their workout plans (drafts + history)
   */
  getMyWorkoutHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const memberId = user.userId || user.id;
      const plans = await this.service.getMemberWorkoutHistory(memberId);

      res.status(200).json({
        status: 'success',
        data: plans,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/workouts/trainer/pending
   * Trainer / Admin views all draft workout plans awaiting review
   */
  getPendingDrafts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await this.service.getPendingDraftPlans();
      res.status(200).json({
        status: 'success',
        data: plans,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/workouts/trainer/all
   * Trainer / Admin views all workout routines
   */
  getAllPlans = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await this.service.getAllGymWorkoutPlans();
      res.status(200).json({
        status: 'success',
        data: plans,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/workouts/trainer/custom
   * Trainer creates custom workout plan directly
   */
  createCustomPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const trainerUserId = user.userId || user.id;
      const validated = createCustomWorkoutSchema.parse(req.body);

      const plan = await this.service.createCustomWorkoutPlan({
        memberId: validated.memberId,
        trainerUserId,
        title: validated.title,
        description: validated.description,
        status: 'approved',
        exercises: validated.exercises,
      });

      res.status(201).json({
        status: 'success',
        message: 'Custom workout plan created and activated successfully.',
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/v1/workouts/:id/approve
   * Business Rule 11: Trainer or Admin approves draft workout routine
   */
  approvePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const trainerUserId = user.userId || user.id;
      const role = user.role;
      const planId = req.params.id;

      const plan = await this.service.approveWorkoutPlan(planId, trainerUserId, role);
      res.status(200).json({
        status: 'success',
        message: 'Workout plan approved and activated for member.',
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/workouts/:id
   * View specific workout plan details
   */
  getPlanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.service.getWorkoutPlanById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: plan,
      });
    } catch (err) {
      next(err);
    }
  };
}
