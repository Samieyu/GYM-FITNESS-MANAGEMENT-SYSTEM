import { EquipmentRepository, EquipmentItem, EquipmentReportItem, MaintenanceLogItem } from './equipment.repository';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError';
import { toEthiopianDate } from '../../shared/utils/ethiopianCalendar';

export class EquipmentService {
  private repo: EquipmentRepository;

  constructor() {
    this.repo = new EquipmentRepository();
  }

  private enrichEquipment(item: EquipmentItem) {
    const lastServiceEc = item.last_service_date ? toEthiopianDate(item.last_service_date) : null;
    const nextServiceEc = item.next_service_due ? toEthiopianDate(item.next_service_due) : null;
    return {
      ...item,
      last_service_ec: lastServiceEc ? `${lastServiceEc.formatted} (${lastServiceEc.formattedAm})` : null,
      next_service_ec: nextServiceEc ? `${nextServiceEc.formatted} (${nextServiceEc.formattedAm})` : null,
    };
  }

  private enrichReport(item: EquipmentReportItem) {
    const createdEc = toEthiopianDate(item.created_at);
    const resolvedEc = item.resolved_at ? toEthiopianDate(item.resolved_at) : null;
    return {
      ...item,
      created_at_ec: createdEc ? `${createdEc.formatted} (${createdEc.formattedAm})` : null,
      resolved_at_ec: resolvedEc ? `${resolvedEc.formatted} (${resolvedEc.formattedAm})` : null,
    };
  }

  private enrichMaintenance(item: MaintenanceLogItem) {
    const serviceEc = toEthiopianDate(item.service_date);
    const nextServiceEc = item.next_service_due ? toEthiopianDate(item.next_service_due) : null;
    return {
      ...item,
      service_date_ec: serviceEc ? `${serviceEc.formatted} (${serviceEc.formattedAm})` : null,
      next_service_due_ec: nextServiceEc ? `${nextServiceEc.formatted} (${nextServiceEc.formattedAm})` : null,
    };
  }

  async getAllEquipment(filters: { search?: string; status?: string; category?: string } = {}) {
    await this.repo.seedDefaultEquipmentIfEmpty();
    const list = await this.repo.getAllEquipment(filters);
    return list.map((item) => this.enrichEquipment(item));
  }

  async getEquipmentById(id: string) {
    const item = await this.repo.getEquipmentById(id);
    if (!item) {
      throw new NotFoundError('Equipment not found');
    }
    return this.enrichEquipment(item);
  }

  async createEquipment(data: {
    name: string;
    code: string;
    category: string;
    location?: string;
    status?: string;
    last_service_date?: string | null;
    next_service_due?: string | null;
  }) {
    const existing = await this.repo.getEquipmentByCode(data.code.trim().toUpperCase());
    if (existing) {
      throw new BadRequestError(`Equipment with code "${data.code}" already exists`);
    }

    const created = await this.repo.createEquipment({
      ...data,
      code: data.code.trim().toUpperCase(),
    });
    return this.enrichEquipment(created);
  }

  async updateEquipment(
    id: string,
    data: {
      name?: string;
      code?: string;
      category?: string;
      location?: string;
      status?: string;
      last_service_date?: string | null;
      next_service_due?: string | null;
    }
  ) {
    const existing = await this.repo.getEquipmentById(id);
    if (!existing) {
      throw new NotFoundError('Equipment not found');
    }

    if (data.code) {
      const codeDuplicate = await this.repo.getEquipmentByCode(data.code.trim().toUpperCase());
      if (codeDuplicate && codeDuplicate.id !== id) {
        throw new BadRequestError(`Equipment code "${data.code}" is already in use by another machine`);
      }
      data.code = data.code.trim().toUpperCase();
    }

    const updated = await this.repo.updateEquipment(id, data);
    if (!updated) {
      throw new NotFoundError('Equipment not found');
    }
    return this.enrichEquipment(updated);
  }

  async deleteEquipment(id: string) {
    const existing = await this.repo.getEquipmentById(id);
    if (!existing) {
      throw new NotFoundError('Equipment not found');
    }
    const success = await this.repo.deleteEquipment(id);
    return { success };
  }

  async createReport(data: {
    equipment_id: string;
    reported_by_user_id: string;
    issue_description: string;
    priority: string;
  }) {
    const equipment = await this.repo.getEquipmentById(data.equipment_id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    const report = await this.repo.createReport(data);
    return this.enrichReport(report);
  }

  async getAllReports(filters: { status?: string; equipment_id?: string } = {}) {
    const reports = await this.repo.getAllReports(filters);
    return reports.map((r) => this.enrichReport(r));
  }

  async updateReportStatus(id: string, status: 'open' | 'in_progress' | 'resolved') {
    const updated = await this.repo.updateReportStatus(id, status);
    if (!updated) {
      throw new NotFoundError('Report not found');
    }
    return this.enrichReport(updated);
  }

  async createMaintenanceLog(data: {
    equipment_id: string;
    serviced_by: string;
    cost: number;
    description: string;
    service_date?: string;
    next_service_due?: string | null;
    resolve_report_id?: string | null;
  }) {
    const equipment = await this.repo.getEquipmentById(data.equipment_id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }

    const log = await this.repo.createMaintenanceLog(data);
    return this.enrichMaintenance(log);
  }

  async getMaintenanceLogs(equipment_id?: string) {
    const logs = await this.repo.getMaintenanceLogs(equipment_id);
    return logs.map((l) => this.enrichMaintenance(l));
  }
}
