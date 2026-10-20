import { config } from '../../config';

export interface GeneratedExerciseItem {
  exerciseName: string;
  category: string;
  muscleGroup: string;
  dayOfWeek: number; // 1 to 7
  dayName: string;   // e.g. "Day 1: Push / Chest & Triceps"
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
  orderIndex: number;
}

export interface GeneratedWorkoutRoutine {
  title: string;
  description: string;
  targetGoal: string;
  daysPerWeek: number;
  exercises: GeneratedExerciseItem[];
}

export interface AiGenerationRequest {
  goal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number; // 2 - 6
  targetMuscleGroups?: string[];
  specialNotes?: string;
  memberName?: string;
}

/**
 * Intelligent Fallback Workout Routine Generator
 * Generates structured, sport-science-backed multi-day workout routines
 * when Gemini API key is missing, offline, or rate-limited.
 */
export const generateFallbackWorkoutPlan = (params: AiGenerationRequest): GeneratedWorkoutRoutine => {
  const { goal, experienceLevel, daysPerWeek, specialNotes } = params;

  const goalTitles: Record<string, string> = {
    weight_loss: 'High-Metabolic Fat Loss & Conditioning Circuit',
    muscle_gain: 'Hypertrophy Muscle Builder & Density Program',
    endurance: 'Cardiovascular Stamina & Muscular Endurance Split',
    strength: 'Compound Power & Progressive Strength Blueprint',
    general_fitness: 'Functional Total-Body Vitality & Mobility Routine',
  };

  const title = goalTitles[goal] || 'Customized Gym Workout Plan';
  const description = `Tailored ${experienceLevel} program focusing on ${goal.replace('_', ' ')} across ${daysPerWeek} training days per week.${
    specialNotes ? ` Accommodations: ${specialNotes}` : ''
  }`;

  const exercises: GeneratedExerciseItem[] = [];

  // Day 1: Upper Body / Chest & Triceps
  exercises.push(
    {
      exerciseName: 'Barbell Bench Press',
      category: 'Strength',
      muscleGroup: 'Chest',
      dayOfWeek: 1,
      dayName: 'Day 1: Upper Body Strength & Chest',
      sets: experienceLevel === 'beginner' ? 3 : 4,
      reps: goal === 'strength' ? 5 : goal === 'muscle_gain' ? 8 : 12,
      restSeconds: goal === 'strength' ? 120 : 60,
      notes: 'Keep shoulder blades pinched back, control eccentric descent.',
      orderIndex: 1,
    },
    {
      exerciseName: 'Overhead Shoulder Press',
      category: 'Strength',
      muscleGroup: 'Shoulders, Triceps',
      dayOfWeek: 1,
      dayName: 'Day 1: Upper Body Strength & Chest',
      sets: 3,
      reps: 10,
      restSeconds: 60,
      notes: 'Brace core tightly and avoid hyperextending the lower back.',
      orderIndex: 2,
    },
    {
      exerciseName: 'Plank Hold',
      category: 'Core',
      muscleGroup: 'Abs, Core',
      dayOfWeek: 1,
      dayName: 'Day 1: Upper Body Strength & Chest',
      sets: 3,
      reps: 45, // Seconds
      restSeconds: 45,
      notes: 'Maintain neutral spine and engage glutes throughout hold.',
      orderIndex: 3,
    }
  );

  // Day 2: Lower Body / Quads & Glutes
  if (daysPerWeek >= 2) {
    exercises.push(
      {
        exerciseName: 'Barbell Back Squat',
        category: 'Strength',
        muscleGroup: 'Quadriceps, Glutes',
        dayOfWeek: 2,
        dayName: 'Day 2: Lower Body Power & Core',
        sets: experienceLevel === 'beginner' ? 3 : 4,
        reps: goal === 'strength' ? 5 : 8,
        restSeconds: goal === 'strength' ? 120 : 75,
        notes: 'Break parallel at bottom, drive through midfoot on ascent.',
        orderIndex: 1,
      },
      {
        exerciseName: 'Dumbbell Walking Lunge',
        category: 'Strength',
        muscleGroup: 'Quads, Glutes',
        dayOfWeek: 2,
        dayName: 'Day 2: Lower Body Power & Core',
        sets: 3,
        reps: 12,
        restSeconds: 60,
        notes: 'Take controlled steps, maintain upright torso posture.',
        orderIndex: 2,
      }
    );
  }

  // Day 3: Posterior Chain & Pull
  if (daysPerWeek >= 3) {
    exercises.push(
      {
        exerciseName: 'Conventional Deadlift',
        category: 'Strength',
        muscleGroup: 'Hamstrings, Back',
        dayOfWeek: 3,
        dayName: 'Day 3: Posterior Chain & Back Hypertrophy',
        sets: 3,
        reps: goal === 'strength' ? 5 : 8,
        restSeconds: 90,
        notes: 'Engage lats before lift-off, hinge hips back without rounding spine.',
        orderIndex: 1,
      },
      {
        exerciseName: 'Pull-Up',
        category: 'Bodyweight',
        muscleGroup: 'Lats, Biceps',
        dayOfWeek: 3,
        dayName: 'Day 3: Posterior Chain & Back Hypertrophy',
        sets: 3,
        reps: experienceLevel === 'beginner' ? 6 : 10,
        restSeconds: 60,
        notes: 'Full range of motion, pause momentarily at top contraction.',
        orderIndex: 2,
      }
    );
  }

  // Day 4: Full Body Functional & Core
  if (daysPerWeek >= 4) {
    exercises.push(
      {
        exerciseName: 'Barbell Bench Press',
        category: 'Strength',
        muscleGroup: 'Chest',
        dayOfWeek: 4,
        dayName: 'Day 4: Upper Dynamic Volume',
        sets: 3,
        reps: 12,
        restSeconds: 60,
        notes: 'Focus on explosive concentric contraction and muscle squeeze.',
        orderIndex: 1,
      },
      {
        exerciseName: 'Plank Hold',
        category: 'Core',
        muscleGroup: 'Abs, Core',
        dayOfWeek: 4,
        dayName: 'Day 4: Upper Dynamic Volume',
        sets: 4,
        reps: 60,
        restSeconds: 45,
        notes: 'Solid isometric stability building anti-rotation core strength.',
        orderIndex: 2,
      }
    );
  }

  return {
    title,
    description,
    targetGoal: goal,
    daysPerWeek,
    exercises,
  };
};

