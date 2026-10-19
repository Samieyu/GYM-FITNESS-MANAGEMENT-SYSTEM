import { Pool, PoolClient } from 'pg';
import { pool } from '../../db/pool';

export interface MembershipRecord {
  id: string;
  member_id: string;
  plan_id: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  auto_renew: boolean;
  reminder_7d_sent: boolean;
  reminder_1d_sent: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined plan details if available
  plan_name?: string;
  plan_price?: number;
  duration_months?: number;
  plan_image_url?: string | null;
}

export interface PaymentRecord {
  id: string;
  member_id: string;
  membership_id: string | null;
  amount: number;
  currency: string;
  payment_method: 'chapa' | 'cash' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference: string;
  chapa_transaction_id: string | null;
  recorded_by_user_id: string | null;
  raw_response: any;
  created_at: Date;
  updated_at: Date;
  // Joined member details
  member_email?: string;
  member_first_name?: string;
  member_last_name?: string;
  plan_name?: string;
}

export class PaymentsRepository {
  private db: Pool = pool;

  async getClient(): Promise<PoolClient> {
    return this.db.connect();
  }

  // --- MEMBERSHIP METHODS ---

  async findActiveMembershipByMemberId(memberId: string, client?: PoolClient): Promise<MembershipRecord | null> {
    const runner = client || this.db;
    const query = `
      SELECT 
        m.*,
        p.name as plan_name,
        p.price as plan_price,
        p.duration_months,
        p.image_url as plan_image_url
      FROM memberships m
      JOIN membership_plans p ON m.plan_id = p.id
      WHERE m.member_id = $1 AND m.status = 'active' AND m.end_date >= CURRENT_DATE
      ORDER BY m.end_date DESC
      LIMIT 1;
    `;
    const res = await runner.query(query, [memberId]);
    return res.rows[0] ? this.mapMembership(res.rows[0]) : null;
  }

  async findMembershipById(membershipId: string, client?: PoolClient): Promise<MembershipRecord | null> {
    const runner = client || this.db;
    const query = `
      SELECT 
        m.*,
        p.name as plan_name,
        p.price as plan_price,
        p.duration_months,
        p.image_url as plan_image_url
      FROM memberships m
      JOIN membership_plans p ON m.plan_id = p.id
      WHERE m.id = $1;
    `;
    const res = await runner.query(query, [membershipId]);
    return res.rows[0] ? this.mapMembership(res.rows[0]) : null;
  }

  async createPendingMembership(
    memberId: string,
    planId: string,
    client?: PoolClient
  ): Promise<MembershipRecord> {
    const runner = client || this.db;
    const query = `
      INSERT INTO memberships (member_id, plan_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *;
    `;
    const res = await runner.query(query, [memberId, planId]);
    return this.mapMembership(res.rows[0]);
  }

