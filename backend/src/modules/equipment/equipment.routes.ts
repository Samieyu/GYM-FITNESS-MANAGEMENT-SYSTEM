import { Router } from 'express';
import { EquipmentController } from './equipment.controller';
import { authGuard } from '../../shared/middlewares/authGuard';
import { roleGuard } from '../../shared/middlewares/roleGuard';

const router = Router();
const controller = new EquipmentController();

// 1. Defect Reporting (must come before /:id)
router.get('/reports', authGuard, roleGuard('admin', 'reception', 'trainer'), controller.getAllReports);
router.post('/reports', authGuard, controller.createReport);
router.patch('/reports/:id/status', authGuard, roleGuard('admin', 'reception'), controller.updateReportStatus);

// 2. Maintenance Logs (must come before /:id)
router.get('/maintenance', authGuard, roleGuard('admin', 'reception', 'trainer'), controller.getMaintenanceLogs);
router.post('/maintenance', authGuard, roleGuard('admin'), controller.createMaintenanceLog);

// 3. Equipment Inventory CRUD
router.get('/', authGuard, controller.getAllEquipment);
router.get('/:id', authGuard, controller.getEquipmentById);
router.post('/', authGuard, roleGuard('admin'), controller.createEquipment);
router.put('/:id', authGuard, roleGuard('admin'), controller.updateEquipment);
router.delete('/:id', authGuard, roleGuard('admin'), controller.deleteEquipment);

export default router;
