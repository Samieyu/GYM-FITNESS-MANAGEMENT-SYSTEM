import { getStoredAccessToken } from './auth';

export interface FitnessClass {
  id: string;
  title: string;
  description: string | null;
  trainer_id: string;
  trainer_name?: string;
  trainer_specialization?: string;
  capacity: number;
  start_time: string;
  end_time: string;
  location: string;
  is_cancelled: boolean;
  booked_count: number;
  waitlist_count: number;
  my_booking_status?: 'booked' | 'waitlisted' | 'cancelled' | 'attended' | null;
  my_waitlist_position?: number | null;
  created_at: string;
}

export interface ClassBooking {
  booking_id: string;
  booking_status: 'booked' | 'waitlisted' | 'cancelled' | 'attended';
  waitlist_position: number | null;
  booked_at: string;
  class_id: string;
  title: string;
  description: string | null;
  capacity: number;
  start_time: string;
  end_time: string;
  location: string;
  is_cancelled: boolean;
  trainer_name: string;
}

export interface RosterAttendee {
  id: string;
  class_id: string;
  member_id: string;
  status: 'booked' | 'waitlisted' | 'cancelled' | 'attended';
  waitlist_position: number | null;
  booked_at: string;
  cancelled_at: string | null;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_phone: string | null;
}

export interface TrainerOption {
  id: string;
  specialization: string;
  is_available: boolean;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const getAuthHeaders = () => {
  const token = getStoredAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchUpcomingClassesApi = async (): Promise<FitnessClass[]> => {
  const res = await fetch('/api/v1/classes', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to load classes');
  return data.data || [];
};

export const bookClassApi = async (classId: string): Promise<any> => {
  const res = await fetch(`/api/v1/classes/${classId}/book`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to book class');
  return data;
};

export const cancelClassBookingApi = async (classId: string): Promise<any> => {
  const res = await fetch(`/api/v1/classes/${classId}/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to cancel booking');
  return data;
};

export const fetchMyBookingsApi = async (): Promise<ClassBooking[]> => {
  const res = await fetch('/api/v1/classes/my/bookings', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to load bookings');
  return data.data || [];
};

export const fetchClassRosterApi = async (classId: string): Promise<RosterAttendee[]> => {
  const res = await fetch(`/api/v1/classes/${classId}/roster`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to load class roster');
  return data.data || [];
};

export const updateAttendanceApi = async (
  classId: string,
  memberId: string,
  status: 'attended' | 'booked' | 'cancelled'
): Promise<any> => {
  const res = await fetch(`/api/v1/classes/${classId}/attendance/${memberId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to update attendance');
  return data;
};

export const createClassApi = async (payload: {
  title: string;
  description?: string;
  trainerId: string;
  capacity: number;
  startTime: string;
  endTime: string;
  location?: string;
}): Promise<FitnessClass> => {
  const res = await fetch('/api/v1/classes', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to create class');
  return data.data;
};

export const fetchTrainersApi = async (): Promise<TrainerOption[]> => {
  const res = await fetch('/api/v1/classes/trainers', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to load trainers');
  return data.data || [];
};
