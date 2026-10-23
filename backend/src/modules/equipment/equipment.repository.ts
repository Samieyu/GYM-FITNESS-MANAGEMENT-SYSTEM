import { pool } from '../../db/pool';

export interface EquipmentItem {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string | null;
  status: 'operational' | 'faulty' | 'maintenance' | 'decommissioned';
  last_service_date: string | null;
  next_service_due: string | null;
  open_reports_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EquipmentReportItem {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_code?: string;
  equipment_location?: string;
  reported_by_user_id: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_role?: string;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at: string | null;
}

export interface MaintenanceLogItem {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_code?: string;
  equipment_category?: string;
  serviced_by: string;
  cost: number;
  description: string;
  service_date: string;
  next_service_due: string | null;
  created_at: string;
}

export class EquipmentRepository {
  async getAllEquipment(filters: { search?: string; status?: string; category?: string } = {}): Promise<EquipmentItem[]> {
    let query = `
      SELECT 
        e.*,
        COALESCE(r.open_reports_count, 0)::int as open_reports_count
      FROM equipment e
      LEFT JOIN (
        SELECT equipment_id, COUNT(*) as open_reports_count
        FROM equipment_reports
        WHERE status != 'resolved'
        GROUP BY equipment_id
      ) r ON r.equipment_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (e.name ILIKE $${params.length} OR e.code ILIKE $${params.length} OR e.location ILIKE $${params.length})`;
    }

    if (filters.status && filters.status !== 'all') {
      params.push(filters.status);
      query += ` AND e.status = $${params.length}`;
    }

    if (filters.category && filters.category !== 'all') {
      params.push(filters.category);
      query += ` AND e.category = $${params.length}`;
    }

    query += ` ORDER BY e.name ASC`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async getEquipmentById(id: string): Promise<EquipmentItem | null> {
    const res = await pool.query(`SELECT * FROM equipment WHERE id = $1`, [id]);
    return res.rows[0] || null;
  }

  async getEquipmentByCode(code: string): Promise<EquipmentItem | null> {
    const res = await pool.query(`SELECT * FROM equipment WHERE code = $1`, [code]);
    return res.rows[0] || null;
  }

