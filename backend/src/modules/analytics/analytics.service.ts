import { AnalyticsRepository } from './analytics.repository';
import { toEthiopianDate } from '../../shared/utils/ethiopianCalendar';

export class AnalyticsService {
  private repo: AnalyticsRepository;

  constructor() {
    this.repo = new AnalyticsRepository();
  }

  async getFinancialOverview() {
    return this.repo.getFinancialOverview();
  }

  async getAttendanceOverview() {
    return this.repo.getAttendanceOverview();
  }

  /**
   * Helper to escape CSV cell
   */
  private escapeCsv(val: any): string {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }

  async generateAttendanceCsv(): Promise<string> {
    const rows = await this.repo.getExportAttendanceRows();
    const headers = [
      'Record ID',
      'Member Name',
      'Email',
      'Phone',
      'Check-in Time (Gregorian)',
      'Check-in Date (Ethiopian Calendar / ዓ.ም)',
      'Status',
      'Denial Reason',
      'Check-in Type',
    ];

    const lines = [headers.map((h) => this.escapeCsv(h)).join(',')];

    for (const r of rows) {
      const ethDate = toEthiopianDate(r.checkin_time);
      const ethFormatted = ethDate ? `${ethDate.formatted} (${ethDate.formattedAm})` : 'N/A';

      lines.push(
        [
          this.escapeCsv(r.id),
          this.escapeCsv(r.member_name),
          this.escapeCsv(r.member_email),
          this.escapeCsv(r.member_phone || 'N/A'),
          this.escapeCsv(new Date(r.checkin_time).toLocaleString()),
          this.escapeCsv(ethFormatted),
          this.escapeCsv(r.status),
          this.escapeCsv(r.denial_reason),
          this.escapeCsv(r.checkin_type),
        ].join(',')
      );
    }

    return lines.join('\n');
  }

  async generateMembersCsv(): Promise<string> {
    const rows = await this.repo.getExportMembersRows();
    const headers = [
      'User ID',
      'Member Name',
      'Email',
      'Phone',
      'Active Plan',
      'Membership Status',
      'Start Date (E.C.)',
      'Expiry Date (E.C.)',
      'Joined Date (E.C.)',
    ];

    const lines = [headers.map((h) => this.escapeCsv(h)).join(',')];

    for (const r of rows) {
      const startEth = r.start_date ? toEthiopianDate(r.start_date) : null;
      const endEth = r.end_date ? toEthiopianDate(r.end_date) : null;
      const joinEth = toEthiopianDate(r.joined_date);

      lines.push(
        [
          this.escapeCsv(r.id),
          this.escapeCsv(r.member_name),
          this.escapeCsv(r.email),
          this.escapeCsv(r.phone || 'N/A'),
          this.escapeCsv(r.plan_name),
          this.escapeCsv(r.membership_status),
          this.escapeCsv(startEth ? `${startEth.formatted} (${startEth.formattedAm})` : 'N/A'),
          this.escapeCsv(endEth ? `${endEth.formatted} (${endEth.formattedAm})` : 'N/A'),
          this.escapeCsv(joinEth ? `${joinEth.formatted} (${joinEth.formattedAm})` : 'N/A'),
        ].join(',')
      );
    }

    return lines.join('\n');
  }

  async generateFinancialCsv(): Promise<string> {
    const rows = await this.repo.getExportFinancialRows();
    const headers = [
      'Payment ID',
      'Payment Reference',
      'Member Name',
      'Email',
      'Amount (ETB)',
      'Currency',
      'Payment Method',
      'Status',
      'Date (Gregorian)',
      'Date (Ethiopian Calendar / ዓ.ም)',
    ];

    const lines = [headers.map((h) => this.escapeCsv(h)).join(',')];

    for (const r of rows) {
      const ethDate = toEthiopianDate(r.payment_date);
      const ethFormatted = ethDate ? `${ethDate.formatted} (${ethDate.formattedAm})` : 'N/A';

      lines.push(
        [
          this.escapeCsv(r.id),
          this.escapeCsv(r.payment_reference),
          this.escapeCsv(r.member_name),
          this.escapeCsv(r.member_email),
          this.escapeCsv(r.amount),
          this.escapeCsv(r.currency),
          this.escapeCsv(r.payment_method),
          this.escapeCsv(r.status),
          this.escapeCsv(new Date(r.payment_date).toLocaleString()),
          this.escapeCsv(ethFormatted),
        ].join(',')
      );
    }

    return lines.join('\n');
  }
}
