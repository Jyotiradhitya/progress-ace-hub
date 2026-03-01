import { useTrackerStore } from '@/store/trackerStore';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, BookOpen, Briefcase, TrendingUp, Target, Clock, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import type { TrackerTab } from '@/types/tracker';

const StatCard = ({ icon, label, value, sub, color, onTap }: { icon: React.ReactNode; label: string; value: string; sub?: string; color?: string; onTap?: () => void }) => (
  <motion.button
    onClick={onTap}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.97 }}
    className="glass-card stat-glow rounded-lg p-4 text-left w-full group cursor-pointer"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`font-mono text-2xl font-bold mt-1 ${color || 'text-foreground'}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">{icon}</span>
        <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  </motion.button>
);

const ActivityHeatmap = ({ dailyLogs }: { dailyLogs: { date: string; gymDone: boolean; studyHours: number; workHours: number }[] }) => {
  const last30 = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const log = dailyLogs.find((l) => l.date === date);
      const intensity = log ? (log.gymDone ? 1 : 0) + Math.min(log.studyHours, 4) / 4 + Math.min(log.workHours, 4) / 4 : 0;
      days.push({ date, intensity: Math.min(intensity, 1) });
    }
    return days;
  }, [dailyLogs]);

  return (
    <div className="glass-card rounded-lg p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Last 30 Days Activity</p>
      <div className="flex gap-1 flex-wrap">
        {last30.map((d) => (
          <motion.div
            key={d.date}
            whileHover={{ scale: 1.5 }}
            className="w-4 h-4 rounded-sm transition-colors cursor-default"
            title={`${d.date}: ${Math.round(d.intensity * 100)}%`}
            style={{
              backgroundColor: d.intensity > 0
                ? `hsl(var(--primary) / ${0.15 + d.intensity * 0.85})`
                : 'hsl(var(--muted))',
            }}
          />
        ))}
      </div>
    </div>
  );
};

const QuickNavCard = ({ icon, label, tab, onTap }: { icon: React.ReactNode; label: string; tab: TrackerTab; onTap: (tab: TrackerTab) => void }) => (
  <motion.button
    onClick={() => onTap(tab)}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className="glass-card rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer group"
  >
    <div className="text-primary group-hover:text-accent transition-colors">{icon}</div>
    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
  </motion.button>
);

export const Dashboard = () => {
  const { gymSessions, exams, career, dailyLogs, setActiveTab } = useTrackerStore();

  const totalWorkouts = gymSessions.length;
  const totalStudyHours = dailyLogs.reduce((a, l) => a + l.studyHours, 0);
  const examProgress = useMemo(() => {
    if (exams.length === 0) return 0;
    const total = exams.reduce((a, e) => a + e.subjects.reduce((b, s) => b + s.totalTopics, 0), 0);
    const done = exams.reduce((a, e) => a + e.subjects.reduce((b, s) => b + s.completedTopics, 0), 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [exams]);

  const tasksCompleted = career?.tasks.filter((t) => t.status === 'done').length ?? 0;

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const log = dailyLogs.find((l) => l.date === date);
      days.push({
        date: format(subDays(new Date(), i), 'MMM dd'),
        study: log?.studyHours || 0,
        work: log?.workHours || 0,
      });
    }
    return days;
  }, [dailyLogs]);

  const navigate = (tab: TrackerTab) => setActiveTab(tab);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Your life, quantified. Tap any card to dive deeper.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Dumbbell size={20} />} label="Workouts" value={String(totalWorkouts)} sub="total sessions" color="text-primary" onTap={() => navigate('gym')} />
        <StatCard icon={<Clock size={20} />} label="Study Hrs" value={String(totalStudyHours)} sub="total logged" color="text-accent" onTap={() => navigate('exams')} />
        <StatCard icon={<Target size={20} />} label="Exam Prep" value={`${examProgress}%`} sub="syllabus done" color="text-success" onTap={() => navigate('exams')} />
        <StatCard icon={<Briefcase size={20} />} label="Tasks Done" value={String(tasksCompleted)} sub="career tasks" color="text-primary" onTap={() => navigate('career')} />
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-4 gap-2">
        <QuickNavCard icon={<Dumbbell size={18} />} label="Gym" tab="gym" onTap={navigate} />
        <QuickNavCard icon={<BookOpen size={18} />} label="Exams" tab="exams" onTap={navigate} />
        <QuickNavCard icon={<Briefcase size={18} />} label="Career" tab="career" onTap={navigate} />
        <QuickNavCard icon={<Target size={18} />} label="Habits" tab="habits" onTap={navigate} />
      </div>

      <ActivityHeatmap dailyLogs={dailyLogs} />

      <div className="glass-card rounded-lg p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">14 Day Trend</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="workGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Area type="monotone" dataKey="study" stroke="hsl(var(--primary))" fill="url(#studyGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="work" stroke="hsl(var(--accent))" fill="url(#workGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
