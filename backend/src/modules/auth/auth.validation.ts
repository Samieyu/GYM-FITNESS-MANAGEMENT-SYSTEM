import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Strict validation regex for Ethiopian mobile numbers (Ethio telecom: 09/07, Safaricom Ethiopia: 07)
export const ETHIOPIAN_PHONE_REGEX = /^(\+251|0)[79]\d{8}$/;

// Strict validation regex for Google Gmail accounts
export const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

export const registerMemberSchema = z.object({
  email: z
    .string()
    .email('Valid email address is required')
    .toLowerCase()
    .trim()
    .refine((val) => GMAIL_REGEX.test(val), {
      message: 'Only valid @gmail.com addresses are permitted (e.g. member@gmail.com)',
    }),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  firstName: z.string().min(2, 'First name is required').trim(),
  lastName: z.string().min(2, 'Last name is required').trim(),
  phone: z
    .string({ required_error: 'Ethiopian phone number is required' })
    .transform((p) => (p || '').replace(/[\s-]/g, ''))
    .refine((val) => ETHIOPIAN_PHONE_REGEX.test(val), {
      message: 'Must be a valid Ethiopian phone number (+251 9..., +251 7..., 09..., or 07...)',
    }),
  photoUrl: z.string().url('Photo URL must be a valid URL').optional().or(z.literal('')),
  fitnessGoals: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10, 'Valid verification token is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Valid refresh token is required'),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Valid email address is required').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Valid reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };
};