  async activateMembership(
    membershipId: string,
    durationMonths: number,
    client?: PoolClient
  ): Promise<MembershipRecord> {
    const runner = client || this.db;
    const query = `
      UPDATE memberships
      SET 
        status = 'active',
        start_date = CURRENT_DATE,
        end_date = CURRENT_DATE + ($2 || ' month')::INTERVAL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const res = await runner.query(query, [membershipId, `${durationMonths}`]);
    return this.mapMembership(res.rows[0]);
  }

  async createAndActivateMembership(
    memberId: string,
    planId: string,
    durationMonths: number,
    client?: PoolClient
  ): Promise<MembershipRecord> {
    const runner = client || this.db;
    const query = `
      INSERT INTO memberships (member_id, plan_id, status, start_date, end_date)
      VALUES (
        $1, 
        $2, 
        'active', 
        CURRENT_DATE, 
        CURRENT_DATE + ($3 || ' month')::INTERVAL
      )
      RETURNING *;
    `;
    const res = await runner.query(query, [memberId, planId, `${durationMonths}`]);
    return this.mapMembership(res.rows[0]);
  }

  // --- PAYMENT METHODS ---

  async createPayment(
    data: {
      memberId: string;
      membershipId: string | null;
      amount: number;
      currency?: string;
      paymentMethod: 'chapa' | 'cash' | 'bank_transfer';
      status?: 'pending' | 'completed' | 'failed' | 'refunded';
      paymentReference: string;
      recordedByUserId?: string | null;
      rawResponse?: any;
    },
    client?: PoolClient
  ): Promise<PaymentRecord> {
    const runner = client || this.db;
    const query = `
      INSERT INTO payments (
        member_id,
        membership_id,
        amount,
        currency,
        payment_method,
        status,
        payment_reference,
        recorded_by_user_id,
        raw_response
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const res = await runner.query(query, [
      data.memberId,
      data.membershipId,
      data.amount,
      data.currency || 'ETB',
      data.paymentMethod,
      data.status || 'pending',
      data.paymentReference,
      data.recordedByUserId || null,
      data.rawResponse ? JSON.stringify(data.rawResponse) : null,
    ]);
    return this.mapPayment(res.rows[0]);
  }

  async findPaymentByReference(reference: string, client?: PoolClient): Promise<PaymentRecord | null> {
    const runner = client || this.db;
    const query = `
      SELECT 
        p.*,
        u.email as member_email,
        u.first_name as member_first_name,
        u.last_name as member_last_name,
        mp.name as plan_name,
        m.plan_id
      FROM payments p
      JOIN users u ON p.member_id = u.id
      LEFT JOIN memberships m ON p.membership_id = m.id
      LEFT JOIN membership_plans mp ON m.plan_id = mp.id
      WHERE p.payment_reference = $1;
    `;
    const res = await runner.query(query, [reference]);
    return res.rows[0] ? this.mapPayment(res.rows[0]) : null;
  }

  async findPaymentById(id: string, client?: PoolClient): Promise<PaymentRecord | null> {
    const runner = client || this.db;
    const query = `
      SELECT p.*
      FROM payments p
      WHERE p.id = $1;
    `;
    const res = await runner.query(query, [id]);
    return res.rows[0] ? this.mapPayment(res.rows[0]) : null;
  }

  async updatePaymentStatus(
    paymentId: string,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    chapaTransactionId?: string | null,
    rawResponse?: any,
    client?: PoolClient
  ): Promise<PaymentRecord> {
    const runner = client || this.db;
    const query = `
      UPDATE payments
      SET 
        status = $2,
        chapa_transaction_id = COALESCE($3, chapa_transaction_id),
        raw_response = COALESCE($4, raw_response),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const res = await runner.query(query, [
      paymentId,
      status,
      chapaTransactionId || null,
      rawResponse ? JSON.stringify(rawResponse) : null,
    ]);
    return this.mapPayment(res.rows[0]);
  }

  async findPaymentsByMemberId(memberId: string): Promise<PaymentRecord[]> {
    const query = `
      SELECT 
        p.*,
        mp.name as plan_name
      FROM payments p
      LEFT JOIN memberships m ON p.membership_id = m.id
      LEFT JOIN membership_plans mp ON m.plan_id = mp.id
      WHERE p.member_id = $1
      ORDER BY p.created_at DESC;
    `;
    const res = await this.db.query(query, [memberId]);
    return res.rows.map((row) => this.mapPayment(row));
  }

  async findAllPayments(options: {
    page: number;
    limit: number;
    status?: string;
    paymentMethod?: string;
  }): Promise<{ payments: PaymentRecord[]; total: number }> {
    const offset = (options.page - 1) * options.limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (options.status) {
      conditions.push(`p.status = $${idx++}`);
      values.push(options.status);
    }
    if (options.paymentMethod) {
      conditions.push(`p.payment_method = $${idx++}`);
      values.push(options.paymentMethod);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM payments p ${whereClause};`;
    const countRes = await this.db.query(countQuery, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const listQuery = `
      SELECT 
        p.*,
        u.email as member_email,
        u.first_name as member_first_name,
        u.last_name as member_last_name,
        mp.name as plan_name
      FROM payments p
      JOIN users u ON p.member_id = u.id
      LEFT JOIN memberships m ON p.membership_id = m.id
      LEFT JOIN membership_plans mp ON m.plan_id = mp.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;
    const listRes = await this.db.query(listQuery, [...values, options.limit, offset]);

    return {
      payments: listRes.rows.map((row) => this.mapPayment(row)),
      total,
    };
  }

  // --- AUDIT & UTILITY METHODS ---

  async recordAuditLog(
    audit: {
      userId?: string | null;
      action: string;
      entityName: string;
      entityId?: string | null;
      oldValues?: any;
      newValues?: any;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
    client?: PoolClient
  ): Promise<void> {
    const runner = client || this.db;
    const query = `
      INSERT INTO audit_logs (
        user_id,
        action,
        entity_name,
        entity_id,
        old_values,
        new_values,
        ip_address,
        user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;
    await runner.query(query, [
      audit.userId || null,
      audit.action,
      audit.entityName,
      audit.entityId || null,
      audit.oldValues ? JSON.stringify(audit.oldValues) : null,
      audit.newValues ? JSON.stringify(audit.newValues) : null,
      audit.ipAddress || null,
      audit.userAgent || null,
    ]);
  }

  async findPlanById(planId: string): Promise<any | null> {
    const query = `SELECT * FROM membership_plans WHERE id = $1;`;
    const res = await this.db.query(query, [planId]);
    return res.rows[0] || null;
  }

  async findUserById(userId: string): Promise<any | null> {
    const query = `SELECT id, email, first_name, last_name, role, is_active, is_verified FROM users WHERE id = $1;`;
    const res = await this.db.query(query, [userId]);
    return res.rows[0] || null;
  }

  private mapMembership(row: any): MembershipRecord {
    return {
      id: row.id,
      member_id: row.member_id,
      plan_id: row.plan_id,
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      auto_renew: row.auto_renew,
      reminder_7d_sent: row.reminder_7d_sent,
      reminder_1d_sent: row.reminder_1d_sent,
      created_at: row.created_at,
      updated_at: row.updated_at,
      plan_name: row.plan_name,
      plan_price: row.plan_price ? parseFloat(row.plan_price) : undefined,
      duration_months: row.duration_months ? parseInt(row.duration_months, 10) : undefined,
      plan_image_url: row.plan_image_url,
    };
  }

  private mapPayment(row: any): PaymentRecord {
    return {
      id: row.id,
      member_id: row.member_id,
      membership_id: row.membership_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      payment_method: row.payment_method,
      status: row.status,
      payment_reference: row.payment_reference,
      chapa_transaction_id: row.chapa_transaction_id,
      recorded_by_user_id: row.recorded_by_user_id,
      raw_response: row.raw_response,
      created_at: row.created_at,
      updated_at: row.updated_at,
      member_email: row.member_email,
      member_first_name: row.member_first_name,
      member_last_name: row.member_last_name,
      plan_name: row.plan_name,
    };
  }
}
