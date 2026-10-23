import { Request, Response, NextFunction } from 'express';
import { ClassesService } from './classes.service';
import { createClassSchema, attendanceSchema } from './classes.validation';
import { BadRequestError } from '../../shared/errors/AppError';

export class ClassesController {
  private service = new ClassesService();

  getUpcoming = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const memberId = (req as any).user?.userId;
      const classes = await this.service.getUpcomingClasses(memberId);
      res.status(200).json({
        status: 'success',
        data: classes,
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const classRow = await this.service.getClassById(id);
      res.status(200).json({
        status: 'success',
        data: classRow,
      });
    } catch (err) {
      next(err);
    }
  };

  bookClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const result = await this.service.bookClass(id, {
        id: user.userId,
        email: user.email,
        firstName: user.firstName || 'Member',
      });

      res.status(201).json({
        status: 'success',
        message:
          result.action === 'booked'
            ? 'Class booked successfully! Spot confirmed.'
            : `Class is currently full. You have been added to the waitlist at position #${result.booking.waitlist_position}.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const memberId = req.body.memberId || user.userId;
      const result = await this.service.cancelBooking(id, memberId);

      res.status(200).json({
        status: 'success',
        message: 'Booking cancelled successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getRoster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const roster = await this.service.getClassRoster(id);
      res.status(200).json({
        status: 'success',
        data: roster,
      });
    } catch (err) {
      next(err);
    }
  };

  updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, memberId } = req.params;
      const parsed = attendanceSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError('Validation error', parsed.error.flatten().fieldErrors);
      }

      const updated = await this.service.updateAttendance(id, memberId, parsed.data.status);
      res.status(200).json({
        status: 'success',
        message: `Attendance marked as ${parsed.data.status}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };

  createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createClassSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new BadRequestError('Validation error', parsed.error.flatten().fieldErrors);
      }

      const newClass = await this.service.createClass(parsed.data);
      res.status(201).json({
        status: 'success',
        message: 'Class scheduled successfully',
        data: newClass,
      });
    } catch (err) {
      next(err);
    }
  };

  getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const bookings = await this.service.getMemberBookings(user.userId);
      res.status(200).json({
        status: 'success',
        data: bookings,
      });
    } catch (err) {
      next(err);
    }
  };

  getTrainers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const trainers = await this.service.getAllTrainers();
      res.status(200).json({
        status: 'success',
        data: trainers,
      });
    } catch (err) {
      next(err);
    }
  };
}
