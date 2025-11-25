import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { storage, Habit } from '@/lib/storage';
import { toast } from 'sonner';

interface SettingsProps {
  onBack: () => void;
}

const ICON_OPTIONS = ['💧', '🏃', '📖', '🧘', '🥗', '💪', '🎯', '✍️', '🌅', '😴', '🎨', '🎵', '🧠', '💼'];
const COLOR_OPTIONS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
  '#ef4444', '#14b8a6', '#06b6d4', '#6366f1', '#f97316'
];

export function Settings({ onBack }: SettingsProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState('');

  useEffect(() => {
    setHabits(storage.getHabits());
  }, []);

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditColor(habit.color);
    setEditIcon(habit.icon);
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      toast.error('Habit name cannot be empty');
      return;
    }

    const updatedHabits = habits.map(h => 
      h.id === editingId 
        ? { ...h, name: editName, color: editColor, icon: editIcon }
        : h
    );
    
    storage.saveHabits(updatedHabits);
    setHabits(updatedHabits);
    setEditingId(null);
    toast.success('Habit updated');
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    storage.saveHabits(updatedHabits);
    setHabits(updatedHabits);
    toast.success('Habit deleted');
  };

  const addNewHabit = () => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: 'New Habit',
      color: COLOR_OPTIONS[habits.length % COLOR_OPTIONS.length],
      icon: ICON_OPTIONS[habits.length % ICON_OPTIONS.length]
    };
    
    const updatedHabits = [...habits, newHabit];
    storage.saveHabits(updatedHabits);
    setHabits(updatedHabits);
    startEdit(newHabit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-display font-bold">Manage Habits</h1>
            <p className="text-muted-foreground">Edit your tracked habits</p>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-display">Your Habits ({habits.length})</CardTitle>
              <Button onClick={addNewHabit} className="gradient-primary border-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Habit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {habits.map((habit) => (
              <div key={habit.id} className="p-4 rounded-lg border border-border">
                {editingId === habit.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Habit name"
                    />
                    
                    <div className="flex gap-2 flex-wrap">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setEditIcon(icon)}
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            editIcon === icon 
                              ? 'border-primary scale-110' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            editColor === color ? 'scale-110 ring-2 ring-primary ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveEdit} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{habit.name}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(habit)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteHabit(habit.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {habits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No habits yet. Add your first habit to get started!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
