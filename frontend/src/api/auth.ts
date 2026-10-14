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

const ACCESS_TOKEN_KEY = 'titan_gym_access_token';
const REFRESH_TOKEN_KEY = 'titan_gym_refresh_token';
const USER_KEY = 'titan_gym_user';

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
