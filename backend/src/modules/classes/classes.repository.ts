import { PoolClient } from 'pg';
import { pool } from '../../db/pool';

export interface ClassRecord {
  id: string;
  title: string;
  description: string | null;
  trainer_id: string;
  trainer_name?: string;
  trainer_specialization?: string;
  capacity: number;
  start_time: Date;
  end_time: Date;
  location: string;
  is_cancelled: boolean;
  booked_count?: number;
  waitlist_count?: number;
  my_booking_status?: 'booked' | 'waitlisted' | 'cancelled' | 'attended' | null;
  my_waitlist_position?: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface BookingRecord {
  id: string;
  class_id: string;
  member_id: string;
  status: 'booked' | 'waitlisted' | 'cancelled' | 'attended';
  waitlist_position: number | null;
  booked_at: Date;
  cancelled_at: Date | null;
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_phone?: string;
}

export class ClassesRepository {
  async getClient(): Promise<PoolClient> {
    return pool.connect();
  }

  async getUpcomingClasses(memberId?: string): Promise<ClassRecord[]> {
    const query = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.trainer_id,
        CONCAT(u.first_name, ' ', u.last_name) AS trainer_name,
        t.specialization AS trainer_specialization,
        c.capacity,
        c.start_time,
        c.end_time,
        c.location,
        c.is_cancelled,
        c.created_at,
        c.updated_at,
        COALESCE((
          SELECT COUNT(*)::int 
          FROM class_bookings cb 
          WHERE cb.class_id = c.id AND cb.status = 'booked'
        ), 0) AS booked_count,
        COALESCE((
          SELECT COUNT(*)::int 
          FROM class_bookings cb 
          WHERE cb.class_id = c.id AND cb.status = 'waitlisted'
        ), 0) AS waitlist_count
        ${
          memberId
            ? `, (
                SELECT cb.status 
                FROM class_bookings cb 
                WHERE cb.class_id = c.id AND cb.member_id = $1 AND cb.status IN ('booked', 'waitlisted')
                LIMIT 1
              ) AS my_booking_status,
              (
                SELECT cb.waitlist_position 
                FROM class_bookings cb 
                WHERE cb.class_id = c.id AND cb.member_id = $1 AND cb.status = 'waitlisted'
                LIMIT 1
              ) AS my_waitlist_position`
            : `, NULL::text AS my_booking_status, NULL::int AS my_waitlist_position`
        }
      FROM classes c
      JOIN trainers t ON c.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE c.start_time >= CURRENT_TIMESTAMP - INTERVAL '2 hours'
      ORDER BY c.start_time ASC;
    `;

    const params = memberId ? [memberId] : [];
    const res = await pool.query(query, params);
    return res.rows;
  }

  async getClassById(classId: string, client?: PoolClient): Promise<ClassRecord | null> {
    const query = `
      SELECT 
        c.*,
        CONCAT(u.first_name, ' ', u.last_name) AS trainer_name,
        t.specialization AS trainer_specialization,
        COALESCE((
          SELECT COUNT(*)::int 
          FROM class_bookings cb 
          WHERE cb.class_id = c.id AND cb.status = 'booked'
        ), 0) AS booked_count,
        COALESCE((
          SELECT COUNT(*)::int 
          FROM class_bookings cb 
          WHERE cb.class_id = c.id AND cb.status = 'waitlisted'
        ), 0) AS waitlist_count
      FROM classes c
      JOIN trainers t ON c.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE c.id = $1
      LIMIT 1;
    `;
    const runner = client || pool;
    const res = await runner.query(query, [classId]);
    return res.rows[0] || null;
  }

  async checkActiveMembership(memberId: string, client?: PoolClient): Promise<boolean> {
    const query = `
      SELECT id 
      FROM memberships 
      WHERE member_id = $1 
        AND status = 'active' 
        AND end_date >= CURRENT_DATE 
      LIMIT 1;
    `;
    const runner = client || pool;
    const res = await runner.query(query, [memberId]);
    return res.rowCount !== null && res.rowCount > 0;
  }

  async getExistingBooking(classId: string, memberId: string, client?: PoolClient): Promise<BookingRecord | null> {
    const query = `
      SELECT * 
      FROM class_bookings 
      WHERE class_id = $1 AND member_id = $2
      LIMIT 1;
    `;
    const runner = client || pool;
    const res = await runner.query(query, [classId, memberId]);
    return res.rows[0] || null;
  }

  async bookClassAtomic(
    classId: string,
    memberId: string,
    client: PoolClient
  ): Promise<{ booking: BookingRecord; action: 'booked' | 'waitlisted' }> {
    // 1. Lock class row for concurrency safety
    const classRes = await client.query(
      `SELECT * FROM classes WHERE id = $1 FOR UPDATE;`,
      [classId]
    );
    const classRow = classRes.rows[0];
    if (!classRow) {
      throw new Error('Class not found');
    }
    if (classRow.is_cancelled) {
      throw new Error('Cannot book a cancelled class');
    }

    // 2. Count current booked attendees
    const countRes = await client.query(
      `SELECT COUNT(*)::int as count FROM class_bookings WHERE class_id = $1 AND status = 'booked';`,
      [classId]
    );
    const bookedCount = countRes.rows[0]?.count || 0;

    let targetStatus: 'booked' | 'waitlisted';
    let waitlistPos: number | null = null;

    if (bookedCount < classRow.capacity) {
      targetStatus = 'booked';
      waitlistPos = null;
    } else {
      targetStatus = 'waitlisted';
      const maxWaitRes = await client.query(
        `SELECT COALESCE(MAX(waitlist_position), 0) + 1 as next_pos 
         FROM class_bookings 
         WHERE class_id = $1 AND status = 'waitlisted';`,
        [classId]
      );
      waitlistPos = maxWaitRes.rows[0]?.next_pos || 1;
    }

    // 3. Upsert booking record
    const upsertQuery = `
      INSERT INTO class_bookings (class_id, member_id, status, waitlist_position, booked_at, cancelled_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, NULL)
      ON CONFLICT (class_id, member_id) DO UPDATE SET
        status = EXCLUDED.status,
        waitlist_position = EXCLUDED.waitlist_position,
        booked_at = CURRENT_TIMESTAMP,
        cancelled_at = NULL
      RETURNING *;
    `;
    const bookingRes = await client.query(upsertQuery, [
      classId,
      memberId,
      targetStatus,
      waitlistPos,
    ]);

    return {
      booking: bookingRes.rows[0],
      action: targetStatus,
    };
  }

  async cancelBookingAtomic(
    classId: string,
    memberId: string,
    client: PoolClient
  ): Promise<{
    cancelledBooking: BookingRecord;
    promotedMember: { id: string; email: string; firstName: string } | null;
  }> {
    // 1. Lock the booking to cancel
    const bookingRes = await client.query(
      `SELECT * FROM class_bookings WHERE class_id = $1 AND member_id = $2 FOR UPDATE;`,
      [classId, memberId]
    );
    const booking = bookingRes.rows[0];
    if (!booking) {
      throw new Error('Booking not found');
    }
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    const previousStatus = booking.status;
    const previousWaitlistPos = booking.waitlist_position;

    // 2. Mark booking as cancelled
    const updateRes = await client.query(
      `UPDATE class_bookings 
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, waitlist_position = NULL 
       WHERE id = $1 
       RETURNING *;`,
      [booking.id]
    );
    const cancelledBooking = updateRes.rows[0];

    let promotedMember: { id: string; email: string; firstName: string } | null = null;

    if (previousStatus === 'booked') {
      // 3. If a booked spot opened up, promote 1st waitlisted member
      const waitlistRes = await client.query(
        `SELECT cb.id, cb.member_id, u.email, u.first_name 
         FROM class_bookings cb 
         JOIN users u ON cb.member_id = u.id 
         WHERE cb.class_id = $1 AND cb.status = 'waitlisted' 
         ORDER BY cb.waitlist_position ASC 
         LIMIT 1 
         FOR UPDATE OF cb;`,
        [classId]
      );

      if (waitlistRes.rows.length > 0) {
        const topWaitlist = waitlistRes.rows[0];
        await client.query(
          `UPDATE class_bookings 
           SET status = 'booked', waitlist_position = NULL 
           WHERE id = $1;`,
          [topWaitlist.id]
        );

        // Shift remaining waitlist positions down by 1
        await client.query(
          `UPDATE class_bookings 
           SET waitlist_position = waitlist_position - 1 
           WHERE class_id = $1 AND status = 'waitlisted';`,
          [classId]
        );

        promotedMember = {
          id: topWaitlist.member_id,
          email: topWaitlist.email,
          firstName: topWaitlist.first_name,
        };
      }
    } else if (previousStatus === 'waitlisted' && previousWaitlistPos !== null) {
      // Re-order remaining waitlist
      await client.query(
        `UPDATE class_bookings 
         SET waitlist_position = waitlist_position - 1 
         WHERE class_id = $1 AND status = 'waitlisted' AND waitlist_position > $2;`,
        [classId, previousWaitlistPos]
      );
    }

    return {
      cancelledBooking,
      promotedMember,
    };
  }

  async getClassRoster(classId: string): Promise<BookingRecord[]> {
    const query = `
      SELECT 
        cb.id,
        cb.class_id,
        cb.member_id,
        cb.status,
        cb.waitlist_position,
        cb.booked_at,
        cb.cancelled_at,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.phone as user_phone
      FROM class_bookings cb
      JOIN users u ON cb.member_id = u.id
      WHERE cb.class_id = $1
      ORDER BY 
        CASE 
          WHEN cb.status = 'booked' THEN 1
          WHEN cb.status = 'attended' THEN 2
          WHEN cb.status = 'waitlisted' THEN 3
          ELSE 4 
        END,
        cb.waitlist_position ASC,
        cb.booked_at ASC;
    `;
    const res = await pool.query(query, [classId]);
    return res.rows;
  }

  async updateAttendance(
    classId: string,
    memberId: string,
    status: 'attended' | 'booked' | 'cancelled'
  ): Promise<BookingRecord> {
    const query = `
      UPDATE class_bookings
      SET status = $3
      WHERE class_id = $1 AND member_id = $2
      RETURNING *;
    `;
    const res = await pool.query(query, [classId, memberId, status]);
    return res.rows[0];
  }

  async createClass(data: {
    title: string;
    description?: string;
    trainerId: string;
    capacity: number;
    startTime: string;
    endTime: string;
    location?: string;
  }): Promise<ClassRecord> {
    const query = `
      INSERT INTO classes (title, description, trainer_id, capacity, start_time, end_time, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const res = await pool.query(query, [
      data.title,
      data.description || null,
      data.trainerId,
      data.capacity,
      data.startTime,
      data.endTime,
      data.location || 'Main Studio',
    ]);
    return res.rows[0];
  }

  async getMemberBookings(memberId: string): Promise<any[]> {
    const query = `
      SELECT 
        cb.id as booking_id,
        cb.status as booking_status,
        cb.waitlist_position,
        cb.booked_at,
        c.id as class_id,
        c.title,
        c.description,
        c.capacity,
        c.start_time,
        c.end_time,
        c.location,
        c.is_cancelled,
        CONCAT(u.first_name, ' ', u.last_name) AS trainer_name
      FROM class_bookings cb
      JOIN classes c ON cb.class_id = c.id
      JOIN trainers t ON c.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE cb.member_id = $1
      ORDER BY c.start_time DESC;
    `;
    const res = await pool.query(query, [memberId]);
    return res.rows;
  }

  async getAllTrainers(): Promise<any[]> {
    const query = `
      SELECT t.id, t.specialization, t.is_available, u.id as user_id, u.first_name, u.last_name, u.email
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      WHERE t.is_available = TRUE
      ORDER BY u.first_name ASC;
    `;
    const res = await pool.query(query);
    return res.rows;
  }
}
