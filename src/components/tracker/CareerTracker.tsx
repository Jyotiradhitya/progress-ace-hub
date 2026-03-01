import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Briefcase, Check, Circle, Clock, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

export const CareerTracker = () => {
  const { career, setCareer, addCareerTask, updateCareerTask, addSkill, updateSkillLevel, addMilestone, toggleMilestone } = useTrackerStore();

  const [setupOpen, setSetupOpen] = useState(false);
  const [company, setCompany] = useState(career?.company || '');
  const [role, setRole] = useState(career?.role || '');
  const [startDate, setStartDate] = useState(career?.startDate || '');

  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskCategory, setTaskCategory] = useState('');

  const [skillOpen, setSkillOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillTarget, setSkillTarget] = useState(8);

  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');

  const handleSetup = () => {
    setCareer({
      id: career?.id || crypto.randomUUID(),
      company, role, startDate,
      tasks: career?.tasks || [],
      skills: career?.skills || [],
      milestones: career?.milestones || [],
    });
    setSetupOpen(false);
  };

  const handleAddTask = () => {
    addCareerTask({
      id: crypto.randomUUID(),
      title: taskTitle,
      status: 'todo',
      priority: taskPriority,
      date: new Date().toISOString().split('T')[0],
      category: taskCategory,
    });
    setTaskTitle('');
    setTaskOpen(false);
  };

  const handleAddSkill = () => {
    addSkill({ id: crypto.randomUUID(), name: skillName, level: 1, targetLevel: skillTarget });
    setSkillName('');
    setSkillOpen(false);
  };

  const handleAddMilestone = () => {
    addMilestone({ id: crypto.randomUUID(), title: milestoneTitle, date: new Date().toISOString().split('T')[0], achieved: false });
    setMilestoneTitle('');
    setMilestoneOpen(false);
  };

  const statusIcon = (s: string) => {
    if (s === 'done') return <Check size={14} className="text-success" />;
    if (s === 'in_progress') return <Clock size={14} className="text-accent" />;
    return <Circle size={14} className="text-muted-foreground" />;
  };

  const priorityColor = (p: string) => {
    if (p === 'high') return 'text-destructive';
    if (p === 'medium') return 'text-accent';
    return 'text-muted-foreground';
  };

  if (!career) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Career Tracker</h2>
        <div className="glass-card rounded-lg p-8 text-center">
          <Briefcase size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm mb-4">Set up your career profile to get started</p>
          <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
            <DialogTrigger asChild><Button>Setup Profile</Button></DialogTrigger>
            <DialogContent className="max-w-sm bg-card border-border">
              <DialogHeader><DialogTitle>Career Profile</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div><label className="text-xs text-muted-foreground">Company</label><Input value={company} onChange={(e) => setCompany(e.target.value)} className="bg-secondary border-border" placeholder="e.g. VLSI Corp" /></div>
                <div><label className="text-xs text-muted-foreground">Role</label><Input value={role} onChange={(e) => setRole(e.target.value)} className="bg-secondary border-border" placeholder="e.g. VLSI Intern" /></div>
                <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary border-border" /></div>
                <Button onClick={handleSetup} className="w-full" disabled={!company || !role}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Career Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1">{career.role} @ {career.company}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSetupOpen(true)}>Edit Profile</Button>
      </div>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs text-muted-foreground">Company</label><Input value={company} onChange={(e) => setCompany(e.target.value)} className="bg-secondary border-border" /></div>
            <div><label className="text-xs text-muted-foreground">Role</label><Input value={role} onChange={(e) => setRole(e.target.value)} className="bg-secondary border-border" /></div>
            <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary border-border" /></div>
            <Button onClick={handleSetup} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tasks */}
      <div className="glass-card rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Tasks</span>
          <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Plus size={12} /> Task</Button></DialogTrigger>
            <DialogContent className="max-w-sm bg-card border-border">
              <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="bg-secondary border-border" placeholder="Task title" />
                <Input value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)} className="bg-secondary border-border" placeholder="Category (e.g. Design, Testing)" />
                <Select value={taskPriority} onValueChange={(v: 'low' | 'medium' | 'high') => setTaskPriority(v)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddTask} className="w-full" disabled={!taskTitle}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <AnimatePresence>
          {career.tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No tasks yet</p>
          ) : (
            career.tasks.map((task) => (
              <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-1.5">
                <button onClick={() => {
                  const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
                  updateCareerTask(task.id, { status: next });
                }}>
                  {statusIcon(task.status)}
                </button>
                <span className={`text-sm flex-1 ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                {task.category && <span className="text-xs bg-secondary px-2 py-0.5 rounded">{task.category}</span>}
                <Star size={12} className={priorityColor(task.priority)} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Skills */}
      <div className="glass-card rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Skills</span>
          <Dialog open={skillOpen} onOpenChange={setSkillOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Plus size={12} /> Skill</Button></DialogTrigger>
            <DialogContent className="max-w-sm bg-card border-border">
              <DialogHeader><DialogTitle>Add Skill</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <Input value={skillName} onChange={(e) => setSkillName(e.target.value)} className="bg-secondary border-border" placeholder="Skill name" />
                <div><label className="text-xs text-muted-foreground">Target Level (1-10)</label><Input type="number" min={1} max={10} value={skillTarget} onChange={(e) => setSkillTarget(Number(e.target.value))} className="bg-secondary border-border" /></div>
                <Button onClick={handleAddSkill} className="w-full" disabled={!skillName}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {career.skills.map((skill) => (
          <div key={skill.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">{skill.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">{skill.level}/{skill.targetLevel}</span>
                <Button variant="outline" size="icon" className="h-5 w-5" disabled={skill.level <= 1} onClick={() => updateSkillLevel(skill.id, skill.level - 1)}>-</Button>
                <Button variant="outline" size="icon" className="h-5 w-5" disabled={skill.level >= 10} onClick={() => updateSkillLevel(skill.id, skill.level + 1)}>+</Button>
              </div>
            </div>
            <Progress value={(skill.level / skill.targetLevel) * 100} className="h-1.5" />
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="glass-card rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Milestones</span>
          <Dialog open={milestoneOpen} onOpenChange={setMilestoneOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Trophy size={12} /> Add</Button></DialogTrigger>
            <DialogContent className="max-w-sm bg-card border-border">
              <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <Input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} className="bg-secondary border-border" placeholder="Milestone title" />
                <Button onClick={handleAddMilestone} className="w-full" disabled={!milestoneTitle}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {career.milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-3 cursor-pointer" onClick={() => toggleMilestone(m.id)}>
            {m.achieved ? <Check size={14} className="text-success" /> : <Circle size={14} className="text-muted-foreground" />}
            <span className={`text-sm flex-1 ${m.achieved ? 'line-through text-muted-foreground' : ''}`}>{m.title}</span>
            <span className="text-xs text-muted-foreground">{m.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
