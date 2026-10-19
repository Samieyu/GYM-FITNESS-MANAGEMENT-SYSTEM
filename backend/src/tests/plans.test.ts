import request from 'supertest';
import app from '../app';
import { plansRepository } from '../modules/plans/plans.repository';
import { generateAccessToken } from '../shared/utils/tokens';

// Mock DB pool to isolate test runs
jest.mock('../db/pool', () => ({
  query: jest.fn(),
  pool: {
    connect: jest.fn(),
  },
}));

// Mock Email Service
jest.mock('../shared/services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendInvitationEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('Plans & Pricing Engine Integration Tests (Phase 3 & Business Rule 1)', () => {
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const trainerId = 'b0000000-0000-0000-0000-000000000002';
  const memberId = 'c0000000-0000-0000-0000-000000000003';

  const adminToken = generateAccessToken({
    userId: adminId,
    email: 'admin@gymfitness.local',
    role: 'admin',
  });

  const trainerToken = generateAccessToken({
    userId: trainerId,
    email: 'trainer@gymfitness.local',
    role: 'trainer',
  });

  const memberToken = generateAccessToken({
    userId: memberId,
    email: 'member@gymfitness.local',
    role: 'member',
  });

  const samplePlan = {
    id: 'p0000000-0000-0000-0000-000000000001',
    name: 'Standard Monthly',
    description: 'Full access to gym facilities',
    duration_months: 1,
    price: '1500.00',
    image_url: '/uploads/plans/sample_plan.jpg',
    is_active: true,
    created_by_admin_id: adminId,
    created_at: new Date(),
    updated_at: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/plans (Public Visitor & Members)', () => {
    it('returns active plans for public visitors without authentication (200 OK)', async () => {
      jest.spyOn(plansRepository, 'findAll').mockResolvedValue([samplePlan]);

      const res = await request(app).get('/api/v1/plans');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].name).toBe('Standard Monthly');
      expect(res.body.data[0].price).toBe(1500);
    });

    it('returns single plan details by ID (200 OK)', async () => {
      jest.spyOn(plansRepository, 'findById').mockResolvedValue(samplePlan);

      const res = await request(app).get(`/api/v1/plans/${samplePlan.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(samplePlan.id);
    });

    it('returns 404 Not Found for non-existent plan ID', async () => {
      jest.spyOn(plansRepository, 'findById').mockResolvedValue(null);

      const res = await request(app).get('/api/v1/plans/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Business Rule 1: Role enforcement on Plan creation & Pricing', () => {
    it('denies unauthenticated requests on POST /api/v1/plans (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/v1/plans')
        .send({
          name: 'VIP Annual',
          durationMonths: 12,
          price: 15000,
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('denies trainers from creating or pricing plans with 403 Forbidden (Business Rule 1)', async () => {
      const res = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          name: 'Trainer Special Tier',
          durationMonths: 1,
          price: 500,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('denies members from modifying plan prices with 403 Forbidden (Business Rule 1)', async () => {
      const res = await request(app)
        .put(`/api/v1/plans/${samplePlan.id}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          price: 100,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Admin Plan Management & Audit Logging', () => {
    it('allows Admin to create a plan with pricing and image (201 Created)', async () => {
      jest.spyOn(plansRepository, 'findByName').mockResolvedValue(null);
      jest.spyOn(plansRepository, 'createPlan').mockResolvedValue({
        ...samplePlan,
        name: 'Quarterly Fitness',
        duration_months: 3,
        price: '4000.00',
      });
      const auditSpy = jest.spyOn(plansRepository, 'recordAuditLog').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Quarterly Fitness',
          description: 'Unlimited access + trainer assessment',
          durationMonths: 3,
          price: 4000,
          imageUrl: 'https://images.example.com/quarterly.jpg',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Quarterly Fitness');
      expect(res.body.data.price).toBe(4000);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: adminId,
          action: 'create_plan',
          entityType: 'membership_plan',
        })
      );
    });

    it('allows Admin to update plan price and logs price change in audit_logs', async () => {
      jest.spyOn(plansRepository, 'findById').mockResolvedValue(samplePlan);
      jest.spyOn(plansRepository, 'updatePlan').mockResolvedValue({
        ...samplePlan,
        price: '1800.00',
      });
      const auditSpy = jest.spyOn(plansRepository, 'recordAuditLog').mockResolvedValue();

      const res = await request(app)
        .put(`/api/v1/plans/${samplePlan.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 1800,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(1800);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: adminId,
          action: 'update_plan_price',
          entityType: 'membership_plan',
        })
      );
    });

    it('rejects plan creation with negative price (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Price Plan',
          durationMonths: 1,
          price: -500,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects plan creation with duplicate name (409 Conflict)', async () => {
      jest.spyOn(plansRepository, 'findByName').mockResolvedValue(samplePlan);

      const res = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Standard Monthly',
          durationMonths: 1,
          price: 1500,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('allows Admin to upload image from local storage via base64 (200 OK)', async () => {
      // 1x1 transparent PNG base64
      const testPngBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

      const res = await request(app)
        .post('/api/v1/plans/upload-image')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          imageBase64: testPngBase64,
          imageName: 'my_local_gym_photo.png',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.imageUrl).toContain('/uploads/plans/');
      expect(res.body.data.imageUrl).toContain('.png');
    });
  });
});
