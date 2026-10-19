import { getStoredAccessToken } from './auth';

export interface QrPassData {
  token: string;
  expiresInSeconds: number;
  timestamp: number;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  membership: {
    id: string;
    plan_id: string;
    plan_name: string;
    status: 'active';
    start_date: string;
    end_date: string;
  } | null;
}

export interface ScanResultData {
  status: 'allowed' | 'denied';
  message: string;
  checkinId: string;
  checkinTime: string;
  denialReason?: string | null;
  isRepeatCheckin?: boolean;
  minutesSinceLastCheckin?: number;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  membership?: {
    id: string;
    plan_id: string;
    plan_name: string;
    status: 'active';
    start_date: string;
    end_date: string;
  } | null;
}

export interface CheckinRecordItem {
  id: string;
  member_id: string;
  checkin_time: string;
  status: 'allowed' | 'denied';
  denial_reason: string | null;
  checkin_type: 'reception_qr' | 'reception_manual' | 'self_qr';
  scanned_by_user_id: string | null;
  created_at: string;
  member_first_name?: string;
  member_last_name?: string;
  member_email?: string;
  plan_name?: string;
  scanned_by_first_name?: string;
  scanned_by_last_name?: string;
}

const getAuthHeaders = () => {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Fetch dynamic 60s rotating QR pass for current logged-in member
 */
export const fetchMyQrPassApi = async (): Promise<QrPassData> => {
  const res = await fetch('/api/v1/checkins/my-qr', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to fetch QR pass');
  }

  return data.data;
};

/**
 * Scan member QR or manual Member ID at front desk (Reception & Admin)
 */
export const scanCheckinApi = async (params: {
  scannedData: string;
  checkinType?: 'reception_qr' | 'reception_manual' | 'self_qr';
  allowOverride?: boolean;
}): Promise<ScanResultData> => {
  const res = await fetch('/api/v1/checkins/scan', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Scan check-in failed');
  }

  return data.data;
};

/**
 * Get recent check-ins log for reception/admin
 */
export const fetchRecentCheckinsApi = async (limit = 30): Promise<CheckinRecordItem[]> => {
  const res = await fetch(`/api/v1/checkins/recent?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to fetch recent check-ins');
  }

  return data.data || [];
};

/**
 * Get member's personal attendance history
 */
export const fetchMyCheckinHistoryApi = async (limit = 30): Promise<CheckinRecordItem[]> => {
  const res = await fetch(`/api/v1/checkins/my-history?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to fetch check-in history');
  }

  return data.data || [];
};
