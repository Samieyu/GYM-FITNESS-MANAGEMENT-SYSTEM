import { getStoredAccessToken } from './auth';
import { API_ROOT } from './client';

const API_BASE = `${API_ROOT}/ai`;

function getAuthHeaders() {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface YouTubeVideo {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  url: string;
}

export interface AiChatResponse {
  answer: string;
  videos?: YouTubeVideo[];
  timestamp: string;
}

export interface ExerciseExplanation {
  exerciseName: string;
  dbDetails: {
    name: string;
    category: string;
    muscle_group: string;
    equipment_needed: string;
    description: string;
    instructions: string;
  } | null;
  aiGuide: string;
  videos?: YouTubeVideo[];
}

export async function askFitnessCoachApi(question: string): Promise<AiChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    credentials: 'omit',
    headers: getAuthHeaders(),
    body: JSON.stringify({ question }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to query AI Coach');
  return data.data;
}

export async function explainExerciseApi(exerciseName: string): Promise<ExerciseExplanation> {
  const response = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    credentials: 'omit',
    headers: getAuthHeaders(),
    body: JSON.stringify({ exerciseName }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to explain exercise');
  return data.data;
}

export async function fetchMyAiProgressSummaryApi(): Promise<string> {
  const response = await fetch(`${API_BASE}/progress-summary`, {
    credentials: 'omit',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch AI progress summary');
  return data.data.summary;
}

export async function fetchMemberAiProgressSummaryApi(memberId: string): Promise<string> {
  const response = await fetch(`${API_BASE}/progress-summary/${memberId}`, {
    credentials: 'omit',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch member AI progress summary');
  return data.data.summary;
}
