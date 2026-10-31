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
      setSuccessMessage(`Routine "${approved.title}" successfully approved and activated for the member !`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
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
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Trainer Workout Workspace & Review Gate
              <span className="px-2 py-0.5 rounded-full bg-orange-primary/20 text-orange-primary text-[10px] font-bold border border-orange-primary/30 uppercase">
                Coach Approval
              </span>
            </h3>
            <p className="text-xs text-gray-400">Coach: <strong className="text-gray-200">{trainerName}</strong></p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-charcoal-900 p-1 border border-charcoal-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Pending AI Drafts Queue ({pendingPlans.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Direct Custom Plan Builder
          </button>
        </div>

        {/* Alerts */}
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

        {/* TAB 1: PENDING DRAFTS QUEUE (Business Coach Approval Gate) */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300 leading-relaxed">
              <strong>Business Rule 11 Gate:</strong> Review AI-generated routines requested by members. Only after a coach inspects the exercise balance and clicks <strong>"Approve & Activate"</strong> will the routine become active for the athlete.
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-orange-primary" />
                Loading pending routine drafts...
              </div>
            ) : pendingPlans.length > 0 ? (
              <div className="space-y-3">
                {pendingPlans.map((plan) => {
                  const isExpanded = expandedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3 transition hover:border-charcoal-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{plan.title}</h4>
                            {plan.is_ai_generated && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[9px] font-bold uppercase flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> AI Draft
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Athlete: <strong className="text-white">{plan.member_first_name} {plan.member_last_name}</strong> ({plan.member_email})
                          </p>
                          <span className="text-[10px] text-gray-500 block mt-1">
                            Submitted (E.C.) {formatEthiopianDate(plan.created_at)} • {plan.exercises?.length || 0} exercises
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                            className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-xs font-semibold transition"
                          >
                            {isExpanded ? 'Hide Details' : 'Review Exercises'}
                          </button>

                          <button
                            type="button"
                            disabled={approvingId === plan.id}
                            onClick={() => handleApprovePlan(plan.id)}
                            className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-green-950/40 disabled:opacity-50"
                          >
                            {approvingId === plan.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve & Activate
                          </button>
                        </div>
                      </div>

                      {/* Expanded Exercise Breakdown */}
                      {isExpanded && plan.exercises && (
                        <div className="pt-3 border-t border-charcoal-800/80 space-y-2 animate-fadeIn">
                          <p className="text-xs text-gray-300 italic">
                            Description: {plan.description || 'No description provided.'}
                          </p>

                          <div className="divide-y divide-charcoal-800/60 rounded-xl bg-charcoal-950/60 p-2">
                            {plan.exercises.map((ex) => (
                              <div key={ex.id} className="py-2 px-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                                <div>
                                  <span className="font-bold text-white block">
                                    Day {ex.day_of_week} • {ex.exercise_name} ({ex.muscle_group})
                                  </span>
                                  {ex.notes && (
                                    <span className="text-[11px] text-gray-400 italic block">
                                      Tip: {ex.notes}
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-orange-primary font-semibold text-xs whitespace-nowrap">
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
              <div className="py-12 text-center text-gray-500 text-xs">
                No pending AI drafts awaiting review. All athlete routines are approved!
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DIRECT CUSTOM PLAN BUILDER */}
        {activeTab === 'builder' && (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Member UUID / User ID
                </label>
                <input
                  type="text"
                  value={customMemberId}
                  onChange={(e) => setCustomMemberId(e.target.value)}
                  placeholder="Enter member's UUID..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white font-mono text-xs focus:outline-none focus:border-orange-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. 4-Week Hypertrophy Split"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:outline-none focus:border-orange-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Trainer Coaching Rationale / Notes
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={2}
                placeholder="Targeted recommendations, progression guide..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:outline-none focus:border-orange-primary"
              />
            </div>

            {/* Exercises Builder */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-300">
                  Exercises in Routine ({builderExercises.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddBuilderExercise}
                  className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-orange-primary text-white text-xs font-semibold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Exercise
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {builderExercises.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <select
                        value={item.exerciseId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBuilderExercises((prev) =>
                            prev.map((ex, i) => (i === index ? { ...ex, exerciseId: val } : ex))
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-700 text-white text-xs focus:outline-none"
                      >
                        {exerciseLibrary.map((lib) => (
                          <option key={lib.id} value={lib.id}>
                            {lib.name} ({lib.muscle_group})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <label className="text-[10px] text-gray-400 block">Day (1-7)</label>
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
                          className="w-full px-2 py-1 rounded-lg bg-charcoal-950 border border-charcoal-700 text-white text-xs text-center"
                        />
                      </div>

                      <div className="w-16">
                        <label className="text-[10px] text-gray-400 block">Sets</label>
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
                          className="w-full px-2 py-1 rounded-lg bg-charcoal-950 border border-charcoal-700 text-white text-xs text-center"
                        />
                      </div>

                      <div className="w-16">
                        <label className="text-[10px] text-gray-400 block">Reps</label>
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
                          className="w-full px-2 py-1 rounded-lg bg-charcoal-950 border border-charcoal-700 text-white text-xs text-center"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveBuilderExercise(index)}
                        className="p-1.5 text-red-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition mt-3 sm:mt-0"
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
              className="w-full py-3 rounded-xl bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-primary/20 disabled:opacity-50"
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