  async createEquipment(data: {
    name: string;
    code: string;
    category: string;
    location?: string;
    status?: string;
    last_service_date?: string | null;
    next_service_due?: string | null;
  }): Promise<EquipmentItem> {
    const res = await pool.query(
      `
      INSERT INTO equipment (name, code, category, location, status, last_service_date, next_service_due)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        data.name,
        data.code,
        data.category,
        data.location || 'Main Gym Floor',
        data.status || 'operational',
        data.last_service_date || null,
        data.next_service_due || null,
      ]
    );
    return res.rows[0];
  }

  async updateEquipment(
    id: string,
    data: {
      name?: string;
      code?: string;
      category?: string;
      location?: string;
      status?: string;
      last_service_date?: string | null;
      next_service_due?: string | null;
    }
  ): Promise<EquipmentItem | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      values.push(data.name);
      fields.push(`name = $${values.length}`);
    }
    if (data.code !== undefined) {
      values.push(data.code);
      fields.push(`code = $${values.length}`);
    }
    if (data.category !== undefined) {
      values.push(data.category);
      fields.push(`category = $${values.length}`);
    }
    if (data.location !== undefined) {
      values.push(data.location);
      fields.push(`location = $${values.length}`);
    }
    if (data.status !== undefined) {
      values.push(data.status);
      fields.push(`status = $${values.length}`);
    }
    if (data.last_service_date !== undefined) {
      values.push(data.last_service_date);
      fields.push(`last_service_date = $${values.length}`);
    }
    if (data.next_service_due !== undefined) {
      values.push(data.next_service_due);
      fields.push(`next_service_due = $${values.length}`);
    }

    if (fields.length === 0) {
      return this.getEquipmentById(id);
    }

    values.push(id);
    const query = `
      UPDATE equipment
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      RETURNING *
    `;

    const res = await pool.query(query, values);
    return res.rows[0] || null;
  }

  async deleteEquipment(id: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM equipment WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async createReport(data: {
    equipment_id: string;
    reported_by_user_id: string;
    issue_description: string;
    priority: string;
  }): Promise<EquipmentReportItem> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const reportRes = await client.query(
        `
        INSERT INTO equipment_reports (equipment_id, reported_by_user_id, issue_description, priority, status)
        VALUES ($1, $2, $3, $4, 'open')
        RETURNING *
        `,
        [data.equipment_id, data.reported_by_user_id, data.issue_description, data.priority]
      );

      // If report is critical or high, automatically update equipment status to 'faulty'
      if (data.priority === 'critical' || data.priority === 'high') {
        await client.query(
          `
          UPDATE equipment
          SET status = 'faulty', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND status != 'decommissioned'
          `,
          [data.equipment_id]
        );
      }

      await client.query('COMMIT');
      return reportRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAllReports(filters: { status?: string; equipment_id?: string } = {}): Promise<EquipmentReportItem[]> {
    let query = `
      SELECT 
        r.*,
        e.name as equipment_name,
        e.code as equipment_code,
        e.location as equipment_location,
        TRIM(CONCAT(u.first_name, ' ', u.last_name)) as reporter_name,
        u.email as reporter_email,
        u.role as reporter_role
      FROM equipment_reports r
      JOIN equipment e ON e.id = r.equipment_id
      JOIN users u ON u.id = r.reported_by_user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.status && filters.status !== 'all') {
      params.push(filters.status);
      query += ` AND r.status = $${params.length}`;
    }

    if (filters.equipment_id) {
      params.push(filters.equipment_id);
      query += ` AND r.equipment_id = $${params.length}`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async updateReportStatus(id: string, status: 'open' | 'in_progress' | 'resolved'): Promise<EquipmentReportItem | null> {
    const resolvedAt = status === 'resolved' ? new Date().toISOString() : null;
    const res = await pool.query(
      `
      UPDATE equipment_reports
      SET status = $1, resolved_at = $2
      WHERE id = $3
      RETURNING *
      `,
      [status, resolvedAt, id]
    );
    return res.rows[0] || null;
  }

  async createMaintenanceLog(data: {
    equipment_id: string;
    serviced_by: string;
    cost: number;
    description: string;
    service_date?: string;
    next_service_due?: string | null;
    resolve_report_id?: string | null;
  }): Promise<MaintenanceLogItem> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const serviceDate = data.service_date || new Date().toISOString().split('T')[0];

      const logRes = await client.query(
        `
        INSERT INTO equipment_maintenance_logs (equipment_id, serviced_by, cost, description, service_date, next_service_due)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [data.equipment_id, data.serviced_by, data.cost, data.description, serviceDate, data.next_service_due || null]
      );

      // Restore equipment status to operational and update service dates
      await client.query(
        `
        UPDATE equipment
        SET 
          status = 'operational',
          last_service_date = $1,
          next_service_due = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        `,
        [serviceDate, data.next_service_due || null, data.equipment_id]
      );

      // If a linked report ID was provided, mark it as resolved
      if (data.resolve_report_id) {
        await client.query(
          `
          UPDATE equipment_reports
          SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
          WHERE id = $1
          `,
          [data.resolve_report_id]
        );
      }

      await client.query('COMMIT');
      return logRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getMaintenanceLogs(equipment_id?: string): Promise<MaintenanceLogItem[]> {
    let query = `
      SELECT 
        l.*,
        e.name as equipment_name,
        e.code as equipment_code,
        e.category as equipment_category
      FROM equipment_maintenance_logs l
      JOIN equipment e ON e.id = l.equipment_id
    `;
    const params: any[] = [];

    if (equipment_id) {
      params.push(equipment_id);
      query += ` WHERE l.equipment_id = $1`;
    }

    query += ` ORDER BY l.service_date DESC, l.created_at DESC`;

    const res = await pool.query(query, params);
    return res.rows;
  }

  async seedDefaultEquipmentIfEmpty(): Promise<void> {
    const checkRes = await pool.query(`SELECT COUNT(*) FROM equipment`);
    if (parseInt(checkRes.rows[0].count, 10) > 0) {
      return;
    }

    const defaultItems = [
      {
        name: 'Life Fitness Pro Treadmill Alpha',
        code: 'EQ-TRD-01',
        category: 'Cardio',
        location: 'Cardio Deck - Zone A',
        status: 'operational',
        last_service_date: '2026-08-15',
        next_service_due: '2026-11-15',
      },
      {
        name: 'Hammer Strength Olympic Squat Rack',
        code: 'EQ-SQR-01',
        category: 'Strength / Free Weights',
        location: 'Free Weights Area',
        status: 'operational',
        last_service_date: '2026-07-01',
        next_service_due: '2026-12-01',
      },
      {
        name: 'Dual Cable Cross Machine 360',
        code: 'EQ-CBL-01',
        category: 'Cable Machines',
        location: 'Main Gym Floor - Zone B',
        status: 'operational',
        last_service_date: '2026-09-10',
        next_service_due: '2026-12-10',
      },
      {
        name: 'Leg Press 45-Degree Super Incline',
        code: 'EQ-LGP-01',
        category: 'Strength / Lower Body',
        location: 'Leg Conditioning Zone',
        status: 'faulty',
        last_service_date: '2026-05-20',
        next_service_due: '2026-08-20',
      },
      {
        name: 'Concept2 Indoor Rowing Ergometer',
        code: 'EQ-ROW-01',
        category: 'Cardio / HIIT',
        location: 'Cardio Deck - Zone C',
        status: 'operational',
        last_service_date: '2026-08-01',
        next_service_due: '2026-11-01',
      },
      {
        name: 'Urethane Dumbbell Set (2.5kg - 50kg)',
        code: 'EQ-DMB-01',
        category: 'Free Weights',
        location: 'Free Weights Area',
        status: 'operational',
        last_service_date: '2026-06-15',
        next_service_due: '2026-12-15',
      },
    ];

    for (const item of defaultItems) {
      await pool.query(
        `
        INSERT INTO equipment (name, code, category, location, status, last_service_date, next_service_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (code) DO NOTHING
        `,
        [item.name, item.code, item.category, item.location, item.status, item.last_service_date, item.next_service_due]
      );
    }
  }
}
