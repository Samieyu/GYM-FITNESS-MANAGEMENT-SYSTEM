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

import { API_ROOT, safeJson } from './client';

export const clearStoredAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const API_BASE = `${API_ROOT}/auth`;

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
  const json = await safeJson(res);
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
  const json = await safeJson(res);
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
  const json = await safeJson(res);
  if (!res.ok) throw new Error(json.error?.message || 'Verification failed');
  return json;
};

export const resendVerificationApi = async (email: string) => {
  const res = await fetch(`${API_BASE}/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await safeJson(res);
  if (!res.ok) throw new Error(json.error?.message || 'Failed to resend verification email');
  return json;
};

export const requestPasswordResetApi = async (email: string) => {
  const res = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await safeJson(res);
  if (!res.ok) throw new Error(json.error?.message || 'Failed to request password reset');
  return json;
};

export const resetPasswordApi = async (token: string, newPassword: string) => {
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const json = await safeJson(res);
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

export const updateProfilePhotoApi = async (photoUrl: string | null): Promise<User> => {
  const token = getStoredAccessToken();
  const res = await fetch(`${API_BASE}/profile-photo`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ photoUrl }),
  });
  const json = await safeJson(res);
  if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to update profile photo');
  const user: User = json.data;
  const stored = getStoredUser();
  if (stored) {
    const updated = { ...stored, photoUrl: user.photoUrl };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  }
  return user;
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

export const refreshTokensApi = async (): Promise<boolean> => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const json = await safeJson(res);
    if (json.data?.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, json.data.accessToken);
      if (json.data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, json.data.refreshToken);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = getStoredAccessToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await refreshTokensApi();
    if (refreshed) {
      token = getStoredAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
};

export const fetchStaffMembersApi = async (): Promise<StaffMember[]> => {
  const res = await authenticatedFetch(`${API_BASE}/admin/staff`);
  const json = await safeJson(res);
  if (!res.ok) {
    const detailMsg = Array.isArray(json.error?.details) && json.error.details.length > 0
      ? json.error.details.map((d: any) => d.message || d.field).join(' • ')
      : null;
    throw new Error(detailMsg || json.error?.message || json.message || 'Failed to fetch staff members');
  }
  return json.data || [];
};

export const registerStaffApi = async (data: RegisterStaffPayload): Promise<{
  message: string;
  staff: StaffMember;
  inviteSent: boolean;
}> => {
  const res = await authenticatedFetch(`${API_BASE}/admin/register-staff`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const json = await safeJson(res);
  if (!res.ok) {
    const detailMsg = Array.isArray(json.error?.details) && json.error.details.length > 0
      ? json.error.details.map((d: any) => d.message || d.field).join(' • ')
      : null;
    throw new Error(detailMsg || json.error?.message || json.message || 'Failed to register staff');
  }
  return json.data;
};
