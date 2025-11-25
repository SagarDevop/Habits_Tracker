import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate } from '@/lib/dateUtils';
import { storage, Habit } from '@/lib/storage';
import confetti from 'canvas-confetti';

interface DayModalProps {
  date: Date;
  onClose: () => void;
}

export function DayModal({ date, onClose }: DayModalProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const allHabits = storage.getHabits();
    setHabits(allHabits);

    const dateStr = formatDate(date);
    const progress = storage.getProgressForDate(dateStr);
    
    if (progress) {
      setCompleted(progress.habits);
    } else {
      // Initialize with all false
      const initial: Record<string, boolean> = {};
      allHabits.forEach(h => initial[h.id] = false);
      setCompleted(initial);
    }
  }, [date]);

  const handleToggle = (habitId: string, checked: boolean) => {
    const newCompleted = { ...completed, [habitId]: checked };
    setCompleted(newCompleted);

    const dateStr = formatDate(date);
    storage.saveProgressForDate(dateStr, newCompleted);

    // Check if 100% complete
    const totalHabits = habits.length;
    const completedCount = Object.values(newCompleted).filter(Boolean).length;
    
    if (completedCount === totalHabits && totalHabits > 0) {
      // Trigger confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const totalHabits = habits.length;
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </DialogTitle>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span className="font-semibold text-foreground">{completedCount}/{totalHabits}</span>
            </div>
            <div className="mt-2 h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full gradient-success transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-center text-2xl font-bold text-primary">
              {progress}%
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
            >
              <Checkbox
                id={habit.id}
                checked={completed[habit.id] || false}
                onCheckedChange={(checked) => handleToggle(habit.id, checked as boolean)}
                className="data-[state=checked]:animate-checkmark"
              />
              <label
                htmlFor={habit.id}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                >
                  {habit.icon}
                </div>
                <span className={`text-base ${completed[habit.id] ? 'line-through text-muted-foreground' : ''}`}>
                  {habit.name}
                </span>
              </label>
            </div>
          ))}
        </div>

        {progress === 100 && (
          <div className="mt-4 p-4 rounded-lg gradient-success text-white text-center font-semibold animate-in">
            🎉 Perfect day! All habits completed! 🎉
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