/**
 * Generate Workout Routine using Google Gemini 1.5 Flash API with Fallback
 * (Enforcing Business Rule 11)
 */
export const generateGeminiWorkoutPlan = async (
  request: AiGenerationRequest
): Promise<GeneratedWorkoutRoutine> => {
  const apiKey = config.gemini.apiKey;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.log('[Gemini AI] No valid GEMINI_API_KEY provided; utilizing intelligent sports-science template engine.');
    return generateFallbackWorkoutPlan(request);
  }

  try {
    const prompt = `You are a certified professional strength and conditioning coach (CSCS).
Design a structured, evidence-based workout routine for a gym member with these specifications:
- Goal: ${request.goal}
- Experience Level: ${request.experienceLevel}
- Frequency: ${request.daysPerWeek} days per week
- Target Muscle Groups: ${request.targetMuscleGroups?.join(', ') || 'Full body balanced'}
- Special Notes / Physical Constraints: ${request.specialNotes || 'None'}

Available Gym Exercises:
- "Barbell Bench Press" (Category: Strength, Muscle: Chest)
- "Barbell Back Squat" (Category: Strength, Muscle: Quadriceps, Glutes)
- "Conventional Deadlift" (Category: Strength, Muscle: Hamstrings, Back)
- "Overhead Shoulder Press" (Category: Strength, Muscle: Shoulders, Triceps)
- "Pull-Up" (Category: Bodyweight, Muscle: Lats, Biceps)
- "Dumbbell Walking Lunge" (Category: Strength, Muscle: Quads, Glutes)
- "Plank Hold" (Category: Core, Muscle: Abs, Core)

Return ONLY valid JSON matching this schema:
{
  "title": "string (motivating workout plan title)",
  "description": "string (brief 2-sentence rationale)",
  "targetGoal": "${request.goal}",
  "daysPerWeek": ${request.daysPerWeek},
  "exercises": [
    {
      "exerciseName": "must match one of the available gym exercises listed above",
      "category": "Strength | Bodyweight | Core | Cardio",
      "muscleGroup": "string",
      "dayOfWeek": 1-${request.daysPerWeek},
      "dayName": "string e.g. Day 1: Upper Body Push",
      "sets": number (e.g. 3 or 4),
      "reps": number (e.g. 8, 10, or 12),
      "restSeconds": number (e.g. 60 or 90),
      "notes": "string coaching tip",
      "orderIndex": number (1, 2, 3...)
    }
  ]
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!res.ok) {
      console.warn(`[Gemini AI] API responded with status ${res.status}. Falling back to template.`);
      return generateFallbackWorkoutPlan(request);
    }

    const data: any = await res.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      return generateFallbackWorkoutPlan(request);
    }

    const parsed: GeneratedWorkoutRoutine = JSON.parse(textOutput);
    if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
      return generateFallbackWorkoutPlan(request);
    }

    return parsed;
  } catch (error) {
    console.warn('[Gemini AI] Exception while querying Gemini, using fallback:', error);
    return generateFallbackWorkoutPlan(request);
  }
};
