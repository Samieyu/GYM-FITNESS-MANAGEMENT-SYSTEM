import { z } from 'zod';

export const logProgressMetricSchema = z.object({
  weightKg: z
    .number({ required_error: 'Weight (kg) is required' })
    .positive('Weight must be positive')
    .max(500, 'Weight must be realistic (under 500kg)'),
  heightCm: z.number().positive().max(300).optional(),
  chestCm: z.number().positive().max(300).optional(),
  waistCm: z.number().positive().max(300).optional(),
  hipsCm: z.number().positive().max(300).optional(),
  armsCm: z.number().positive().max(200).optional(),
  thighsCm: z.number().positive().max(200).optional(),
  bodyFatPercentage: z
    .number()
    .min(1, 'Body fat must be at least 1%')
    .max(70, 'Body fat must be under 70%')
    .optional(),
  photoUrl: z.string().optional(),
  recordedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Recorded date must be YYYY-MM-DD')
    .optional(),
});

export const trainerCommentSchema = z.object({
  comment: z
    .string({ required_error: 'Feedback comment is required' })
    .min(2, 'Comment must be at least 2 characters')
    .max(1000, 'Comment must be under 1000 characters'),
});

export type LogProgressMetricInput = z.infer<typeof logProgressMetricSchema>;
export type TrainerCommentInput = z.infer<typeof trainerCommentSchema>;
