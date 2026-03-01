import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GymSession, ExamPrep, CareerProfile, DailyLog, TrackerTab, Habit } from '@/types/tracker';

interface TrackerState {
  activeTab: TrackerTab;
  setActiveTab: (tab: TrackerTab) => void;

  gymSessions: GymSession[];
  addGymSession: (session: GymSession) => void;
  removeGymSession: (id: string) => void;

  exams: ExamPrep[];
  addExam: (exam: ExamPrep) => void;
  updateExam: (id: string, exam: Partial<ExamPrep>) => void;
  removeExam: (id: string) => void;
  addMockTest: (examId: string, test: ExamPrep['mockTests'][0]) => void;
  updateSubjectProgress: (examId: string, subjectId: string, completed: number) => void;

  career: CareerProfile | null;
  setCareer: (profile: CareerProfile) => void;
  addCareerTask: (task: CareerProfile['tasks'][0]) => void;
  updateCareerTask: (taskId: string, updates: Partial<CareerProfile['tasks'][0]>) => void;
  addSkill: (skill: CareerProfile['skills'][0]) => void;
  updateSkillLevel: (skillId: string, level: number) => void;
  addMilestone: (milestone: CareerProfile['milestones'][0]) => void;
  toggleMilestone: (milestoneId: string) => void;

  dailyLogs: DailyLog[];
  addDailyLog: (log: DailyLog) => void;

  habits: Habit[];
  addHabit: (habit: Habit) => void;
  removeHabit: (id: string) => void;
  toggleHabitDate: (habitId: string, date: string) => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      gymSessions: [],
      addGymSession: (session) =>
        set((s) => ({ gymSessions: [session, ...s.gymSessions] })),
      removeGymSession: (id) =>
        set((s) => ({ gymSessions: s.gymSessions.filter((g) => g.id !== id) })),

      exams: [],
      addExam: (exam) => set((s) => ({ exams: [...s.exams, exam] })),
      updateExam: (id, updates) =>
        set((s) => ({
          exams: s.exams.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      removeExam: (id) =>
        set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),
      addMockTest: (examId, test) =>
        set((s) => ({
          exams: s.exams.map((e) =>
            e.id === examId ? { ...e, mockTests: [...e.mockTests, test] } : e
          ),
        })),
      updateSubjectProgress: (examId, subjectId, completed) =>
        set((s) => ({
          exams: s.exams.map((e) =>
            e.id === examId
              ? {
                  ...e,
                  subjects: e.subjects.map((sub) =>
                    sub.id === subjectId ? { ...sub, completedTopics: completed } : sub
                  ),
                }
              : e
          ),
        })),

      career: null,
      setCareer: (profile) => set({ career: profile }),
      addCareerTask: (task) =>
        set((s) => ({
          career: s.career ? { ...s.career, tasks: [task, ...s.career.tasks] } : s.career,
        })),
      updateCareerTask: (taskId, updates) =>
        set((s) => ({
          career: s.career
            ? {
                ...s.career,
                tasks: s.career.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...updates } : t
                ),
              }
            : s.career,
        })),
      addSkill: (skill) =>
        set((s) => ({
          career: s.career ? { ...s.career, skills: [...s.career.skills, skill] } : s.career,
        })),
      updateSkillLevel: (skillId, level) =>
        set((s) => ({
          career: s.career
            ? {
                ...s.career,
                skills: s.career.skills.map((sk) =>
                  sk.id === skillId ? { ...sk, level } : sk
                ),
              }
            : s.career,
        })),
      addMilestone: (milestone) =>
        set((s) => ({
          career: s.career
            ? { ...s.career, milestones: [...s.career.milestones, milestone] }
            : s.career,
        })),
      toggleMilestone: (milestoneId) =>
        set((s) => ({
          career: s.career
            ? {
                ...s.career,
                milestones: s.career.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, achieved: !m.achieved } : m
                ),
              }
            : s.career,
        })),

      dailyLogs: [],
      addDailyLog: (log) =>
        set((s) => ({
          dailyLogs: [
            ...s.dailyLogs.filter((l) => l.date !== log.date),
            log,
          ],
        })),

      habits: [],
      addHabit: (habit) => set((s) => ({ habits: [...s.habits, habit] })),
      removeHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      toggleHabitDate: (habitId, date) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completedDates: h.completedDates.includes(date)
                    ? h.completedDates.filter((d) => d !== date)
                    : [...h.completedDates, date],
                }
              : h
          ),
        })),

      theme: 'dark',
      setTheme: (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return set({ theme });
      },
    }),
    {
      name: 'lifeos-tracker',
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);
