import { useTrackerStore } from '@/store/trackerStore';
import type { TrackerTab } from '@/types/tracker';
import { LayoutDashboard, Dumbbell, BookOpen, Briefcase, BarChart3, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { format } from 'date-fns';

const tabs: { id: TrackerTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'gym', label: 'Gym', icon: <Dumbbell size={18} /> },
  { id: 'exams', label: 'Exams', icon: <BookOpen size={18} /> },
  { id: 'career', label: 'Career', icon: <Briefcase size={18} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
];

export const Sidebar = () => {
  const { activeTab, setActiveTab, dailyLogs } = useTrackerStore();

  const streak = useMemo(() => {
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = dailyLogs.find((l) => l.date === dateStr);
      if (log && (log.gymDone || log.studyHours > 0 || log.workHours > 0)) {
        count++;
      } else if (i > 0) break;
    }
    return count;
  }, [dailyLogs]);

  return (
    <div className="w-16 md:w-56 h-screen bg-sidebar border-r border-sidebar-border flex flex-col py-6 shrink-0">
      <div className="px-3 md:px-5 mb-8">
        <h1 className="hidden md:block text-lg font-bold gradient-text">LifeOS</h1>
        <div className="md:hidden flex justify-center">
          <span className="gradient-text font-bold text-lg">L</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 md:px-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-primary bg-sidebar-accent'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 bg-sidebar-accent rounded-md"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10 hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      {streak > 0 && (
        <div className="px-3 md:px-5 mt-auto">
          <div className="glass-card rounded-lg p-3 flex items-center gap-2">
            <Flame size={18} className="text-accent animate-pulse-glow" />
            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="font-mono text-sm font-bold text-accent">{streak} days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
