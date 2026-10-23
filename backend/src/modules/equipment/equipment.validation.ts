import { z } from 'zod';

export const equipmentStatusEnum = z.enum(['operational', 'faulty', 'maintenance', 'decommissioned']);
export const reportPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const reportStatusEnum = z.enum(['open', 'in_progress', 'resolved']);

export const createEquipmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  code: z.string().min(2, 'Code must be at least 2 characters').max(50),
  category: z.string().min(2, 'Category must be specified').max(100),
  location: z.string().max(100).optional().default('Main Gym Floor'),
  status: equipmentStatusEnum.default('operational'),
  last_service_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
  next_service_due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
});

export const updateEquipmentSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  code: z.string().min(2).max(50).optional(),
  category: z.string().min(2).max(100).optional(),
  location: z.string().max(100).optional(),
  status: equipmentStatusEnum.optional(),
  last_service_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
  next_service_due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
});

export const createEquipmentReportSchema = z.object({
  equipment_id: z.string().uuid('Valid equipment ID is required'),
  issue_description: z.string().min(5, 'Please provide at least 5 characters describing the issue'),
  priority: reportPriorityEnum.default('medium'),
});

export const updateReportStatusSchema = z.object({
  status: reportStatusEnum,
});

export const createMaintenanceLogSchema = z.object({
  equipment_id: z.string().uuid('Valid equipment ID is required'),
  serviced_by: z.string().min(2, 'Serviced by / Technician name is required').max(150),
  cost: z.number().min(0, 'Cost must be non-negative').default(0),
  description: z.string().min(3, 'Maintenance description is required'),
  service_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  next_service_due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable(),
  resolve_report_id: z.string().uuid().optional().nullable(),
});
