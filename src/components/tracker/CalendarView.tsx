import { useMemo, useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Dumbbell, BookOpen, Briefcase, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrackerTab } from '@/types/tracker';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView = () => {
  const { gymSessions, exams, career, dailyLogs, habits, setActiveTab } = useTrackerStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startDay = getDay(days[0]);

  const getEventsForDate = (dateStr: string) => {
    const events: { type: string; label: string; icon: React.ReactNode; tab: TrackerTab }[] = [];

    // Gym sessions
    const gym = gymSessions.filter((s) => s.date === dateStr);
    if (gym.length > 0) {
      events.push({ type: 'gym', label: `${gym[0].exercises.length} exercises · ${gym[0].duration}min`, icon: <Dumbbell size={12} />, tab: 'gym' });
    }

    // Daily log
    const log = dailyLogs.find((l) => l.date === dateStr);
    if (log) {
      if (log.studyHours > 0) events.push({ type: 'study', label: `${log.studyHours}h study`, icon: <BookOpen size={12} />, tab: 'exams' });
      if (log.workHours > 0) events.push({ type: 'work', label: `${log.workHours}h work`, icon: <Briefcase size={12} />, tab: 'career' });
    }

    // Mock tests
    exams.forEach((exam) => {
      exam.mockTests.forEach((m) => {
        if (m.date === dateStr) {
          events.push({ type: 'mock', label: `${exam.name}: ${m.score}/${m.totalMarks}`, icon: <BookOpen size={12} />, tab: 'exams' });
        }
      });
    });

    // Career milestones
    if (career) {
      career.milestones.forEach((m) => {
        if (m.date === dateStr) {
          events.push({ type: 'milestone', label: m.title, icon: <CheckCircle2 size={12} />, tab: 'career' });
        }
      });
    }

    // Habits
    habits.forEach((h) => {
      if (h.completedDates.includes(dateStr)) {
        events.push({ type: 'habit', label: `${h.icon} ${h.name}`, icon: <CheckCircle2 size={12} />, tab: 'habits' });
      }
    });

    return events;
  };

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const dotColors: Record<string, string> = {
    gym: 'bg-primary',
    study: 'bg-accent',
    work: 'bg-chart-3',
    mock: 'bg-warning',
    milestone: 'bg-success',
    habit: 'bg-primary/60',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Calendar</h2>
        <p className="text-sm text-muted-foreground mt-1">All your activities at a glance</p>
      </div>

      <div className="glass-card rounded-xl p-5">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft size={16} />
          </Button>
          <h3 className="font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const events = getEventsForDate(dateStr);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start gap-0.5 transition-colors text-sm relative
                  ${isToday ? 'ring-1 ring-primary' : ''}
                  ${isSelected ? 'bg-primary/20' : 'hover:bg-secondary'}
                `}
              >
                <span className={`text-xs font-mono ${isToday ? 'text-primary font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
                {events.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {[...new Set(events.map((e) => e.type))].slice(0, 3).map((type) => (
                      <div key={type} className={`w-1.5 h-1.5 rounded-full ${dotColors[type] || 'bg-muted-foreground'}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-primary" /> Gym</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-accent" /> Study</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-chart-3" /> Work</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-success" /> Milestone</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-primary/60" /> Habit</div>
        </div>
      </div>

      {/* Selected Day Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-lg p-4 space-y-2"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </p>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities this day</p>
            ) : (
              selectedEvents.map((ev, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveTab(ev.tab)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 py-1.5 w-full text-left group"
                >
                  <div className={`p-1 rounded ${dotColors[ev.type] || 'bg-muted'} text-primary-foreground`}>{ev.icon}</div>
                  <span className="text-sm flex-1">{ev.label}</span>
                  <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
