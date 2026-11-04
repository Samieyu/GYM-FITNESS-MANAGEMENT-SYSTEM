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

  // AI Request Form State
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
        `AI Draft Routine "${result.title}" created successfully! It is awaiting coach review and approval.`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-surface border border-border w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto text-text transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-modal-title"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text transition p-1.5 rounded-full hover:bg-background"
          aria-label="Close workout modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 id="workout-modal-title" className="text-lg font-bold text-text flex items-center gap-2">
              Workout Routine & AI Coach
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/25 uppercase">
                AI Coaching
              </span>
            </h2>
            <p className="text-xs text-text-muted">Athlete: <strong className="text-text">{memberName}</strong></p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-background p-1 border border-border mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'current'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" /> Active Routine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'request'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Request AI Routine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Plan History & Drafts
          </button>
        </div>

        {/* Banners */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: ACTIVE ROUTINE VIEW */}
        {activeTab === 'current' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-text-muted text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                Loading your workout program...
              </div>
            ) : activePlan ? (
              <div className="space-y-4">
                {/* Active Plan Header Card */}
                <div className="p-4 rounded-2xl bg-background border border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-extrabold text-text flex items-center gap-2">
                      {activePlan.title}
                      {activePlan.is_ai_generated && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase tracking-wider">
                          AI Formulated
                        </span>
                      )}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE APPROVED
                    </span>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed mb-3">
                    {activePlan.description || 'Custom multi-day training routine.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-2 border-t border-border">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Approved by:{' '}
                      <strong className="text-text">
                        Coach {activePlan.trainer_first_name || 'Staff'} {activePlan.trainer_last_name || ''}
                      </strong>
                    </span>
                    <span className="text-border">•</span>
                    <span>
                      Activated on (E.C.): <span className="text-text font-medium">{activePlan.approved_at ? formatEthiopianDate(activePlan.approved_at) : 'Active'}</span>
                    </span>
                  </div>
                </div>

                {/* Day-by-Day Exercises */}
                <div className="space-y-3">
                  {Object.keys(groupedExercises).length > 0 ? (
                    Object.entries(groupedExercises).map(([dayNumber, list]) => (
                      <div key={dayNumber} className="rounded-2xl bg-background border border-border overflow-hidden">
                        <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between">
                          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Day {dayNumber} Training Split
                          </span>
                          <span className="text-[11px] text-text-muted">
                            {list?.length} {list?.length === 1 ? 'Exercise' : 'Exercises'}
                          </span>
                        </div>

                        <div className="divide-y divide-border p-2">
                          {list?.map((item) => (
                            <div key={item.id} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface/50 rounded-xl transition">
                              <div>
                                <h4 className="text-xs font-bold text-text flex items-center gap-2">
                                  {item.exercise_name}
                                  <span className="text-[10px] text-text-muted font-normal">
                                    ({item.muscle_group})
                                  </span>
                                </h4>
                                {item.notes && (
                                  <p className="text-[11px] text-text-muted mt-0.5 italic">
                                    Tip: {item.notes}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs shrink-0 font-mono">
                                <span className="px-2.5 py-1 rounded bg-surface border border-border text-primary font-bold">
                                  {item.sets} Sets × {item.reps} Reps
                                </span>
                                {item.rest_seconds && (
                                  <span className="text-[11px] text-text-muted flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-text-muted" /> {item.rest_seconds}s rest
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-background text-center text-xs text-text-muted">
                      No exercises found in this routine.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-background border border-border text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">No Active Workout Routine Yet</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                    You can request a custom AI-formulated routine tailored to your goals, or wait for your assigned coach to publish one.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('request')}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition inline-flex items-center gap-2 shadow-md shadow-primary/20 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" /> Request AI Routine Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REQUEST AI WORKOUT PLAN */}
        {activeTab === 'request' && (
          <form onSubmit={handleRequestAiPlan} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-text leading-relaxed">
              <strong className="text-primary">Business AI Coaching:</strong> Select your goals and physical preferences. The Gemini AI engine will generate a comprehensive draft routine. Your certified coach will review and approve it before activation.
            </div>

            {/* Goal Selection */}
            <div>
              <label className="text-xs font-semibold text-text block mb-1.5">
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
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background border-border text-text-muted hover:text-text'
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
                <label className="text-xs font-semibold text-text block mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
                >
                  <option value="beginner">Beginner (0 - 1 years)</option>
                  <option value="intermediate">Intermediate (1 - 3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">
                  Weekly Training Frequency
                </label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
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
              <label className="text-xs font-semibold text-text block mb-1.5">
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
                          ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                          : 'bg-background text-text-muted border-border hover:text-text'
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
              <label className="text-xs font-semibold text-text block mb-1.5">
                Special Notes / Injuries / Preferences (Optional)
              </label>
              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Mild lower-back sensitivity, prefer dumbbells over heavy barbells..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 placeholder-text-muted"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50 active:scale-98"
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
              <span className="text-xs text-text-muted">Your requested plans & status:</span>
              <button
                type="button"
                onClick={loadData}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {planHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {planHistory.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3.5 rounded-2xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-text text-sm">{plan.title}</h4>
                        {plan.is_ai_generated && (
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-1 line-clamp-1">
                        {plan.description || 'Workout Routine'}
                      </p>
                      <span className="text-[10px] text-text-muted block mt-1">
                        Created (E.C.) {formatEthiopianDate(plan.created_at)} • {plan.exercises?.length || 0} exercises
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          plan.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : plan.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-background text-text-muted border border-border'
                        }`}
                      >
                        {plan.status === 'draft' ? 'AWAITING TRAINER APPROVAL' : plan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted text-xs">
                No past workout plans found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
