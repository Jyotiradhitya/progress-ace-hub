export interface GymExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
  muscleGroup: string;
}

export interface GymSession {
  id: string;
  date: string;
  exercises: GymExercise[];
  duration: number; // minutes
  notes?: string;
}

export interface ExamSubject {
  id: string;
  name: string;
  totalTopics: number;
  completedTopics: number;
  hoursSpent: number;
}

export interface MockTest {
  id: string;
  examId: string;
  date: string;
  score: number;
  totalMarks: number;
  timeTaken: number; // minutes
}

export interface ExamPrep {
  id: string;
  name: string;
  targetDate: string;
  subjects: ExamSubject[];
  mockTests: MockTest[];
  dailyHoursTarget: number;
}

export interface CareerTask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  date: string;
  category: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-10
  targetLevel: number;
}

export interface CareerProfile {
  id: string;
  company: string;
  role: string;
  startDate: string;
  tasks: CareerTask[];
  skills: Skill[];
  milestones: { id: string; title: string; date: string; achieved: boolean }[];
}

export interface DailyLog {
  date: string;
  gymDone: boolean;
  studyHours: number;
  workHours: number;
  mood: 1 | 2 | 3 | 4 | 5;
}

export type TrackerTab = 'dashboard' | 'gym' | 'exams' | 'career' | 'pomodoro' | 'reports';
