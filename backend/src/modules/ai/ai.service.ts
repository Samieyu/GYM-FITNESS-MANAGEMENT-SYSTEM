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

export interface YouTubeVideoResult {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  url: string;
}

const CURATED_EXERCISE_VIDEOS: Record<string, YouTubeVideoResult[]> = {
  bench: [
    {
      id: 'hWbUlkb5Ms4',
      title: 'How To Bench Press With Perfect Technique (5 Steps)',
      author: 'Jeff Nippard',
      thumbnail: 'https://i.ytimg.com/vi/hWbUlkb5Ms4/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=hWbUlkb5Ms4',
    },
    {
      id: '4Y2ZdHCOXok',
      title: 'How to PROPERLY Bench Press for Growth (5 Easy Steps)',
      author: 'Jeremy Ethier',
      thumbnail: 'https://i.ytimg.com/vi/4Y2ZdHCOXok/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=4Y2ZdHCOXok',
    },
  ],
  squat: [
    {
      id: 'PPmvh7gBTi0',
      title: 'Do You Have A Perfect Squat? (Find Out)',
      author: 'Jeff Nippard',
      thumbnail: 'https://i.ytimg.com/vi/PPmvh7gBTi0/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=PPmvh7gBTi0',
    },
    {
      id: 'gcNh17Ckjgg',
      title: 'How to PROPERLY Squat for Growth (4 Easy Steps)',
      author: 'Jeremy Ethier',
      thumbnail: 'https://i.ytimg.com/vi/gcNh17Ckjgg/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=gcNh17Ckjgg',
    },
  ],
  deadlift: [
    {
      id: 'r4MzxtBKyNE',
      title: 'How To Deadlift: 5 Step Guide for Beginners',
      author: 'Alan Thrall',
      thumbnail: 'https://i.ytimg.com/vi/r4MzxtBKyNE/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=r4MzxtBKyNE',
    },
    {
      id: 'VL5Ab0T07e4',
      title: 'How To Deadlift With Perfect Form (4 Steps)',
      author: 'Jeff Nippard',
      thumbnail: 'https://i.ytimg.com/vi/VL5Ab0T07e4/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=VL5Ab0T07e4',
    },
  ],
  pullup: [
    {
      id: 'eGo4IYlbE5g',
      title: 'How To Do Your First Pull-Up (Step-by-Step)',
      author: 'Jeremy Ethier',
      thumbnail: 'https://i.ytimg.com/vi/eGo4IYlbE5g/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    },
    {
      id: '3YvfRx31cLg',
      title: 'The Perfect Pull-Up - Avoid These 5 Mistakes',
      author: 'Jeff Nippard',
      thumbnail: 'https://i.ytimg.com/vi/3YvfRx31cLg/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=3YvfRx31cLg',
    },
  ],
  pushup: [
    {
      id: 'IODxDxX7oi4',
      title: 'The Perfect Push Up - Do It Right!',
      author: 'Calisthenicmovement',
      thumbnail: 'https://i.ytimg.com/vi/IODxDxX7oi4/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    },
  ],
  press: [
    {
      id: '2yjwXTZQDDI',
      title: 'How To Overhead Press: Form & Technique',
      author: 'Alan Thrall',
      thumbnail: 'https://i.ytimg.com/vi/2yjwXTZQDDI/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    },
  ],
  curl: [
    {
      id: 'ykJmrZ5v0Oo',
      title: 'How To Bicep Curl With Perfect Form',
      author: 'Jeremy Ethier',
      thumbnail: 'https://i.ytimg.com/vi/ykJmrZ5v0Oo/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    },
  ],
  row: [
    {
      id: 'G8l_8chR5BE',
      title: 'How To Barbell Row For A Bigger Back',
      author: 'Jeremy Ethier',
      thumbnail: 'https://i.ytimg.com/vi/G8l_8chR5BE/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=G8l_8chR5BE',
    },
  ],
  lunge: [
    {
      id: 'D7KaRcUTQeE',
      title: 'How To Do Lunges With Proper Form',
      author: 'Bowflex',
      thumbnail: 'https://i.ytimg.com/vi/D7KaRcUTQeE/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
    },
  ],
};

export class AiService {
  /**
   * Helper to query Gemini API or fallback
   */
  private async queryGemini(prompt: string, fallbackResponse: string): Promise<string> {
    const apiKey = config.gemini.apiKey;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('[Gemini AI] No valid GEMINI_API_KEY configured in environment. Using expert fallback.');
      return fallbackResponse;
    }

    const modelsToTry = [
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
    ];

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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

        if (response.ok) {
          const data: any = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            console.log(`[Gemini AI] Live response generated with model "${model}".`);
            return text.trim();
          }
        } else {
          const errorBody = await response.text().catch(() => '');
          console.warn(`[Gemini AI] Model "${model}" failed (HTTP ${response.status}): ${errorBody.slice(0, 160)}`);
          if (response.status === 400 && errorBody.includes('API_KEY_INVALID')) {
            console.error('[Gemini AI] The configured GEMINI_API_KEY is invalid according to Google.');
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[Gemini AI] Network error querying model "${model}": ${err.message}`);
      }
    }

    console.warn('[Gemini AI] All models failed or rate limited. Serving role-aware dynamic fallback.');
    return fallbackResponse;
  }

  /**
   * Live connectivity check for Gemini AI
   */
  async checkAiStatus(): Promise<{
    configured: boolean;
    maskedKey?: string;
    modelTested?: string;
    live: boolean;
    error?: string;
    sampleResponse?: string;
  }> {
    const apiKey = config.gemini.apiKey;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return {
        configured: false,
        live: false,
        error: 'GEMINI_API_KEY is not configured in Render environment variables.',
      };
    }

    const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : '***';
    const modelsToTry = [
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
    ];

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Reply with the single word "ACTIVE".' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          return {
            configured: true,
            maskedKey,
            modelTested: model,
            live: true,
            sampleResponse: text,
          };
        } else {
          const errorText = await response.text().catch(() => '');
          if (response.status === 400 && errorText.includes('API_KEY_INVALID')) {
            return {
              configured: true,
              maskedKey,
              modelTested: model,
              live: false,
              error: 'Google Generative Language rejected key: HTTP 400 API_KEY_INVALID',
            };
          }
        }
      } catch (err: any) {
        // continue
      }
    }

    return {
      configured: true,
      maskedKey,
      live: false,
      error: 'Google Generative Language endpoints could not be reached or returned non-200 status.',
    };
  }

  /**
   * Search YouTube for fitness tutorial & exercise form videos
   */
  async searchYouTubeVideos(rawQuery: string, maxResults = 3): Promise<YouTubeVideoResult[]> {
    const cleanQuery = rawQuery
      .toLowerCase()
      .replace(/\b(show\s+me|give\s+me|can\s+you\s+give|find|search|video|videos|tutorial|demonstration|exercise|form|technique|please|for|the|a|of|how\s+to\s+do|how\s+to)\b/gi, ' ')
      .trim() || rawQuery.trim();

    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery + ' exercise form tutorial')}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      clearTimeout(timeout);

      if (response.ok) {
        const html = await response.text();
        const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
        const matches = Array.from(html.matchAll(regex), (m) => m[1]);
        const uniqueIds = Array.from(new Set(matches)).slice(0, maxResults);

        if (uniqueIds.length > 0) {
          const results = await Promise.all(
            uniqueIds.map(async (id) => {
              try {
                const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
                const oembedRes = await fetch(oembedUrl);
                if (oembedRes.ok) {
                  const data: any = await oembedRes.json();
                  return {
                    id,
                    title: data.title || `${cleanQuery.toUpperCase()} Tutorial`,
                    author: data.author_name || 'Fitness Coach',
                    thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                    url: `https://www.youtube.com/watch?v=${id}`,
                  };
                }
              } catch {
                // Ignore oembed failure
              }
              return {
                id,
                title: `${cleanQuery.toUpperCase()} Form & Technique Guide`,
                author: 'Fitness Coach',
                thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                url: `https://www.youtube.com/watch?v=${id}`,
              };
            })
          );
          if (results.length > 0) {
            return results;
          }
        }
      }
    } catch (err: any) {
      console.warn(`[YouTube Search] Live search failed: ${err.message}. Checking curated library.`);
    }

    // Fallback to curated library
    const lower = cleanQuery.toLowerCase();
    for (const [key, videos] of Object.entries(CURATED_EXERCISE_VIDEOS)) {
      if (lower.includes(key)) {
        return videos.slice(0, maxResults);
      }
    }

    // Default to bench / squat if general exercise video asked
    return CURATED_EXERCISE_VIDEOS['bench'] || [];
  }

  /**
   * Helper to detect if user is asking for video demonstrations or exercise technique
   */
  private detectVideoIntent(text: string): { isVideoRequest: boolean; searchTerm: string } {
    const lower = text.toLowerCase();
    const videoKeywords = ['video', 'videos', 'youtube', 'watch', 'clip', 'demonstration', 'tutorial', 'show me', 'see how'];
    const isExplicitVideo = videoKeywords.some((kw) => lower.includes(kw));

    const exerciseKeywords = [
      'bench press', 'bench', 'squat', 'deadlift', 'overhead press', 'shoulder press',
      'pull up', 'pull-up', 'pullups', 'push up', 'push-up', 'pushups',
      'bicep curl', 'biceps', 'curl', 'barbell row', 'dumbbell row', 'row',
      'lunge', 'lunges', 'plank', 'dips', 'lateral raise', 'leg press'
    ];
    const matchedExercise = exerciseKeywords.find((ex) => lower.includes(ex));

    if (isExplicitVideo || (matchedExercise && (lower.includes('form') || lower.includes('technique') || lower.includes('how to')))) {
      const searchTerm = matchedExercise || text;
      return { isVideoRequest: true, searchTerm };
    }

    return { isVideoRequest: false, searchTerm: '' };
  }

  /**
   * Interactive Fitness Q&A Coach
   */
  async askFitnessCoach(
    question: string,
    profile: UserFitnessProfile = {}
  ): Promise<{ answer: string; videos?: YouTubeVideoResult[] }> {
    const { isVideoRequest, searchTerm } = this.detectVideoIntent(question);

    let videos: YouTubeVideoResult[] | undefined = undefined;
    if (isVideoRequest) {
      videos = await this.searchYouTubeVideos(searchTerm || question, 3);
    }

    const videoInstruction =
      isVideoRequest && videos && videos.length > 0
        ? `\n\nNOTE: The user requested video demonstrations. The system has automatically searched YouTube and attached ${videos.length} verified video tutorial cards below your response (e.g. "${videos[0].title}"). Emphasize 2-3 key biomechanical execution cues in your answer and invite the athlete to watch the attached video tutorial below for full visual cues.`
        : '';

    const prompt = `You are POWERZONE Coach AI, an elite, motivational sports scientist and strength coach working at POWERZONE Fitness Center in Addis Ababa, Ethiopia.
User Profile:
- Name: ${profile.name || 'Athlete'}
- Role: ${profile.role || 'Member'}
- Fitness Goal: ${profile.goal || 'General Fitness & Body Recomposition'}
${profile.weightKg ? `- Current Weight: ${profile.weightKg} kg` : ''}

Question from user:
"${question}"
${videoInstruction}

Provide an empowering, science-backed, and practical answer.
Where relevant, incorporate advice suitable for Ethiopian athletes (e.g. nutrition like teff, injera, shiro, lentils for protein during fasting days/tsom, hydration in high-altitude Addis Ababa).
Keep your response concise, well-structured with bullet points, and actionable for gym workouts.`;

    const lowerQ = question.toLowerCase();
    const role = (profile.role || '').toLowerCase();
    let fallback = '';

    if (isVideoRequest && videos && videos.length > 0) {
      fallback = `### 🎥 Video Demonstration & Technique Guide: ${(searchTerm || 'Exercise Tutorial').toUpperCase()}
Here are the essential biomechanical execution cues to focus on:
• **Starting Stance & Setup**: Establish a stable base of support, brace your abdominal wall 360°, and retract your shoulder blades into a stable pocket.
• **Path of Movement**: Move smoothly through the full active range of motion without jerking or hyperextending joints.
• **Tempo Control**: Maintain a controlled 2-3 second eccentric descent to maximize muscle tension and safeguard connective tissues.
• **Visual Demonstration**: Verified YouTube video tutorials with step-by-step coaching breakdown have been attached below for you to watch right here!`;
    } else if (
      lowerQ.includes('hello') ||
      lowerQ.includes('hi') ||
      lowerQ.includes('hey') ||
      lowerQ.includes('selam') ||
      lowerQ.trim() === 'help'
    ) {
      fallback = `### 🇪🇹 Selam & Welcome to POWERZONE AI Coach!
I am your dedicated athletic and operational assistant at POWERZONE Fitness.
- **For Athletes & Members**: Ask me about personalized workout routines, Ethiopian nutrition during fasting (tsom), biomechanics form checks, or tracking your physique milestones.
- **For Trainers & Coaches**: Ask me for periodization models, RPE-based microcycle structuring, or client regression/progression cues.
- **For Admin & Reception**: Ask me about check-in flow metrics, peak hour capacity management, or member onboarding best practices.

*What training target or operational goal would you like to explore today?*`;
    } else if (
      lowerQ.includes('admin') ||
      lowerQ.includes('facility') ||
      lowerQ.includes('revenue') ||
      lowerQ.includes('equipment') ||
      lowerQ.includes('maintenance') ||
      role === 'admin'
    ) {
      fallback = `### 🏢 POWERZONE Facility & Operations Advisory
Key operational guidelines for POWERZONE gym management:
- **Equipment Longevity**: Enforce weekly cable lubrication and bolt inspections across all pin-loaded selectorized machines to prevent sudden downtime.
- **Peak Hour Turnaround**: Between 5:00 PM and 8:30 PM, maintain a 30-minute cardio machine courtesy limit to maximize athlete throughput without bottlenecking the free weight zone.
- **Staff Shift Alignment**: Ensure at least one Floor Coach and one Reception Concierge are active per 50 floor athletes to maintain high check-in velocity and member safety.
- **Digital Retention**: Review expiring memberships 5 days in advance using automated WhatsApp / SMS reminders to maintain renewal rates above 85%.`;
    } else if (
      lowerQ.includes('trainer') ||
      lowerQ.includes('programming') ||
      lowerQ.includes('periodization') ||
      lowerQ.includes('client') ||
      role === 'trainer'
    ) {
      fallback = `### 📋 Coach Programming & Periodization Blueprint
Evidence-based guidelines for client programming:
- **Auto-Regulation via RPE**: Gauge client fatigue using the Rate of Perceived Exertion (RPE 7-9). When fatigue accumulates, reduce volume by 20% rather than dropping intensity.
- **Progressive Overload Vectors**: Progress clients not just by adding load, but by improving tempo control (3-second eccentric phase) and extending time-under-tension.
- **Deload Integration**: Program an active recovery deload week every 4-6 weeks (50% working volume at current intensity) to allow connective tissue adaptation.
- **Movement Hierarchy**: Anchor sessions around compound multi-joint movements (Squat, Hinge, Push, Pull, Carry) before assigning single-joint accessories.`;
    } else if (
      lowerQ.includes('reception') ||
      lowerQ.includes('checkin') ||
      lowerQ.includes('qr') ||
      lowerQ.includes('walkin') ||
      role === 'reception'
    ) {
      fallback = `### 🎟️ Front Desk Reception & Concierge Best Practices
Fast-track protocol for member onboarding and access:
- **Dynamic 60-Second QR Pass**: Members scan their live rotating QR code at the turnstile. If an expired code appears, advise the athlete to refresh their Member Pass screen.
- **Walk-in Registrations**: Capture full name, Gmail address, and mobile phone (+251 9... / 09...). Dispatch the instant activation invite so the athlete can set their PIN on their smartphone.
- **Membership Verification**: Before granting access, ensure the account status displays green (Active) in the Reception Scanner terminal.
- **Hospitality Standard**: Greet every athlete by name upon entrance and remind them of today's group fitness schedule!`;
    } else if (
      lowerQ.includes('split') ||
      lowerQ.includes('routine') ||
      lowerQ.includes('schedule') ||
      lowerQ.includes('workout plan')
    ) {
      fallback = `### 📅 Optimized POWERZONE Workout Splits
Choose the training split that matches your weekly schedule:
- **4-Day Upper / Lower Split** (Best for busy professionals):
  - Day 1: Upper Body Power (Bench Press, Barbell Row, Overhead Press, Pull-Ups)
  - Day 2: Lower Body Power (Back Squat, Romanian Deadlift, Bulgarian Split Squat, Calf Raises)
  - Day 3: Rest / Active Recovery
  - Day 4: Upper Body Hypertrophy (Incline Dumbbell Press, Cable Rows, Lateral Raises, Arms)
  - Day 5: Lower Body Hypertrophy (Leg Press, Leg Curls, Walking Lunges, Abs)
  - Day 6 & 7: Rest or Light Zone 2 Cardio.
- **3-Day Full Body** (Best for foundational strength & high frequency):
  - Mon / Wed / Fri: 1 squat variation, 1 hinge, 1 push, 1 pull, 1 core exercise per session.`;
    } else if (
      lowerQ.includes('hydration') ||
      lowerQ.includes('altitude') ||
      lowerQ.includes('water') ||
      lowerQ.includes('addis')
    ) {
      fallback = `### 💧 Altitude Hydration & Conditioning in Addis Ababa
Addis Ababa sits at approximately **2,355 meters (7,726 feet)** above sea level, significantly altering physiological demands:
- **Accelerated Respiratory Water Loss**: Dry, thin mountain air causes your body to lose moisture up to twice as fast through respiration alone.
- **Target Fluid Intake**: Consume **3.5 to 4.5 liters of clean water daily**, increasing by 750ml per hour of intense gym training.
- **Electrolyte Balance**: Replenish sodium and potassium lost through sweat—incorporate natural pinch of sea salt, lemon, and banana/ayib into your post-training hydration.
- **Aerobic Pacing**: Keep rest intervals strictly timed; oxygen debt accumulates faster at high altitude during high-rep heavy compound sets.`;
    } else if (
      lowerQ.includes('protein') ||
      lowerQ.includes('diet') ||
      lowerQ.includes('food') ||
      lowerQ.includes('nutrition') ||
      lowerQ.includes('fasting') ||
      lowerQ.includes('tsom')
    ) {
      fallback = `### 🥗 Nutrition & Protein Blueprint
For your training goals, aim for **1.6 to 2.2g of protein per kg of bodyweight** daily:
- **High-Protein Ethiopian Staples**: 
  - **Teff & Injera**: High in iron, complex carbohydrates, and fiber for sustained workout energy.
  - **Fasting / Tsom Options**: Shiro, lentils (misir wot), split peas (kik wot), and roasted chickpeas (kolo) provide excellent plant protein.
  - **Animal Sources**: Eggs, grilled beef/tibs, chicken breast, and cottage cheese (ayib).
- **Post-Workout Window**: Consume 25-30g of protein and 40g of complex carbs within 60-90 minutes post-training to accelerate muscle protein synthesis.
- **Hydration**: Drink at least 3-4 liters of water daily, especially when training in high-altitude environments.`;
    } else if (
      lowerQ.includes('lose weight') ||
      lowerQ.includes('fat loss') ||
      lowerQ.includes('belly') ||
      lowerQ.includes('cut')
    ) {
      fallback = `### 🔥 Science-Backed Fat Loss Strategy
To achieve sustainable fat reduction while preserving lean muscle mass:
1. **Caloric Deficit**: Create a modest deficit of 300–500 calories below maintenance.
2. **Prioritize Resistance Training**: Heavy compound movements (Squats, Deadlifts, Presses) 3-4 days per week prevent metabolic slowdown.
3. **Cardio & Conditioning**: Supplement workouts with 20–30 minutes of Zone 2 cardio (treadmill incline walking or rowing) 2-3 times per week.
4. **Sleep & Recovery**: Aim for 7–8 hours of quality sleep to control cortisol and hunger hormones (ghrelin/leptin).`;
    } else if (
      lowerQ.includes('muscle') ||
      lowerQ.includes('hypertrophy') ||
      lowerQ.includes('bulk') ||
      lowerQ.includes('gain')
    ) {
      fallback = `### 💪 Hypertrophy & Muscle Growth Strategy
To maximize muscle building:
1. **Progressive Overload**: Strive to add 1-2 reps or 1.25-2.5 kg to your working sets each week.
2. **Volume & Rep Ranges**: Train each muscle group with 10-18 total weekly working sets, using the 6-12 rep range at RPE 7-9.
3. **Rest Intervals**: Allow 2-3 minutes for heavy compound lifts and 60-90 seconds for isolation exercises.
4. **Caloric Surplus**: Eat roughly 250-350 calories above maintenance with high protein distribution every 3-4 hours.`;
    } else {
      fallback = `### 🏋️ POWERZONE Coach Guidance
Here are your key coaching recommendations:
- **Consistency**: The best training split is the one you can sustain 3-5 days per week without skipping.
- **Movement Mastery**: Focus on full range of motion, controlled eccentrics (2-3 seconds on the way down), and forceful concentric drive.
- **Recovery & Mobility**: Dedicate 10 minutes post-workout to dynamic mobility and stretching to prevent joint strain.
- **Track Your Progress**: Regularly log your weights and measurements in the POWERZONE Transformation tab so we can adjust your volume!`;
    }

    const answer = await this.queryGemini(prompt, fallback);
    return {
      answer,
      videos: videos && videos.length > 0 ? videos : undefined,
    };
  }

  /**
   * Explain an Exercise with Step-by-Step Biomechanics, Form Cues & YouTube Tutorial Videos
   */
  async explainExercise(exerciseName: string): Promise<any> {
    // Check if exercise exists in DB
    const res = await pool.query(`SELECT * FROM exercise_library WHERE name ILIKE $1 LIMIT 1`, [`%${exerciseName}%`]);
    const dbExercise = res.rows[0];

    // Fetch video tutorials for this specific exercise
    const videos = await this.searchYouTubeVideos(exerciseName, 2);

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
      videos: videos && videos.length > 0 ? videos : undefined,
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
