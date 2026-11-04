export type UserRole = 'admin' | 'reception' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  phone?: string | null;
  isVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = 'sweatbox_gym_access_token';
const REFRESH_TOKEN_KEY = 'sweatbox_gym_refresh_token';
const USER_KEY = 'sweatbox_gym_user';

export const getStoredAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getStoredRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setStoredAuth = (tokens: AuthTokens, user: User): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const API_BASE = '/api/v1/auth';

export const registerMemberApi = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
  fitnessGoals?: string;
}) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Registration failed');
  if (json.data?.accessToken && json.data?.user) {
    setStoredAuth(
      { accessToken: json.data.accessToken, refreshToken: json.data.refreshToken || '' },
      json.data.user
    );
  }
  return json;
};

export const loginApi = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Login failed');
  setStoredAuth(
    { accessToken: json.data.accessToken, refreshToken: json.data.refreshToken },
    json.data.user
  );
  return json.data;
};

export const verifyEmailApi = async (token: string) => {
  const res = await fetch(`${API_BASE}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Verification failed');
  return json;
};

export const resendVerificationApi = async (email: string) => {
  const res = await fetch(`${API_BASE}/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to resend verification email');
  return json;
};

export const requestPasswordResetApi = async (email: string) => {
  const res = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to request password reset');
  return json;
};

export const resetPasswordApi = async (token: string, newPassword: string) => {
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Password reset failed');
  return json;
};

export const logoutApi = async () => {
  const refreshToken = getStoredRefreshToken();
  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  clearStoredAuth();
};

export interface StaffMember {
  id: string;
  email: string;
  role: 'trainer' | 'reception';
  first_name: string;
  last_name: string;
  phone?: string | null;
  photo_url?: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface RegisterStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'trainer' | 'reception';
  password: string;
  specialization?: string;
  bio?: string;
}

export const fetchStaffMembersApi = async (): Promise<StaffMember[]> => {
  const token = getStoredAccessToken();
  const res = await fetch(`${API_BASE}/admin/staff`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to fetch staff members');
  return json.data;
};

export const registerStaffApi = async (data: RegisterStaffPayload): Promise<{
  message: string;
  staff: StaffMember;
  inviteSent: boolean;
}> => {
  const token = getStoredAccessToken();
  const res = await fetch(`${API_BASE}/admin/register-staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to register staff');
  return json.data;
};
