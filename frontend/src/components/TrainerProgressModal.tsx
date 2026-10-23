import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Scale, 
  Calendar, 
  MessageSquare, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Send,
  UserCheck
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
    }
  }, [isOpen]);

  const handleSelectMember = (member: AssignedMemberSummary) => {
    setSelectedMember(member);
    setActiveCommentMetricId(null);
    setSuccessMessage(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-5xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col justify-between">
        {/* Header */}
        <div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-charcoal-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5 mb-4">
            <div className="p-3 bg-orange-primary/10 border border-orange-primary/30 rounded-2xl text-orange-primary shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Athlete Transformation & Weight Reviews</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-charcoal-800 text-orange-primary border border-charcoal-700">
                  Coach Portal
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Inspect member transformation metrics, track weight deltas, and submit personalized coaching guidance.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-3 p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-3 rounded-xl bg-green-950/80 border border-green-800 text-xs text-green-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Main Split Layout: Left Members List, Right Metric Details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {/* Column 1: Member selector */}
          <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-800">
                <span className="text-xs font-bold uppercase text-gray-300">Athletes ({members.length})</span>
                <button
                  type="button"
                  onClick={loadMembers}
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
                {members.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No assigned athletes found.</p>
                ) : (
                  members.map((m) => {
                    const isSelected = selectedMember?.user_id === m.user_id;
                    return (
                      <div
                        key={m.user_id}
                        onClick={() => handleSelectMember(m)}
                        className={`p-3 rounded-xl cursor-pointer transition border ${
                          isSelected
                            ? 'bg-orange-primary/10 border-orange-primary/50 text-white'
                            : 'bg-charcoal-850 border-charcoal-800 hover:border-charcoal-700 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs truncate">
                            {m.first_name} {m.last_name}
                          </p>
                          <span className="text-[10px] font-mono text-gray-400">
                            {m.member_code || 'MEM'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400">
                          <span>
                            Latest: <strong className="text-white">{m.latest_weight_kg ? `${m.latest_weight_kg} kg` : 'None'}</strong>
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-charcoal-800 text-[10px]">
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

          {/* Column 2 & 3: Selected Member Metrics & Timeline */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between overflow-hidden">
            {selectedMember ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Member Highlights header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-800">
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {selectedMember.first_name} {selectedMember.last_name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedMember.email} • Goal: <span className="text-orange-primary">{selectedMember.fitness_goals || 'General Fitness'}</span>
                    </p>
                  </div>

                  {summary && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Weight</span>
                        <span className="text-sm font-black text-white">{summary.current_weight || '—'} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Net Change</span>
                        <span
                          className={`text-sm font-black flex items-center justify-end gap-0.5 ${
                            summary.total_change_kg === null
                              ? 'text-gray-400'
                              : summary.total_change_kg < 0
                              ? 'text-green-400'
                              : summary.total_change_kg > 0
                              ? 'text-amber-400'
                              : 'text-white'
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
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-3">
                  {metricsLoading ? (
                    <div className="text-center py-10 text-gray-400 text-xs">Loading logs...</div>
                  ) : metrics.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xs">
                      This athlete has not logged any measurements yet.
                    </div>
                  ) : (
                    metrics.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-2 hover:border-charcoal-750 transition"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-orange-primary flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatEthiopianDate(m.recorded_date)} E.C.
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-sm">{m.weight_kg} kg</span>
                            {m.delta_kg !== null && m.delta_kg !== undefined && (
                              <span
                                className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                  m.delta_kg < 0
                                    ? 'bg-green-950 text-green-400'
                                    : m.delta_kg > 0
                                    ? 'bg-amber-950 text-amber-400'
                                    : 'text-gray-400'
                                }`}
                              >
                                {m.delta_kg > 0 ? `+${m.delta_kg}` : m.delta_kg} kg
                              </span>
                            )}
                            {m.bmi && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-charcoal-800 text-gray-300">
                                BMI {m.bmi}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Dimensions */}
                        {(m.waist_cm || m.chest_cm || m.hips_cm || m.arms_cm || m.thighs_cm || m.body_fat_percentage) && (
                          <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                            {m.body_fat_percentage && <span>Fat: <strong className="text-white">{m.body_fat_percentage}%</strong></span>}
                            {m.waist_cm && <span>Waist: <strong className="text-white">{m.waist_cm}cm</strong></span>}
                            {m.chest_cm && <span>Chest: <strong className="text-white">{m.chest_cm}cm</strong></span>}
                            {m.hips_cm && <span>Hips: <strong className="text-white">{m.hips_cm}cm</strong></span>}
                            {m.arms_cm && <span>Arms: <strong className="text-white">{m.arms_cm}cm</strong></span>}
                            {m.thighs_cm && <span>Thighs: <strong className="text-white">{m.thighs_cm}cm</strong></span>}
                          </div>
                        )}

                        {/* Coach feedback or inline comment trigger */}
                        {m.trainer_comment ? (
                          <div className="p-2.5 rounded-lg bg-orange-950/20 border border-orange-primary/30 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-orange-primary font-semibold mb-0.5">
                              <span>Coach Feedback:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCommentMetricId(m.id);
                                  setCommentText(m.trainer_comment || '');
                                }}
                                className="text-gray-400 hover:text-white underline text-[10px]"
                              >
                                Edit Note
                              </button>
                            </div>
                            <p className="text-gray-200 italic">"{m.trainer_comment}"</p>
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
                                className="text-[11px] text-orange-primary hover:underline flex items-center gap-1 font-semibold"
                              >
                                <MessageSquare className="w-3 h-3" /> Add Coaching Guidance Note
                              </button>
                            )}
                          </div>
                        )}

                        {/* Active inline feedback form */}
                        {activeCommentMetricId === m.id && (
                          <div className="p-3 rounded-xl bg-charcoal-900 border border-orange-primary/40 space-y-2 mt-2">
                            <label className="block text-[11px] text-white font-semibold">
                              Provide Feedback to Athlete (dispatches email alert):
                            </label>
                            <textarea
                              rows={2}
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="e.g. Excellent reduction in waist circumference! Keep your hydration up and stay consistent."
                              className="w-full bg-charcoal-850 border border-charcoal-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-primary resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveCommentMetricId(null)}
                                className="px-2.5 py-1 rounded bg-charcoal-800 text-gray-400 text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={submittingComment || !commentText.trim()}
                                onClick={() => handlePostComment(m.id)}
                                className="px-3 py-1 rounded bg-orange-primary hover:bg-orange-hover text-white font-bold text-xs flex items-center gap-1 disabled:opacity-50"
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
              <div className="text-center py-20 text-gray-500 text-xs">
                Select an athlete on the left to review their progress metrics.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-charcoal-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white text-xs font-semibold transition"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
};
