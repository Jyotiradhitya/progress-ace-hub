import { useTrackerStore } from '@/store/trackerStore';
import type { TrackerTab, AppTheme } from '@/types/tracker';
import { LayoutDashboard, Dumbbell, BookOpen, Briefcase, BarChart3, Flame, Timer, CalendarDays, Heart, Palette, PanelLeftClose, PanelLeft } from 'lucide-react';
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
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
    <motion.div
      animate={{ width: collapsed ? 56 : 224 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden md:flex h-screen bg-sidebar border-r border-sidebar-border flex-col py-4 shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 mb-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.h1
              key="title"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-bold gradient-text whitespace-nowrap"
            >
              LifeOS
            </motion.h1>
          )}
        </AnimatePresence>
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </motion.button>
      </div>

      {/* Nav tabs */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            title={collapsed ? tab.label : undefined}
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
            <span className="relative z-10 shrink-0">{tab.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="relative z-10 whitespace-nowrap overflow-hidden"
                >
                  {tab.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-2 space-y-2 mt-auto">
        {/* Theme Selector */}
        <div className="relative">
          <motion.button
            onClick={() => setThemeOpen(!themeOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={collapsed ? 'Theme' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            <Palette size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Theme</span>}
            <span className={`text-xs ${collapsed ? '' : 'ml-auto'}`}>{themes.find(t => t.id === theme)?.emoji}</span>
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
            className="glass-card rounded-lg p-2.5 flex items-center gap-2"
            animate={{
              boxShadow: [
                '0 0 0 0 hsl(var(--accent) / 0)',
                '0 0 20px 0 hsl(var(--accent) / 0.2)',
                '0 0 0 0 hsl(var(--accent) / 0)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame size={18} className="text-accent animate-pulse-glow shrink-0" />
            {!collapsed && (
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="font-mono text-sm font-bold text-accent">{streak} days</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Mobile bottom navigation bar
export const MobileBottomNav = () => {
  const { activeTab, setActiveTab } = useTrackerStore();

  // Show only 5 main tabs on mobile bottom nav for space
  const mobileTabs = tabs.slice(0, 5);
  const moreTabs = tabs.slice(5);
  const [showMore, setShowMore] = useState(false);
  const isMoreActive = moreTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-16 left-4 right-4 glass-card rounded-xl p-3 grid grid-cols-3 gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {moreTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowMore(false); }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-lg text-xs transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border safe-area-bottom">
        <div className="flex items-center justify-around px-1 h-14">
          {mobileTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.85 }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute top-0 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{tab.icon}</span>
              <span className="text-[10px] leading-none">{tab.label}</span>
            </motion.button>
          ))}
          {/* More button */}
          <motion.button
            onClick={() => setShowMore(!showMore)}
            whileTap={{ scale: 0.85 }}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[48px] ${
              isMoreActive || showMore
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
            </svg>
            <span className="text-[10px] leading-none">More</span>
          </motion.button>
        </div>
      </div>
    </>
  );
};
