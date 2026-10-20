import request from 'supertest';
import app from '../app';
import { WorkoutsRepository } from '../modules/workouts/workouts.repository';
import { generateAccessToken } from '../shared/utils/tokens';

// Mock DB pool
const mockClient = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
  release: jest.fn(),
};

jest.mock('../db/pool', () => ({
  query: jest.fn(),
  pool: {
    connect: jest.fn().mockImplementation(() => Promise.resolve(mockClient)),
    query: jest.fn(),
  },
}));

// Mock Email Service
jest.mock('../shared/services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendWalkinInvitationEmail: jest.fn().mockResolvedValue(undefined),
  sendPaymentConfirmationEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Workouts & AI Routine Engine Tests (Phase 6, Rules 10 & 11)', () => {
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const trainerUserId = 'b0000000-0000-0000-0000-000000000002';
  const trainerProfileId = 'trn-0000-0000-0000-000000000001';
  const memberId = 'c0000000-0000-0000-0000-000000000003';
  const exerciseId1 = 'ex000000-0000-0000-0000-000000000001';
  const exerciseId2 = 'ex000000-0000-0000-0000-000000000002';
  const planId = 'wp000000-0000-0000-0000-000000000001';

  const adminToken = generateAccessToken({
    userId: adminId,
    email: 'admin@gymfitness.local',
    role: 'admin',
  });

  const trainerToken = generateAccessToken({
    userId: trainerUserId,
    email: 'trainer@gymfitness.local',
    role: 'trainer',
  });

  const memberToken = generateAccessToken({
    userId: memberId,
    email: 'member@gymfitness.local',
    role: 'member',
  });

  const sampleExercises = [
    {
      id: exerciseId1,
      name: 'Barbell Bench Press',
      category: 'Strength',
      muscle_group: 'Chest',
      equipment_needed: 'Barbell, Bench',
      description: 'Chest pressing movement',
      instructions: 'Push bar up from chest',
      gif_or_image_url: null,
      created_at: new Date(),
    },
    {
      id: exerciseId2,
      name: 'Barbell Back Squat',
      category: 'Strength',
      muscle_group: 'Quadriceps, Glutes',
      equipment_needed: 'Barbell, Squat Rack',
      description: 'Lower body compound squat',
      instructions: 'Squat to parallel',
      gif_or_image_url: null,
      created_at: new Date(),
    },
  ];

  const sampleDraftPlan = {
    id: planId,
    member_id: memberId,
    trainer_id: trainerProfileId,
    title: 'Hypertrophy Muscle Builder & Density Program',
    description: 'Tailored intermediate program focusing on muscle gain across 3 training days per week.',
    status: 'draft' as const,
    is_ai_generated: true,
    approved_by_trainer_id: null,
    approved_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    member_first_name: 'John',
    member_last_name: 'Athlete',
    member_email: 'member@gymfitness.local',
    exercises: [
      {
        id: 'we000000-0000-0000-0000-000000000001',
        workout_plan_id: planId,
        exercise_id: exerciseId1,
        exercise_name: 'Barbell Bench Press',
        category: 'Strength',
        muscle_group: 'Chest',
        equipment_needed: 'Barbell, Bench',
        day_of_week: 1,
        sets: 4,
        reps: 8,
        rest_seconds: 60,
        notes: 'Keep shoulder blades pinched back.',
        order_index: 1,
      },
    ],
  };

  const sampleApprovedPlan = {
    ...sampleDraftPlan,
    status: 'approved' as const,
    approved_by_trainer_id: trainerProfileId,
    approved_at: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. EXERCISE LIBRARY
  // =========================================================================
  describe('GET /api/v1/workouts/exercises', () => {
    it('returns the list of gym exercises from library (200 OK)', async () => {
      jest.spyOn(WorkoutsRepository.prototype, 'getAllExercises').mockResolvedValue(sampleExercises as any);

      const res = await request(app)
        .get('/api/v1/workouts/exercises')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].name).toBe('Barbell Bench Press');
    });

    it('denies unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/workouts/exercises');
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 2. MEMBER AI WORKOUT REQUEST (Business Rules 10 & 11)
  // =========================================================================
  describe('POST /api/v1/workouts/request-ai (Business Rule 10: Goal Selection & AI Formulation)', () => {
    it('generates a draft routine matching member fitness goals with status=draft (201 Created)', async () => {
      jest.spyOn(WorkoutsRepository.prototype, 'getAllExercises').mockResolvedValue(sampleExercises as any);
      jest.spyOn(WorkoutsRepository.prototype, 'findMemberProfile').mockResolvedValue({ assigned_trainer_id: trainerProfileId });
      jest.spyOn(WorkoutsRepository.prototype, 'createWorkoutPlan').mockResolvedValue(sampleDraftPlan as any);

      const res = await request(app)
        .post('/api/v1/workouts/request-ai')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          goal: 'muscle_gain',
          experienceLevel: 'intermediate',
          daysPerWeek: 3,
          targetMuscleGroups: ['Chest', 'Back'],
          specialNotes: 'Focus on bench press technique',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.is_ai_generated).toBe(true);
      expect(res.body.data.title).toContain('Hypertrophy');
    });

    it('validates required fitness goal and days per week range', async () => {
      const res = await request(app)
        .post('/api/v1/workouts/request-ai')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          goal: 'invalid_goal',
          daysPerWeek: 10, // Invalid: exceeds max 6
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  // =========================================================================
  // 3. TRAINER APPROVAL GATE (Business Rule 11)
  // =========================================================================
  describe('PUT /api/v1/workouts/:id/approve (Business Rule 11: Trainer Approval Gate)', () => {
    it('allows a certified trainer to approve and activate draft routine (200 OK)', async () => {
      jest.spyOn(WorkoutsRepository.prototype, 'findPlanById').mockResolvedValue(sampleDraftPlan as any);
      jest.spyOn(WorkoutsRepository.prototype, 'findTrainerByUserId').mockResolvedValue({ id: trainerProfileId });
      jest.spyOn(WorkoutsRepository.prototype, 'approveWorkoutPlan').mockResolvedValue(sampleApprovedPlan as any);

      const res = await request(app)
        .put(`/api/v1/workouts/${planId}/approve`)
        .set('Authorization', `Bearer ${trainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.approved_by_trainer_id).toBe(trainerProfileId);
    });

    it('allows an administrator to approve draft routine (200 OK)', async () => {
      jest.spyOn(WorkoutsRepository.prototype, 'findPlanById').mockResolvedValue(sampleDraftPlan as any);
      jest.spyOn(WorkoutsRepository.prototype, 'findTrainerByUserId').mockResolvedValue(null);
      jest.spyOn(WorkoutsRepository.prototype, 'approveWorkoutPlan').mockResolvedValue(sampleApprovedPlan as any);

      const res = await request(app)
        .put(`/api/v1/workouts/${planId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('enforces Business Rule 11: denies member from self-approving routine with 403 Forbidden', async () => {
      const res = await request(app)
        .put(`/api/v1/workouts/${planId}/approve`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // =========================================================================
  // 4. TRAINER PENDING QUEUE & CUSTOM PLAN BUILDER
  // =========================================================================
  describe('Trainer Workflow: Pending Queue & Custom Plans', () => {
    it('allows trainer to retrieve pending draft plans awaiting review (200 OK)', async () => {
      jest.spyOn(WorkoutsRepository.prototype, 'findPendingDraftPlans').mockResolvedValue([sampleDraftPlan as any]);

      const res = await request(app)
        .get('/api/v1/workouts/trainer/pending')
        .set('Authorization', `Bearer ${trainerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('draft');
    });

    it('allows trainer to construct a custom workout plan directly (201 Created)', async () => {
      jest.spyOn(WorkoutsRepository.prototype, 'findTrainerByUserId').mockResolvedValue({ id: trainerProfileId });
      jest.spyOn(WorkoutsRepository.prototype, 'createWorkoutPlan').mockResolvedValue(sampleApprovedPlan as any);

      const res = await request(app)
        .post('/api/v1/workouts/trainer/custom')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          memberId,
          title: 'Custom Hypertrophy Routine',
          description: 'Specialized 4-week progression by Coach Alex',
          exercises: [
            {
              exerciseId: exerciseId1,
              dayOfWeek: 1,
              sets: 4,
              reps: 10,
              restSeconds: 60,
              notes: 'Touch chest lightly without bouncing',
              orderIndex: 1,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('approved');
    });
  });
});
