import { query, pool } from '../../db/pool';

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment_needed: string | null;
  description: string | null;
  instructions: string | null;
  gif_or_image_url: string | null;
  created_at: Date;
}

export interface WorkoutExerciseRecord {
  id: string;
  workout_plan_id: string;
  exercise_id: string;
  exercise_name: string;
  category: string;
  muscle_group: string;
  equipment_needed: string | null;
  day_of_week: number;
  sets: number;
  reps: number;
  rest_seconds: number | null;
  notes: string | null;
  order_index: number;
}

export interface WorkoutPlanRecord {
  id: string;
  member_id: string;
  trainer_id: string | null;
  title: string;
  description: string | null;
  status: 'draft' | 'approved' | 'archived';
  is_ai_generated: boolean;
  approved_by_trainer_id: string | null;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  member_first_name?: string;
  member_last_name?: string;
  member_email?: string;
  trainer_first_name?: string;
  trainer_last_name?: string;
  exercises?: WorkoutExerciseRecord[];
}

export class WorkoutsRepository {
  /**
   * Get all exercises from the library
   */
  async getAllExercises(): Promise<ExerciseLibraryItem[]> {
    const res = await query(
      `SELECT id, name, category, muscle_group, equipment_needed, description, instructions, gif_or_image_url, created_at
       FROM exercise_library
       ORDER BY category ASC, name ASC`
    );
    return res.rows;
  }

