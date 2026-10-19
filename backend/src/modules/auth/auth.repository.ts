import { query } from '../../db/pool';
import { UserRole } from '../../shared/utils/tokens';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string | null;
  photo_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MemberProfileRow {
  id: string;
  user_id: string;
  member_code: string | null;
  emergency_contact: string | null;
  health_notes: string | null;
  fitness_goals: string | null;
  assigned_trainer_id: string | null;
}

export class AuthRepository {
  async findUserByEmail(email: string): Promise<UserRow | null> {
    const res = await query<UserRow>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;',
      [email]
    );
    return res.rows[0] || null;
  }

  async findUserById(id: string): Promise<UserRow | null> {
    const res = await query<UserRow>('SELECT * FROM users WHERE id = $1 LIMIT 1;', [id]);
    return res.rows[0] || null;
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    role?: UserRole;
    firstName: string;
    lastName: string;
    phone?: string;
    photoUrl?: string;
    isVerified?: boolean;
  }): Promise<UserRow> {
    const res = await query<UserRow>(
      `
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, photo_url, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *;
    `,
      [
        data.email.toLowerCase(),
        data.passwordHash,
        data.role || 'member',
        data.firstName,
        data.lastName,
        data.phone || null,
        data.photoUrl || null,
        data.isVerified ?? false,
      ]
    );
    return res.rows[0];
  }

  async createMemberProfile(data: {
    userId: string;
    memberCode: string;
    fitnessGoals?: string;
    emergencyContact?: string;
  }): Promise<MemberProfileRow> {
    const res = await query<MemberProfileRow>(
      `
      INSERT INTO member_profiles (user_id, member_code, fitness_goals, emergency_contact)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [data.userId, data.memberCode, data.fitnessGoals || null, data.emergencyContact || null]
    );
    return res.rows[0];
  }

  async saveEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await query(
      `
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES ($1, $2, $3);
    `,
      [userId, token, expiresAt]
    );
  }

  async findEmailVerificationToken(
    token: string
  ): Promise<{ id: string; user_id: string; expires_at: Date } | null> {
    const res = await query(
      `
      SELECT id, user_id, expires_at 
      FROM email_verifications 
      WHERE token = $1 
      LIMIT 1;
    `,
      [token]
    );
    return res.rows[0] || null;
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await query('DELETE FROM email_verifications WHERE token = $1;', [token]);
  }

  async setUserVerified(userId: string): Promise<void> {
    await query(
      'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1;',
      [userId]
    );
  }

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await query(
      `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3);
    `,
      [userId, tokenHash, expiresAt]
    );
  }

  async findRefreshToken(
    tokenHash: string
  ): Promise<{ id: string; user_id: string; expires_at: Date; revoked: boolean } | null> {
    const res = await query(
      `
      SELECT id, user_id, expires_at, revoked 
      FROM refresh_tokens 
      WHERE token_hash = $1 
      LIMIT 1;
    `,
      [tokenHash]
    );
    return res.rows[0] || null;
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await query('UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1;', [tokenHash]);
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1;', [userId]);
  }

  async savePasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await query(
      `
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES ($1, $2, $3);
    `,
      [userId, token, expiresAt]
    );
  }

  async findPasswordResetToken(
    token: string
  ): Promise<{ id: string; user_id: string; expires_at: Date; used_at: Date | null } | null> {
    const res = await query(
      `
      SELECT id, user_id, expires_at, used_at 
      FROM password_resets 
      WHERE token = $1 
      LIMIT 1;
    `,
      [token]
    );
    return res.rows[0] || null;
  }

  async markPasswordResetUsed(token: string): Promise<void> {
    await query(
      'UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE token = $1;',
      [token]
    );
  }

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<void> {
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;',
      [newPasswordHash, userId]
    );
  }
}

export const authRepository = new AuthRepository();
