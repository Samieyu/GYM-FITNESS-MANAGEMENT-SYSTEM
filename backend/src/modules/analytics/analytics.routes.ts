import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new AnalyticsController();

// Financial and attendance dashboards - admin and reception
router.get('/financial', authGuard, roleGuard('admin', 'reception'), controller.getFinancialOverview);
router.get('/attendance', authGuard, roleGuard('admin', 'reception', 'trainer'), controller.getAttendanceOverview);

// CSV Data Exports - admin and reception
router.get('/export/attendance', authGuard, roleGuard('admin', 'reception'), controller.exportAttendanceCsv);
router.get('/export/members', authGuard, roleGuard('admin', 'reception'), controller.exportMembersCsv);
router.get('/export/financial', authGuard, roleGuard('admin', 'reception'), controller.exportFinancialCsv);

export default router;
