import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  XCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { FitnessClass, RosterAttendee, fetchClassRosterApi, updateAttendanceApi } from '../api/classes';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface ClassRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  fitnessClass: FitnessClass | null;
  classList?: FitnessClass[];
  onSelectClass?: (cls: FitnessClass) => void;
  onAttendanceUpdated?: () => void;
}

export const ClassRosterModal: React.FC<ClassRosterModalProps> = ({
  isOpen,
  onClose,
  fitnessClass,
  classList = [],
  onSelectClass,
  onAttendanceUpdated,
}) => {
  const [roster, setRoster] = useState<RosterAttendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadRoster = async () => {
    if (!fitnessClass) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchClassRosterApi(fitnessClass.id);
      setRoster(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load class roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && fitnessClass) {
      loadRoster();
    }
  }, [isOpen, fitnessClass?.id]);

  const handleUpdateStatus = async (memberId: string, newStatus: 'attended' | 'booked' | 'cancelled') => {
    if (!fitnessClass) return;
    setActionLoadingId(memberId);
    try {
      await updateAttendanceApi(fitnessClass.id, memberId, newStatus);
      await loadRoster();
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update attendance status');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen || !fitnessClass) return null;

  const bookedList = roster.filter((r) => r.status === 'booked' || r.status === 'attended');
  const waitlistList = roster.filter((r) => r.status === 'waitlisted');
  const attendedCount = roster.filter((r) => r.status === 'attended').length;
  const ethDate = formatEthiopianDate(fitnessClass.start_time);

  const timeFormatted = new Date(fitnessClass.start_time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' - ' + new Date(fitnessClass.end_time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border w-full max-w-3xl rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl relative max-h-[90vh] flex flex-col justify-between animate-in zoom-in-95 duration-200 text-text">
        {/* Top Header */}
        <div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 text-text-muted hover:text-text transition p-2 rounded-xl hover:bg-surface-elevated min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pr-8">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-text">{fitnessClass.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 tracking-wider">
                    Roster & Check-In
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-text-muted">
                  <span className="flex items-center gap-1 text-text font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {ethDate} E.C.
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-text font-medium">
                    <Clock className="w-3.5 h-3.5 text-primary" /> {timeFormatted}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-text-muted">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" /> {fitnessClass.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Switch Class Selector (If multiple classes exist) */}
            {classList.length > 1 && onSelectClass && (
              <div className="sm:text-right shrink-0">
                <label className="block text-[11px] text-text-muted font-semibold mb-1">Switch Class</label>
                <select
                  value={fitnessClass.id}
                  onChange={(e) => {
                    const targetCls = classList.find((c) => c.id === e.target.value);
                    if (targetCls) onSelectClass(targetCls);
                  }}
                  className="bg-surface-elevated border border-border rounded-xl px-3 py-2 text-text text-xs focus:outline-none focus:border-primary transition"
                >
                  {classList.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface text-text">
                      {c.title} ({formatEthiopianDate(c.start_time)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3.5 rounded-2xl bg-surface-elevated/70 border border-border text-center">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Capacity</span>
              <span className="text-xl font-black text-text">
                {bookedList.length} <span className="text-xs font-normal text-text-muted">/ {fitnessClass.capacity}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">Checked In</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {attendedCount} <span className="text-xs font-normal text-emerald-600/70 dark:text-emerald-400/70">/ {bookedList.length}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">Waitlisted</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {waitlistList.length}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
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
        </div>

        {/* Scrollable Attendees List */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 my-2">
          {/* Confirmed Attendees Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Confirmed Attendees ({bookedList.length})
              </h4>
              <button
                type="button"
                onClick={loadRoster}
                className="text-[11px] text-text-muted hover:text-text flex items-center gap-1.5 p-1 rounded-lg hover:bg-surface-elevated transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} /> Refresh
              </button>
            </div>

            {bookedList.length === 0 ? (
              <div className="text-xs text-text-muted py-6 text-center bg-surface-elevated/40 rounded-2xl border border-border">
                No confirmed athlete bookings yet for this class.
              </div>
            ) : (
              <div className="space-y-2.5">
                {bookedList.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="p-3.5 rounded-xl bg-surface-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-border-strong transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-text">
                          {attendee.user_first_name} {attendee.user_last_name}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            attendee.status === 'attended'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-surface border border-border text-text-muted'
                          }`}
                        >
                          {attendee.status === 'attended' ? 'Attended ✓' : 'Booked'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {attendee.user_email} {attendee.user_phone ? `• ${attendee.user_phone}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {attendee.status !== 'attended' ? (
                        <button
                          type="button"
                          disabled={actionLoadingId === attendee.member_id}
                          onClick={() => handleUpdateStatus(attendee.member_id, 'attended')}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 active:scale-95"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Check-In</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actionLoadingId === attendee.member_id}
                          onClick={() => handleUpdateStatus(attendee.member_id, 'booked')}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-text-muted hover:text-text text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Undo</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={actionLoadingId === attendee.member_id}
                        onClick={() => handleUpdateStatus(attendee.member_id, 'cancelled')}
                        className="min-h-[38px] p-2 rounded-xl bg-surface hover:bg-danger/10 border border-border text-text-muted hover:text-danger text-xs transition flex items-center justify-center min-w-[38px]"
                        title="Cancel booking and auto-promote waitlist"
                        aria-label="Cancel attendee booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Waitlist Queue Section */}
          {waitlistList.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Waitlist Queue ({waitlistList.length})
              </h4>
              <div className="space-y-2.5">
                {waitlistList.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                          #{attendee.waitlist_position}
                        </span>
                        <p className="text-sm font-bold text-text">
                          {attendee.user_first_name} {attendee.user_last_name}
                        </p>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 ml-8">
                        {attendee.user_email} • Booked {new Date(attendee.booked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 shrink-0">
                      Auto-promotes next
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3.5 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text text-xs font-bold transition active:scale-95"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};
