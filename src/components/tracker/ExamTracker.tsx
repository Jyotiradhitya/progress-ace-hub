import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, TrendingUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import type { ExamPrep, ExamSubject, MockTest } from '@/types/tracker';

const presetExams = ['SSC CGL', 'UPSC CSE', 'UPSC CAPF', 'SSC CHSL', 'SSC MTS', 'GATE', 'CAT', 'IBPS PO', 'RRB NTPC', 'Custom'];

export const ExamTracker = () => {
  const { exams, addExam, removeExam, addMockTest, updateSubjectProgress } = useTrackerStore();
  const [addOpen, setAddOpen] = useState(false);
  const [mockOpen, setMockOpen] = useState<string | null>(null);
  const [examName, setExamName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [dailyTarget, setDailyTarget] = useState(4);
  const [subjects, setSubjects] = useState<Omit<ExamSubject, 'id'>[]>([
    { name: '', totalTopics: 10, completedTopics: 0, hoursSpent: 0 },
  ]);

  const [mockScore, setMockScore] = useState(0);
  const [mockTotal, setMockTotal] = useState(200);
  const [mockTime, setMockTime] = useState(120);

  const handleAddExam = () => {
    const exam: ExamPrep = {
      id: crypto.randomUUID(),
      name: examName,
      targetDate,
      dailyHoursTarget: dailyTarget,
      subjects: subjects.map((s) => ({ ...s, id: crypto.randomUUID() })),
      mockTests: [],
    };
    addExam(exam);
    setAddOpen(false);
    setExamName('');
    setSubjects([{ name: '', totalTopics: 10, completedTopics: 0, hoursSpent: 0 }]);
  };

  const handleAddMock = (examId: string) => {
    const test: MockTest = {
      id: crypto.randomUUID(),
      examId,
      date: new Date().toISOString().split('T')[0],
      score: mockScore,
      totalMarks: mockTotal,
      timeTaken: mockTime,
    };
    addMockTest(examId, test);
    setMockOpen(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Prep</h2>
          <p className="text-sm text-muted-foreground mt-1">Track syllabus & mock scores</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add Exam</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs text-muted-foreground">Exam Name</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetExams.map((p) => (
                    <button key={p} onClick={() => setExamName(p === 'Custom' ? '' : p)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${examName === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                      {p}
                    </button>
                  ))}
                </div>
                <Input value={examName} onChange={(e) => setExamName(e.target.value)} className="bg-secondary border-border" placeholder="Exam name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Target Date</label>
                  <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Daily Hours Target</label>
                  <Input type="number" value={dailyTarget} onChange={(e) => setDailyTarget(Number(e.target.value))} className="bg-secondary border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Subjects</label>
                {subjects.map((sub, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input placeholder="Subject name" value={sub.name} onChange={(e) => {
                      const n = [...subjects]; n[idx] = { ...n[idx], name: e.target.value }; setSubjects(n);
                    }} className="bg-secondary border-border flex-1" />
                    <Input type="number" placeholder="Topics" value={sub.totalTopics} onChange={(e) => {
                      const n = [...subjects]; n[idx] = { ...n[idx], totalTopics: Number(e.target.value) }; setSubjects(n);
                    }} className="bg-secondary border-border w-20" />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setSubjects([...subjects, { name: '', totalTopics: 10, completedTopics: 0, hoursSpent: 0 }])} className="w-full">
                  <Plus size={14} /> Add Subject
                </Button>
              </div>
              <Button onClick={handleAddExam} className="w-full" disabled={!examName}>Add Exam</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence>
        {exams.length === 0 ? (
          <div className="glass-card rounded-lg p-8 text-center">
            <BookOpen size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No exams added. Start tracking your prep!</p>
          </div>
        ) : (
          exams.map((exam) => {
            const totalTopics = exam.subjects.reduce((a, s) => a + s.totalTopics, 0);
            const doneTopics = exam.subjects.reduce((a, s) => a + s.completedTopics, 0);
            const progress = totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0;
            const lastMock = exam.mockTests[exam.mockTests.length - 1];

            return (
              <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{exam.name}</h3>
                    <p className="text-xs text-muted-foreground">Target: {exam.targetDate} · {exam.dailyHoursTarget}h/day</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl font-bold text-primary">{progress}%</span>
                    <Button variant="ghost" size="icon" onClick={() => removeExam(exam.id)} className="text-muted-foreground hover:text-destructive h-7 w-7">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <Progress value={progress} className="h-2" />

                <div className="space-y-2">
                  {exam.subjects.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3">
                      <span className="text-sm flex-1">{sub.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{sub.completedTopics}/{sub.totalTopics}</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" disabled={sub.completedTopics <= 0}
                          onClick={() => updateSubjectProgress(exam.id, sub.id, sub.completedTopics - 1)}>-</Button>
                        <Button variant="outline" size="icon" className="h-6 w-6" disabled={sub.completedTopics >= sub.totalTopics}
                          onClick={() => updateSubjectProgress(exam.id, sub.id, sub.completedTopics + 1)}>+</Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mock Tests */}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Mock Tests</span>
                    <Dialog open={mockOpen === exam.id} onOpenChange={(o) => setMockOpen(o ? exam.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><TrendingUp size={12} /> Add Mock</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm bg-card border-border">
                        <DialogHeader><DialogTitle>Add Mock Test</DialogTitle></DialogHeader>
                        <div className="space-y-3 mt-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div><label className="text-xs text-muted-foreground">Score</label><Input type="number" value={mockScore} onChange={(e) => setMockScore(Number(e.target.value))} className="bg-secondary border-border" /></div>
                            <div><label className="text-xs text-muted-foreground">Total</label><Input type="number" value={mockTotal} onChange={(e) => setMockTotal(Number(e.target.value))} className="bg-secondary border-border" /></div>
                            <div><label className="text-xs text-muted-foreground">Time (min)</label><Input type="number" value={mockTime} onChange={(e) => setMockTime(Number(e.target.value))} className="bg-secondary border-border" /></div>
                          </div>
                          <Button onClick={() => handleAddMock(exam.id)} className="w-full">Save</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {exam.mockTests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {exam.mockTests.map((m) => (
                        <div key={m.id} className="bg-secondary rounded px-2 py-1 text-xs">
                          <span className="font-mono font-bold text-primary">{m.score}/{m.totalMarks}</span>
                          <span className="text-muted-foreground ml-1">({Math.round((m.score / m.totalMarks) * 100)}%)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No mock tests yet</p>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
};
