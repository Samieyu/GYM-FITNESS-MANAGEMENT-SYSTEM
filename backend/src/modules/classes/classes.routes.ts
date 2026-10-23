import { Router } from 'express';
import { ClassesController } from './classes.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new ClassesController();

// Optional auth for public schedule browsing
const optionalAuth = (req: any, _res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const { verifyAccessToken } = require('../../shared/utils/tokens');
      const token = authHeader.split(' ')[1];
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore invalid token for public view
    }
  }
  next();
};

// 1. Browse upcoming classes (public / member)
router.get('/', optionalAuth, controller.getUpcoming);

// 2. Get active trainers list (for scheduling modal)
router.get('/trainers', authGuard, controller.getTrainers);

// 3. Member's own bookings
router.get('/my/bookings', authGuard, roleGuard('member'), controller.getMyBookings);

// 4. Get class details
router.get('/:id', optionalAuth, controller.getById);

// 5. Rule 12: Book class / join waitlist (member only, enforces active membership)
router.post('/:id/book', authGuard, roleGuard('member'), controller.bookClass);

// 6. Cancel booking (member or admin)
router.post('/:id/cancel', authGuard, controller.cancelBooking);

// 7. Trainer & Admin: View class roster
router.get('/:id/roster', authGuard, roleGuard('trainer', 'admin'), controller.getRoster);

// 8. Trainer & Admin: Mark attendance
router.post(
  '/:id/attendance/:memberId',
  authGuard,
  roleGuard('trainer', 'admin'),
  controller.updateAttendance
);

// 9. Admin & Trainer: Schedule a new group class
router.post('/', authGuard, roleGuard('trainer', 'admin'), controller.createClass);

export default router;
