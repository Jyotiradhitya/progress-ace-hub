import { useState, useMemo } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Check, Flame, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const HABIT_ICONS = ['💪', '📖', '🧘', '💧', '🏃', '🎯', '✍️', '🛏️', '🍎', '💊'];
const HABIT_COLORS = [
  'bg-primary/20 text-primary',
  'bg-accent/20 text-accent',
  'bg-success/20 text-success',
  'bg-chart-3/20 text-chart-3',
  'bg-destructive/20 text-destructive',
];

export const HabitTracker = () => {
  const { habits, addHabit, removeHabit, toggleHabitDate } = useTrackerStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💪');
  const [colorIdx, setColorIdx] = useState(0);

  const today = format(new Date(), 'yyyy-MM-dd');

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return { date: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), dayNum: format(d, 'd') };
    });
  }, []);

  const handleAdd = () => {
    addHabit({
      id: crypto.randomUUID(),
      name,
      icon,
      color: HABIT_COLORS[colorIdx % HABIT_COLORS.length],
      completedDates: [],
      createdAt: today,
    });
    setName('');
    setOpen(false);
  };

  const getStreak = (habit: typeof habits[0]) => {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (habit.completedDates.includes(d)) count++;
      else if (i > 0) break;
    }
    return count;
  };

  const getCompletionRate = (habit: typeof habits[0]) => {
    const last30 = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
    const done = last30.filter((d) => habit.completedDates.includes(d)).length;
    return Math.round((done / 30) * 100);
  };

  const allDoneToday = habits.length > 0 && habits.every((h) => h.completedDates.includes(today));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Habits</h2>
          <p className="text-sm text-muted-foreground mt-1">Build consistency, one day at a time</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus size={16} /> New Habit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm bg-card border-border">
            <DialogHeader><DialogTitle>Create Habit</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" placeholder="e.g. Drink 3L water" />
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${icon === ic ? 'bg-primary/20 ring-1 ring-primary' : 'bg-secondary hover:bg-secondary/80'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2">
                  {HABIT_COLORS.map((c, i) => (
                    <button
                      key={c}
                      onClick={() => setColorIdx(i)}
                      className={`w-8 h-8 rounded-full ${c} flex items-center justify-center transition-all ${colorIdx === i ? 'ring-2 ring-ring scale-110' : ''}`}
                    >
                      {colorIdx === i && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={!name}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Summary */}
      {habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card rounded-xl p-5 text-center ${allDoneToday ? 'glow-primary' : ''}`}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Today's Progress</p>
          <p className="font-mono text-4xl font-bold text-primary">
            {habits.filter((h) => h.completedDates.includes(today)).length}/{habits.length}
          </p>
          {allDoneToday && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 flex items-center justify-center gap-1 text-accent">
              <Award size={16} />
              <span className="text-sm font-medium">All habits complete! 🎉</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Habit Grid */}
      <AnimatePresence>
        {habits.length === 0 ? (
          <div className="glass-card rounded-lg p-8 text-center">
            <span className="text-3xl mb-2 block">🎯</span>
            <p className="text-muted-foreground text-sm">No habits yet. Create your first one!</p>
          </div>
        ) : (
          habits.map((habit) => {
            const streak = getStreak(habit);
            const rate = getCompletionRate(habit);
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${habit.color}`}>
                      {habit.icon}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{habit.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {streak > 0 && (
                          <span className="flex items-center gap-0.5 text-accent">
                            <Flame size={12} /> {streak}d
                          </span>
                        )}
                        <span>{rate}% (30d)</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeHabit(habit.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>

                {/* 7-day view */}
                <div className="flex gap-1.5">
                  {last7Days.map((day) => {
                    const done = habit.completedDates.includes(day.date);
                    return (
                      <button
                        key={day.date}
                        onClick={() => toggleHabitDate(habit.id, day.date)}
                        className={`flex-1 rounded-lg py-2 flex flex-col items-center gap-1 transition-all ${
                          done
                            ? 'bg-primary/20 text-primary'
                            : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                        }`}
                      >
                        <span className="text-[10px]">{day.label}</span>
                        <span className="text-xs font-mono">{day.dayNum}</span>
                        {done && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={14} />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
};
