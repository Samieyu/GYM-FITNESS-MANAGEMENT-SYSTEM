import { z } from 'zod';

export const createClassSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().max(1000).optional(),
  trainerId: z.string().uuid('Valid trainer ID is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(100),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid start time ISO string is required',
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid end time ISO string is required',
  }),
  location: z.string().max(100).default('Main Studio'),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export const updateClassSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional(),
  trainerId: z.string().uuid().optional(),
  capacity: z.number().int().min(1).max(100).optional(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val))).optional(),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val))).optional(),
  location: z.string().max(100).optional(),
  isCancelled: z.boolean().optional(),
});

export const attendanceSchema = z.object({
  status: z.enum(['attended', 'booked', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be attended, booked, or cancelled' }),
  }),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
