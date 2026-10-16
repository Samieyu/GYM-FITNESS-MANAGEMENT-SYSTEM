import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config';

export type UserRole = 'admin' | 'reception' | 'trainer' | 'member';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const generateRefreshToken = (days = 7): { token: string; hash: string; expiresAt: Date } => {
  const token = generateRandomToken(40);
  const hash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  return { token, hash, expiresAt };
};
