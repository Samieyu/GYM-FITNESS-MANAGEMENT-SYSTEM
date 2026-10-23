import { getStoredAccessToken } from './auth';

export interface ProgressMetric {
  id: string;
  member_id: string;
  weight_kg: number;
  height_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  arms_cm: number | null;
  thighs_cm: number | null;
  body_fat_percentage: number | null;
  photo_url: string | null;
  trainer_comment: string | null;
  trainer_name?: string | null;
  trainer_specialization?: string | null;
  trainer_commented_at?: string | null;
  recorded_date: string;
  created_at: string;
  bmi?: number | null;
  bmi_category?: string | null;
  delta_kg?: number | null;
}

export interface ProgressSummary {
  initial_weight: number | null;
  current_weight: number | null;
  total_change_kg: number | null;
  current_bmi: number | null;
  current_bmi_category: string | null;
  latest_fat_percentage: number | null;
}

export interface MemberProgressData {
  metrics: ProgressMetric[];
  summary: ProgressSummary;
}

export interface AssignedMemberSummary {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  member_code: string | null;
  fitness_goals: string | null;
  latest_weight_kg: number | null;
  latest_recorded_date: string | null;
  total_logs_count: number;
}

export interface LogMetricPayload {
  weightKg: number;
  heightCm?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  bodyFatPercentage?: number;
  photoUrl?: string;
  recordedDate?: string;
}

const getAuthHeaders = () => {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const logProgressMetricApi = async (payload: LogMetricPayload): Promise<ProgressMetric> => {
  const res = await fetch('/api/v1/progress', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to log progress metric');
  return data.data;
};

export const fetchMyProgressMetricsApi = async (): Promise<MemberProgressData> => {
  const res = await fetch('/api/v1/progress/my', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch progress metrics');
  return data.data;
};

export const fetchMemberProgressMetricsApi = async (memberId: string): Promise<MemberProgressData> => {
  const res = await fetch(`/api/v1/progress/member/${memberId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch member progress metrics');
  return data.data;
};

export const submitTrainerCommentApi = async (metricId: string, comment: string): Promise<ProgressMetric> => {
  const res = await fetch(`/api/v1/progress/${metricId}/comment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to submit trainer feedback');
  return data.data;
};

export const fetchAssignedMembersProgressApi = async (): Promise<AssignedMemberSummary[]> => {
  const res = await fetch('/api/v1/progress/members', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch assigned members');
  return data.data || [];
};
