import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getFinancialOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getFinancialOverview();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getAttendanceOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getAttendanceOverview();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async exportAttendanceCsv(_req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await analyticsService.generateAttendanceCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="titan_attendance_logs.csv"');
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }

  async exportMembersCsv(_req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await analyticsService.generateMembersCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="titan_members_roster.csv"');
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }

  async exportFinancialCsv(_req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await analyticsService.generateFinancialCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="titan_financial_report.csv"');
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}
