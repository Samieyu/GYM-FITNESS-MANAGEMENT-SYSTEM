import { getStoredAccessToken } from './auth';

const API_BASE = '/api/v1/analytics';

function getAuthHeaders() {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface FinancialOverview {
  totalRevenue: number;
  chapaRevenue: number;
  cashRevenue: number;
  bankTransferRevenue: number;
  successfulTransactions: number;
  activeMembershipsCount: number;
  maintenanceExpense: number;
  netMargin: number;
  revenueByMonth: Array<{ month: string; amount: number; transactions: number }>;
}

export interface AttendanceOverview {
  totalCheckins: number;
  grantedCount: number;
  deniedCount: number;
  denialRate: number;
  hourlyTraffic: Array<{ hour: number; count: number }>;
  topDenialReasons: Array<{ reason: string; count: number }>;
  topActiveMembers: Array<{ name: string; email: string; checkinCount: number }>;
}

export async function fetchFinancialOverviewApi(): Promise<FinancialOverview> {
  const response = await fetch(`${API_BASE}/financial`, {
    credentials: 'omit',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch financial overview');
  return data.data;
}

export async function fetchAttendanceOverviewApi(): Promise<AttendanceOverview> {
  const response = await fetch(`${API_BASE}/attendance`, {
    credentials: 'omit',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch attendance overview');
  return data.data;
}

export async function downloadAttendanceCsv(): Promise<void> {
  const token = getStoredAccessToken();
  const res = await fetch(`${API_BASE}/export/attendance`, {
    credentials: 'omit',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to export attendance CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'titan_attendance_logs.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadMembersCsv(): Promise<void> {
  const token = getStoredAccessToken();
  const res = await fetch(`${API_BASE}/export/members`, {
    credentials: 'omit',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to export members roster CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'titan_members_roster.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadFinancialCsv(): Promise<void> {
  const token = getStoredAccessToken();
  const res = await fetch(`${API_BASE}/export/financial`, {
    credentials: 'omit',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to export financial report CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'titan_financial_report.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
