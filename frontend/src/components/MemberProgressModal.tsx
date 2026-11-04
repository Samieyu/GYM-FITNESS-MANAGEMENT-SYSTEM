import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Calendar, 
  Plus, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  ProgressMetric, 
  ProgressSummary, 
  fetchMyProgressMetricsApi, 
  logProgressMetricApi 
} from '../api/progress';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface MemberProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
}

export const MemberProgressModal: React.FC<MemberProgressModalProps> = ({
  isOpen,
  onClose,
  memberName,
}) => {
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [waistCm, setWaistCm] = useState<string>('');
  const [chestCm, setChestCm] = useState<string>('');
  const [hipsCm, setHipsCm] = useState<string>('');
  const [armsCm, setArmsCm] = useState<string>('');
  const [thighsCm, setThighsCm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchMyProgressMetricsApi();
      setMetrics(data.metrics);
      setSummary(data.summary);

      // Pre-fill height if existing
      const lastWithHeight = data.metrics.find((m) => m.height_cm);
      if (lastWithHeight && lastWithHeight.height_cm) {
        setHeightCm(String(lastWithHeight.height_cm));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load progress records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setShowLogForm(false);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleSubmitMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weightKg);
    if (!parsedWeight || parsedWeight <= 0) {
      setErrorMessage('Please enter a valid weight in kg');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await logProgressMetricApi({
        weightKg: parsedWeight,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
        waistCm: waistCm ? parseFloat(waistCm) : undefined,
        chestCm: chestCm ? parseFloat(chestCm) : undefined,
        hipsCm: hipsCm ? parseFloat(hipsCm) : undefined,
        armsCm: armsCm ? parseFloat(armsCm) : undefined,
        thighsCm: thighsCm ? parseFloat(thighsCm) : undefined,
      });

      setSuccessMessage('Progress entry recorded successfully!');
      setWeightKg('');
      setBodyFat('');
      setWaistCm('');
      setChestCm('');
      setHipsCm('');
      setArmsCm('');
      setThighsCm('');
      setShowLogForm(false);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record progress entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-surface border border-border w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] flex flex-col justify-between text-text transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-modal-title"
      >
        {/* Header */}
        <div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-text-muted hover:text-text transition p-1.5 rounded-full hover:bg-background"
            aria-label="Close progress modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5 mb-5">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="progress-modal-title" className="text-xl font-bold text-text">
                  Body Transformation & Progress Logs
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/25">
                  Athlete Tracking
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Athlete: <strong className="text-text">{memberName}</strong> • Track weight changes, body measurements, BMI trends, and coach feedback.
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-background border border-border">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Current Weight</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-text">
                    {summary.current_weight !== null ? `${summary.current_weight}` : '—'}
                  </span>
                  <span className="text-xs text-text-muted">kg</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-background border border-border">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Net Change</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-xl font-black flex items-center gap-0.5 ${
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
                        {summary.total_change_kg < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                        {Math.abs(summary.total_change_kg)}
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                  {summary.total_change_kg !== null && <span className="text-xs text-text-muted">kg</span>}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-background border border-border">
                <span className="text-[10px] uppercase font-bold text-text-muted block">BMI & Category</span>
                <div className="mt-0.5">
                  <span className="text-base font-bold text-text">
                    {summary.current_bmi ? `${summary.current_bmi}` : '—'}
                  </span>
                  {summary.current_bmi_category && (
                    <span className="text-[10px] block text-primary font-semibold">
                      {summary.current_bmi_category}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-background border border-border">
                <span className="text-[10px] uppercase font-bold text-text-muted block">Body Fat</span>
                <div className="mt-0.5">
                  <span className="text-xl font-black text-text">
                    {summary.latest_fat_percentage !== null ? `${summary.latest_fat_percentage}%` : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setShowLogForm(!showLogForm)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> {showLogForm ? 'Close Entry Form' : 'Log New Measurements'}
            </button>

            <button
              type="button"
              onClick={loadData}
              className="text-xs text-text-muted hover:text-text flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} /> Refresh
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-2">
          {/* New Entry Form Card */}
          {showLogForm && (
            <form onSubmit={handleSubmitMetric} className="p-4 rounded-2xl bg-background border border-border space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Scale className="w-4 h-4" /> Record Today's Metrics
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-text font-semibold mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="500"
                    required
                    placeholder="e.g. 78.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-text font-semibold mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="50"
                    max="300"
                    placeholder="e.g. 178"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-text font-semibold mb-1">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="60"
                    placeholder="e.g. 15.2"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 font-mono"
                  />
                </div>
              </div>

              {/* Body Circumferences */}
              <div>
                <span className="block text-[10px] uppercase font-bold text-text-muted mb-1.5">Body Circumferences (Optional, cm)</span>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5">Waist</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="cm"
                      value={waistCm}
                      onChange={(e) => setWaistCm(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-text text-[11px] focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5">Chest</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="cm"
                      value={chestCm}
                      onChange={(e) => setChestCm(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-text text-[11px] focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5">Hips</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="cm"
                      value={hipsCm}
                      onChange={(e) => setHipsCm(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-text text-[11px] focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5">Arms</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="cm"
                      value={armsCm}
                      onChange={(e) => setArmsCm(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-text text-[11px] focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-0.5">Thighs</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="cm"
                      value={thighsCm}
                      onChange={(e) => setThighsCm(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-text text-[11px] focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-surface hover:bg-background border border-border text-text text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          )}

          {/* Historical Logs List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Measurement History & Coach Reviews
            </h3>

            {metrics.length === 0 ? (
              <p className="text-xs text-text-muted py-8 text-center bg-background rounded-2xl border border-border">
                No transformation metrics logged yet. Click "Log New Measurements" above to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {metrics.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-background border border-border hover:border-primary/40 transition space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatEthiopianDate(m.recorded_date)} E.C.
                        </span>
                        <span className="text-[11px] text-text-muted">
                          ({new Date(m.created_at).toLocaleDateString()})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-extrabold text-text">{m.weight_kg} kg</span>
                          {m.delta_kg !== null && m.delta_kg !== undefined && (
                            <span
                              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                m.delta_kg < 0
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : m.delta_kg > 0
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'text-text-muted'
                              }`}
                            >
                              {m.delta_kg > 0 ? `+${m.delta_kg}` : m.delta_kg} kg
                            </span>
                          )}
                        </div>

                        {m.bmi && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface text-text border border-border">
                            BMI: {m.bmi} ({m.bmi_category})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Circumferences summary */}
                    {(m.waist_cm || m.chest_cm || m.hips_cm || m.arms_cm || m.thighs_cm || m.body_fat_percentage) && (
                      <div className="flex flex-wrap gap-2 text-[11px] text-text-muted pt-1">
                        {m.body_fat_percentage && (
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            Fat: <strong className="text-text">{m.body_fat_percentage}%</strong>
                          </span>
                        )}
                        {m.waist_cm && (
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            Waist: <strong className="text-text">{m.waist_cm} cm</strong>
                          </span>
                        )}
                        {m.chest_cm && (
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            Chest: <strong className="text-text">{m.chest_cm} cm</strong>
                          </span>
                        )}
                        {m.hips_cm && (
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            Hips: <strong className="text-text">{m.hips_cm} cm</strong>
                          </span>
                        )}
                        {m.arms_cm && (
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            Arms: <strong className="text-text">{m.arms_cm} cm</strong>
                          </span>
                        )}
                        {m.thighs_cm && (
                          <span className="px-2 py-0.5 rounded bg-surface border border-border">
                            Thighs: <strong className="text-text">{m.thighs_cm} cm</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Personal Trainer Feedback comment */}
                    {m.trainer_comment ? (
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 mt-2">
                        <div className="flex items-center justify-between text-[11px] text-primary font-semibold mb-1">
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Coach Note • {m.trainer_name || 'Coach'}
                          </span>
                          {m.trainer_commented_at && (
                            <span className="text-[10px] text-text-muted font-normal">
                              {formatEthiopianDate(m.trainer_commented_at)} E.C.
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text italic">"{m.trainer_comment}"</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-text-muted italic">No coach comments on this log yet.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-background hover:bg-surface border border-border text-text text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
