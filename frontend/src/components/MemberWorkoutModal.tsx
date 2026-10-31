import React, { useState, useEffect } from 'react';
import { 
  X, 
  Dumbbell, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
 
  Activity, 
  ShieldCheck, 
  Flame,

} from 'lucide-react';
import { 
  fetchMyActiveWorkoutApi, 
  fetchMyWorkoutHistoryApi, 
  requestAiWorkoutPlanApi, 
  WorkoutPlanItem, 
  AiWorkoutRequestParams 
} from '../api/workouts';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface MemberWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
}

export const MemberWorkoutModal: React.FC<MemberWorkoutModalProps> = ({
  isOpen,
  onClose,
  memberName,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'request' | 'history'>('current');
  const [activePlan, setActivePlan] = useState<WorkoutPlanItem | null>(null);
  const [planHistory, setPlanHistory] = useState<WorkoutPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // AI Request Form State (Business Rule 10)
  const [goal, setGoal] = useState<'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness'>('muscle_gain');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [targetMuscles, setTargetMuscles] = useState<string[]>(['Chest', 'Back', 'Legs']);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [active, history] = await Promise.all([
        fetchMyActiveWorkoutApi(),
        fetchMyWorkoutHistoryApi(),
      ]);
      setActivePlan(active);
      setPlanHistory(history);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load workout routine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleToggleMuscle = (muscle: string) => {
    setTargetMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  };

  const handleRequestAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: AiWorkoutRequestParams = {
        goal,
        experienceLevel,
        daysPerWeek,
        targetMuscleGroups: targetMuscles,
        specialNotes: specialNotes.trim() || undefined,
      };

      const result = await requestAiWorkoutPlanApi(payload);
      setSuccessMessage(
        `AI Draft Routine "${result.title}" created successfully! It is currently in draft status awaiting review and approval from your coach.`
      );
      await loadData();
      setActiveTab('history');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate AI workout routine.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Group active plan exercises by day of week
  const groupedExercises: Record<number, any[]> = {};
  if (activePlan?.exercises) {
    for (const ex of activePlan.exercises) {
      if (!groupedExercises[ex.day_of_week]) {
        groupedExercises[ex.day_of_week] = [];
      }
      groupedExercises[ex.day_of_week]?.push(ex);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-1.5 rounded-full hover:bg-charcoal-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-primary/15 border border-orange-primary/30 flex items-center justify-center text-orange-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Workout Routine & AI Coach
              <span className="px-2 py-0.5 rounded-full bg-orange-primary/20 text-orange-primary text-[10px] font-bold border border-orange-primary/30 uppercase">
                AI Coaching
              </span>
            </h3>
            <p className="text-xs text-gray-400">Athlete: <strong className="text-gray-200">{memberName}</strong></p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-charcoal-900 p-1 border border-charcoal-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'current'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" /> Active Routine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'request'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Request AI Routine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Plan History & Drafts
          </button>
        </div>

        {/* Banners */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-green-950/80 border border-green-800 text-xs text-green-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: ACTIVE ROUTINE VIEW */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-orange-primary" />
                Loading your workout program...
              </div>
            ) : activePlan ? (
              <div className="space-y-4">
                {/* Active Plan Header Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-charcoal-900 to-charcoal-950 border border-charcoal-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      {activePlan.title}
                      {activePlan.is_ai_generated && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[9px] font-bold uppercase tracking-wider">
                          AI Formulated
                        </span>
                      )}
                    </h4>
                    <span className="px-2.5 py-1 rounded-full bg-green-950 text-green-400 border border-green-800 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE APPROVED
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed mb-3">
                    {activePlan.description || 'Custom multi-day training routine.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-2 border-t border-charcoal-800">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-primary" /> Approved by:{' '}
                      <strong className="text-white">
                        Coach {activePlan.trainer_first_name || 'Staff'} {activePlan.trainer_last_name || ''}
                      </strong>
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">
                      Activated on (E.C.): <span className="text-gray-300">{activePlan.approved_at ? formatEthiopianDate(activePlan.approved_at) : 'Active'}</span>
                    </span>
                  </div>
                </div>

                {/* Day-by-Day Exercises */}
                <div className="space-y-3">
                  {Object.keys(groupedExercises).length > 0 ? (
                    Object.entries(groupedExercises).map(([dayNumber, list]) => (
                      <div key={dayNumber} className="rounded-2xl bg-charcoal-900 border border-charcoal-800 overflow-hidden">
                        <div className="px-4 py-2.5 bg-charcoal-950/80 border-b border-charcoal-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-orange-primary flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Day {dayNumber} Training Split
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {list?.length} {list?.length === 1 ? 'Exercise' : 'Exercises'}
                          </span>
                        </div>

                        <div className="divide-y divide-charcoal-800/60 p-2">
                          {list?.map((item) => (
                            <div key={item.id} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-charcoal-800/40 rounded-xl transition">
                              <div>
                                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                                  {item.exercise_name}
                                  <span className="text-[10px] text-gray-400 font-normal">
                                    ({item.muscle_group})
                                  </span>
                                </h5>
                                {item.notes && (
                                  <p className="text-[11px] text-gray-400 mt-0.5 italic">
                                    Tip: {item.notes}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs shrink-0 font-mono">
                                <span className="px-2 py-1 rounded bg-charcoal-800 text-orange-primary font-bold">
                                  {item.sets} Sets × {item.reps} Reps
                                </span>
                                {item.rest_seconds && (
                                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-500" /> {item.rest_seconds}s rest
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-charcoal-900 text-center text-xs text-gray-400">
                      No exercises found in this routine.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-orange-primary/10 border border-orange-primary/30 flex items-center justify-center text-orange-primary mx-auto">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">No Active Workout Routine Yet</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    You can request a custom AI-formulated routine tailored to your goals, or wait for your assigned coach to publish one.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('request')}
                  className="px-5 py-2.5 rounded-xl bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-lg shadow-orange-primary/20"
                >
                  <Sparkles className="w-4 h-4" /> Request AI Routine Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REQUEST AI WORKOUT PLAN (Business AI Coaching) */}
        {activeTab === 'request' && (
          <form onSubmit={handleRequestAiPlan} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-orange-primary/10 border border-orange-primary/30 text-xs text-orange-200 leading-relaxed">
              <strong>Business AI Coaching:</strong> Select your goals and physical preferences. The Gemini AI engine will generate a comprehensive draft routine. Your certified coach will review and approve it before activation.
            </div>

            {/* Goal Selection */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Primary Fitness Goal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'muscle_gain', label: 'Muscle Building' },
                  { id: 'weight_loss', label: 'Fat Loss & Cardio' },
                  { id: 'strength', label: 'Max Strength' },
                  { id: 'endurance', label: 'Stamina & Conditioning' },
                  { id: 'general_fitness', label: 'General Vitality' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-left ${
                      goal === item.id
                        ? 'bg-orange-primary/20 border-orange-primary text-white'
                        : 'bg-charcoal-900 border-charcoal-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level & Days Per Week */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:outline-none focus:border-orange-primary"
                >
                  <option value="beginner">Beginner (0 - 1 years)</option>
                  <option value="intermediate">Intermediate (1 - 3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Weekly Training Frequency
                </label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:outline-none focus:border-orange-primary"
                >
                  <option value={2}>2 Days per week</option>
                  <option value={3}>3 Days per week (Recommended)</option>
                  <option value={4}>4 Days per week</option>
                  <option value={5}>5 Days per week</option>
                  <option value={6}>6 Days per week</option>
                </select>
              </div>
            </div>

            {/* Target Muscle Groups */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Target Muscle Groups
              </label>
              <div className="flex flex-wrap gap-2">
                {['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs & Core'].map((muscle) => {
                  const selected = targetMuscles.includes(muscle);
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => handleToggleMuscle(muscle)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                        selected
                          ? 'bg-orange-primary text-white border-orange-primary'
                          : 'bg-charcoal-900 text-gray-400 border-charcoal-700 hover:text-white'
                      }`}
                    >
                      {muscle}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Notes & Constraints */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Special Notes / Injuries / Preferences (Optional)
              </label>
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Mild lower-back sensitivity, prefer dumbells over heavy barbells..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:outline-none focus:border-orange-primary placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-primary/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating AI Plan with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Draft Plan
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: PLAN HISTORY & DRAFTS */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Your requested plans & status:</span>
              <button
                type="button"
                onClick={loadData}
                className="text-[11px] text-orange-primary hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {planHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {planHistory.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3.5 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-white text-sm">{plan.title}</h5>
                        {plan.is_ai_generated && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[9px] font-bold uppercase">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                        {plan.description || 'Workout Routine'}
                      </p>
                      <span className="text-[10px] text-gray-500 block mt-1">
                        Created (E.C.) {formatEthiopianDate(plan.created_at)} • {plan.exercises?.length || 0} exercises
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          plan.status === 'active'
                            ? 'bg-green-950 text-green-400 border border-green-800'
                            : plan.status === 'draft'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}
                      >
                        {plan.status === 'draft' ? 'AWAITING TRAINER APPROVAL' : plan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                No past workout plans found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