  /**
   * Find exercise by name (or return null)
   */
  async findExerciseByName(name: string): Promise<ExerciseLibraryItem | null> {
    const res = await query(
      `SELECT * FROM exercise_library WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name]
    );
    return res.rows[0] || null;
  }

  /**
   * Find trainer ID by user_id
   */
  async findTrainerByUserId(userId: string): Promise<{ id: string } | null> {
    const res = await query(
      `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  /**
   * Find member profile to get assigned trainer
   */
  async findMemberProfile(userId: string): Promise<{ assigned_trainer_id: string | null } | null> {
    const res = await query(
      `SELECT assigned_trainer_id FROM member_profiles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  /**
   * Find member's active approved workout routine with exercises
   */
  async findActiveWorkoutPlan(memberId: string): Promise<WorkoutPlanRecord | null> {
    const res = await query(
      `SELECT 
         wp.*,
         u.first_name AS member_first_name,
         u.last_name AS member_last_name,
         u.email AS member_email,
         tu.first_name AS trainer_first_name,
         tu.last_name AS trainer_last_name
       FROM workout_plans wp
       JOIN users u ON wp.member_id = u.id
       LEFT JOIN trainers t ON wp.approved_by_trainer_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       WHERE wp.member_id = $1 AND wp.status = 'approved'
       ORDER BY wp.updated_at DESC
       LIMIT 1`,
      [memberId]
    );

    if (res.rows.length === 0) return null;
    const plan = res.rows[0];
    plan.exercises = await this.getExercisesForPlan(plan.id);
    return plan;
  }

  /**
   * Find all plans for a member
   */
  async findPlansByMemberId(memberId: string): Promise<WorkoutPlanRecord[]> {
    const res = await query(
      `SELECT 
         wp.*,
         u.first_name AS member_first_name,
         u.last_name AS member_last_name,
         u.email AS member_email,
         tu.first_name AS trainer_first_name,
         tu.last_name AS trainer_last_name
       FROM workout_plans wp
       JOIN users u ON wp.member_id = u.id
       LEFT JOIN trainers t ON wp.approved_by_trainer_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       WHERE wp.member_id = $1
       ORDER BY wp.created_at DESC`,
      [memberId]
    );

    const plans = res.rows;
    for (const plan of plans) {
      plan.exercises = await this.getExercisesForPlan(plan.id);
    }
    return plans;
  }

  /**
   * Find a specific workout plan by ID with exercises
   */
  async findPlanById(planId: string): Promise<WorkoutPlanRecord | null> {
    const res = await query(
      `SELECT 
         wp.*,
         u.first_name AS member_first_name,
         u.last_name AS member_last_name,
         u.email AS member_email,
         tu.first_name AS trainer_first_name,
         tu.last_name AS trainer_last_name
       FROM workout_plans wp
       JOIN users u ON wp.member_id = u.id
       LEFT JOIN trainers t ON wp.approved_by_trainer_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       WHERE wp.id = $1`,
      [planId]
    );

    if (res.rows.length === 0) return null;
    const plan = res.rows[0];
    plan.exercises = await this.getExercisesForPlan(plan.id);
    return plan;
  }

  /**
   * Find pending draft workout plans awaiting trainer approval (Business Rule 11)
   */
  async findPendingDraftPlans(): Promise<WorkoutPlanRecord[]> {
    const res = await query(
      `SELECT 
         wp.*,
         u.first_name AS member_first_name,
         u.last_name AS member_last_name,
         u.email AS member_email
       FROM workout_plans wp
       JOIN users u ON wp.member_id = u.id
       WHERE wp.status = 'draft'
       ORDER BY wp.created_at DESC`
    );

    const plans = res.rows;
    for (const plan of plans) {
      plan.exercises = await this.getExercisesForPlan(plan.id);
    }
    return plans;
  }

  /**
   * Find all plans across the gym (Trainers and Admins)
   */
  async findAllPlans(): Promise<WorkoutPlanRecord[]> {
    const res = await query(
      `SELECT 
         wp.*,
         u.first_name AS member_first_name,
         u.last_name AS member_last_name,
         u.email AS member_email,
         tu.first_name AS trainer_first_name,
         tu.last_name AS trainer_last_name
       FROM workout_plans wp
       JOIN users u ON wp.member_id = u.id
       LEFT JOIN trainers t ON wp.approved_by_trainer_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       ORDER BY wp.created_at DESC`
    );

    const plans = res.rows;
    for (const plan of plans) {
      plan.exercises = await this.getExercisesForPlan(plan.id);
    }
    return plans;
  }

  /**
   * Helper: Get all exercises for a plan
   */
  async getExercisesForPlan(planId: string): Promise<WorkoutExerciseRecord[]> {
    const res = await query(
      `SELECT 
         we.id,
         we.workout_plan_id,
         we.exercise_id,
         el.name AS exercise_name,
         el.category,
         el.muscle_group,
         el.equipment_needed,
         we.day_of_week,
         we.sets,
         we.reps,
         we.rest_seconds,
         we.notes,
         we.order_index
       FROM workout_exercises we
       JOIN exercise_library el ON we.exercise_id = el.id
       WHERE we.workout_plan_id = $1
       ORDER BY we.day_of_week ASC, we.order_index ASC`,
      [planId]
    );
    return res.rows;
  }

  /**
   * Transactional creation of a new workout plan with exercises
   */
  async createWorkoutPlan(params: {
    memberId: string;
    trainerId?: string | null;
    title: string;
    description?: string;
    status: 'draft' | 'approved';
    isAiGenerated: boolean;
    approvedByTrainerId?: string | null;
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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If status is approved, archive any existing approved plan for this member
      if (params.status === 'approved') {
        await client.query(
          `UPDATE workout_plans 
           SET status = 'archived', updated_at = CURRENT_TIMESTAMP 
           WHERE member_id = $1 AND status = 'approved'`,
          [params.memberId]
        );
      }

      const planRes = await client.query(
        `INSERT INTO workout_plans (
           member_id, 
           trainer_id, 
           title, 
           description, 
           status, 
           is_ai_generated, 
           approved_by_trainer_id, 
           approved_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          params.memberId,
          params.trainerId || null,
          params.title,
          params.description || null,
          params.status,
          params.isAiGenerated,
          params.approvedByTrainerId || null,
          params.status === 'approved' ? new Date() : null,
        ]
      );

      const createdPlan = planRes.rows[0];

      // Insert exercises
      for (const ex of params.exercises) {
        await client.query(
          `INSERT INTO workout_exercises (
             workout_plan_id, 
             exercise_id, 
             day_of_week, 
             sets, 
             reps, 
             rest_seconds, 
             notes, 
             order_index
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            createdPlan.id,
            ex.exerciseId,
            ex.dayOfWeek,
            ex.sets,
            ex.reps,
            ex.restSeconds || 60,
            ex.notes || null,
            ex.orderIndex,
          ]
        );
      }

      await client.query('COMMIT');
      return (await this.findPlanById(createdPlan.id))!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Business Rule 11: Trainer approves draft routine and activates it
   */
  async approveWorkoutPlan(planId: string, trainerId: string | null): Promise<WorkoutPlanRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Retrieve plan to get member_id
      const checkRes = await client.query(
        `SELECT member_id FROM workout_plans WHERE id = $1`,
        [planId]
      );
      if (checkRes.rows.length === 0) {
        throw new Error('Workout plan not found');
      }
      const memberId = checkRes.rows[0].member_id;

      // Archive any existing approved plan
      await client.query(
        `UPDATE workout_plans 
         SET status = 'archived', updated_at = CURRENT_TIMESTAMP 
         WHERE member_id = $1 AND status = 'approved'`,
        [memberId]
      );

      // Approve and activate target plan
      await client.query(
        `UPDATE workout_plans 
         SET status = 'approved', 
             approved_by_trainer_id = $1, 
             approved_at = CURRENT_TIMESTAMP, 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [trainerId || null, planId]
      );

      await client.query('COMMIT');
      return (await this.findPlanById(planId))!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update plan details or status
   */
  async updatePlan(planId: string, fields: { title?: string; description?: string }): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (fields.title) {
      sets.push(`title = $${idx++}`);
      values.push(fields.title);
    }
    if (fields.description !== undefined) {
      sets.push(`description = $${idx++}`);
      values.push(fields.description);
    }
    sets.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(planId);

    await query(
      `UPDATE workout_plans SET ${sets.join(', ')} WHERE id = $${idx}`,
      values
    );
  }
}
