import { z } from 'zod';

export const requestAiWorkoutSchema = z.object({
  goal: z.enum(['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness'], {
    required_error: 'Fitness goal is required',
  }),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  daysPerWeek: z.number().int().min(2, 'Must train at least 2 days per week').max(6, 'Maximum 6 days per week').default(3),
  targetMuscleGroups: z.array(z.string()).optional(),
  specialNotes: z.string().max(500, 'Special notes cannot exceed 500 characters').optional(),
});

export const createCustomWorkoutSchema = z.object({
  memberId: z.string().uuid('Valid member ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().max(1000).optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid('Valid exercise ID required'),
      dayOfWeek: z.number().int().min(1).max(7),
      sets: z.number().int().min(1).default(3),
      reps: z.number().int().min(1).default(10),
      restSeconds: z.number().int().min(0).max(600).default(60),
      notes: z.string().max(250).optional(),
      orderIndex: z.number().int().min(1).default(1),
    })
  ).min(1, 'At least 1 exercise is required in a workout routine'),
});

export const updateWorkoutPlanSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().max(1000).optional(),
});
