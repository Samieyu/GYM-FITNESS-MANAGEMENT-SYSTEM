import { z } from 'zod';
import { ETHIOPIAN_PHONE_REGEX, GMAIL_REGEX } from '../auth/auth.validation';

export const walkinRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name is required').trim(),
  lastName: z.string().min(2, 'Last name is required').trim(),
  email: z
    .string()
    .email('Valid email address is required')
    .toLowerCase()
    .trim()
    .refine((val) => GMAIL_REGEX.test(val), {
      message: 'Only valid @gmail.com addresses are permitted (e.g. member@gmail.com)',
    }),
  phone: z
    .string({ required_error: 'Ethiopian phone number is required' })
    .transform((p) => (p || '').replace(/[\s-]/g, ''))
    .refine((val) => ETHIOPIAN_PHONE_REGEX.test(val), {
      message: 'Must be a valid Ethiopian phone number (+251 9..., +251 7..., 09..., or 07...)',
    }),
  planId: z.string().uuid({ message: 'Valid membership plan ID is required' }),
  paymentMethod: z.enum(['cash', 'bank_transfer'], {
    errorMap: () => ({ message: 'Payment method must be either cash or bank_transfer' }),
  }),
  amount: z.number().positive({ message: 'Payment amount must be greater than zero' }),
  referenceNote: z.string().max(255).optional(),
  fitnessGoals: z.string().max(500).optional(),
  emergencyContact: z.string().max(255).optional(),
  assignedTrainerId: z.string().uuid().optional(),
});

export type WalkinRegisterInput = z.infer<typeof walkinRegisterSchema>;
