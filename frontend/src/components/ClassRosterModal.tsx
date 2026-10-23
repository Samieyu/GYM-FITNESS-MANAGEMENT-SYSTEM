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
  ChevronDown
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
        {/* Top Header */}
        <div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-charcoal-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pr-10">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-orange-primary/10 border border-orange-primary/30 rounded-2xl text-orange-primary shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{fitnessClass.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-charcoal-800 text-orange-primary border border-charcoal-700">
                    Roster & Check-In
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1 text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-orange-primary" /> {ethDate} E.C.
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-orange-primary" /> {timeFormatted}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-orange-primary" /> {fitnessClass.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Switch Class Selector (If multiple classes exist) */}
            {classList.length > 1 && onSelectClass && (
              <div className="sm:text-right">
                <label className="block text-[11px] text-gray-400 font-semibold mb-1">Switch Class</label>
                <select
                  value={fitnessClass.id}
                  onChange={(e) => {
                    const targetCls = classList.find((c) => c.id === e.target.value);
                    if (targetCls) onSelectClass(targetCls);
                  }}
                  className="bg-charcoal-900 border border-charcoal-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-orange-primary"
                >
                  {classList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({formatEthiopianDate(c.start_time)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Capacity</span>
              <span className="text-lg font-black text-white">
                {bookedList.length} <span className="text-xs font-normal text-gray-400">/ {fitnessClass.capacity}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-green-400 font-bold block">Checked In</span>
              <span className="text-lg font-black text-green-400">
                {attendedCount} <span className="text-xs font-normal text-gray-400">/ {bookedList.length}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">Waitlisted</span>
              <span className="text-lg font-black text-amber-400">
                {waitlistList.length}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Scrollable Attendees List */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 my-2">
          {/* Confirmed Attendees Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Confirmed Attendees ({bookedList.length})
              </h4>
              <button
                type="button"
                onClick={loadRoster}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {bookedList.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center bg-charcoal-900/50 rounded-xl border border-charcoal-800">
                No confirmed attendees yet for this class.
              </p>
            ) : (
              <div className="space-y-2">
                {bookedList.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between hover:border-charcoal-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">
                          {attendee.user_first_name} {attendee.user_last_name}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            attendee.status === 'attended'
                              ? 'bg-green-950 text-green-400 border border-green-800'
                              : 'bg-charcoal-800 text-gray-300 border border-charcoal-700'
                          }`}
                        >
                          {attendee.status === 'attended' ? 'Attended ✓' : 'Booked'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {attendee.user_email} {attendee.user_phone ? `• ${attendee.user_phone}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {attendee.status !== 'attended' ? (
                        <button
                          type="button"
                          disabled={actionLoadingId === attendee.member_id}
                          onClick={() => handleUpdateStatus(attendee.member_id, 'attended')}
                          className="px-2.5 py-1.5 rounded-lg bg-green-950 hover:bg-green-900 text-green-400 border border-green-800 text-xs font-semibold transition flex items-center gap-1 disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Check-In
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={actionLoadingId === attendee.member_id}
                          onClick={() => handleUpdateStatus(attendee.member_id, 'booked')}
                          className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-400 border border-charcoal-700 text-xs font-semibold transition"
                        >
                          Undo
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={actionLoadingId === attendee.member_id}
                        onClick={() => handleUpdateStatus(attendee.member_id, 'cancelled')}
                        className="px-2 py-1.5 rounded-lg bg-charcoal-800 hover:bg-red-950 text-gray-400 hover:text-red-400 border border-charcoal-700 text-xs transition"
                        title="Cancel booking and auto-promote waitlist"
                      >
                        <XCircle className="w-3.5 h-3.5" />
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Waitlist Queue ({waitlistList.length})
              </h4>
              <div className="space-y-2">
                {waitlistList.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="p-3 rounded-xl bg-charcoal-900 border border-amber-950/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                          #{attendee.waitlist_position}
                        </span>
                        <p className="text-sm font-semibold text-white">
                          {attendee.user_first_name} {attendee.user_last_name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 ml-8">
                        {attendee.user_email} • Booked {new Date(attendee.booked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className="text-[11px] text-amber-400 font-medium">Auto-promotes next</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-charcoal-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white text-xs font-semibold transition"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};
