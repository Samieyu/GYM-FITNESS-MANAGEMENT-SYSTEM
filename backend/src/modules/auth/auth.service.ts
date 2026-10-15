import { authRepository, UserRow } from './auth.repository';
import { hashPassword, comparePassword } from '../../shared/utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  hashToken,
  UserRole,
} from '../../shared/utils/tokens';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  NotFoundError,
} from '../../shared/errors/AppError';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../../shared/services/emailService';

export interface RegisterMemberInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
  fitnessGoals?: string;
  emergencyContact?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
}

export class AuthService {
  async registerMember(input: RegisterMemberInput): Promise<{ message: string; userId: string }> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      role: 'member',
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      photoUrl: input.photoUrl,
      isVerified: false,
    });

    const memberCode = `MEM-${Date.now().toString().slice(-6)}`;
    await authRepository.createMemberProfile({
      userId: user.id,
      memberCode,
      fitnessGoals: input.fitnessGoals,
      emergencyContact: input.emergencyContact,
    });

    // Verification token valid for 24 hours
    const verificationToken = generateRandomToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await authRepository.saveEmailVerificationToken(user.id, verificationToken, expiresAt);
    await sendVerificationEmail(user.email, user.first_name, verificationToken);

    return {
      message: 'Registration successful. Please verify your email before logging in.',
      userId: user.id,
    };
  }

  async verifyEmail(token: string): Promise<{ message: string; email?: string }> {
    const record = await authRepository.findEmailVerificationToken(token);
    if (!record) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    if (new Date(record.expires_at) < new Date()) {
      await authRepository.deleteEmailVerificationToken(token);
      throw new BadRequestError('Verification token has expired. Please request a new one.');
    }

    await authRepository.setUserVerified(record.user_id);
    await authRepository.deleteEmailVerificationToken(token);

    const user = await authRepository.findUserById(record.user_id);

    return {
      message: 'Email verified successfully. You may now log in.',
      email: user?.email,
    };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Do not disclose whether email exists
      return { message: 'If an unverified account exists, a new verification link was sent.' };
    }

    if (user.is_verified) {
      throw new BadRequestError('Account is already verified. Please log in.');
    }

    const verificationToken = generateRandomToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await authRepository.saveEmailVerificationToken(user.id, verificationToken, expiresAt);
    await sendVerificationEmail(user.email, user.first_name, verificationToken);

    return { message: 'If an unverified account exists, a new verification link was sent.' };
  }

  async login(email: string, passwordPlain: string): Promise<AuthResponse> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await comparePassword(passwordPlain, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.is_verified) {
      throw new ForbiddenError('Email not verified. Please verify your email before logging in.');
    }

    if (!user.is_active) {
      throw new ForbiddenError('Your account has been deactivated. Please contact management.');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { token: refreshToken, hash: refreshHash, expiresAt } = generateRefreshToken(7);
    await authRepository.saveRefreshToken(user.id, refreshHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        photoUrl: user.photo_url,
      },
    };
  }

  async refreshAccessToken(incomingRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = hashToken(incomingRefreshToken);
    const stored = await authRepository.findRefreshToken(tokenHash);

    if (!stored || stored.revoked || new Date(stored.expires_at) < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await authRepository.findUserById(stored.user_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    // Revoke old refresh token (rotation)
    await authRepository.revokeRefreshToken(tokenHash);

    // Issue new pair
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { token: newRefreshToken, hash: newRefreshHash, expiresAt } = generateRefreshToken(7);
    await authRepository.saveRefreshToken(user.id, newRefreshHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(incomingRefreshToken?: string): Promise<{ message: string }> {
    if (incomingRefreshToken) {
      const tokenHash = hashToken(incomingRefreshToken);
      await authRepository.revokeRefreshToken(tokenHash);
    }
    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await authRepository.findUserByEmail(email);
    if (user && user.is_active) {
      const resetToken = generateRandomToken(32);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await authRepository.savePasswordResetToken(user.id, resetToken, expiresAt);
      await sendPasswordResetEmail(user.email, user.first_name, resetToken);
    }

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPasswordPlain: string): Promise<{ message: string }> {
    const record = await authRepository.findPasswordResetToken(token);
    if (!record || record.used_at || new Date(record.expires_at) < new Date()) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const newPasswordHash = await hashPassword(newPasswordPlain);
    await authRepository.updateUserPassword(record.user_id, newPasswordHash);
    await authRepository.markPasswordResetUsed(token);
    await authRepository.revokeAllUserRefreshTokens(record.user_id);

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  async getCurrentUser(userId: string): Promise<Omit<UserRow, 'password_hash'>> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
