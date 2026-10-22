import { getStoredAccessToken } from './auth';

export interface WalkinRegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  planId: string;
  paymentMethod: 'cash' | 'bank_transfer';
  amount: number;
  referenceNote?: string;
  fitnessGoals?: string;
  emergencyContact?: string;
  assignedTrainerId?: string;
}

export interface WalkinRegistrationResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    isNewUser: boolean;
  };
  membership: any;
  payment: any;
  inviteSent: boolean;
  inviteToken?: string;
}

/**
 * Business Rule 10: Register Walk-In Member (Admin & Reception)
 */
export const registerWalkinMemberApi = async (
  payload: WalkinRegistrationInput
): Promise<WalkinRegistrationResponse> => {
  const token = getStoredAccessToken();
  const res = await fetch('/api/v1/reception/walk-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to register walk-in member');
  }

  return data.data;
};

/**
 * Trigger manual expiration & reminder check (Admin only)
 */
export const triggerManualExpiryCheckApi = async (): Promise<any> => {
  const token = getStoredAccessToken();
  const res = await fetch('/api/v1/cron/admin/run-expiry-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to run expiration check');
  }

  return data.data;
};
