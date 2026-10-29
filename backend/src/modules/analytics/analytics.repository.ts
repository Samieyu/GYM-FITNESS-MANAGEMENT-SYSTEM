import { pool } from '../../db/pool';

export interface FinancialOverview {
  totalRevenue: number;
  chapaRevenue: number;
  cashRevenue: number;
  bankTransferRevenue: number;
  successfulTransactions: number;
  activeMembershipsCount: number;
  maintenanceExpense: number;
  netMargin: number;
  revenueByMonth: Array<{ month: string; amount: number; transactions: number }>;
}

export interface AttendanceOverview {
  totalCheckins: number;
  grantedCount: number;
  deniedCount: number;
  denialRate: number;
  hourlyTraffic: Array<{ hour: number; count: number }>;
  topDenialReasons: Array<{ reason: string; count: number }>;
  topActiveMembers: Array<{ name: string; email: string; checkinCount: number }>;
}

export class AnalyticsRepository {
  async getFinancialOverview(): Promise<FinancialOverview> {
    // 1. Revenue metrics
    const revQuery = `
      SELECT 
        COALESCE(SUM(amount) FILTER (WHERE status = 'successful'), 0)::numeric as total_revenue,
        COALESCE(SUM(amount) FILTER (WHERE status = 'successful' AND payment_method = 'chapa'), 0)::numeric as chapa_revenue,
        COALESCE(SUM(amount) FILTER (WHERE status = 'successful' AND payment_method = 'cash'), 0)::numeric as cash_revenue,
        COALESCE(SUM(amount) FILTER (WHERE status = 'successful' AND payment_method = 'bank_transfer'), 0)::numeric as bank_revenue,
        COUNT(*) FILTER (WHERE status = 'successful')::int as successful_transactions
      FROM payments
    `;
    const revRes = await pool.query(revQuery);
    const revRow = revRes.rows[0];

    // 2. Active memberships count
    const memQuery = `SELECT COUNT(*)::int as active_count FROM memberships WHERE status = 'active'`;
    const memRes = await pool.query(memQuery);
    const activeMembershipsCount = memRes.rows[0].active_count;

    // 3. Maintenance total cost
    const maintQuery = `SELECT COALESCE(SUM(cost), 0)::numeric as total_cost FROM equipment_maintenance_logs`;
    const maintRes = await pool.query(maintQuery);
    const maintenanceExpense = Number(maintRes.rows[0].total_cost);

    // 4. Monthly revenue breakdown (last 6 months)
    const monthQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COALESCE(SUM(amount), 0)::numeric as amount,
        COUNT(*)::int as transactions
      FROM payments
      WHERE status = 'successful'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
      LIMIT 6
    `;
    const monthRes = await pool.query(monthQuery);

    const totalRevenue = Number(revRow.total_revenue);
    const netMargin = totalRevenue - maintenanceExpense;

    return {
      totalRevenue,
      chapaRevenue: Number(revRow.chapa_revenue),
      cashRevenue: Number(revRow.cash_revenue),
      bankTransferRevenue: Number(revRow.bank_revenue),
      successfulTransactions: revRow.successful_transactions,
      activeMembershipsCount,
      maintenanceExpense,
      netMargin,
      revenueByMonth: monthRes.rows.map((r) => ({
        month: r.month,
        amount: Number(r.amount),
        transactions: r.transactions,
      })),
    };
  }

  async getAttendanceOverview(): Promise<AttendanceOverview> {
    // 1. Total check-ins & granted/denied
    const totalQuery = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'allowed')::int as granted,
        COUNT(*) FILTER (WHERE status = 'denied')::int as denied
      FROM checkins
    `;
    const totalRes = await pool.query(totalQuery);
    const totalRow = totalRes.rows[0];
    const total = totalRow.total;
    const granted = totalRow.granted;
    const denied = totalRow.denied;
    const denialRate = total > 0 ? Number(((denied / total) * 100).toFixed(1)) : 0;

    // 2. Hourly check-in heatmap
    const hourQuery = `
      SELECT 
        EXTRACT(HOUR FROM checkin_time)::int as hour,
        COUNT(*)::int as count
      FROM checkins
      GROUP BY EXTRACT(HOUR FROM checkin_time)
      ORDER BY hour ASC
    `;
    const hourRes = await pool.query(hourQuery);
    const hourMap = new Map<number, number>();
    for (let h = 6; h <= 22; h++) hourMap.set(h, 0);
    for (const r of hourRes.rows) {
      if (hourMap.has(r.hour)) hourMap.set(r.hour, r.count);
    }
    const hourlyTraffic = Array.from(hourMap.entries()).map(([hour, count]) => ({ hour, count }));

    // 3. Top denial reasons
    const denialQuery = `
      SELECT 
        COALESCE(denial_reason, 'Unspecified Denial') as reason,
        COUNT(*)::int as count
      FROM checkins
      WHERE status = 'denied'
      GROUP BY denial_reason
      ORDER BY count DESC
      LIMIT 5
    `;
    const denialRes = await pool.query(denialQuery);

    // 4. Most active members
    const activeQuery = `
      SELECT 
        TRIM(CONCAT(u.first_name, ' ', u.last_name)) as name,
        u.email,
        COUNT(c.id)::int as checkin_count
      FROM checkins c
      JOIN users u ON u.id = c.member_id
      WHERE c.status = 'allowed'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY checkin_count DESC
      LIMIT 5
    `;
    const activeRes = await pool.query(activeQuery);

    return {
      totalCheckins: total,
      grantedCount: granted,
      deniedCount: denied,
      denialRate,
      hourlyTraffic,
      topDenialReasons: denialRes.rows,
      topActiveMembers: activeRes.rows.map((r) => ({
        name: r.name,
        email: r.email,
        checkinCount: r.checkin_count,
      })),
    };
  }

  async getExportAttendanceRows(): Promise<any[]> {
    const query = `
      SELECT 
        c.id,
        TRIM(CONCAT(u.first_name, ' ', u.last_name)) as member_name,
        u.email as member_email,
        u.phone as member_phone,
        c.checkin_time,
        c.status,
        COALESCE(c.denial_reason, 'N/A') as denial_reason,
        c.checkin_type
      FROM checkins c
      JOIN users u ON u.id = c.member_id
      ORDER BY c.checkin_time DESC
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  async getExportMembersRows(): Promise<any[]> {
    const query = `
      SELECT 
        u.id,
        TRIM(CONCAT(u.first_name, ' ', u.last_name)) as member_name,
        u.email,
        u.phone,
        u.is_active,
        COALESCE(p.name, 'No Active Plan') as plan_name,
        COALESCE(m.status::text, 'none') as membership_status,
        m.start_date,
        m.end_date,
        u.created_at as joined_date
      FROM users u
      LEFT JOIN memberships m ON m.member_id = u.id AND m.status = 'active'
      LEFT JOIN membership_plans p ON p.id = m.plan_id
      WHERE u.role = 'member'
      ORDER BY u.created_at DESC
    `;
    const res = await pool.query(query);
    return res.rows;
  }

  async getExportFinancialRows(): Promise<any[]> {
    const query = `
      SELECT 
        p.id,
        p.payment_reference,
        TRIM(CONCAT(u.first_name, ' ', u.last_name)) as member_name,
        u.email as member_email,
        p.amount,
        p.currency,
        p.payment_method,
        p.status,
        p.created_at as payment_date
      FROM payments p
      JOIN users u ON u.id = p.member_id
      ORDER BY p.created_at DESC
    `;
    const res = await pool.query(query);
    return res.rows;
  }
}
