import request from 'supertest';
import app from '../app';
import { authRepository } from '../modules/auth/auth.repository';
import { hashPassword } from '../shared/utils/hash';
import { generateAccessToken, generateRefreshToken } from '../shared/utils/tokens';
import { pool } from '../db/pool';

jest.mock('../db/pool', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  },
  query: jest.fn(),
  getClient: jest.fn(),
}));

jest.mock('../shared/services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendWalkinInvitationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.setTimeout(25000);

describe('Auth & RBAC Integration Tests (FR Accounts & Website)', () => {
  const mockMemberUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'testmember@gymfitness.local',
    password_hash: '',
    role: 'member' as const,
    first_name: 'Jane',
    last_name: 'Doe',
    phone: '+251911000000',
    photo_url: 'https://example.com/photo.jpg',
    is_verified: false,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAdminUser = {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'admin@gymfitness.local',
    password_hash: '',
    role: 'admin' as const,
    first_name: 'Super',
    last_name: 'Admin',
    phone: '+251911999999',
    photo_url: null,
    is_verified: true,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeAll(async () => {
    mockMemberUser.password_hash = await hashPassword('Member@123456');
    mockAdminUser.password_hash = await hashPassword('Admin@123456');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/v1/auth/register', () => {
    it('successfully registers a member and creates profile (201 Created)', async () => {
      jest.spyOn(authRepository, 'findUserByEmail').mockResolvedValue(null);
      jest.spyOn(authRepository, 'createUser').mockResolvedValue(mockMemberUser);
      jest.spyOn(authRepository, 'createMemberProfile').mockResolvedValue({
        id: 'prof-1',
        user_id: mockMemberUser.id,
        member_code: 'MEM-123456',
        emergency_contact: null,
        health_notes: null,
        fitness_goals: 'Build stamina',
        assigned_trainer_id: null,
      });
      jest.spyOn(authRepository, 'saveEmailVerificationToken').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@gymfitness.local',
          password: 'Password@123',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+251911000000',
          photoUrl: 'https://example.com/avatar.png',
          fitnessGoals: 'Build stamina',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('verify your email');
    });

    it('rejects registration with already registered email (409 Conflict)', async () => {
      jest.spyOn(authRepository, 'findUserByEmail').mockResolvedValue(mockMemberUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: mockMemberUser.email,
          password: 'Password@123',
          firstName: 'Jane',
          lastName: 'Doe',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects registration with invalid email or short password (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email-format',
          password: '123', // less than 6 chars
          firstName: '',
          lastName: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('blocks login if email is not yet verified (403 Forbidden)', async () => {
      jest.spyOn(authRepository, 'findUserByEmail').mockResolvedValue({
        ...mockMemberUser,
        is_verified: false,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockMemberUser.email,
          password: 'Member@123456',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('verify your email');
    });

    it('allows login if verified and returns access + refresh tokens (200 OK)', async () => {
      jest.spyOn(authRepository, 'findUserByEmail').mockResolvedValue({
        ...mockMemberUser,
        is_verified: true,
      });
      jest.spyOn(authRepository, 'saveRefreshToken').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockMemberUser.email,
          password: 'Member@123456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(mockMemberUser.email);
    });

    it('rejects invalid password with 401 Unauthorized', async () => {
      jest.spyOn(authRepository, 'findUserByEmail').mockResolvedValue({
        ...mockMemberUser,
        is_verified: true,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: mockMemberUser.email,
          password: 'WrongPassword@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/verify-email', () => {
    it('verifies account with valid token (200 OK)', async () => {
      jest.spyOn(authRepository, 'findEmailVerificationToken').mockResolvedValue({
        id: 'tok-1',
        user_id: mockMemberUser.id,
        expires_at: new Date(Date.now() + 1000 * 3600), // 1 hour future
      });
      jest.spyOn(authRepository, 'setUserVerified').mockResolvedValue();
      jest.spyOn(authRepository, 'deleteEmailVerificationToken').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: 'valid_sample_token_1234567890' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('Email verified successfully');
    });

    it('rejects expired or non-existent token (400 Bad Request)', async () => {
      jest.spyOn(authRepository, 'findEmailVerificationToken').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: 'invalid_token_1234567890' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('RBAC & Role Guards (/admin-check & /me)', () => {
    it('GET /api/v1/auth/me rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/auth/me returns authenticated user details', async () => {
      const token = generateAccessToken({
        userId: mockMemberUser.id,
        email: mockMemberUser.email,
        role: 'member',
      });

      jest.spyOn(authRepository, 'findUserById').mockResolvedValue({
        ...mockMemberUser,
        is_verified: true,
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(mockMemberUser.id);
      expect(res.body.data).not.toHaveProperty('password_hash');
    });

    it('denies non-admin roles on admin-only route with 403 Forbidden', async () => {
      const memberToken = generateAccessToken({
        userId: mockMemberUser.id,
        email: mockMemberUser.email,
        role: 'member',
      });

      const res = await request(app)
        .get('/api/v1/auth/admin-check')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('Requires one of [admin]');
    });

    it('grants admin access on admin-only route with 200 OK', async () => {
      const adminToken = generateAccessToken({
        userId: mockAdminUser.id,
        email: mockAdminUser.email,
        role: 'admin',
      });

      const res = await request(app)
        .get('/api/v1/auth/admin-check')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Welcome Admin');
    });
  });

  describe('POST /api/v1/auth/refresh and /logout', () => {
    it('refreshes token pair with valid refresh token (200 OK)', async () => {
      const { token: rawRefreshToken, hash } = generateRefreshToken(7);

      jest.spyOn(authRepository, 'findRefreshToken').mockResolvedValue({
        id: 'ref-1',
        user_id: mockMemberUser.id,
        expires_at: new Date(Date.now() + 1000 * 3600),
        revoked: false,
      });
      jest.spyOn(authRepository, 'findUserById').mockResolvedValue(mockMemberUser);
      jest.spyOn(authRepository, 'revokeRefreshToken').mockResolvedValue();
      jest.spyOn(authRepository, 'saveRefreshToken').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rawRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('logs out and revokes refresh token (200 OK)', async () => {
      const revokeSpy = jest.spyOn(authRepository, 'revokeRefreshToken').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'sample_refresh_token_to_revoke_12345' });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Logged out successfully');
      expect(revokeSpy).toHaveBeenCalled();
    });
  });
});
