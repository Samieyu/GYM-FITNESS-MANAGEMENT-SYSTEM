import { PoolClient } from 'pg';
import { pool } from '../../db/pool';

export interface UserRecord {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  is_verified: boolean;
  is_active: boolean;
}

export interface PlanRecord {
  id: string;
  name: string;
  price: string;
  duration_months: number;
  is_active: boolean;
}

export interface MembershipRecord {
  id: string;
  member_id: string;
  plan_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  plan_name?: string;
  duration_months?: number;
}

export interface PaymentRecord {
  id: string;
  member_id: string;
  membership_id: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  payment_reference: string;
  created_at: Date;
}

export class ReceptionRepository {
  async getClient(): Promise<PoolClient> {
    return pool.connect();
  }

  async findUserByEmail(email: string, client?: PoolClient): Promise<UserRecord | null> {
    const query = `
      SELECT id, email, role, first_name, last_name, phone, is_verified, is_active
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;
    const res = client ? await client.query(query, [email]) : await pool.query(query, [email]);
    return res.rows[0] || null;
  }

  async findPlanById(planId: string, client?: PoolClient): Promise<PlanRecord | null> {
    const query = `
      SELECT id, name, price, duration_months, is_active
      FROM membership_plans
      WHERE id = $1
      LIMIT 1;
    `;
    const res = client ? await client.query(query, [planId]) : await pool.query(query, [planId]);
    return res.rows[0] || null;
  }

  async findActiveMembershipByMemberId(
    memberId: string,
    client?: PoolClient
  ): Promise<MembershipRecord | null> {
    const query = `
      SELECT m.id, m.member_id, m.plan_id, m.status, m.start_date, m.end_date, p.name as plan_name
      FROM memberships m
      JOIN membership_plans p ON m.plan_id = p.id
      WHERE m.member_id = $1 AND m.status = 'active'
      LIMIT 1;
    `;
    const res = client ? await client.query(query, [memberId]) : await pool.query(query, [memberId]);
    return res.rows[0] || null;
  }

  async createUser(
    data: {
      email: string;
      passwordHash: string;
      role: 'member';
      firstName: string;
      lastName: string;
      phone: string;
      isVerified: boolean;
    },
    client: PoolClient
  ): Promise<UserRecord> {
    const query = `
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      RETURNING id, email, role, first_name, last_name, phone, is_verified, is_active;
    `;
    const res = await client.query(query, [
      data.email.toLowerCase(),
      data.passwordHash,
      data.role,
      data.firstName,
      data.lastName,
      data.phone,
      data.isVerified,
    ]);
    return res.rows[0];
  }

  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
    client: PoolClient
  ): Promise<void> {
    const query = `
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES ($1, $2, $3);
    `;
    await client.query(query, [userId, token, expiresAt]);
  }

  async createMemberProfile(
    data: {
      userId: string;
      memberCode: string;
      emergencyContact?: string;
      fitnessGoals?: string;
      assignedTrainerId?: string;
    },
    client: PoolClient
  ): Promise<void> {
    const query = `
      INSERT INTO member_profiles (user_id, member_code, emergency_contact, fitness_goals, assigned_trainer_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        emergency_contact = COALESCE(EXCLUDED.emergency_contact, member_profiles.emergency_contact),
        fitness_goals = COALESCE(EXCLUDED.fitness_goals, member_profiles.fitness_goals),
        assigned_trainer_id = COALESCE(EXCLUDED.assigned_trainer_id, member_profiles.assigned_trainer_id);
    `;
    await client.query(query, [
      data.userId,
      data.memberCode,
      data.emergencyContact || null,
      data.fitnessGoals || null,
      data.assignedTrainerId || null,
    ]);
  }

  async createAndActivateMembership(
    memberId: string,
    planId: string,
    durationMonths: number,
    client: PoolClient
  ): Promise<MembershipRecord> {
    const query = `
      INSERT INTO memberships (member_id, plan_id, status, start_date, end_date)
      VALUES ($1, $2, 'active', CURRENT_DATE, CURRENT_DATE + ($3 || ' months')::INTERVAL)
      RETURNING id, member_id, plan_id, status, start_date, end_date;
    `;
    const res = await client.query(query, [memberId, planId, durationMonths]);
    return res.rows[0];
  }

  async createPayment(
    data: {
      memberId: string;
      membershipId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      status: string;
      paymentReference: string;
      recordedByUserId: string;
      rawResponse?: any;
    },
    client: PoolClient
  ): Promise<PaymentRecord> {
    const query = `
      INSERT INTO payments (
        member_id, membership_id, amount, currency, payment_method, 
        status, payment_reference, recorded_by_user_id, raw_response
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, member_id, membership_id, amount, currency, payment_method, status, payment_reference, created_at;
    `;
    const res = await client.query(query, [
      data.memberId,
      data.membershipId,
      data.amount,
      data.currency,
      data.paymentMethod,
      data.status,
      data.paymentReference,
      data.recordedByUserId,
      data.rawResponse ? JSON.stringify(data.rawResponse) : null,
    ]);
    return res.rows[0];
  }

  async recordAuditLog(
    data: {
      userId: string;
      action: string;
      entityType: string;
      entityId: string;
      newValues: any;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
    client: PoolClient
  ): Promise<void> {
    const query = `
      INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, new_values, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    await client.query(query, [
      data.userId,
      data.action,
      data.entityType,
      data.entityId,
      JSON.stringify(data.newValues),
      data.ipAddress || null,
      data.userAgent || null,
    ]);
  }
}
