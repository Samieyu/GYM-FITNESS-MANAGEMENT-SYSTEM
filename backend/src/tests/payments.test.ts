import request from 'supertest';
import crypto from 'crypto';
import app from '../app';
import { PaymentsRepository } from '../modules/payments/payments.repository';
import { generateAccessToken } from '../shared/utils/tokens';
import { config } from '../config';

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

describe('Payments & Membership Activation Tests (Phase 4, Rules 2, 3, 4)', () => {
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const receptionId = 'd0000000-0000-0000-0000-000000000001';
  const trainerId = 'b0000000-0000-0000-0000-000000000002';
  const memberId = 'c0000000-0000-0000-0000-000000000003';
  const planId = 'e0000000-0000-0000-0000-000000000001';

  const adminToken = generateAccessToken({
    userId: adminId,
    email: 'admin@gymfitness.local',
    role: 'admin',
  });

  const receptionToken = generateAccessToken({
    userId: receptionId,
    email: 'reception@gymfitness.local',
    role: 'reception',
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
    id: planId,
    name: 'Standard Monthly',
    description: 'Full access to gym facilities',
    duration_months: 1,
    price: 1500,
    image_url: '/uploads/plans/sample_plan.jpg',
    is_active: true,
  };

  const sampleMemberUser = {
    id: memberId,
    email: 'member@gymfitness.local',
    first_name: 'John',
    last_name: 'Member',
    role: 'member',
    is_active: true,
    is_verified: true,
  };

  const samplePendingPayment = {
    id: 'pay-0000-0000-0000-000000000001',
    member_id: memberId,
    membership_id: 'mem-0000-0000-0000-000000000001',
    amount: 1500,
    currency: 'ETB',
    payment_method: 'chapa' as const,
    status: 'pending' as const,
    payment_reference: 'TX-GYM-12345-ABCDEF',
    chapa_transaction_id: null,
    recorded_by_user_id: null,
    raw_response: null,
    created_at: new Date(),
    updated_at: new Date(),
    member_email: 'member@gymfitness.local',
    member_first_name: 'John',
    member_last_name: 'Member',
    plan_name: 'Standard Monthly',
  };

  const sampleActiveMembership = {
    id: 'mem-0000-0000-0000-000000000001',
    member_id: memberId,
    plan_id: planId,
    status: 'active' as const,
    start_date: '2026-10-18',
    end_date: '2026-11-18',
    auto_renew: false,
    reminder_7d_sent: false,
    reminder_1d_sent: false,
    created_at: new Date(),
    updated_at: new Date(),
    plan_name: 'Standard Monthly',
    plan_price: 1500,
    duration_months: 1,
    plan_image_url: null,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. CHAPA INITIALIZATION (Business Rules 2 & 3)
  // =========================================================================
  describe('POST /api/v1/payments/chapa/initialize (Business Rules 2 & 3)', () => {
    it('allows a member to initialize Chapa checkout for an active plan (200 OK)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findPlanById').mockResolvedValue(samplePlan);
      jest.spyOn(PaymentsRepository.prototype, 'findActiveMembershipByMemberId').mockResolvedValue(null);
      jest.spyOn(PaymentsRepository.prototype, 'createPendingMembership').mockResolvedValue({
        ...sampleActiveMembership,
        status: 'pending',
      });
      jest.spyOn(PaymentsRepository.prototype, 'createPayment').mockResolvedValue(samplePendingPayment);

      const res = await request(app)
        .post('/api/v1/payments/chapa/initialize')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ planId });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('checkoutUrl');
      expect(res.body.data).toHaveProperty('txRef');
      expect(res.body.data.amount).toBe(1500);
      expect(res.body.data.planName).toBe('Standard Monthly');
    });

    it('denies unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/payments/chapa/initialize')
        .send({ planId });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('denies non-members (trainers) with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/payments/chapa/initialize')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({ planId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('enforces Business Rule 2: blocks checkout if member already has active membership (409 Conflict)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findPlanById').mockResolvedValue(samplePlan);
      jest.spyOn(PaymentsRepository.prototype, 'findActiveMembershipByMemberId').mockResolvedValue(sampleActiveMembership);

      const res = await request(app)
        .post('/api/v1/payments/chapa/initialize')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ planId });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('already has an active membership');
    });

    it('rejects initialization for non-existent plan with 404 Not Found', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findPlanById').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/payments/chapa/initialize')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ planId });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =========================================================================
  // 2. CHAPA WEBHOOK & SIGNATURE VERIFICATION (Business Rule 3)
  // =========================================================================
  describe('POST /api/v1/payments/chapa/webhook (Business Rule 3: Verification & Idempotency)', () => {
    const webhookSecret = config.chapa.webhookSecret || config.chapa.secretKey;

    const createSignedWebhook = (payload: any, secret = webhookSecret) => {
      const rawBody = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
      return { rawBody, signature };
    };

    it('rejects webhook with missing signature with 401 Unauthorized', async () => {
      const payload = { tx_ref: 'TX-GYM-12345-ABCDEF', status: 'success', amount: 1500 };
      const res = await request(app)
        .post('/api/v1/payments/chapa/webhook')
        .send(payload);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Missing Chapa webhook signature');
    });

    it('rejects webhook with invalid signature with 401 Unauthorized', async () => {
      const payload = { tx_ref: 'TX-GYM-12345-ABCDEF', status: 'success', amount: 1500 };
      const { rawBody } = createSignedWebhook(payload, 'wrong_secret');

      const res = await request(app)
        .post('/api/v1/payments/chapa/webhook')
        .set('x-chapa-signature', 'invalid_signature_hex')
        .set('Content-Type', 'application/json')
        .send(rawBody);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toContain('Invalid Chapa webhook signature');
    });

    it('rejects webhook with amount mismatch with 422 Unprocessable Entity', async () => {
      const payload = { tx_ref: 'TX-GYM-12345-ABCDEF', status: 'success', amount: 500 }; // 500 instead of 1500
      const { rawBody, signature } = createSignedWebhook(payload);

      jest.spyOn(PaymentsRepository.prototype, 'findPaymentByReference').mockResolvedValue(samplePendingPayment);
      const updateStatusSpy = jest.spyOn(PaymentsRepository.prototype, 'updatePaymentStatus').mockResolvedValue(samplePendingPayment);

      const res = await request(app)
        .post('/api/v1/payments/chapa/webhook')
        .set('x-chapa-signature', signature)
        .set('Content-Type', 'application/json')
        .send(rawBody);

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('UNPROCESSABLE_ENTITY');
      expect(res.body.error.message).toContain('Payment amount mismatch');
      expect(updateStatusSpy).toHaveBeenCalledWith(samplePendingPayment.id, 'failed', undefined, expect.any(Object));
    });

    it('verifies signature, activates membership in transaction, and logs audit (200 OK)', async () => {
      const payload = {
        tx_ref: 'TX-GYM-12345-ABCDEF',
        status: 'success',
        amount: 1500,
        currency: 'ETB',
        reference: 'CHAPA-TX-998877',
      };
      const { rawBody, signature } = createSignedWebhook(payload);

      jest.spyOn(PaymentsRepository.prototype, 'findPaymentByReference').mockResolvedValue(samplePendingPayment);
      jest.spyOn(PaymentsRepository.prototype, 'findMembershipById').mockResolvedValue(sampleActiveMembership);
      const updatePaymentSpy = jest.spyOn(PaymentsRepository.prototype, 'updatePaymentStatus').mockResolvedValue({
        ...samplePendingPayment,
        status: 'completed',
      });
      const activateMemSpy = jest.spyOn(PaymentsRepository.prototype, 'activateMembership').mockResolvedValue(sampleActiveMembership);
      const auditSpy = jest.spyOn(PaymentsRepository.prototype, 'recordAuditLog').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/payments/chapa/webhook')
        .set('x-chapa-signature', signature)
        .set('Content-Type', 'application/json')
        .send(rawBody);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('success');
      expect(updatePaymentSpy).toHaveBeenCalled();
      expect(activateMemSpy).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'PAYMENT_COMPLETED',
          entityName: 'payments',
        }),
        expect.anything()
      );
    });

    it('enforces Idempotency / Replay Protection: already processed payment returns 200 without duplicate action', async () => {
      const payload = {
        tx_ref: 'TX-GYM-12345-ABCDEF',
        status: 'success',
        amount: 1500,
      };
      const { rawBody, signature } = createSignedWebhook(payload);

      // Payment is ALREADY 'completed'
      jest.spyOn(PaymentsRepository.prototype, 'findPaymentByReference').mockResolvedValue({
        ...samplePendingPayment,
        status: 'completed',
      });
      const activateMemSpy = jest.spyOn(PaymentsRepository.prototype, 'activateMembership');

      const res = await request(app)
        .post('/api/v1/payments/chapa/webhook')
        .set('x-chapa-signature', signature)
        .set('Content-Type', 'application/json')
        .send(rawBody);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('already_processed');
      expect(activateMemSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. MANUAL PAYMENTS: CASH & BANK TRANSFER (Business Rule 4)
  // =========================================================================
  describe('POST /api/v1/payments/manual (Business Rule 4: Reception & Admin recording)', () => {
    it('allows Reception to record cash payment and activates membership (201 Created)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser);
      jest.spyOn(PaymentsRepository.prototype, 'findPlanById').mockResolvedValue(samplePlan);
      jest.spyOn(PaymentsRepository.prototype, 'findActiveMembershipByMemberId').mockResolvedValue(null);
      const activateSpy = jest.spyOn(PaymentsRepository.prototype, 'createAndActivateMembership').mockResolvedValue(sampleActiveMembership);
      const createPaymentSpy = jest.spyOn(PaymentsRepository.prototype, 'createPayment').mockResolvedValue({
        ...samplePendingPayment,
        payment_method: 'cash',
        status: 'completed',
      });
      const auditSpy = jest.spyOn(PaymentsRepository.prototype, 'recordAuditLog').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/payments/manual')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          memberId,
          planId,
          paymentMethod: 'cash',
          amount: 1500,
          referenceNote: 'Cash received at reception desk',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(activateSpy).toHaveBeenCalled();
      expect(createPaymentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: 'cash',
          status: 'completed',
        }),
        expect.anything()
      );
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OFFLINE_PAYMENT_RECORDED',
        }),
        expect.anything()
      );
    });

    it('allows Admin to record bank transfer payment (201 Created)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser);
      jest.spyOn(PaymentsRepository.prototype, 'findPlanById').mockResolvedValue(samplePlan);
      jest.spyOn(PaymentsRepository.prototype, 'findActiveMembershipByMemberId').mockResolvedValue(null);
      jest.spyOn(PaymentsRepository.prototype, 'createAndActivateMembership').mockResolvedValue(sampleActiveMembership);
      jest.spyOn(PaymentsRepository.prototype, 'createPayment').mockResolvedValue({
        ...samplePendingPayment,
        payment_method: 'bank_transfer',
        status: 'completed',
      });
      jest.spyOn(PaymentsRepository.prototype, 'recordAuditLog').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/payments/manual')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          memberId,
          planId,
          paymentMethod: 'bank_transfer',
          amount: 1500,
          referenceNote: 'CBE slip reference #12345678',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
    });

    it('denies trainers and members from recording manual payments with 403 Forbidden', async () => {
      const resTrainer = await request(app)
        .post('/api/v1/payments/manual')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          memberId,
          planId,
          paymentMethod: 'cash',
          amount: 1500,
        });

      expect(resTrainer.status).toBe(403);

      const resMember = await request(app)
        .post('/api/v1/payments/manual')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          memberId,
          planId,
          paymentMethod: 'cash',
          amount: 1500,
        });

      expect(resMember.status).toBe(403);
    });

    it('enforces Business Rule 2: blocks manual payment if member already has active membership (409 Conflict)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser);
      jest.spyOn(PaymentsRepository.prototype, 'findPlanById').mockResolvedValue(samplePlan);
      jest.spyOn(PaymentsRepository.prototype, 'findActiveMembershipByMemberId').mockResolvedValue(sampleActiveMembership);

      const res = await request(app)
        .post('/api/v1/payments/manual')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          memberId,
          planId,
          paymentMethod: 'cash',
          amount: 1500,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects manual payment if amount is less than plan price (400 Bad Request)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser);
      jest.spyOn(PaymentsRepository.prototype, 'findPlanById').mockResolvedValue(samplePlan);
      jest.spyOn(PaymentsRepository.prototype, 'findActiveMembershipByMemberId').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/payments/manual')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          memberId,
          planId,
          paymentMethod: 'cash',
          amount: 1000, // Less than 1500
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('is less than the plan price');
    });
  });

  // =========================================================================
  // 4. MEMBERSHIP STATUS & PAYMENT HISTORY
  // =========================================================================
  describe('GET /api/v1/memberships/my-active and GET /api/v1/payments/my-history', () => {
    it('returns member active membership with calculated days remaining (200 OK)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findActiveMembershipByMemberId').mockResolvedValue(sampleActiveMembership);

      const res = await request(app)
        .get('/api/v1/memberships/my-active')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('active');
      expect(res.body.data).toHaveProperty('daysRemaining');
    });

    it('returns null data when member has no active membership (200 OK)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findActiveMembershipByMemberId').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/memberships/my-active')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });

    it('returns member payment history (200 OK)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findPaymentsByMemberId').mockResolvedValue([samplePendingPayment]);

      const res = await request(app)
        .get('/api/v1/payments/my-history')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].amount).toBe(1500);
    });

    it('allows Admin & Reception to list all payments (200 OK)', async () => {
      jest.spyOn(PaymentsRepository.prototype, 'findAllPayments').mockResolvedValue({
        payments: [samplePendingPayment],
        total: 1,
      });

      const res = await request(app)
        .get('/api/v1/payments/admin/all?page=1&limit=10')
        .set('Authorization', `Bearer ${receptionToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });
});
