export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD
  habits: Record<string, boolean>; // habitId -> completed
  progress: number; // 0-100
}

const HABITS_KEY = 'habitcalendar_habits';
const PROGRESS_KEY = 'habitcalendar_progress';

export const storage = {
  // Habits
  getHabits: (): Habit[] => {
    const data = localStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveHabits: (habits: Habit[]) => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },

  // Progress
  getAllProgress: (): DayProgress[] => {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getProgressForDate: (date: string): DayProgress | null => {
    const allProgress = storage.getAllProgress();
    return allProgress.find(p => p.date === date) || null;
  },

  saveProgressForDate: (date: string, habits: Record<string, boolean>) => {
    const allProgress = storage.getAllProgress();
    const existingIndex = allProgress.findIndex(p => p.date === date);
    
    const totalHabits = Object.keys(habits).length;
    const completedHabits = Object.values(habits).filter(Boolean).length;
    const progress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    const dayProgress: DayProgress = { date, habits, progress };

    if (existingIndex >= 0) {
      allProgress[existingIndex] = dayProgress;
    } else {
      allProgress.push(dayProgress);
    }

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
  },

  // Helper to check if setup is complete
  isSetupComplete: (): boolean => {
    return storage.getHabits().length > 0;
  }
};
