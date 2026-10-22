import cron from 'node-cron';
import { pool } from '../../db/pool';
import { sendExpiryReminderEmail } from '../../shared/services/emailService';
import { formatEthiopianDate } from '../../shared/utils/ethiopianCalendar';

export interface ExpiryJobSummary {
  expiredCount: number;
  reminder7dCount: number;
  reminder1dCount: number;
  processedAt: string;
}

export class CronService {
  /**
   * Business Rules 5 & 6:
   * 1. Mark past-due active memberships as 'expired'
   * 2. Send 7-day expiration reminder email
   * 3. Send 1-day urgent expiration reminder email
   */
  async processMembershipExpirations(): Promise<ExpiryJobSummary> {
    const client = await pool.connect();
    let expiredCount = 0;
    let reminder7dCount = 0;
    let reminder1dCount = 0;

    try {
      await client.query('BEGIN');

      // 1. Expire memberships past their end_date
      const expireQuery = `
        UPDATE memberships
        SET status = 'expired', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'active' AND end_date < CURRENT_DATE
        RETURNING id, member_id;
      `;
      const expireRes = await client.query(expireQuery);
      expiredCount = expireRes.rowCount || 0;

      // Record audit log for expired memberships
      for (const row of expireRes.rows) {
        await client.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
           VALUES ($1, 'MEMBERSHIP_EXPIRED_AUTOMATED', 'memberships', $2, $3)`,
          [row.member_id, row.id, JSON.stringify({ previousStatus: 'active', newStatus: 'expired' })]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Cron Expiry] Error expiring memberships:', err);
      throw err;
    } finally {
      client.release();
    }

    // 2. 7-Day Expiry Reminders
    try {
      const query7d = `
        SELECT m.id, m.member_id, m.end_date, p.name as plan_name, u.email, u.first_name, u.last_name
        FROM memberships m
        JOIN membership_plans p ON m.plan_id = p.id
        JOIN users u ON m.member_id = u.id
        WHERE m.status = 'active'
          AND m.end_date = CURRENT_DATE + INTERVAL '7 days'
          AND m.reminder_7d_sent = FALSE;
      `;
      const res7d = await pool.query(query7d);
      reminder7dCount = res7d.rowCount || 0;

      for (const row of res7d.rows) {
        const ethDate = formatEthiopianDate(row.end_date);
        await sendExpiryReminderEmail(row.email, row.first_name, {
          planName: row.plan_name,
          daysRemaining: 7,
          endDate: row.end_date instanceof Date ? row.end_date.toISOString().split('T')[0] : String(row.end_date),
          endDateEc: `${ethDate} E.C.`,
        });

        await pool.query(
          `UPDATE memberships SET reminder_7d_sent = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [row.id]
        );
      }
    } catch (err) {
      console.error('[Cron Expiry] Error processing 7-day reminders:', err);
    }

    // 3. 1-Day Expiry Reminders
    try {
      const query1d = `
        SELECT m.id, m.member_id, m.end_date, p.name as plan_name, u.email, u.first_name, u.last_name
        FROM memberships m
        JOIN membership_plans p ON m.plan_id = p.id
        JOIN users u ON m.member_id = u.id
        WHERE m.status = 'active'
          AND m.end_date = CURRENT_DATE + INTERVAL '1 day'
          AND m.reminder_1d_sent = FALSE;
      `;
      const res1d = await pool.query(query1d);
      reminder1dCount = res1d.rowCount || 0;

      for (const row of res1d.rows) {
        const ethDate = formatEthiopianDate(row.end_date);
        await sendExpiryReminderEmail(row.email, row.first_name, {
          planName: row.plan_name,
          daysRemaining: 1,
          endDate: row.end_date instanceof Date ? row.end_date.toISOString().split('T')[0] : String(row.end_date),
          endDateEc: `${ethDate} E.C.`,
        });

        await pool.query(
          `UPDATE memberships SET reminder_1d_sent = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [row.id]
        );
      }
    } catch (err) {
      console.error('[Cron Expiry] Error processing 1-day reminders:', err);
    }

    const summary: ExpiryJobSummary = {
      expiredCount,
      reminder7dCount,
      reminder1dCount,
      processedAt: new Date().toISOString(),
    };

    console.log(`[Cron Expiry] Completed job: ${expiredCount} expired, ${reminder7dCount} (7d) reminders, ${reminder1dCount} (1d) reminders.`);
    return summary;
  }

  /**
   * Schedule the recurring background task (Daily at 00:00 midnight)
   */
  startCronJobs(): void {
    cron.schedule('0 0 * * *', async () => {
      console.log('[Cron Job] Running daily membership expiration & reminder check...');
      try {
        await this.processMembershipExpirations();
      } catch (err) {
        console.error('[Cron Job] Unhandled error during scheduled run:', err);
      }
    });

    console.log('[Cron] Daily automated membership expiration scheduler registered (00:00 UTC)');
  }
}
