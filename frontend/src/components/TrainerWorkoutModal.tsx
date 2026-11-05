import React, { useState, useEffect } from 'react';
import { 
  X, 
  Dumbbell, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Layers,
} from 'lucide-react';
import { 
  fetchTrainerPendingDraftsApi, 
  approveWorkoutPlanApi, 
  fetchExerciseLibraryApi, 
  createCustomWorkoutPlanApi,
  WorkoutPlanItem, 
  ExerciseItem 
} from '../api/workouts';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface TrainerWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerName: string;
}

export const TrainerWorkoutModal: React.FC<TrainerWorkoutModalProps> = ({
  isOpen,
  onClose,
  trainerName,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'builder'>('pending');
  const [pendingPlans, setPendingPlans] = useState<WorkoutPlanItem[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Custom Builder Form State
  const [customMemberId, setCustomMemberId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('Custom Strength Split');
  const [customDescription, setCustomDescription] = useState<string>('Personalized resistance program curated by coach.');
  const [builderExercises, setBuilderExercises] = useState<
    Array<{
      exerciseId: string;
      dayOfWeek: number;
      sets: number;
      reps: number;
      restSeconds: number;
      notes: string;
    }>
  >([]);
  const [isSavingCustom, setIsSavingCustom] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [pending, library] = await Promise.all([
        fetchTrainerPendingDraftsApi(),
        fetchExerciseLibraryApi(),
      ]);
      setPendingPlans(pending);
      setExerciseLibrary(library);

      // Default builder with 1 exercise from library if empty
      if (builderExercises.length === 0 && library.length > 0) {
        setBuilderExercises([
          {
            exerciseId: library[0].id,
            dayOfWeek: 1,
            sets: 3,
            reps: 10,
            restSeconds: 60,
            notes: 'Controlled tempo with full range of motion.',
          },
        ]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load trainer queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleApprovePlan = async (planId: string) => {
    setApprovingId(planId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const approved = await approveWorkoutPlanApi(planId);
      setSuccessMessage(`Routine "${approved.title}" successfully approved and activated for the member!`);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval failed');
    } finally {
      setApprovingId(null);
    }
  };

  const handleAddBuilderExercise = () => {
    if (exerciseLibrary.length === 0) return;
    setBuilderExercises((prev) => [
      ...prev,
      {
        exerciseId: exerciseLibrary[0].id,
        dayOfWeek: 1,
        sets: 3,
        reps: 10,
        restSeconds: 60,
        notes: '',
      },
    ]);
  };

  const handleRemoveBuilderExercise = (index: number) => {
    setBuilderExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMemberId.trim()) {
      setErrorMessage('Please enter the Member ID / UUID to assign this plan to.');
      return;
    }
    if (builderExercises.length === 0) {
      setErrorMessage('Please add at least 1 exercise.');
      return;
    }

    setIsSavingCustom(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await createCustomWorkoutPlanApi({
        memberId: customMemberId.trim(),
        title: customTitle.trim(),
        description: customDescription.trim(),
        exercises: builderExercises.map((ex, idx) => ({
          ...ex,
          orderIndex: idx + 1,
        })),
      });

      setSuccessMessage(`Custom workout routine "${res.title}" published and activated for member!`);
      setActiveTab('pending');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish custom workout routine.');
    } finally {
      setIsSavingCustom(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border w-full max-w-3xl rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-text">
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 text-text-muted hover:text-text transition p-2 rounded-xl hover:bg-surface-elevated min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-text">
                Trainer Workout Workspace & Review Gate
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase tracking-wider">
                Coach Approval Gate
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Certified Coach: <strong className="text-text font-semibold">{trainerName}</strong> • Review AI member routines and author custom splits.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-surface-elevated p-1.5 border border-border mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === 'pending'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending AI Drafts</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'pending' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-surface border border-border text-text-muted'
            }`}>
              {pendingPlans.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === 'builder'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Direct Custom Plan Builder</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-danger hover:opacity-80 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:opacity-80 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: PENDING DRAFTS QUEUE (Business Coach Approval Gate - Rule 11) */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border text-xs text-text-muted leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-text font-semibold">Business Rule 11 Gate:</strong> Review AI-generated routines requested by athletes. Only after a certified trainer inspects the exercise balance and taps <strong className="text-text font-semibold">"Approve & Activate"</strong> will the routine unlock for the athlete.
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-text-muted text-xs flex flex-col items-center justify-center gap-2.5">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span>Loading pending athlete routine drafts...</span>
              </div>
            ) : pendingPlans.length > 0 ? (
              <div className="space-y-3.5">
                {pendingPlans.map((plan) => {
                  const isExpanded = expandedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className="p-4 sm:p-5 rounded-2xl bg-surface-elevated/60 border border-border hover:border-border-strong space-y-3.5 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-text">{plan.title}</h4>
                            {plan.is_ai_generated && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI Draft
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <strong className="text-text font-semibold">{plan.member_first_name} {plan.member_last_name}</strong>
                              <span>({plan.member_email})</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-text-muted">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Submitted: {formatEthiopianDate(plan.created_at)} E.C.</span>
                            <span>•</span>
                            <span>{plan.exercises?.length || 0} exercises configured</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-text text-xs font-semibold transition flex items-center gap-1.5"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'Review Exercises'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            disabled={approvingId === plan.id}
                            onClick={() => handleApprovePlan(plan.id)}
                            className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/20 disabled:opacity-50 active:scale-95"
                          >
                            {approvingId === plan.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Approve & Activate
                          </button>
                        </div>
                      </div>

                      {/* Expanded Exercise Breakdown */}
                      {isExpanded && plan.exercises && (
                        <div className="pt-3.5 border-t border-border space-y-3 animate-in fade-in duration-150">
                          <p className="text-xs text-text-muted italic bg-surface p-2.5 rounded-xl border border-border">
                            {plan.description || 'No specific rationale provided by athlete.'}
                          </p>

                          <div className="divide-y divide-border rounded-xl bg-surface border border-border overflow-hidden">
                            {plan.exercises.map((ex) => (
                              <div key={ex.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                                <div>
                                  <span className="font-bold text-text block">
                                    Day {ex.day_of_week} • {ex.exercise_name} <span className="text-text-muted font-normal">({ex.muscle_group})</span>
                                  </span>
                                  {ex.notes && (
                                    <span className="text-[11px] text-text-muted italic block mt-0.5">
                                      Tip: {ex.notes}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-primary font-bold text-xs whitespace-nowrap bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 shrink-0">
                                  {ex.sets} Sets × {ex.reps} Reps ({ex.rest_seconds || 60}s rest)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-text-muted text-xs bg-surface-elevated/40 rounded-2xl border border-border p-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-text">All athlete routines are approved!</p>
                <p className="mt-1 text-[11px]">No pending AI routine drafts are awaiting coach review right now.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DIRECT CUSTOM PLAN BUILDER */}
        {activeTab === 'builder' && (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">
                  Member UUID / User ID *
                </label>
                <input
                  type="text"
                  value={customMemberId}
                  onChange={(e) => setCustomMemberId(e.target.value)}
                  placeholder="e.g. c0000000-0000-0000-0000-000000000003"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-text font-mono text-xs focus:outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1.5">
                  Routine Title *
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. 4-Week Hypertrophy Split"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-text text-xs focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1.5">
                Trainer Coaching Rationale / Notes
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={2}
                placeholder="Targeted recommendations, progression guide, form cues..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-text text-xs focus:outline-none focus:border-primary transition resize-none"
              />
            </div>

            {/* Exercises Builder */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  Exercises in Routine ({builderExercises.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddBuilderExercise}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Exercise
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {builderExercises.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-surface-elevated border border-border flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
                  >
                    <div className="flex-1 w-full">
                      <label className="text-[10px] text-text-muted block mb-1">Exercise Choice</label>
                      <select
                        value={item.exerciseId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBuilderExercises((prev) =>
                            prev.map((ex, i) => (i === index ? { ...ex, exerciseId: val } : ex))
                          );
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text text-xs focus:outline-none focus:border-primary transition"
                      >
                        {exerciseLibrary.map((lib) => (
                          <option key={lib.id} value={lib.id} className="bg-surface text-text">
                            {lib.name} ({lib.muscle_group})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="w-20">
                        <label className="text-[10px] text-text-muted block mb-1">Day (1-7)</label>
                        <input
                          type="number"
                          min={1}
                          max={7}
                          value={item.dayOfWeek}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setBuilderExercises((prev) =>
                              prev.map((ex, i) => (i === index ? { ...ex, dayOfWeek: val } : ex))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text text-xs text-center focus:border-primary transition"
                        />
                      </div>

                      <div className="w-20">
                        <label className="text-[10px] text-text-muted block mb-1">Sets</label>
                        <input
                          type="number"
                          min={1}
                          value={item.sets}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setBuilderExercises((prev) =>
                              prev.map((ex, i) => (i === index ? { ...ex, sets: val } : ex))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text text-xs text-center focus:border-primary transition"
                        />
                      </div>

                      <div className="w-20">
                        <label className="text-[10px] text-text-muted block mb-1">Reps</label>
                        <input
                          type="number"
                          min={1}
                          value={item.reps}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setBuilderExercises((prev) =>
                              prev.map((ex, i) => (i === index ? { ...ex, reps: val } : ex))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text text-xs text-center focus:border-primary transition"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveBuilderExercise(index)}
                        className="p-2 text-danger hover:bg-danger/10 rounded-lg transition mt-3 sm:mt-0 min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0"
                        aria-label="Remove exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingCustom}
              className="w-full min-h-[44px] py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95"
            >
              {isSavingCustom ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Publishing Routine...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Publish & Activate Routine for Member
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
