import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(100),
  description: z.string().optional(),
  durationMonths: z.number().int().min(1, 'Duration must be at least 1 month'),
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().optional().nullable(),
  imageBase64: z.string().optional().nullable(),
  imageName: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updatePlanSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  durationMonths: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().optional().nullable(),
  imageBase64: z.string().optional().nullable(),
  imageName: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const uploadPlanImageSchema = z.object({
  imageBase64: z.string().min(10, 'Base64 image content is required'),
  imageName: z.string().min(1, 'Image filename is required'),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type UploadPlanImageInput = z.infer<typeof uploadPlanImageSchema>;
