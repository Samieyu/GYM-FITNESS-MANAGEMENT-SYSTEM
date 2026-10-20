import { WorkoutsRepository, WorkoutPlanRecord, ExerciseLibraryItem } from './workouts.repository';
import { generateGeminiWorkoutPlan, AiGenerationRequest } from './workouts.service.ai';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../shared/errors/AppError';

export class WorkoutsService {
  private repo = new WorkoutsRepository();

  /**
   * Get all exercises in the library
   */
  async getExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
    return await this.repo.getAllExercises();
  }

  /**
   * Business Rule 10 & 11: Member requests AI-generated draft workout routine
   */
  async requestAiWorkoutPlan(
    memberUserId: string,
    params: AiGenerationRequest
  ): Promise<WorkoutPlanRecord> {
    // 1. Generate workout routine using Gemini AI (with sports-science fallback)
    const generated = await generateGeminiWorkoutPlan(params);

    // 2. Fetch available exercises in database
    const library = await this.repo.getAllExercises();
    if (library.length === 0) {
      throw new BadRequestError('Exercise library is currently empty. Please contact gym administration.');
    }

    // Lookup member's assigned trainer if any
    const profile = await this.repo.findMemberProfile(memberUserId);
    const assignedTrainerId = profile?.assigned_trainer_id || null;

    // 3. Match generated exercises with DB exercise_library
    const planExercises: Array<{
      exerciseId: string;
      dayOfWeek: number;
      sets: number;
      reps: number;
      restSeconds?: number;
      notes?: string;
      orderIndex: number;
    }> = [];

    const defaultExerciseId = library[0].id;

    for (const ex of generated.exercises) {
      // Find matching exercise by name (case-insensitive substring or exact match)
      const matched = library.find(
        (l) =>
          l.name.toLowerCase() === ex.exerciseName.toLowerCase() ||
          l.name.toLowerCase().includes(ex.exerciseName.toLowerCase()) ||
          ex.exerciseName.toLowerCase().includes(l.name.toLowerCase())
      );

      const exerciseId = matched ? matched.id : defaultExerciseId;

      planExercises.push({
        exerciseId,
        dayOfWeek: ex.dayOfWeek,
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        restSeconds: ex.restSeconds || 60,
        notes: ex.notes || `${ex.dayName} - Focus on proper form and control`,
        orderIndex: ex.orderIndex || planExercises.length + 1,
      });
    }

    // 4. Save workout plan in DRAFT status (Business Rule 11: Requires trainer approval before activation)
    const draftPlan = await this.repo.createWorkoutPlan({
      memberId: memberUserId,
      trainerId: assignedTrainerId,
      title: generated.title,
      description: generated.description,
      status: 'draft', // Strictly DRAFT until trainer approves
      isAiGenerated: true,
      exercises: planExercises,
    });

    return draftPlan;
  }

  /**
   * Business Rule 11: Trainer or Admin reviews and approves draft workout plan
   */
  async approveWorkoutPlan(
    planId: string,
    trainerUserId: string,
    userRole: string
  ): Promise<WorkoutPlanRecord> {
    // Rule 11: Members CANNOT approve their own routines
    if (userRole !== 'trainer' && userRole !== 'admin') {
      throw new ForbiddenError(
        'Business Rule 11: Only certified trainers or administrators can review and approve workout plans.'
      );
    }

    const plan = await this.repo.findPlanById(planId);
    if (!plan) {
      throw new NotFoundError('Workout plan not found');
    }

    // Lookup trainer ID from trainers table
    let trainerId: string | null = null;
    const trainerRecord = await this.repo.findTrainerByUserId(trainerUserId);
    if (trainerRecord) {
      trainerId = trainerRecord.id;
    } else if (plan.trainer_id) {
      trainerId = plan.trainer_id;
    }

    const approvedPlan = await this.repo.approveWorkoutPlan(planId, trainerId);
    return approvedPlan;
  }

  /**
   * Trainer creates custom workout plan directly
   */
  async createCustomWorkoutPlan(params: {
    memberId: string;
    trainerUserId: string;
    title: string;
    description?: string;
    status?: 'draft' | 'approved';
    exercises: Array<{
      exerciseId: string;
      dayOfWeek: number;
      sets: number;
      reps: number;
      restSeconds?: number;
      notes?: string;
      orderIndex: number;
    }>;
  }): Promise<WorkoutPlanRecord> {
    const trainerRecord = await this.repo.findTrainerByUserId(params.trainerUserId);
    const trainerId = trainerRecord?.id || null;

    const plan = await this.repo.createWorkoutPlan({
      memberId: params.memberId,
      trainerId,
      title: params.title,
      description: params.description,
      status: params.status || 'approved',
      isAiGenerated: false,
      approvedByTrainerId: params.status === 'draft' ? null : trainerId,
      exercises: params.exercises,
    });

    return plan;
  }

  /**
   * Get member's current active approved workout routine
   */
  async getMemberActiveWorkout(memberUserId: string): Promise<WorkoutPlanRecord | null> {
    return await this.repo.findActiveWorkoutPlan(memberUserId);
  }

  /**
   * Get member's workout plan history (drafts & previous active)
   */
  async getMemberWorkoutHistory(memberUserId: string): Promise<WorkoutPlanRecord[]> {
    return await this.repo.findPlansByMemberId(memberUserId);
  }

  /**
   * Trainer / Admin view of pending draft workout plans awaiting review
   */
  async getPendingDraftPlans(): Promise<WorkoutPlanRecord[]> {
    return await this.repo.findPendingDraftPlans();
  }

  /**
   * Trainer / Admin view of all gym workout plans
   */
  async getAllGymWorkoutPlans(): Promise<WorkoutPlanRecord[]> {
    return await this.repo.findAllPlans();
  }

  /**
   * Get single plan by ID
   */
  async getWorkoutPlanById(planId: string): Promise<WorkoutPlanRecord> {
    const plan = await this.repo.findPlanById(planId);
    if (!plan) {
      throw new NotFoundError('Workout plan not found');
    }
    return plan;
  }
}
