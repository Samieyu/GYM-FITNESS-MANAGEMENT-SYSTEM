import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, AlertCircle, Dumbbell, Sparkles } from 'lucide-react';
import { createClassApi, fetchTrainersApi, TrainerOption, FitnessClass } from '../api/classes';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (newClass: FitnessClass) => void;
  currentUserId?: string;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onClassCreated,
  currentUserId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [capacity, setCapacity] = useState<number>(15);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('Studio A - Main Floor');

  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);

      fetchTrainersApi()
        .then((data) => {
          setTrainers(data);
          if (data.length > 0) {
            const myTrainer = currentUserId ? data.find((t) => t.user_id === currentUserId) : null;
            setTrainerId(myTrainer ? myTrainer.id : data[0].id);
          }
        })
        .catch((err) => {
          console.error('Failed to load trainers:', err);
          setErrorMessage(err.message || 'Failed to load trainers');
        });
    }
  }, [isOpen, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Class title is required');
      return;
    }
    if (!trainerId) {
      setErrorMessage('Please assign a trainer for this class');
      return;
    }
    if (capacity < 1) {
      setErrorMessage('Capacity must be at least 1 spot');
      return;
    }
    if (!date) {
      setErrorMessage('Class date is required');
      return;
    }

    const startIso = new Date(`${date}T${startTime}:00`).toISOString();
    const endIso = new Date(`${date}T${endTime}:00`).toISOString();

    if (new Date(endIso) <= new Date(startIso)) {
      setErrorMessage('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await createClassApi({
        title: title.trim(),
        description: description.trim() || undefined,
        trainerId,
        capacity,
        startTime: startIso,
        endTime: endIso,
        location: location.trim() || 'Main Studio',
      });

      onClassCreated(created);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create group class');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border w-full max-w-lg rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-text">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 text-text-muted hover:text-text transition p-2 rounded-xl hover:bg-surface-elevated min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text">Schedule Group Fitness Class</h3>
            <p className="text-xs text-text-muted mt-0.5">Capacity limit and automated waitlist queue</p>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-text font-bold mb-1.5">Class Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HIIT Strength & Core Conditioning"
              required
              className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-text text-xs placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-text font-bold mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="High energy workout details, target muscle groups, prerequisites..."
              className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-text text-xs placeholder:text-text-muted/50 focus:outline-none focus:border-primary resize-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-text font-bold mb-1.5">Lead Instructor / Trainer *</label>
              <select
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                required
                className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-text text-xs focus:outline-none focus:border-primary transition"
              >
                {trainers.length === 0 ? (
                  <option value="" className="bg-surface text-text">Loading trainers...</option>
                ) : (
                  trainers.map((t) => (
                    <option key={t.id} value={t.id} className="bg-surface text-text">
                      {t.first_name} {t.last_name} ({t.specialization})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-text font-bold mb-1.5">Max Capacity *</label>
              <div className="relative">
                <Users className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-text text-xs focus:outline-none focus:border-primary font-mono transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-text font-bold mb-1.5">Date *</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-xl pl-8 pr-2 py-2 text-text text-[11px] focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-text font-bold mb-1.5">Start Time *</label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-xl pl-8 pr-2 py-2 text-text text-[11px] focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-text font-bold mb-1.5">End Time *</label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-xl pl-8 pr-2 py-2 text-text text-[11px] focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-text font-bold mb-1.5">Studio / Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Studio A - Cardio Deck or Heavy Iron Zone"
                required
                className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-text text-xs placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-border text-[11px] text-text-muted space-y-1">
            <p className="font-bold text-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Automated Waitlist Engine Active
            </p>
            <p className="leading-relaxed">
              Once {capacity} spots are booked, additional registrations enter the waitlist queue and are auto-promoted when any member cancels.
            </p>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition flex items-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
