import { useState, useEffect, useCallback, useRef } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type PomodoroMode = 'focus' | 'short_break' | 'long_break';

const DEFAULT_DURATIONS = { focus: 25, short_break: 5, long_break: 15 };

export const PomodoroTimer = () => {
  const { addDailyLog, dailyLogs } = useTrackerStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = dailyLogs.find((l) => l.date === today);

  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState(durations.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempDurations, setTempDurations] = useState(DEFAULT_DURATIONS);

  const startTimeRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const playNotification = useCallback(() => {
    try {
      const ctx = audioRef.current || new AudioContext();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }, []);

  const autoLogStudy = useCallback((minutes: number) => {
    const hours = parseFloat((minutes / 60).toFixed(2));
    const existing = todayLog || { date: today, gymDone: false, studyHours: 0, workHours: 0, mood: 3 as const };
    addDailyLog({
      ...existing,
      studyHours: parseFloat((existing.studyHours + hours).toFixed(2)),
    });
  }, [todayLog, today, addDailyLog]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          playNotification();

          if (mode === 'focus') {
            const elapsed = durations.focus;
            setTotalFocusMinutes((p) => p + elapsed);
            setCompletedPomodoros((p) => p + 1);
            autoLogStudy(elapsed);
            toast.success(`🎯 Focus session complete! ${elapsed} min logged.`);

            // Auto switch to break
            const newCount = completedPomodoros + 1;
            if (newCount % 4 === 0) {
              setMode('long_break');
              return durations.long_break * 60;
            } else {
              setMode('short_break');
              return durations.short_break * 60;
            }
          } else {
            toast('☕ Break over! Ready for another round?');
            setMode('focus');
            return durations.focus * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, durations, completedPomodoros, playNotification, autoLogStudy]);

  const toggleTimer = () => {
    if (!isRunning && mode === 'focus') {
      startTimeRef.current = Date.now();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode] * 60);
    startTimeRef.current = null;
  };

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
    startTimeRef.current = null;
  };

  const saveSettings = () => {
    setDurations(tempDurations);
    setTimeLeft(tempDurations[mode] * 60);
    setIsRunning(false);
    setSettingsOpen(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (durations[mode] * 60);

  const modeConfig = {
    focus: { label: 'Focus', icon: BookOpen, color: 'text-primary' },
    short_break: { label: 'Short Break', icon: Coffee, color: 'text-accent' },
    long_break: { label: 'Long Break', icon: Coffee, color: 'text-success' },
  };

  const currentMode = modeConfig[mode];
  const circumference = 2 * Math.PI * 88;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pomodoro Timer</h2>
          <p className="text-sm text-muted-foreground mt-1">Focus sessions auto-log to your daily check-in</p>
        </div>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Settings2 size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs bg-card border-border">
            <DialogHeader><DialogTitle>Timer Settings</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <label className="text-xs text-muted-foreground">Focus (min)</label>
                <Input type="number" value={tempDurations.focus} onChange={(e) => setTempDurations({ ...tempDurations, focus: Number(e.target.value) })} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Short Break (min)</label>
                <Input type="number" value={tempDurations.short_break} onChange={(e) => setTempDurations({ ...tempDurations, short_break: Number(e.target.value) })} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Long Break (min)</label>
                <Input type="number" value={tempDurations.long_break} onChange={(e) => setTempDurations({ ...tempDurations, long_break: Number(e.target.value) })} className="bg-secondary border-border" />
              </div>
              <Button onClick={saveSettings} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-card rounded-xl p-8 flex flex-col items-center ${mode === 'focus' ? 'glow-primary' : 'glow-accent'}`}
      >
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          {(Object.keys(modeConfig) as PomodoroMode[]).map((m) => {
            const cfg = modeConfig[m];
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  mode === m ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Circular Timer */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke="hsl(220, 14%, 12%)"
              strokeWidth="6"
            />
            <motion.circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={mode === 'focus' ? 'hsl(172, 66%, 50%)' : mode === 'short_break' ? 'hsl(38, 90%, 55%)' : 'hsl(142, 70%, 45%)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-bold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-xs mt-1 ${currentMode.color}`}>{currentMode.label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={resetTimer} className="h-10 w-10">
            <RotateCcw size={18} />
          </Button>
          <Button
            size="lg"
            onClick={toggleTimer}
            className={`h-12 w-12 rounded-full p-0 ${isRunning ? 'bg-destructive hover:bg-destructive/90' : ''}`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="font-mono text-xl font-bold text-primary">{completedPomodoros}</p>
          <p className="text-xs text-muted-foreground">Pomodoros</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="font-mono text-xl font-bold text-accent">{totalFocusMinutes}m</p>
          <p className="text-xs text-muted-foreground">Focus Today</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="font-mono text-xl font-bold text-success">
            {todayLog ? todayLog.studyHours.toFixed(1) : '0.0'}h
          </p>
          <p className="text-xs text-muted-foreground">Logged Study</p>
        </div>
      </div>

      {/* Pomodoro History Dots */}
      {completedPomodoros > 0 && (
        <div className="glass-card rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Session Progress</p>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: completedPomodoros }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full bg-primary" />
              </motion.div>
            ))}
            {Array.from({ length: Math.max(0, 4 - (completedPomodoros % 4)) }).map((_, i) => (
              <div key={`empty-${i}`} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-muted" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {4 - (completedPomodoros % 4)} more until long break
          </p>
        </div>
      )}
    </div>
  );
};
