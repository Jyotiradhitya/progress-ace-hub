import { Sidebar } from '@/components/tracker/Sidebar';
import { Dashboard } from '@/components/tracker/Dashboard';
import { GymTracker } from '@/components/tracker/GymTracker';
import { ExamTracker } from '@/components/tracker/ExamTracker';
import { CareerTracker } from '@/components/tracker/CareerTracker';
import { Reports } from '@/components/tracker/Reports';
import { PomodoroTimer } from '@/components/tracker/PomodoroTimer';
import { CalendarView } from '@/components/tracker/CalendarView';
import { HabitTracker } from '@/components/tracker/HabitTracker';
import { DailyCheckIn } from '@/components/tracker/DailyCheckIn';
import { SplashScreen } from '@/components/SplashScreen';
import { useTrackerStore } from '@/store/trackerStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.97, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, scale: 0.97, filter: 'blur(6px)' },
};

const Index = () => {
  const { activeTab } = useTrackerStore();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'gym': return <GymTracker />;
      case 'exams': return <ExamTracker />;
      case 'career': return <CareerTracker />;
      case 'pomodoro': return <PomodoroTimer />;
      case 'calendar': return <CalendarView />;
      case 'habits': return <HabitTracker />;
      case 'reports': return <Reports />;
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      <AnimatePresence>
        {!showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex h-screen bg-background overflow-hidden"
          >
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
              <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="h-12 md:h-14 border-b border-border flex items-center justify-between px-3 md:px-6 shrink-0"
              >
                <div />
                <DailyCheckIn />
              </motion.header>
              <ScrollArea className="flex-1">
                <div className="p-3 md:p-6 max-w-4xl mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {renderContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
