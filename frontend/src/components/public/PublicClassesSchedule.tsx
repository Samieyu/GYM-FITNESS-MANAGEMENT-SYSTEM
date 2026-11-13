import React, { useState, useMemo } from 'react';
import { FitnessClass } from '../../api/classes';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Clock,
  MapPin,
  User,
  Users,
  Filter,
  Flame,
  Dumbbell,
  HeartPulse,
} from 'lucide-react';
import { formatEthiopianDateTime } from '../../utils/ethiopianCalendar';

interface PublicClassesScheduleProps {
  classesList: FitnessClass[];
  onBookClass: (cls: FitnessClass) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All Sessions', icon: Filter },
  { id: 'hiit', label: 'HIIT & Cardio', icon: Flame },
  { id: 'strength', label: 'Strength & Power', icon: Dumbbell },
  { id: 'mobility', label: 'Mobility & Recovery', icon: HeartPulse },
];

export const PublicClassesSchedule: React.FC<PublicClassesScheduleProps> = ({
  classesList,
  onBookClass,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter classes by category and search text
  const filteredClasses = useMemo(() => {
    return classesList.filter((cls) => {
      const titleLower = cls.title.toLowerCase();
      const descLower = (cls.description || '').toLowerCase();
      const trainerLower = (cls.trainer_name || '').toLowerCase();

      // Category matching heuristic
      let categoryMatch = true;
      if (selectedCategory === 'hiit') {
        categoryMatch = titleLower.includes('hiit') || titleLower.includes('cardio') || titleLower.includes('conditioning');
      } else if (selectedCategory === 'strength') {
        categoryMatch = titleLower.includes('strength') || titleLower.includes('power') || titleLower.includes('lift') || titleLower.includes('body');
      } else if (selectedCategory === 'mobility') {
        categoryMatch = titleLower.includes('mobility') || titleLower.includes('yoga') || titleLower.includes('stretch') || titleLower.includes('recovery');
      }

      // Query matching
      const queryMatch =
        !searchQuery ||
        titleLower.includes(searchQuery.toLowerCase()) ||
        descLower.includes(searchQuery.toLowerCase()) ||
        trainerLower.includes(searchQuery.toLowerCase());

      return categoryMatch && queryMatch;
    });
  }, [classesList, selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary">Group Fitness Timetable</Badge>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-text">
          CLASS <span className="text-primary">SCHEDULE</span>
        </h1>
        <p className="text-sm sm:text-base text-text-muted">
          Dynamic group classes guided by certified POWERZONE trainers. All sessions feature live capacity tracking and Ethiopian Calendar timestamps.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap min-h-[44px] ${
                  isSelected
                    ? 'bg-primary text-slate-950 shadow-md shadow-primary/20'
                    : 'bg-surface-elevated text-text-muted hover:text-text hover:bg-surface border border-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search classes or coaches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-text placeholder-text-muted focus:outline-none focus:border-primary min-h-[44px]"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-surface border border-border animate-pulse space-y-4 shadow-sm">
              <div className="h-5 w-1/3 bg-border rounded" />
              <div className="h-6 w-3/4 bg-border rounded" />
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-1/2 bg-border rounded" />
              <div className="h-2 w-full bg-border rounded mt-4" />
              <div className="h-10 bg-border rounded-xl mt-6" />
            </div>
          ))
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => {
            const isFull = cls.booked_count >= cls.capacity;
            const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));

            return (
              <Card
                key={cls.id}
                className="p-6 sm:p-7 flex flex-col justify-between hover:border-primary/50 transition group border-border relative shadow-sm"
              >
                <div>
                  {/* Top meta */}
                  <div className="flex items-center justify-between text-xs mb-3.5">
                    <span className="flex items-center gap-1.5 font-mono text-primary font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {formatEthiopianDateTime(cls.start_time)}
                    </span>
                    <Badge variant={isFull ? 'warning' : 'success'} size="sm">
                      {isFull ? `Full (${cls.waitlist_count} Waitlist)` : `${cls.booked_count}/${cls.capacity} Booked`}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-black text-text uppercase group-hover:text-primary transition">
                    {cls.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {cls.description || 'Full-body functional training, agility drills, and cardio conditioning.'}
                  </p>

                  {/* Details */}
                  <div className="mt-5 space-y-2 text-xs text-text-muted pt-4 border-t border-border">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Room: <strong className="text-text">{cls.location}</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        Coach: <strong className="text-text">{cls.trainer_name || 'POWERZONE Coach'}</strong>
                        {cls.trainer_specialization && (
                          <span className="text-text-muted"> ({cls.trainer_specialization})</span>
                        )}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Capacity: {cls.capacity} Athletes max</span>
                    </p>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-5">
                    <div className="flex justify-between text-[11px] text-text-muted mb-1">
                      <span>Occupancy</span>
                      <span className="font-mono font-bold text-text">{pct}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-7 pt-2">
                  <Button
                    variant={isFull ? 'secondary' : 'primary'}
                    size="md"
                    className="w-full justify-center font-bold"
                    onClick={() => onBookClass(cls)}
                  >
                    {isFull ? 'Join Class Waitlist' : 'Reserve Spot Now'}
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-16 text-text-muted">
            No classes match your selected category or search filter.
          </div>
        )}
      </div>
    </div>
  );
};
