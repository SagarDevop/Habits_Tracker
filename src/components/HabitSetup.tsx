import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { storage, Habit } from '@/lib/storage';
import { toast } from 'sonner';

const ICON_OPTIONS = ['💧', '🏃', '📖', '🧘', '🥗', '💪', '🎯', '✍️', '🌅', '😴', '🎨', '🎵', '🧠', '💼'];
const COLOR_OPTIONS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
  '#ef4444', '#14b8a6', '#06b6d4', '#6366f1', '#f97316'
];

interface HabitSetupProps {
  onComplete: () => void;
}

export function HabitSetup({ onComplete }: HabitSetupProps) {
  const [habits, setHabits] = useState<Omit<Habit, 'id'>[]>([
    { name: '', color: COLOR_OPTIONS[0], icon: ICON_OPTIONS[0] }
  ]);

  const addHabit = () => {
    const nextColorIndex = habits.length % COLOR_OPTIONS.length;
    const nextIconIndex = habits.length % ICON_OPTIONS.length;
    setHabits([
      ...habits,
      { name: '', color: COLOR_OPTIONS[nextColorIndex], icon: ICON_OPTIONS[nextIconIndex] }
    ]);
  };

  const updateHabit = (index: number, field: keyof Omit<Habit, 'id'>, value: string) => {
    const newHabits = [...habits];
    newHabits[index] = { ...newHabits[index], [field]: value };
    setHabits(newHabits);
  };

  const removeHabit = (index: number) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    const validHabits = habits.filter(h => h.name.trim() !== '');
    if (validHabits.length === 0) {
      toast.error('Please add at least one habit');
      return;
    }

    const habitsWithIds: Habit[] = validHabits.map((h, i) => ({
      ...h,
      id: `habit-${Date.now()}-${i}`
    }));

    storage.saveHabits(habitsWithIds);
    toast.success(`${habitsWithIds.length} habits saved! Let's start tracking.`);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <Card className="w-full max-w-3xl shadow-card animate-in">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-display mb-2">Welcome to HabitCalendar Pro</CardTitle>
          <CardDescription className="text-base">
            Add the habits you want to track daily. Aim for 8-12 habits for best results.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {habits.map((habit, index) => (
            <div key={index} className="flex gap-3 items-start animate-in">
              <div className="flex-1 space-y-3">
                <Input
                  placeholder={`Habit ${index + 1} (e.g., Drink 8 glasses of water)`}
                  value={habit.name}
                  onChange={(e) => updateHabit(index, 'name', e.target.value)}
                  className="text-base"
                />
                
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1.5 flex-wrap flex-1">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => updateHabit(index, 'icon', icon)}
                        className={`w-9 h-9 rounded-lg border-2 transition-all hover:scale-110 ${
                          habit.icon === icon 
                            ? 'border-primary scale-110 shadow-md' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-1.5">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateHabit(index, 'color', color)}
                        className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
                          habit.color === color ? 'scale-110 ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {habits.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHabit(index)}
                  className="mt-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addHabit}
            className="w-full mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Habit
          </Button>

          <Button
            onClick={handleComplete}
            className="w-full mt-6 h-12 text-base gradient-primary border-0 hover:opacity-90 transition-opacity"
          >
            Start Tracking ({habits.filter(h => h.name.trim()).length} habits)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
