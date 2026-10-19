import { getStoredAccessToken } from './auth';

export interface Membership {
  id: string;
  member_id: string;
  plan_id: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  auto_renew: boolean;
  plan_name?: string;
  plan_price?: number;
  duration_months?: number;
  plan_image_url?: string | null;
  daysRemaining?: number;
}

export interface Payment {
  id: string;
  member_id: string;
  membership_id: string | null;
  amount: number;
  currency: string;
  payment_method: 'chapa' | 'cash' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference: string;
  chapa_transaction_id: string | null;
  recorded_by_user_id: string | null;
  raw_response?: any;
  created_at: string;
  plan_name?: string;
  member_email?: string;
  member_first_name?: string;
  member_last_name?: string;
}

const getAuthHeaders = () => {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Initialize Chapa online payment for logged-in member
 */
export const initializeChapaApi = async (
  planId: string,
  returnUrl?: string
): Promise<{ checkoutUrl: string | null; txRef: string; amount: number; planName: string; isLiveGateway: boolean }> => {
  const res = await fetch('/api/v1/payments/chapa/initialize', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ planId, returnUrl }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to initialize payment');
  }

  return data.data;
};

/**
 * Fetch currently active membership for logged-in member
 */
export const fetchMyActiveMembershipApi = async (): Promise<Membership | null> => {
  const res = await fetch('/api/v1/memberships/my-active', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to fetch membership details');
  }

  return data.data;
};

/**
 * Fetch payment history for logged-in member
 */
export const fetchMyPaymentHistoryApi = async (): Promise<Payment[]> => {
  const res = await fetch('/api/v1/payments/my-history', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to fetch payment history');
  }

  return data.data || [];
};

/**
 * Record manual offline payment (Admin and Reception only)
 */
export const recordManualPaymentApi = async (payload: {
  memberId: string;
  planId: string;
  paymentMethod: 'cash' | 'bank_transfer';
  amount: number;
  referenceNote?: string;
}): Promise<{ payment: Payment; membership: Membership }> => {
  const res = await fetch('/api/v1/payments/manual', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to record manual payment');
  }

  return data.data;
};

/**
 * Fetch all payments for Admin & Reception
 */
export const fetchAllPaymentsAdminApi = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
}): Promise<{ payments: Payment[]; pagination: any }> => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', params.page.toString());
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.status) query.set('status', params.status);
  if (params?.paymentMethod) query.set('paymentMethod', params.paymentMethod);

  const res = await fetch(`/api/v1/payments/admin/all?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to load payments list');
  }

  return {
    payments: data.data || [],
    pagination: data.pagination,
  };
};
