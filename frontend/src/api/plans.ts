import { getStoredAccessToken } from './auth';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  durationMonths: number;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = '/api/v1/plans';

const getAuthHeaders = () => {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchPublicPlansApi = async (): Promise<Plan[]> => {
  const res = await fetch(API_BASE);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch membership plans');
  return json.data;
};

export const fetchAllAdminPlansApi = async (): Promise<Plan[]> => {
  const res = await fetch(`${API_BASE}/admin/all`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch admin plans');
  return json.data;
};

export const createPlanApi = async (data: {
  name: string;
  description?: string;
  durationMonths: number;
  price: number;
  imageUrl?: string | null;
  imageBase64?: string | null;
  imageName?: string | null;
  isActive?: boolean;
}): Promise<Plan> => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to create plan');
  return json.data;
};

export const updatePlanApi = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    durationMonths?: number;
    price?: number;
    imageUrl?: string | null;
    imageBase64?: string | null;
    imageName?: string | null;
    isActive?: boolean;
  }
): Promise<Plan> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to update plan');
  return json.data;
};

export const uploadPlanImageApi = async (
  imageBase64: string,
  imageName: string
): Promise<{ imageUrl: string }> => {
  const res = await fetch(`${API_BASE}/upload-image`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ imageBase64, imageName }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to upload plan image');
  return json.data;
};
