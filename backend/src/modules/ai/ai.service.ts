import { config } from '../../config';
import { pool } from '../../db/pool';
import { toEthiopianDate } from '../../shared/utils/ethiopianCalendar';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserFitnessProfile {
  name?: string;
  role?: string;
  goal?: string;
  weightKg?: number;
}

export class AiService {
  /**
   * Helper to query Gemini API or fallback
   */
  private async queryGemini(prompt: string, fallbackResponse: string): Promise<string> {
    const apiKey = config.gemini.apiKey;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return fallbackResponse;
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[Gemini AI] API responded with ${response.status}. Using expert fallback.`);
        return fallbackResponse;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? text.trim() : fallbackResponse;
    } catch (err: any) {
      console.warn(`[Gemini AI] Fetch error: ${err.message}. Using expert fallback.`);
      return fallbackResponse;
    }
  }

  /**
   * Interactive Fitness Q&A Coach
   */
  async askFitnessCoach(question: string, profile: UserFitnessProfile = {}): Promise<string> {
    const prompt = `You are Titan Coach AI, an elite, motivational sports scientist and strength coach working at Titan Fitness Center in Addis Ababa, Ethiopia.
User Profile:
- Name: ${profile.name || 'Athlete'}
- Role: ${profile.role || 'Member'}
- Fitness Goal: ${profile.goal || 'General Fitness & Body Recomposition'}
${profile.weightKg ? `- Current Weight: ${profile.weightKg} kg` : ''}

Question from user:
"${question}"

Provide an empowering, science-backed, and practical answer.
Where relevant, incorporate advice suitable for Ethiopian athletes (e.g. nutrition like teff, injera, shiro, lentils for protein during fasting days/tsom, hydration in high-altitude Addis Ababa).
Keep your response concise, well-structured with bullet points, and actionable for gym workouts.`;

    const lowerQ = question.toLowerCase();
    let fallback = '';

    if (lowerQ.includes('protein') || lowerQ.includes('diet') || lowerQ.includes('food') || lowerQ.includes('nutrition') || lowerQ.includes('fasting') || lowerQ.includes('tsom')) {
      fallback = `### 🥗 Nutrition & Protein Blueprint
For your training goals, aim for **1.6 to 2.2g of protein per kg of bodyweight** daily:
- **High-Protein Ethiopian Staples**: 
  - **Teff & Injera**: High in iron, complex carbohydrates, and fiber for sustained workout energy.
  - **Fasting / Tsom Options**: Shiro, lentils (misir wot), split peas (kik wot), and roasted chickpeas (kolo) provide excellent plant protein.
  - **Animal Sources**: Eggs, grilled beef/tibs, chicken breast, and cottage cheese (ayib).
- **Post-Workout Window**: Consume 25-30g of protein and 40g of complex carbs within 60-90 minutes post-training to accelerate muscle protein synthesis.
- **Hydration**: Drink at least 3-4 liters of water daily, especially when training in high-altitude environments.`;
    } else if (lowerQ.includes('lose weight') || lowerQ.includes('fat loss') || lowerQ.includes('belly')) {
      fallback = `### 🔥 Science-Backed Fat Loss Strategy
To achieve sustainable fat reduction while preserving lean muscle mass:
1. **Caloric Deficit**: Create a modest deficit of 300–500 calories below maintenance.
2. **Prioritize Resistance Training**: Heavy compound movements (Squats, Deadlifts, Presses) 3-4 days per week prevent metabolic slowdown.
3. **Cardio & Conditioning**: Supplement workouts with 20–30 minutes of Zone 2 cardio (treadmill incline walking or rowing) 2-3 times per week.
4. **Sleep & Recovery**: Aim for 7–8 hours of quality sleep to control cortisol and hunger hormones (ghrelin/leptin).`;
    } else if (lowerQ.includes('muscle') || lowerQ.includes('hypertrophy') || lowerQ.includes('bulk')) {
      fallback = `### 💪 Hypertrophy & Muscle Growth Strategy
To maximize muscle building:
1. **Progressive Overload**: Strive to add 1-2 reps or 1.25-2.5 kg to your working sets each week.
2. **Volume & Rep Ranges**: Train each muscle group with 10-18 total weekly working sets, using the 6-12 rep range at RPE 7-9.
3. **Rest Intervals**: Allow 2-3 minutes for heavy compound lifts and 60-90 seconds for isolation exercises.
4. **Caloric Surplus**: Eat roughly 250-350 calories above maintenance with high protein distribution every 3-4 hours.`;
    } else {
      fallback = `### 🏋️ Titan Coach Guidance
Here are your key coaching recommendations:
- **Consistency**: The best training split is the one you can sustain 3-5 days per week without skipping.
- **Movement Mastery**: Focus on full range of motion, controlled eccentrics (2-3 seconds on the way down), and forceful concentric drive.
- **Recovery & Mobility**: Dedicate 10 minutes post-workout to dynamic mobility and stretching to prevent joint strain.
- **Track Your Progress**: Regularly log your weights and measurements in the Titan Transformation tab so we can adjust your volume!`;
    }

    return this.queryGemini(prompt, fallback);
  }

  /**
   * Explain an Exercise with Step-by-Step Biomechanics & Form Cues
   */
  async explainExercise(exerciseName: string): Promise<any> {
    // Check if exercise exists in DB
    const res = await pool.query(`SELECT * FROM exercise_library WHERE name ILIKE $1 LIMIT 1`, [`%${exerciseName}%`]);
    const dbExercise = res.rows[0];

    const prompt = `You are a biomechanics and sports performance coach.
Provide a complete, detailed exercise guide for: "${exerciseName}".
Include:
1. Primary and secondary muscle groups activated
2. Equipment needed
3. Step-by-step setup and execution cues
4. 3 common mistakes and how to fix them
5. Pro safety tip

Format cleanly in markdown with headings and bullet points.`;

    const fallback = `### 📖 Exercise Form Guide: ${exerciseName}
**Category**: ${dbExercise?.category || 'Strength'}
**Primary Muscle Target**: ${dbExercise?.muscle_group || 'Compound Musculature'}
**Equipment**: ${dbExercise?.equipment_needed || 'Standard Gym Equipment'}

#### 🎯 Setup & Execution
1. **Starting Stance**: Position your feet shoulder-width apart, brace your core, and set your shoulder blades back and down.
2. **Concentric Movement**: Drive through the ground/handles explosively while maintaining a neutral spine. Exhale on exertion.
3. **Eccentric Control**: Lower the weight with control over 2-3 seconds, feeling the deep stretch in the working muscle.
4. **Full Lockout**: Achieve full contraction at the top without hyperextending joints.

#### ⚠️ Common Form Errors to Avoid
- **Excessive Momentum**: Avoid swinging or bouncing weight off your body.
- **Spinal Rounding**: Keep your chest upright and core braced like you're bracing for a punch.
- **Incomplete Range**: Do not cut reps short; prioritize full range of motion over excessive weight.

#### 💡 Coach's Tip
Always warm up with 2 lighter feeder sets before your working weight to calibrate joint lubrication and neural recruitment.`;

    const detailedGuide = await this.queryGemini(prompt, fallback);

    return {
      exerciseName,
      dbDetails: dbExercise || null,
      aiGuide: detailedGuide,
    };
  }

  /**
   * AI Analysis of Member Transformation Timeline
   */
  async generateMemberProgressSummary(memberId: string): Promise<string> {
    const res = await pool.query(
      `
      SELECT 
        weight_kg, 
        height_cm, 
        body_fat_percentage, 
        chest_cm, 
        waist_cm, 
        hips_cm, 
        recorded_date
      FROM progress_metrics
      WHERE member_id = $1
      ORDER BY recorded_date ASC
      `,
      [memberId]
    );

    const logs = res.rows;
    if (logs.length === 0) {
      return 'No transformation metrics logged yet. Start by logging your first weigh-in and body circumferences in the Progress tab!';
    }

    const first = logs[0];
    const latest = logs[logs.length - 1];
    const weightDelta = (Number(latest.weight_kg) - Number(first.weight_kg)).toFixed(1);
    const firstEc = toEthiopianDate(first.recorded_date);
    const latestEc = toEthiopianDate(latest.recorded_date);

    let bmiText = '';
    if (latest.height_cm) {
      const heightM = Number(latest.height_cm) / 100;
      const bmi = (Number(latest.weight_kg) / (heightM * heightM)).toFixed(1);
      bmiText = `Latest BMI is ${bmi}.`;
    }

    const prompt = `You are a fitness analytics coach.
A gym member has the following transformation data:
- Total check-ins / metric logs: ${logs.length}
- Starting Weight: ${first.weight_kg} kg on ${firstEc?.formatted || first.recorded_date} E.C.
- Current Weight: ${latest.weight_kg} kg on ${latestEc?.formatted || latest.recorded_date} E.C.
- Net Weight Change: ${Number(weightDelta) > 0 ? `+${weightDelta} kg (muscle gain / bulk)` : `${weightDelta} kg (fat loss / cut)`}
${bmiText}
${latest.body_fat_percentage ? `- Latest Body Fat: ${latest.body_fat_percentage}%` : ''}
${latest.waist_cm ? `- Waist Circumference: ${latest.waist_cm} cm` : ''}

Write a motivating, concise 3-4 sentence analytical progress summary. Celebrate their consistency, evaluate their rate of progress, and give one focal recommendation for the upcoming week.`;

    const deltaNum = Number(weightDelta);
    let fallback = '';
    if (deltaNum < 0) {
      fallback = `Outstanding dedication! You have successfully decreased your bodyweight by ${Math.abs(deltaNum)} kg since ${firstEc?.formatted || 'your first log'}, demonstrating strong caloric adherence and metabolic fat oxidation. ${bmiText} Your waist circumferences reflect healthy visceral fat reduction while maintaining training intensity. For next week, maintain your protein intake at 2g/kg to safeguard lean muscle and incorporate 10 minutes of progressive core stabilization.`;
    } else if (deltaNum > 0) {
      fallback = `Solid hypertrophy progression! You have increased your body mass by ${deltaNum} kg since ${firstEc?.formatted || 'your first log'}, indicative of positive muscle tissue accrual and strength gains. ${bmiText} Ensure your progressive overload remains consistent on your main compound lifts while keeping your conditioning sharp. Next week, prioritize adequate sleep and post-workout carbohydrate replenishment to optimize glycogen recovery.`;
    } else {
      fallback = `Great consistency! You are maintaining an optimal body composition with your weight stable at ${latest.weight_kg} kg across ${logs.length} logged sessions. ${bmiText} Stability is often a sign of body recomposition where fat is simultaneously replaced by lean muscle tissue. Focus on pushing for 1-2 extra reps on your last working set next week to spark new adaptive stimuli.`;
    }

    return this.queryGemini(prompt, fallback);
  }
}
