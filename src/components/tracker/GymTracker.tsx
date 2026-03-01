import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GymExercise, GymSession } from '@/types/tracker';

const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

export const GymTracker = () => {
  const { gymSessions, addGymSession, removeGymSession } = useTrackerStore();
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<Omit<GymExercise, 'id' | 'date'>[]>([
    { name: '', sets: 3, reps: 10, weight: 0, muscleGroup: 'Chest' },
  ]);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  const addExerciseRow = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: 0, muscleGroup: 'Chest' }]);
  };

  const updateExercise = (idx: number, field: string, value: string | number) => {
    setExercises(exercises.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const removeExercise = (idx: number) => {
    if (exercises.length > 1) setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const session: GymSession = {
      id: crypto.randomUUID(),
      date: today,
      duration,
      notes,
      exercises: exercises.map((e) => ({ ...e, id: crypto.randomUUID(), date: today })),
    };
    addGymSession(session);
    setOpen(false);
    setExercises([{ name: '', sets: 3, reps: 10, weight: 0, muscleGroup: 'Chest' }]);
    setNotes('');
  };

  // PR calculation
  const prs: Record<string, number> = {};
  gymSessions.forEach((s) =>
    s.exercises.forEach((e) => {
      if (!prs[e.name] || e.weight > prs[e.name]) prs[e.name] = e.weight;
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gym Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1">Log workouts & track PRs</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>Log Workout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Duration (min)</label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="bg-secondary border-border" />
                </div>
              </div>
              {exercises.map((ex, idx) => (
                <div key={idx} className="glass-card rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Exercise name" value={ex.name} onChange={(e) => updateExercise(idx, 'name', e.target.value)} className="bg-secondary border-border flex-1" />
                    <Select value={ex.muscleGroup} onValueChange={(v) => updateExercise(idx, 'muscleGroup', v)}>
                      <SelectTrigger className="w-28 bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {muscleGroups.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeExercise(idx)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Sets</label>
                      <Input type="number" value={ex.sets} onChange={(e) => updateExercise(idx, 'sets', Number(e.target.value))} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Reps</label>
                      <Input type="number" value={ex.reps} onChange={(e) => updateExercise(idx, 'reps', Number(e.target.value))} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Weight (kg)</label>
                      <Input type="number" value={ex.weight} onChange={(e) => updateExercise(idx, 'weight', Number(e.target.value))} className="bg-secondary border-border" />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addExerciseRow} className="w-full gap-2">
                <Plus size={14} /> Add Exercise
              </Button>
              <div>
                <label className="text-xs text-muted-foreground">Notes</label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-secondary border-border" placeholder="How did it feel?" />
              </div>
              <Button onClick={handleSave} className="w-full">Save Workout</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* PRs */}
      {Object.keys(prs).length > 0 && (
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Personal Records 🏆</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(prs).filter(([name]) => name).map(([name, weight]) => (
              <div key={name} className="bg-secondary rounded-md px-3 py-2">
                <p className="text-xs text-muted-foreground">{name}</p>
                <p className="font-mono font-bold text-primary">{weight}kg</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session History */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Session History</p>
        <AnimatePresence>
          {gymSessions.length === 0 ? (
            <div className="glass-card rounded-lg p-8 text-center">
              <Dumbbell size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No workouts logged yet. Hit that + button!</p>
            </div>
          ) : (
            gymSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-primary">{session.date}</span>
                    <span className="text-xs text-muted-foreground">{session.duration}min</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeGymSession(session.id)} className="text-muted-foreground hover:text-destructive h-7 w-7">
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.exercises.map((ex) => (
                    <span key={ex.id} className="bg-secondary text-xs rounded px-2 py-1">
                      {ex.name} {ex.sets}×{ex.reps} @ {ex.weight}kg
                    </span>
                  ))}
                </div>
                {session.notes && <p className="text-xs text-muted-foreground mt-2">{session.notes}</p>}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
