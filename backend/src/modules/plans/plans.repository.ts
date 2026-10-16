import { query } from '../../db/pool';

export interface MembershipPlanRow {
  id: string;
  name: string;
  description: string | null;
  duration_months: number;
  price: string; // pg numeric returns string
  image_url: string | null;
  is_active: boolean;
  created_by_admin_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export class PlansRepository {
  async findAll(activeOnly = true): Promise<MembershipPlanRow[]> {
    const sql = activeOnly
      ? 'SELECT * FROM membership_plans WHERE is_active = true ORDER BY duration_months ASC, price ASC;'
      : 'SELECT * FROM membership_plans ORDER BY is_active DESC, duration_months ASC, price ASC;';
    const res = await query<MembershipPlanRow>(sql);
    return res.rows;
  }

  async findById(id: string): Promise<MembershipPlanRow | null> {
    const res = await query<MembershipPlanRow>(
      'SELECT * FROM membership_plans WHERE id = $1 LIMIT 1;',
      [id]
    );
    return res.rows[0] || null;
  }

  async findByName(name: string): Promise<MembershipPlanRow | null> {
    const res = await query<MembershipPlanRow>(
      'SELECT * FROM membership_plans WHERE LOWER(name) = LOWER($1) LIMIT 1;',
      [name]
    );
    return res.rows[0] || null;
  }

  async createPlan(data: {
    name: string;
    description?: string | null;
    durationMonths: number;
    price: number;
    imageUrl?: string | null;
    isActive?: boolean;
    createdByAdminId?: string | null;
  }): Promise<MembershipPlanRow> {
    const res = await query<MembershipPlanRow>(
      `
      INSERT INTO membership_plans (name, description, duration_months, price, image_url, is_active, created_by_admin_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `,
      [
        data.name.trim(),
        data.description || null,
        data.durationMonths,
        data.price,
        data.imageUrl || null,
        data.isActive !== undefined ? data.isActive : true,
        data.createdByAdminId || null,
      ]
    );
    return res.rows[0];
  }

  async updatePlan(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      durationMonths?: number;
      price?: number;
      imageUrl?: string | null;
      isActive?: boolean;
    }
  ): Promise<MembershipPlanRow | null> {
    const current = await this.findById(id);
    if (!current) return null;

    const name = data.name !== undefined ? data.name.trim() : current.name;
    const description = data.description !== undefined ? data.description : current.description;
    const durationMonths = data.durationMonths !== undefined ? data.durationMonths : current.duration_months;
    const price = data.price !== undefined ? data.price : parseFloat(current.price);
    const imageUrl = data.imageUrl !== undefined ? data.imageUrl : current.image_url;
    const isActive = data.isActive !== undefined ? data.isActive : current.is_active;

    const res = await query<MembershipPlanRow>(
      `
      UPDATE membership_plans
      SET name = $1, description = $2, duration_months = $3, price = $4, image_url = $5, is_active = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `,
      [name, description, durationMonths, price, imageUrl, isActive, id]
    );

    return res.rows[0] || null;
  }

  async recordAuditLog(log: {
    userId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string | null;
  }): Promise<void> {
    await query(
      `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
      [
        log.userId,
        log.action,
        log.entityType,
        log.entityId,
        log.oldValues ? JSON.stringify(log.oldValues) : null,
        log.newValues ? JSON.stringify(log.newValues) : null,
        log.ipAddress || null,
      ]
    );
  }
}

export const plansRepository = new PlansRepository();
