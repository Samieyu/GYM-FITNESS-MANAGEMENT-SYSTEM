import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Send,
  User,
  Scale,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { 
  AssignedMemberSummary, 
  ProgressMetric, 
  ProgressSummary, 
  fetchAssignedMembersProgressApi, 
  fetchMemberProgressMetricsApi, 
  submitTrainerCommentApi 
} from '../api/progress';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface TrainerProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerName: string;
}

export const TrainerProgressModal: React.FC<TrainerProgressModalProps> = ({
  isOpen,
  onClose,
  trainerName,
}) => {
  const [members, setMembers] = useState<AssignedMemberSummary[]>([]);
  const [selectedMember, setSelectedMember] = useState<AssignedMemberSummary | null>(null);
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Mobile view toggle: 'roster' | 'details'
  const [mobileView, setMobileView] = useState<'roster' | 'details'>('roster');

  // Active commenting state
  const [activeCommentMetricId, setActiveCommentMetricId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchAssignedMembersProgressApi();
      setMembers(data);
      if (data.length > 0 && !selectedMember) {
        setSelectedMember(data[0]);
        loadMemberMetrics(data[0].user_id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load assigned members');
    } finally {
      setLoading(false);
    }
  };

  const loadMemberMetrics = async (memberId: string) => {
    setMetricsLoading(true);
    try {
      const data = await fetchMemberProgressMetricsApi(memberId);
      setMetrics(data.metrics);
      setSummary(data.summary);
    } catch (err: any) {
      console.error('Failed to load member metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMembers();
      setActiveCommentMetricId(null);
      setSuccessMessage(null);
      setMobileView('roster');
    }
  }, [isOpen]);

  const handleSelectMember = (member: AssignedMemberSummary) => {
    setSelectedMember(member);
    setActiveCommentMetricId(null);
    setSuccessMessage(null);
    setMobileView('details');
    loadMemberMetrics(member.user_id);
  };

  const handlePostComment = async (metricId: string) => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    setErrorMessage(null);
    try {
      await submitTrainerCommentApi(metricId, commentText.trim());
      setSuccessMessage('Coaching feedback submitted and emailed to athlete!');
      setActiveCommentMetricId(null);
      setCommentText('');
      if (selectedMember) {
        await loadMemberMetrics(selectedMember.user_id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit feedback comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border w-full max-w-5xl rounded-3xl p-5 sm:p-7 shadow-2xl relative max-h-[92vh] flex flex-col justify-between animate-in zoom-in-95 duration-200 text-text">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 text-text-muted hover:text-text transition p-2 rounded-xl hover:bg-surface-elevated min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5 mb-4 pr-8">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-text">
                  Athlete Transformation & Weigh-in Reviews
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 tracking-wider">
                  Coach Portal
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Coach: <strong className="text-text font-semibold">{trainerName}</strong> • Inspect member body transformation metrics, track weight deltas, and dispatch feedback.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-3.5 p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
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
            <div className="mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
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
        </div>

        {/* Mobile View Switcher Pill (only on mobile) */}
        <div className="flex md:hidden items-center justify-between mb-3 bg-surface-elevated p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setMobileView('roster')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mobileView === 'roster'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted'
            }`}
          >
            Athletes ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileView('details')}
            disabled={!selectedMember}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition disabled:opacity-40 ${
              mobileView === 'details'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted'
            }`}
          >
            Progress Details
          </button>
        </div>

        {/* Main Split Layout: Left Members List, Right Metric Details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {/* Column 1: Member selector (TRN-PAGE-02) */}
          <div className={`p-4 rounded-2xl bg-surface-elevated/50 border border-border flex flex-col justify-between overflow-hidden ${
            mobileView === 'details' ? 'hidden md:flex' : 'flex'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Assigned Athletes ({members.length})
                </span>
                <button
                  type="button"
                  onClick={loadMembers}
                  className="text-[11px] text-text-muted hover:text-text flex items-center gap-1 p-1 rounded-lg hover:bg-surface transition"
                  title="Refresh athletes roster"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
                </button>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[58vh] pr-1">
                {members.length === 0 ? (
                  <div className="text-center py-8 text-text-muted text-xs">
                    No assigned athletes found in your coaching roster.
                  </div>
                ) : (
                  members.map((m) => {
                    const isSelected = selectedMember?.user_id === m.user_id;
                    return (
                      <div
                        key={m.user_id}
                        onClick={() => handleSelectMember(m)}
                        className={`p-3.5 rounded-xl cursor-pointer transition border ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-text shadow-sm'
                            : 'bg-surface border-border hover:border-border-strong text-text-muted hover:text-text'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs truncate text-text">
                            {m.first_name} {m.last_name}
                          </p>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border">
                            {m.member_code || 'MEM'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2 text-[11px]">
                          <span className="text-text-muted">
                            Latest: <strong className="text-text font-bold">{m.latest_weight_kg ? `${m.latest_weight_kg} kg` : 'None'}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-text-muted text-[10px] border border-border flex items-center gap-1">
                            <Activity className="w-2.5 h-2.5" />
                            {m.total_logs_count} {m.total_logs_count === 1 ? 'log' : 'logs'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Selected Member Metrics & Timeline (TRN-PAGE-03) */}
          <div className={`md:col-span-2 p-4 sm:p-5 rounded-2xl bg-surface-elevated/50 border border-border flex flex-col justify-between overflow-hidden ${
            mobileView === 'roster' ? 'hidden md:flex' : 'flex'
          }`}>
            {selectedMember ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Member Highlights header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileView('roster')}
                        className="md:hidden p-1 rounded-lg text-text-muted hover:text-text"
                        aria-label="Back to roster"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h4 className="text-base font-bold text-text">
                        {selectedMember.first_name} {selectedMember.last_name}
                      </h4>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {selectedMember.email} • Goal: <span className="text-primary font-semibold">{selectedMember.fitness_goals || 'General Fitness'}</span>
                    </p>
                  </div>

                  {summary && (
                    <div className="flex items-center gap-4 bg-surface p-2.5 rounded-xl border border-border">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-muted block">Current Weight</span>
                        <span className="text-sm font-black text-text">{summary.current_weight || '—'} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-text-muted block">Net Change</span>
                        <span
                          className={`text-sm font-black flex items-center justify-end gap-1 ${
                            summary.total_change_kg === null
                              ? 'text-text-muted'
                              : summary.total_change_kg < 0
                              ? 'text-emerald-500'
                              : summary.total_change_kg > 0
                              ? 'text-amber-500'
                              : 'text-text'
                          }`}
                        >
                          {summary.total_change_kg !== null ? (
                            <>
                              {summary.total_change_kg < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                              {Math.abs(summary.total_change_kg)} kg
                            </>
                          ) : (
                            '—'
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline of Logs */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 my-3">
                  {metricsLoading ? (
                    <div className="text-center py-12 text-text-muted text-xs flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span>Loading athlete logs...</span>
                    </div>
                  ) : metrics.length === 0 ? (
                    <div className="text-center py-16 text-text-muted text-xs bg-surface rounded-xl border border-border p-6">
                      <Scale className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-text">No weigh-in logs recorded yet</p>
                      <p className="mt-1 text-[11px]">This athlete has not submitted body transformation metrics yet.</p>
                    </div>
                  ) : (
                    metrics.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl bg-surface border border-border space-y-2.5 hover:border-border-strong transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-primary flex items-center gap-1.5 font-bold">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatEthiopianDate(m.recorded_date)} E.C.
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="font-black text-text text-sm">{m.weight_kg} kg</span>
                            {m.delta_kg !== null && m.delta_kg !== undefined && (
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  m.delta_kg < 0
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : m.delta_kg > 0
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    : 'text-text-muted'
                                }`}
                              >
                                {m.delta_kg > 0 ? `+${m.delta_kg}` : m.delta_kg} kg
                              </span>
                            )}
                            {m.bmi && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-elevated text-text border border-border">
                                BMI {m.bmi}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Body Dimensions */}
                        {(m.waist_cm || m.chest_cm || m.hips_cm || m.arms_cm || m.thighs_cm || m.body_fat_percentage) && (
                          <div className="flex flex-wrap gap-2 text-[11px] text-text-muted pt-1">
                            {m.body_fat_percentage && <span className="bg-surface-elevated px-2 py-0.5 rounded-md border border-border">Fat: <strong className="text-text">{m.body_fat_percentage}%</strong></span>}
                            {m.waist_cm && <span className="bg-surface-elevated px-2 py-0.5 rounded-md border border-border">Waist: <strong className="text-text">{m.waist_cm}cm</strong></span>}
                            {m.chest_cm && <span className="bg-surface-elevated px-2 py-0.5 rounded-md border border-border">Chest: <strong className="text-text">{m.chest_cm}cm</strong></span>}
                            {m.hips_cm && <span className="bg-surface-elevated px-2 py-0.5 rounded-md border border-border">Hips: <strong className="text-text">{m.hips_cm}cm</strong></span>}
                            {m.arms_cm && <span className="bg-surface-elevated px-2 py-0.5 rounded-md border border-border">Arms: <strong className="text-text">{m.arms_cm}cm</strong></span>}
                            {m.thighs_cm && <span className="bg-surface-elevated px-2 py-0.5 rounded-md border border-border">Thighs: <strong className="text-text">{m.thighs_cm}cm</strong></span>}
                          </div>
                        )}

                        {/* Coach feedback or inline comment trigger */}
                        {m.trainer_comment ? (
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                            <div className="flex items-center justify-between text-[11px] text-primary font-bold mb-1">
                              <span>Coach Feedback Note:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCommentMetricId(m.id);
                                  setCommentText(m.trainer_comment || '');
                                }}
                                className="text-text-muted hover:text-text underline text-[10px]"
                              >
                                Edit Note
                              </button>
                            </div>
                            <p className="text-text italic">"{m.trainer_comment}"</p>
                          </div>
                        ) : (
                          <div>
                            {activeCommentMetricId !== m.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCommentMetricId(m.id);
                                  setCommentText('');
                                }}
                                className="text-xs text-primary hover:underline flex items-center gap-1.5 font-bold pt-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Add Coaching Guidance Note
                              </button>
                            )}
                          </div>
                        )}

                        {/* Active inline feedback form */}
                        {activeCommentMetricId === m.id && (
                          <div className="p-3.5 rounded-xl bg-surface-elevated border border-primary/30 space-y-2.5 mt-2 animate-in fade-in duration-150">
                            <label className="block text-xs text-text font-bold">
                              Provide Feedback to Athlete (triggers email alert):
                            </label>
                            <textarea
                              rows={2}
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="e.g. Excellent waist reduction! Increase your hydration and maintain current tempo."
                              className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary resize-none transition"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveCommentMetricId(null)}
                                className="px-3 py-1.5 rounded-xl bg-surface border border-border text-text text-xs font-semibold hover:bg-surface-elevated transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={submittingComment || !commentText.trim()}
                                onClick={() => handlePostComment(m.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                {submittingComment ? 'Sending...' : 'Send Note'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-text-muted text-xs">
                Select an athlete on the left to review their progress metrics.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3.5 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text text-xs font-bold transition active:scale-95"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
