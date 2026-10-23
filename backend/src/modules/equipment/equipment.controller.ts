import { Request, Response, NextFunction } from 'express';
import { EquipmentService } from './equipment.service';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  createEquipmentReportSchema,
  updateReportStatusSchema,
  createMaintenanceLogSchema,
} from './equipment.validation';

const equipmentService = new EquipmentService();

export class EquipmentController {
  async getAllEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, category } = req.query;
      const data = await equipmentService.getAllEquipment({
        search: search as string,
        status: status as string,
        category: category as string,
      });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getEquipmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await equipmentService.getEquipmentById(id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createEquipmentSchema.parse(req.body);
      const data = await equipmentService.createEquipment(validated);
      res.status(201).json({ success: true, message: 'Equipment added successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async updateEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateEquipmentSchema.parse(req.body);
      const data = await equipmentService.updateEquipment(id, validated);
      res.status(200).json({ success: true, message: 'Equipment updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async deleteEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await equipmentService.deleteEquipment(id);
      res.status(200).json({ success: true, message: 'Equipment deleted successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createEquipmentReportSchema.parse(req.body);
      const user = (req as any).user;
      const reported_by_user_id = user?.userId || user?.id;
      const data = await equipmentService.createReport({
        ...validated,
        reported_by_user_id,
      });
      res.status(201).json({ success: true, message: 'Equipment defect reported successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getAllReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, equipment_id } = req.query;
      const data = await equipmentService.getAllReports({
        status: status as string,
        equipment_id: equipment_id as string,
      });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateReportStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = updateReportStatusSchema.parse(req.body);
      const data = await equipmentService.updateReportStatus(id, status);
      res.status(200).json({ success: true, message: 'Report status updated successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async createMaintenanceLog(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createMaintenanceLogSchema.parse(req.body);
      const data = await equipmentService.createMaintenanceLog(validated);
      res.status(201).json({ success: true, message: 'Maintenance operation recorded successfully', data });
    } catch (err) {
      next(err);
    }
  }

  async getMaintenanceLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipment_id } = req.query;
      const data = await equipmentService.getMaintenanceLogs(equipment_id as string);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
