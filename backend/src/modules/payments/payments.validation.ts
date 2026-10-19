import { z } from 'zod';

export const initializeChapaPaymentSchema = z.object({
  planId: z.string().uuid({ message: 'Valid plan ID is required' }),
  returnUrl: z.string().url({ message: 'Return URL must be a valid URL' }).optional(),
});

export const chapaWebhookSchema = z.object({
  tx_ref: z.string().min(1, { message: 'Transaction reference (tx_ref) is required' }),
  status: z.string().min(1, { message: 'Status is required' }),
  amount: z.union([z.number(), z.string().regex(/^\d+(\.\d{1,2})?$/)]),
  currency: z.string().default('ETB'),
  reference: z.string().optional(),
  id: z.string().optional(),
}).passthrough();

export const recordManualPaymentSchema = z.object({
  memberId: z.string().uuid({ message: 'Valid member ID is required' }),
  planId: z.string().uuid({ message: 'Valid plan ID is required' }),
  paymentMethod: z.enum(['cash', 'bank_transfer'], {
    errorMap: () => ({ message: 'Payment method must be either cash or bank_transfer' }),
  }),
  amount: z.number().positive({ message: 'Amount must be greater than zero' }),
  referenceNote: z.string().max(255).optional(),
});

export const paymentFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  paymentMethod: z.enum(['chapa', 'cash', 'bank_transfer']).optional(),
});

export type InitializeChapaPaymentInput = z.infer<typeof initializeChapaPaymentSchema>;
export type ChapaWebhookInput = z.infer<typeof chapaWebhookSchema>;
export type RecordManualPaymentInput = z.infer<typeof recordManualPaymentSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
