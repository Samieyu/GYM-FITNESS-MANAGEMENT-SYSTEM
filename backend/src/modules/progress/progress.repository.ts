import { pool } from '../../db/pool';

export interface ProgressMetricRecord {
  id: string;
  member_id: string;
  weight_kg: number;
  height_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  arms_cm: number | null;
  thighs_cm: number | null;
  body_fat_percentage: number | null;
  photo_url: string | null;
  trainer_comment: string | null;
  trainer_commented_by: string | null;
  trainer_commented_at: string | null;
  trainer_name?: string | null;
  trainer_specialization?: string | null;
  recorded_date: string;
  created_at: string;
  bmi?: number | null;
  bmi_category?: string | null;
}

export interface AssignedMemberSummary {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  member_code: string | null;
  fitness_goals: string | null;
  latest_weight_kg: number | null;
  latest_recorded_date: string | null;
  total_logs_count: number;
}

export class ProgressRepository {
  async logMetric(
    memberId: string,
    data: {
      weightKg: number;
      heightCm?: number;
      chestCm?: number;
      waistCm?: number;
      hipsCm?: number;
      armsCm?: number;
      thighsCm?: number;
      bodyFatPercentage?: number;
      photoUrl?: string;
      recordedDate?: string;
    }
  ): Promise<ProgressMetricRecord> {
    const query = `
      INSERT INTO progress_metrics (
        member_id,
        weight_kg,
        height_cm,
        chest_cm,
        waist_cm,
        hips_cm,
        arms_cm,
        thighs_cm,
        body_fat_percentage,
        photo_url,
        recorded_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::DATE, CURRENT_DATE))
      RETURNING *;
    `;
    const res = await pool.query(query, [
      memberId,
      data.weightKg,
      data.heightCm || null,
      data.chestCm || null,
      data.waistCm || null,
      data.hipsCm || null,
      data.armsCm || null,
      data.thighsCm || null,
      data.bodyFatPercentage || null,
      data.photoUrl || null,
      data.recordedDate || null,
    ]);
    return res.rows[0];
  }

  async getMemberMetrics(memberId: string): Promise<ProgressMetricRecord[]> {
    const query = `
      SELECT 
        pm.*,
        CONCAT(u.first_name, ' ', u.last_name) AS trainer_name,
        t.specialization AS trainer_specialization
      FROM progress_metrics pm
      LEFT JOIN trainers t ON pm.trainer_commented_by = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE pm.member_id = $1
      ORDER BY pm.recorded_date DESC, pm.created_at DESC;
    `;
    const res = await pool.query(query, [memberId]);
    return res.rows;
  }

  async getMetricById(metricId: string): Promise<any | null> {
    const query = `
      SELECT 
        pm.*,
        u.email AS member_email,
        u.first_name AS member_first_name,
        u.last_name AS member_last_name
      FROM progress_metrics pm
      JOIN users u ON pm.member_id = u.id
      WHERE pm.id = $1;
    `;
    const res = await pool.query(query, [metricId]);
    return res.rows[0] || null;
  }

  async addTrainerComment(
    metricId: string,
    trainerId: string,
    comment: string
  ): Promise<ProgressMetricRecord> {
    const query = `
      UPDATE progress_metrics
      SET 
        trainer_comment = $1,
        trainer_commented_by = $2,
        trainer_commented_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const res = await pool.query(query, [comment, trainerId, metricId]);
    return res.rows[0];
  }

  async getTrainerProfileByUserId(userId: string): Promise<{ id: string; specialization: string } | null> {
    const query = `SELECT id, specialization FROM trainers WHERE user_id = $1;`;
    const res = await pool.query(query, [userId]);
    return res.rows[0] || null;
  }

  async getAssignedMembersForTrainer(trainerId?: string): Promise<AssignedMemberSummary[]> {
    // If trainerId is provided, filter by assigned_trainer_id; if omitted (for Admin), return all members
    const filterClause = trainerId ? `WHERE mp.assigned_trainer_id = $1` : ``;
    const params = trainerId ? [trainerId] : [];

    const query = `
      SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        mp.member_code,
        mp.fitness_goals,
        latest.weight_kg AS latest_weight_kg,
        latest.recorded_date AS latest_recorded_date,
        COALESCE(log_counts.cnt, 0)::INT AS total_logs_count
      FROM users u
      JOIN member_profiles mp ON u.id = mp.user_id
      LEFT JOIN LATERAL (
        SELECT weight_kg, recorded_date 
        FROM progress_metrics 
        WHERE member_id = u.id 
        ORDER BY recorded_date DESC, created_at DESC 
        LIMIT 1
      ) latest ON true
      LEFT JOIN (
        SELECT member_id, COUNT(*) AS cnt 
        FROM progress_metrics 
        GROUP BY member_id
      ) log_counts ON log_counts.member_id = u.id
      ${filterClause}
      ORDER BY u.first_name ASC;
    `;
    const res = await pool.query(query, params);
    return res.rows;
  }
}
