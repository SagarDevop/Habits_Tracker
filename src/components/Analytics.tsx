import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { storage } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AnalyticsProps {
  onBack: () => void;
}

export function Analytics({ onBack }: AnalyticsProps) {
  const [currentMonth] = useState(new Date());
  
  const analytics = useMemo(() => {
    const allProgress = storage.getAllProgress();
    const habits = storage.getHabits();
    
    // Filter for current month
    const monthProgress = allProgress.filter(p => {
      const date = new Date(p.date);
      return date.getMonth() === currentMonth.getMonth() && 
             date.getFullYear() === currentMonth.getFullYear();
    });

    // Daily progress data for bar chart
    const dailyData = monthProgress
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(p => ({
        date: new Date(p.date).getDate(),
        progress: p.progress
      }));

    // Calculate streaks per habit
    const streakData = habits.map(habit => {
      let currentStreak = 0;
      let maxStreak = 0;
      const sortedProgress = [...allProgress].sort((a, b) => b.date.localeCompare(a.date));
      
      for (const progress of sortedProgress) {
        if (progress.habits[habit.id]) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          break;
        }
      }

      return {
        name: habit.name,
        streak: currentStreak,
        color: habit.color
      };
    });

    // Monthly summary
    const totalDays = monthProgress.length;
    const avgProgress = totalDays > 0 
      ? Math.round(monthProgress.reduce((sum, p) => sum + p.progress, 0) / totalDays)
      : 0;
    const bestDay = monthProgress.reduce((best, p) => p.progress > (best?.progress || 0) ? p : best, monthProgress[0]);
    const worstDay = monthProgress.reduce((worst, p) => p.progress < (worst?.progress || 100) ? p : worst, monthProgress[0]);
    const perfectDays = monthProgress.filter(p => p.progress === 100).length;

    // Heatmap data (last 30 days)
    const today = new Date();
    const heatmapData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const progress = allProgress.find(p => p.date === dateStr);
      heatmapData.push({
        date: date.getDate(),
        progress: progress?.progress || 0
      });
    }

    return {
      dailyData,
      streakData,
      heatmapData,
      summary: {
        avgProgress,
        bestDay,
        worstDay,
        perfectDays,
        totalDays
      }
    };
  }, [currentMonth]);

  const getHeatmapColor = (progress: number): string => {
    if (progress === 0) return 'bg-muted';
    if (progress < 40) return 'bg-red-300';
    if (progress < 70) return 'bg-orange-300';
    if (progress < 100) return 'bg-blue-300';
    return 'bg-success';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-display font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your progress and streaks</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                {analytics.summary.avgProgress}%
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" />
                Perfect Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {analytics.summary.perfectDays}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Best Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.summary.bestDay ? `${analytics.summary.bestDay.progress}%` : '-'}
              </div>
              {analytics.summary.bestDay && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(analytics.summary.bestDay.date).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Days Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics.summary.totalDays}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Progress Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Daily Progress - {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Streaks */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Current Streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.streakData.map((habit, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: habit.color }}
                  >
                    {habit.streak}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{habit.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {habit.streak} day{habit.streak !== 1 ? 's' : ''} streak
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Last 30 Days Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 md:grid-cols-15 gap-2">
              {analytics.heatmapData.map((day, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded ${getHeatmapColor(day.progress)} transition-colors`}
                  title={`Day ${day.date}: ${day.progress}%`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-muted" />
                <div className="w-4 h-4 rounded bg-red-300" />
                <div className="w-4 h-4 rounded bg-orange-300" />
                <div className="w-4 h-4 rounded bg-blue-300" />
                <div className="w-4 h-4 rounded bg-success" />
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
