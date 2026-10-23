import { ClassesRepository, ClassRecord, BookingRecord } from './classes.repository';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../shared/errors/AppError';
import {
  sendClassBookingConfirmationEmail,
  sendWaitlistPromotionEmail,
} from '../../shared/services/emailService';
import { formatEthiopianDate } from '../../shared/utils/ethiopianCalendar';

export class ClassesService {
  private repo = new ClassesRepository();

  async getUpcomingClasses(memberId?: string): Promise<ClassRecord[]> {
    return this.repo.getUpcomingClasses(memberId);
  }

  async getClassById(classId: string): Promise<ClassRecord> {
    const classRow = await this.repo.getClassById(classId);
    if (!classRow) {
      throw new NotFoundError('Class not found');
    }
    return classRow;
  }

  /**
   * Business Rule 12: Book Class or Join Waitlist
   * - Enforces active membership requirement
   * - Atomically assigns spot or waitlist position
   * - Sends Ethiopian calendar formatted confirmation email
   */
  async bookClass(
    classId: string,
    memberUser: { id: string; email: string; firstName: string }
  ): Promise<{ booking: BookingRecord; action: 'booked' | 'waitlisted'; classDetails: ClassRecord }> {
    // 1. Rule 12 Check: Active membership requirement
    const hasActiveMembership = await this.repo.checkActiveMembership(memberUser.id);
    if (!hasActiveMembership) {
      throw new ForbiddenError(
        'Rule 12: An active membership is required to book group fitness classes. Please subscribe or renew your membership.'
      );
    }

    // 2. Fetch class
    const classRow = await this.repo.getClassById(classId);
    if (!classRow) {
      throw new NotFoundError('Class not found');
    }
    if (classRow.is_cancelled) {
      throw new BadRequestError('This class has been cancelled');
    }
    if (new Date(classRow.start_time) < new Date()) {
      throw new BadRequestError('Cannot book a class that has already started');
    }

    // 3. Check if already booked / waitlisted
    const existing = await this.repo.getExistingBooking(classId, memberUser.id);
    if (existing && (existing.status === 'booked' || existing.status === 'waitlisted')) {
      throw new ConflictError(
        existing.status === 'booked'
          ? 'You already have a confirmed booking for this class'
          : `You are already on the waitlist for this class (Position #${existing.waitlist_position})`
      );
    }

    // 4. Atomic booking transaction
    const client = await this.repo.getClient();
    let result: { booking: BookingRecord; action: 'booked' | 'waitlisted' };
    try {
      await client.query('BEGIN');
      result = await this.repo.bookClassAtomic(classId, memberUser.id, client);
      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // 5. Asynchronous confirmation email with Ethiopian Calendar
    const ethDate = formatEthiopianDate(classRow.start_time);
    const timeFormatted = new Date(classRow.start_time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' - ' + new Date(classRow.end_time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    sendClassBookingConfirmationEmail(memberUser.email, memberUser.firstName, {
      title: classRow.title,
      location: classRow.location,
      trainerName: classRow.trainer_name || 'Staff Instructor',
      timeFormatted,
      dateEc: `${ethDate} E.C.`,
      status: result.action,
      waitlistPosition: result.booking.waitlist_position,
    }).catch((err) => console.error('[Classes] Email error:', err));

    return {
      ...result,
      classDetails: classRow,
    };
  }

  /**
   * Cancel Class Booking & Auto-Promote Waitlist Member
   */
  async cancelBooking(
    classId: string,
    memberId: string
  ): Promise<{ cancelledBooking: BookingRecord; promotedMemberEmail?: string }> {
    const classRow = await this.repo.getClassById(classId);
    if (!classRow) {
      throw new NotFoundError('Class not found');
    }

    const client = await this.repo.getClient();
    let result: {
      cancelledBooking: BookingRecord;
      promotedMember: { id: string; email: string; firstName: string } | null;
    };

    try {
      await client.query('BEGIN');
      result = await this.repo.cancelBookingAtomic(classId, memberId, client);
      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // If a waitlisted member was promoted, notify them via email
    if (result.promotedMember) {
      const ethDate = formatEthiopianDate(classRow.start_time);
      const timeFormatted = new Date(classRow.start_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' - ' + new Date(classRow.end_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      sendWaitlistPromotionEmail(result.promotedMember.email, result.promotedMember.firstName, {
        title: classRow.title,
        location: classRow.location,
        trainerName: classRow.trainer_name || 'Staff Instructor',
        timeFormatted,
        dateEc: `${ethDate} E.C.`,
      }).catch((err) => console.error('[Classes] Waitlist promotion email error:', err));
    }

    return {
      cancelledBooking: result.cancelledBooking,
      promotedMemberEmail: result.promotedMember?.email,
    };
  }

  async getClassRoster(classId: string): Promise<BookingRecord[]> {
    const classRow = await this.repo.getClassById(classId);
    if (!classRow) {
      throw new NotFoundError('Class not found');
    }
    return this.repo.getClassRoster(classId);
  }

  async updateAttendance(
    classId: string,
    memberId: string,
    status: 'attended' | 'booked' | 'cancelled'
  ): Promise<BookingRecord> {
    const booking = await this.repo.getExistingBooking(classId, memberId);
    if (!booking) {
      throw new NotFoundError('Booking record not found');
    }
    return this.repo.updateAttendance(classId, memberId, status);
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
    return this.repo.createClass(data);
  }

  async getMemberBookings(memberId: string): Promise<any[]> {
    return this.repo.getMemberBookings(memberId);
  }

  async getAllTrainers(): Promise<any[]> {
    return this.repo.getAllTrainers();
  }
}
