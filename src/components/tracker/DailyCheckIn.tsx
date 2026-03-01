import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Smile, Meh, Frown, Zap, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

const moodIcons = [Frown, Frown, Meh, Smile, Zap, Heart];
const moodLabels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Amazing'];

export const DailyCheckIn = () => {
  const { addDailyLog, dailyLogs } = useTrackerStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = dailyLogs.find((l) => l.date === today);
  const [open, setOpen] = useState(false);

  const [gymDone, setGymDone] = useState(todayLog?.gymDone || false);
  const [studyHours, setStudyHours] = useState(todayLog?.studyHours || 0);
  const [workHours, setWorkHours] = useState(todayLog?.workHours || 0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(todayLog?.mood || 3);

  const handleSave = () => {
    addDailyLog({ date: today, gymDone, studyHours, workHours, mood });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={todayLog ? "outline" : "default"} size="sm" className="gap-2">
          {todayLog ? '✅ Checked In' : '📝 Daily Check-In'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle>Daily Check-In — {format(new Date(), 'MMM dd')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Gym Done?</span>
            <Switch checked={gymDone} onCheckedChange={setGymDone} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Study Hours</label>
            <Input type="number" min={0} max={24} step={0.5} value={studyHours} onChange={(e) => setStudyHours(Number(e.target.value))} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Work Hours</label>
            <Input type="number" min={0} max={24} step={0.5} value={workHours} onChange={(e) => setWorkHours(Number(e.target.value))} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Mood</label>
            <div className="flex gap-2 justify-between">
              {([1, 2, 3, 4, 5] as const).map((m) => {
                const Icon = moodIcons[m];
                return (
                  <button key={m} onClick={() => setMood(m)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mood === m ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
                    <Icon size={20} />
                    <span className="text-[10px]">{moodLabels[m]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <Button onClick={handleSave} className="w-full">Save Check-In</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
