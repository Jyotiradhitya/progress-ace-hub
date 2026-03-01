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
import { useTrackerStore } from '@/store/trackerStore';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const { activeTab } = useTrackerStore();

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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
          <div />
          <DailyCheckIn />
        </header>
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default Index;
