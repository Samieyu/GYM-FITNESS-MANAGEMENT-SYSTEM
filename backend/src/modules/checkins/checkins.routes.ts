import { Router } from 'express';
import { CheckinsController } from './checkins.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new CheckinsController();

// Member: Generate dynamic 60s rotating QR token
router.get('/my-qr', authGuard, roleGuard('member'), controller.getMyQrPass);

// Member: Attendance history
router.get('/my-history', authGuard, roleGuard('member'), controller.getMyHistory);

// Reception & Admin: Scan member QR code or manual member ID
router.post('/scan', authGuard, roleGuard('reception', 'admin'), controller.scanCheckin);

// Reception & Admin: Live recent check-ins feed
router.get('/recent', authGuard, roleGuard('reception', 'admin'), controller.getRecentCheckins);

export default router;
