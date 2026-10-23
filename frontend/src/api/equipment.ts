import { getStoredAccessToken } from './auth';

export interface Equipment {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string | null;
  status: 'operational' | 'faulty' | 'maintenance' | 'decommissioned';
  last_service_date: string | null;
  next_service_due: string | null;
  open_reports_count?: number;
  last_service_ec?: string | null;
  next_service_ec?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EquipmentReport {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_code?: string;
  equipment_location?: string;
  reported_by_user_id: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_role?: string;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  created_at_ec?: string | null;
  resolved_at_ec?: string | null;
}

export interface MaintenanceLog {
  id: string;
  equipment_id: string;
  equipment_name?: string;
  equipment_code?: string;
  equipment_category?: string;
  serviced_by: string;
  cost: number;
  description: string;
  service_date: string;
  next_service_due: string | null;
  service_date_ec?: string | null;
  next_service_due_ec?: string | null;
  created_at: string;
}

export interface CreateEquipmentPayload {
  name: string;
  code: string;
  category: string;
  location?: string;
  status?: 'operational' | 'faulty' | 'maintenance' | 'decommissioned';
  last_service_date?: string | null;
  next_service_due?: string | null;
}

export interface UpdateEquipmentPayload {
  name?: string;
  code?: string;
  category?: string;
  location?: string;
  status?: 'operational' | 'faulty' | 'maintenance' | 'decommissioned';
  last_service_date?: string | null;
  next_service_due?: string | null;
}

export interface CreateReportPayload {
  equipment_id: string;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CreateMaintenanceLogPayload {
  equipment_id: string;
  serviced_by: string;
  cost: number;
  description: string;
  service_date?: string;
  next_service_due?: string | null;
  resolve_report_id?: string | null;
}

const API_BASE = '/api/v1/equipment';

function getAuthHeaders() {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchEquipmentApi(filters: { search?: string; status?: string; category?: string } = {}): Promise<Equipment[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);

  const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { credentials: 'omit', headers: getAuthHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch equipment list');
  return data.data;
}

export async function createEquipmentApi(payload: CreateEquipmentPayload): Promise<Equipment> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    credentials: 'omit',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create equipment');
  return data.data;
}

export async function updateEquipmentApi(id: string, payload: UpdateEquipmentPayload): Promise<Equipment> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    credentials: 'omit',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update equipment');
  return data.data;
}

export async function deleteEquipmentApi(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'omit',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete equipment');
}

export async function fetchEquipmentReportsApi(filters: { status?: string; equipment_id?: string } = {}): Promise<EquipmentReport[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.equipment_id) params.set('equipment_id', filters.equipment_id);

  const url = `${API_BASE}/reports${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { credentials: 'omit', headers: getAuthHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch equipment reports');
  return data.data;
}

export async function createEquipmentReportApi(payload: CreateReportPayload): Promise<EquipmentReport> {
  const response = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    credentials: 'omit',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit defect report');
  return data.data;
}

export async function updateReportStatusApi(id: string, status: 'open' | 'in_progress' | 'resolved'): Promise<EquipmentReport> {
  const response = await fetch(`${API_BASE}/reports/${id}/status`, {
    method: 'PATCH',
    credentials: 'omit',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update report status');
  return data.data;
}

export async function fetchMaintenanceLogsApi(equipment_id?: string): Promise<MaintenanceLog[]> {
  const params = new URLSearchParams();
  if (equipment_id) params.set('equipment_id', equipment_id);

  const url = `${API_BASE}/maintenance${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { credentials: 'omit', headers: getAuthHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch maintenance logs');
  return data.data;
}

export async function createMaintenanceLogApi(payload: CreateMaintenanceLogPayload): Promise<MaintenanceLog> {
  const response = await fetch(`${API_BASE}/maintenance`, {
    method: 'POST',
    credentials: 'omit',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to record maintenance operation');
  return data.data;
}
