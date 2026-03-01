import { useTrackerStore } from '@/store/trackerStore';
import type { TrackerTab, AppTheme } from '@/types/tracker';
import { LayoutDashboard, Dumbbell, BookOpen, Briefcase, BarChart3, Flame, Timer, CalendarDays, Heart, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';

const tabs: { id: TrackerTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'gym', label: 'Gym', icon: <Dumbbell size={18} /> },
  { id: 'exams', label: 'Exams', icon: <BookOpen size={18} /> },
  { id: 'career', label: 'Career', icon: <Briefcase size={18} /> },
  { id: 'pomodoro', label: 'Pomodoro', icon: <Timer size={18} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={18} /> },
  { id: 'habits', label: 'Habits', icon: <Heart size={18} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
];

const themes: { id: AppTheme; label: string; emoji: string; colors: string }[] = [
  { id: 'sakura-dark', label: 'Sakura Dark', emoji: '🌸', colors: 'from-pink-500 to-yellow-500' },
  { id: 'sakura-light', label: 'Sakura Light', emoji: '🌷', colors: 'from-pink-400 to-amber-400' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '⚡', colors: 'from-green-400 to-fuchsia-500' },
  { id: 'ocean-deep', label: 'Ocean Deep', emoji: '🌊', colors: 'from-cyan-500 to-teal-500' },
  { id: 'forest', label: 'Forest', emoji: '🌿', colors: 'from-emerald-500 to-yellow-500' },
  { id: 'sunset-blaze', label: 'Sunset Blaze', emoji: '🔥', colors: 'from-orange-500 to-rose-500' },
  { id: 'arctic', label: 'Arctic', emoji: '❄️', colors: 'from-blue-400 to-violet-500' },
  { id: 'retrowave', label: 'Retrowave', emoji: '🎶', colors: 'from-fuchsia-500 to-cyan-400' },
];

export const Sidebar = () => {
  const { activeTab, setActiveTab, dailyLogs, theme, setTheme } = useTrackerStore();
  const [themeOpen, setThemeOpen] = useState(false);

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
    <div className="w-14 md:w-56 h-screen bg-sidebar border-r border-sidebar-border flex flex-col py-4 md:py-6 shrink-0">
      <div className="px-3 md:px-5 mb-8">
        <h1 className="hidden md:block text-lg font-bold gradient-text">LifeOS</h1>
        <div className="md:hidden flex justify-center">
          <span className="gradient-text font-bold text-lg">L</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 md:px-3 overflow-y-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
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
            <motion.span 
              className="relative z-10"
              animate={{ rotate: activeTab === tab.id ? [0, -10, 10, 0] : 0 }}
              transition={{ duration: 0.4 }}
            >
              {tab.icon}
            </motion.span>
            <span className="relative z-10 hidden md:inline">{tab.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="px-3 md:px-5 space-y-3 mt-auto">
        {/* Theme Selector */}
        <div className="relative">
          <motion.button
            onClick={() => setThemeOpen(!themeOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <Palette size={18} />
            <span className="hidden md:inline">Theme</span>
            <span className="ml-auto text-xs">{themes.find(t => t.id === theme)?.emoji}</span>
          </motion.button>

          <AnimatePresence>
            {themeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 mb-2 glass-card rounded-lg p-2 space-y-1 z-50 max-h-64 overflow-y-auto min-w-[180px] w-max"
              >
                {themes.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                      theme === t.id ? 'bg-primary/20 text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                  >
                    <span>{t.emoji}</span>
                    <span className="flex-1 text-left">{t.label}</span>
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${t.colors} shrink-0`} />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {streak > 0 && (
          <motion.div 
            className="glass-card rounded-lg p-3 flex items-center gap-2"
            animate={{ 
              boxShadow: [
                '0 0 0 0 hsl(var(--accent) / 0)',
                '0 0 20px 0 hsl(var(--accent) / 0.2)',
                '0 0 0 0 hsl(var(--accent) / 0)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame size={18} className="text-accent animate-pulse-glow" />
            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="font-mono text-sm font-bold text-accent">{streak} days</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
