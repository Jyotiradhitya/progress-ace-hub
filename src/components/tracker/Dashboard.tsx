import { useTrackerStore } from '@/store/trackerStore';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, BookOpen, Briefcase, TrendingUp, Target, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const StatCard = ({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card stat-glow rounded-lg p-4"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`font-mono text-2xl font-bold mt-1 ${color || 'text-foreground'}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className="text-muted-foreground">{icon}</div>
    </div>
  </motion.div>
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
          <div
            key={d.date}
            className="w-4 h-4 rounded-sm transition-colors"
            title={`${d.date}: ${Math.round(d.intensity * 100)}%`}
            style={{
              backgroundColor: d.intensity > 0
                ? `hsl(172 66% 50% / ${0.15 + d.intensity * 0.85})`
                : 'hsl(220 14% 12%)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { gymSessions, exams, career, dailyLogs } = useTrackerStore();

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Your life, quantified.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Dumbbell size={20} />} label="Workouts" value={String(totalWorkouts)} sub="total sessions" color="text-primary" />
        <StatCard icon={<Clock size={20} />} label="Study Hours" value={String(totalStudyHours)} sub="total logged" color="text-accent" />
        <StatCard icon={<Target size={20} />} label="Exam Prep" value={`${examProgress}%`} sub="syllabus covered" color="text-success" />
        <StatCard icon={<Briefcase size={20} />} label="Tasks Done" value={String(tasksCompleted)} sub="career tasks" color="text-primary" />
      </div>

      <ActivityHeatmap dailyLogs={dailyLogs} />

      <div className="glass-card rounded-lg p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">14 Day Trend</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="workGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(38, 90%, 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(38, 90%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 18%, 9%)',
                  border: '1px solid hsl(220, 14%, 16%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="study" stroke="hsl(172, 66%, 50%)" fill="url(#studyGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="work" stroke="hsl(38, 90%, 55%)" fill="url(#workGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
