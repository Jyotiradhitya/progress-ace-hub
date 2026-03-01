import { useMemo, useRef, useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Target, Award, Loader2 } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

export const Reports = () => {
  const { gymSessions, exams, career, dailyLogs } = useTrackerStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Gym volume over time
  const gymVolume = useMemo(() => {
    const last14: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      last14[format(subDays(new Date(), i), 'MMM dd')] = 0;
    }
    gymSessions.forEach((s) => {
      const key = format(new Date(s.date), 'MMM dd');
      if (key in last14) {
        last14[key] += s.exercises.reduce((a, e) => a + e.sets * e.reps * e.weight, 0);
      }
    });
    return Object.entries(last14).map(([date, volume]) => ({ date, volume }));
  }, [gymSessions]);

  // Muscle group distribution
  const muscleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    gymSessions.forEach((s) =>
      s.exercises.forEach((e) => {
        counts[e.muscleGroup] = (counts[e.muscleGroup] || 0) + 1;
      })
    );
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [gymSessions]);

  // Mock test trends per exam
  const mockTrends = useMemo(() => {
    return exams.map((exam) => ({
      name: exam.name,
      data: exam.mockTests.map((m, i) => ({
        attempt: `#${i + 1}`,
        score: Math.round((m.score / m.totalMarks) * 100),
      })),
    }));
  }, [exams]);

  // Consistency score
  const consistencyScore = useMemo(() => {
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const log = dailyLogs.find((l) => l.date === date);
      last30.push(log ? 1 : 0);
    }
    return Math.round((last30.filter(Boolean).length / 30) * 100);
  }, [dailyLogs]);

  // Career stats
  const careerStats = useMemo(() => {
    if (!career) return null;
    const total = career.tasks.length;
    const done = career.tasks.filter((t) => t.status === 'done').length;
    const inProgress = career.tasks.filter((t) => t.status === 'in_progress').length;
    const skillAvg = career.skills.length > 0
      ? Math.round(career.skills.reduce((a, s) => a + (s.level / s.targetLevel) * 100, 0) / career.skills.length)
      : 0;
    const milestonesAchieved = career.milestones.filter((m) => m.achieved).length;
    return { total, done, inProgress, skillAvg, milestonesAchieved, totalMilestones: career.milestones.length };
  }, [career]);

  const handleExportReport = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
      const imgWidth = canvasWidth * ratio;
      const imgHeight = canvasHeight * ratio;

      const xPos = (pdfWidth - imgWidth) / 2;
      const yPos = 10;

      // Add background
      pdf.setFillColor(10, 10, 18);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);
      pdf.save(`lifeos-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('📄 PDF report downloaded!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">Your progress, analyzed.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={handleExportReport} disabled={exporting}>
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {exporting ? 'Generating...' : 'Export PDF'}
        </Button>
      </div>

      <div ref={reportRef} className="space-y-4">
        {/* Consistency Score */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card glow-primary rounded-lg p-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">30-Day Consistency Score</p>
          <p className="font-mono text-5xl font-bold text-primary">{consistencyScore}%</p>
          <p className="text-sm text-muted-foreground mt-2">
            {consistencyScore >= 80 ? '🔥 Exceptional!' : consistencyScore >= 50 ? '💪 Keep pushing!' : '📈 Room to grow!'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Gym Volume Chart */}
          <div className="glass-card rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Gym Volume (14 days)</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gymVolume}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Muscle Distribution */}
          <div className="glass-card rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Muscle Group Distribution</p>
            <div className="h-48">
              {muscleDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={muscleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {muscleDistribution.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No gym data yet</div>
              )}
            </div>
          </div>

          {/* Mock Test Trends */}
          {mockTrends.map((exam) => (
            exam.data.length > 0 && (
              <div key={exam.name} className="glass-card rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{exam.name} Mock Trend</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exam.data}>
                      <XAxis dataKey="attempt" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          ))}

          {/* Career Summary */}
          {careerStats && (
            <div className="glass-card rounded-lg p-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Career Summary</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <Target size={16} className="mx-auto text-primary mb-1" />
                  <p className="font-mono text-lg font-bold">{careerStats.done}/{careerStats.total}</p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <TrendingUp size={16} className="mx-auto text-accent mb-1" />
                  <p className="font-mono text-lg font-bold">{careerStats.skillAvg}%</p>
                  <p className="text-xs text-muted-foreground">Avg Skill</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center col-span-2">
                  <Award size={16} className="mx-auto text-success mb-1" />
                  <p className="font-mono text-lg font-bold">{careerStats.milestonesAchieved}/{careerStats.totalMilestones}</p>
                  <p className="text-xs text-muted-foreground">Milestones</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
