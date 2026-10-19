import request from 'supertest';
import app from '../app';
import { CheckinsRepository } from '../modules/checkins/checkins.repository';
import { generateAccessToken } from '../shared/utils/tokens';
import { generateMemberQrToken } from '../shared/utils/qrTokens';

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

describe('Dynamic QR Check-In & Attendance Tests (Phase 5, Rules 7, 8, 9)', () => {
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

  const sampleMemberUser = {
    id: memberId,
    email: 'member@gymfitness.local',
    first_name: 'Jane',
    last_name: 'Member',
    role: 'member',
    is_active: true,
    is_verified: true,
  };

  const sampleActiveMembership = {
    id: 'mem-0000-0000-0000-000000000001',
    plan_id: planId,
    plan_name: 'Standard Monthly',
    status: 'active' as const,
    start_date: '2026-10-18',
    end_date: '2026-11-18',
  };

  const sampleCheckinRecord = {
    id: 'chk-0000-0000-0000-000000000001',
    member_id: memberId,
    checkin_time: new Date(),
    status: 'allowed' as const,
    denial_reason: null,
    checkin_type: 'reception_qr' as const,
    scanned_by_user_id: receptionId,
    created_at: new Date(),
    member_first_name: 'Jane',
    member_last_name: 'Member',
    member_email: 'member@gymfitness.local',
    plan_name: 'Standard Monthly',
    scanned_by_first_name: 'Sarah',
    scanned_by_last_name: 'Reception',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. MEMBER QR PASS GENERATION (Business Rule 7)
  // =========================================================================
  describe('GET /api/v1/checkins/my-qr (Business Rule 7: Dynamic 60s Rotating Token)', () => {
    it('generates a 60-second rotating HMAC-signed QR token for the logged-in member (200 OK)', async () => {
      jest.spyOn(CheckinsRepository.prototype, 'findActiveMembership').mockResolvedValue(sampleActiveMembership);

      const res = await request(app)
        .get('/api/v1/checkins/my-qr')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.expiresInSeconds).toBe(60);
      expect(res.body.data.member.id).toBe(memberId);
      expect(res.body.data.membership.plan_name).toBe('Standard Monthly');
    });

    it('denies unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/checkins/my-qr');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('denies non-members (trainers) with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/checkins/my-qr')
        .set('Authorization', `Bearer ${trainerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // =========================================================================
  // 2. CHECK-IN SCAN & ATTENDANCE VERIFICATION (Rules 7, 8, 9)
  // =========================================================================
  describe('POST /api/v1/checkins/scan (Business Rules 7, 8, 9: Validation & Anti-Passback)', () => {
    it('grants entry for a valid 60s dynamic QR token with active membership (200 OK)', async () => {
      const { token } = generateMemberQrToken(memberId, Date.now());

      jest.spyOn(CheckinsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser as any);
      jest.spyOn(CheckinsRepository.prototype, 'findActiveMembership').mockResolvedValue(sampleActiveMembership);
      jest.spyOn(CheckinsRepository.prototype, 'findRecentAllowedCheckin').mockResolvedValue(null);
      jest.spyOn(CheckinsRepository.prototype, 'createCheckin').mockResolvedValue(sampleCheckinRecord);

      const res = await request(app)
        .post('/api/v1/checkins/scan')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({ scannedData: token });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('allowed');
      expect(res.body.data.message).toContain('Access Granted');
      expect(res.body.data.member.firstName).toBe('Jane');
    });

    it('enforces Business Rule 7: rejects expired QR token (>60s old) with 400 Bad Request', async () => {
      // Generate token with timestamp from 75 seconds ago
      const expiredTimestamp = Date.now() - 75000;
      const { token } = generateMemberQrToken(memberId, expiredTimestamp);

      const res = await request(app)
        .post('/api/v1/checkins/scan')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({ scannedData: token });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toContain('QR token expired');
    });

    it('enforces Business Rule 7: rejects tampered QR token signature with 400 Bad Request', async () => {
      const { token } = generateMemberQrToken(memberId, Date.now());
      // Corrupt the token characters
      const tamperedToken = token.slice(0, -6) + 'XXXXXX';

      const res = await request(app)
        .post('/api/v1/checkins/scan')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({ scannedData: tamperedToken });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toContain('Tampered or invalid QR signature');
    });

    it('enforces Business Rule 8: denies entry and logs audit if member has NO active membership', async () => {
      const { token } = generateMemberQrToken(memberId, Date.now());

      jest.spyOn(CheckinsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser as any);
      jest.spyOn(CheckinsRepository.prototype, 'findActiveMembership').mockResolvedValue(null);
      jest.spyOn(CheckinsRepository.prototype, 'createCheckin').mockResolvedValue({
        ...sampleCheckinRecord,
        status: 'denied',
        denial_reason: 'No active membership found (expired or unpaid).',
      });

      const res = await request(app)
        .post('/api/v1/checkins/scan')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({ scannedData: token });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('denied');
      expect(res.body.data.message).toContain('Access Denied');
      expect(res.body.data.denialReason).toContain('No active membership');
    });

    it('enforces Business Rule 9: denies entry for repeat check-in within 2 hours (Anti-passback rule)', async () => {
      const { token } = generateMemberQrToken(memberId, Date.now());

      // Simulate a check-in that happened 25 minutes ago
      const recentCheckin = {
        ...sampleCheckinRecord,
        checkin_time: new Date(Date.now() - 25 * 60 * 1000),
      };

      jest.spyOn(CheckinsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser as any);
      jest.spyOn(CheckinsRepository.prototype, 'findActiveMembership').mockResolvedValue(sampleActiveMembership);
      jest.spyOn(CheckinsRepository.prototype, 'findRecentAllowedCheckin').mockResolvedValue(recentCheckin);
      jest.spyOn(CheckinsRepository.prototype, 'createCheckin').mockResolvedValue({
        ...sampleCheckinRecord,
        status: 'denied',
        denial_reason: 'Repeat check-in within 2 hours (25 mins ago). Anti-passback enforced.',
      });

      const res = await request(app)
        .post('/api/v1/checkins/scan')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({ scannedData: token, allowOverride: false });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('denied');
      expect(res.body.data.isRepeatCheckin).toBe(true);
      expect(res.body.data.minutesSinceLastCheckin).toBe(25);
    });

    it('allows reception override for repeat check-in when allowOverride is true', async () => {
      const { token } = generateMemberQrToken(memberId, Date.now());

      const recentCheckin = {
        ...sampleCheckinRecord,
        checkin_time: new Date(Date.now() - 25 * 60 * 1000),
      };

      jest.spyOn(CheckinsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser as any);
      jest.spyOn(CheckinsRepository.prototype, 'findActiveMembership').mockResolvedValue(sampleActiveMembership);
      jest.spyOn(CheckinsRepository.prototype, 'findRecentAllowedCheckin').mockResolvedValue(recentCheckin);
      jest.spyOn(CheckinsRepository.prototype, 'createCheckin').mockResolvedValue({
        ...sampleCheckinRecord,
        status: 'allowed',
        denial_reason: 'Reception authorized 2-hour override.',
      });

      const res = await request(app)
        .post('/api/v1/checkins/scan')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({ scannedData: token, allowOverride: true });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('allowed');
      expect(res.body.data.message).toContain('Access Granted');
    });

    it('allows manual front desk member UUID entry (reception_manual type)', async () => {
      jest.spyOn(CheckinsRepository.prototype, 'findUserById').mockResolvedValue(sampleMemberUser as any);
      jest.spyOn(CheckinsRepository.prototype, 'findActiveMembership').mockResolvedValue(sampleActiveMembership);
      jest.spyOn(CheckinsRepository.prototype, 'findRecentAllowedCheckin').mockResolvedValue(null);
      jest.spyOn(CheckinsRepository.prototype, 'createCheckin').mockResolvedValue({
        ...sampleCheckinRecord,
        checkin_type: 'reception_manual',
      });

      const res = await request(app)
        .post('/api/v1/checkins/scan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ scannedData: memberId });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('allowed');
    });

    it('denies members and trainers from scanning check-ins with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/checkins/scan')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ scannedData: memberId });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // =========================================================================
  // 3. RECENT CHECK-INS & MEMBER ATTENDANCE FEED
  // =========================================================================
  describe('GET /api/v1/checkins/recent & /api/v1/checkins/my-history', () => {
    it('allows Reception & Admin to view live check-in logs (200 OK)', async () => {
      jest.spyOn(CheckinsRepository.prototype, 'findRecentCheckins').mockResolvedValue([sampleCheckinRecord]);

      const res = await request(app)
        .get('/api/v1/checkins/recent')
        .set('Authorization', `Bearer ${receptionToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('allows members to view their individual attendance history (200 OK)', async () => {
      jest.spyOn(CheckinsRepository.prototype, 'findMemberHistory').mockResolvedValue([sampleCheckinRecord]);

      const res = await request(app)
        .get('/api/v1/checkins/my-history')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
