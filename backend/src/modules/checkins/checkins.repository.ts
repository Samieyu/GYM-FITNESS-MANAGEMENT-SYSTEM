import { query } from '../../db/pool';

export interface CheckinRecord {
  id: string;
  member_id: string;
  checkin_time: Date;
  status: 'allowed' | 'denied';
  denial_reason: string | null;
  checkin_type: 'reception_qr' | 'reception_manual' | 'self_qr';
  scanned_by_user_id: string | null;
  created_at: Date;
  // Joined fields
  member_first_name?: string;
  member_last_name?: string;
  member_email?: string;
  plan_name?: string;
  scanned_by_first_name?: string;
  scanned_by_last_name?: string;
}

export interface ActiveMembershipInfo {
  id: string;
  plan_id: string;
  plan_name: string;
  status: 'active';
  start_date: string;
  end_date: string;
}

export class CheckinsRepository {
  /**
   * Find user by ID to verify existence and active status
   */
  async findUserById(userId: string) {
    const res = await query(
      `SELECT id, email, first_name, last_name, role, is_active, is_verified 
       FROM users 
       WHERE id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  /**
   * Business Rule 8: Look up member's currently active membership
   */
  async findActiveMembership(memberId: string): Promise<ActiveMembershipInfo | null> {
    const res = await query(
      `SELECT 
         m.id, 
         m.plan_id, 
         p.name AS plan_name, 
         m.status, 
         TO_CHAR(m.start_date, 'YYYY-MM-DD') AS start_date, 
         TO_CHAR(m.end_date, 'YYYY-MM-DD') AS end_date 
       FROM memberships m
       JOIN membership_plans p ON m.plan_id = p.id
       WHERE m.member_id = $1 
         AND m.status = 'active'
         AND m.end_date >= CURRENT_DATE
       ORDER BY m.end_date DESC
       LIMIT 1`,
      [memberId]
    );
    return res.rows[0] || null;
  }

  /**
   * Business Rule 9: Check for repeat check-in within interval (2 hours anti-passback)
   */
  async findRecentAllowedCheckin(
    memberId: string,
    hours: number = 2
  ): Promise<CheckinRecord | null> {
    const res = await query(
      `SELECT id, member_id, checkin_time, status, denial_reason, checkin_type, scanned_by_user_id, created_at
       FROM checkins
       WHERE member_id = $1
         AND status = 'allowed'
         AND checkin_time >= NOW() - ($2 || ' hours')::INTERVAL
       ORDER BY checkin_time DESC
       LIMIT 1`,
      [memberId, hours.toString()]
    );
    return res.rows[0] || null;
  }

  /**
   * Record a check-in event (allowed or denied)
   */
  async createCheckin(data: {
    memberId: string;
    status: 'allowed' | 'denied';
    denialReason?: string | null;
    checkinType: 'reception_qr' | 'reception_manual' | 'self_qr';
    scannedByUserId?: string | null;
  }): Promise<CheckinRecord> {
    const res = await query(
      `INSERT INTO checkins (
         member_id, 
         status, 
         denial_reason, 
         checkin_type, 
         scanned_by_user_id
       ) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        data.memberId,
        data.status,
        data.denialReason || null,
        data.checkinType,
        data.scannedByUserId || null,
      ]
    );
    return res.rows[0];
  }

  /**
   * Retrieve recent check-in events for reception/admin dashboard live feed
   */
  async findRecentCheckins(limit: number = 25): Promise<CheckinRecord[]> {
    const res = await query(
      `SELECT 
         c.id,
         c.member_id,
         c.checkin_time,
         c.status,
         c.denial_reason,
         c.checkin_type,
         c.scanned_by_user_id,
         c.created_at,
         u.first_name AS member_first_name,
         u.last_name AS member_last_name,
         u.email AS member_email,
         p.name AS plan_name,
         s.first_name AS scanned_by_first_name,
         s.last_name AS scanned_by_last_name
       FROM checkins c
       JOIN users u ON c.member_id = u.id
       LEFT JOIN LATERAL (
         SELECT mp.name 
         FROM memberships m
         JOIN membership_plans mp ON m.plan_id = mp.id
         WHERE m.member_id = c.member_id
         ORDER BY m.created_at DESC
         LIMIT 1
       ) p ON true
       LEFT JOIN users s ON c.scanned_by_user_id = s.id
       ORDER BY c.checkin_time DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }

  /**
   * Retrieve member's individual check-in attendance history
   */
  async findMemberHistory(memberId: string, limit: number = 30): Promise<CheckinRecord[]> {
    const res = await query(
      `SELECT 
         c.id,
         c.member_id,
         c.checkin_time,
         c.status,
         c.denial_reason,
         c.checkin_type,
         c.scanned_by_user_id,
         c.created_at
       FROM checkins c
       WHERE c.member_id = $1
       ORDER BY c.checkin_time DESC
       LIMIT $2`,
      [memberId, limit]
    );
    return res.rows;
  }
}
