import { getStoredAccessToken } from './auth';

export interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment_needed: string | null;
  description: string | null;
  instructions: string | null;
  gif_or_image_url: string | null;
  created_at: string;
}

export interface WorkoutExerciseItem {
  id: string;
  workout_plan_id: string;
  exercise_id: string;
  exercise_name: string;
  category: string;
  muscle_group: string;
  equipment_needed: string | null;
  day_of_week: number;
  sets: number;
  reps: number;
  rest_seconds: number | null;
  notes: string | null;
  order_index: number;
}

export interface WorkoutPlanItem {
  id: string;
  member_id: string;
  trainer_id: string | null;
  title: string;
  description: string | null;
  status: 'draft' | 'approved' | 'active' | 'completed' | 'archived';
  is_ai_generated: boolean;
  approved_by_trainer_id: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  member_first_name?: string;
  member_last_name?: string;
  member_email?: string;
  trainer_first_name?: string;
  trainer_last_name?: string;
  exercises?: WorkoutExerciseItem[];
}

export interface AiWorkoutRequestParams {
  goal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  targetMuscleGroups?: string[];
  specialNotes?: string;
}

const getAuthHeaders = () => {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Fetch list of all exercises from the gym library
 */
export const fetchExerciseLibraryApi = async (): Promise<ExerciseItem[]> => {
  const res = await fetch('/api/v1/workouts/exercises', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to fetch exercise library');
  }

  return data.data || [];
};

/**
 * Fetch member's current active approved workout plan
 */
export const fetchMyActiveWorkoutApi = async (): Promise<WorkoutPlanItem | null> => {
  const res = await fetch('/api/v1/workouts/my-active', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to fetch active workout');
  }

  return data.data || null;
};

/**
 * Fetch member's workout plan history (drafts + completed)
 */
export const fetchMyWorkoutHistoryApi = async (): Promise<WorkoutPlanItem[]> => {
  const res = await fetch('/api/v1/workouts/my-plans', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to fetch workout history');
  }

  return data.data || [];
};

/**
 * Request new AI-generated draft workout routine (Business Rules 10 & 11)
 */
export const requestAiWorkoutPlanApi = async (
  params: AiWorkoutRequestParams
): Promise<WorkoutPlanItem> => {
  const res = await fetch('/api/v1/workouts/request-ai', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'AI workout generation failed');
  }

  return data.data;
};

/**
 * Trainer / Admin view of pending draft workout plans awaiting review
 */
export const fetchTrainerPendingDraftsApi = async (): Promise<WorkoutPlanItem[]> => {
  const res = await fetch('/api/v1/workouts/trainer/pending', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to fetch pending workout plans');
  }

  return data.data || [];
};

/**
 * Trainer / Admin approve and activate draft workout routine (Business Rule 11)
 */
export const approveWorkoutPlanApi = async (planId: string): Promise<WorkoutPlanItem> => {
  const res = await fetch(`/api/v1/workouts/${planId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to approve workout plan');
  }

  return data.data;
};

/**
 * Trainer manually creates and activates custom workout plan for member
 */
export const createCustomWorkoutPlanApi = async (payload: {
  memberId: string;
  title: string;
  description?: string;
  exercises: Array<{
    exerciseId: string;
    dayOfWeek: number;
    sets: number;
    reps: number;
    restSeconds?: number;
    notes?: string;
    orderIndex: number;
  }>;
}): Promise<WorkoutPlanItem> => {
  const res = await fetch('/api/v1/workouts/trainer/custom', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to create custom workout plan');
  }

  return data.data;
};
