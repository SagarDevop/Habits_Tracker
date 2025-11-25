import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BarChart3, Settings } from 'lucide-react';
import { getMonthDays, getMonthName, formatDate, isSameDay } from '@/lib/dateUtils';
import { storage } from '@/lib/storage';
import { DayModal } from './DayModal';

interface CalendarViewProps {
  onNavigateAnalytics: () => void;
  onNavigateSettings: () => void;
}

export function CalendarView({ onNavigateAnalytics, onNavigateSettings }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDayProgress = (date: Date): number => {
    const dateStr = formatDate(date);
    const progress = storage.getProgressForDate(dateStr);
    return progress?.progress || 0;
  };

  const getProgressColor = (progress: number): string => {
    if (progress === 0) return 'bg-muted';
    if (progress < 40) return 'bg-red-200 dark:bg-red-900/30';
    if (progress < 70) return 'bg-orange-200 dark:bg-orange-900/30';
    if (progress < 100) return 'bg-blue-200 dark:bg-blue-900/30';
    return 'bg-success/20';
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === month;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HabitCalendar Pro
              </h1>
              <p className="text-muted-foreground mt-1">Track your daily progress</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onNavigateAnalytics} className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
              <Button variant="outline" onClick={onNavigateSettings} className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>

          {/* Calendar Card */}
          <Card className="p-4 md:p-6 shadow-card">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-6">
              <Button variant="ghost" onClick={previousMonth} size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-2xl md:text-3xl font-display font-bold">
                {getMonthName(month)} {year}
              </h2>
              <Button variant="ghost" onClick={nextMonth} size="icon">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 md:gap-3 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day[0]}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {days.map((day, index) => {
                const progress = getDayProgress(day);
                const isToday = isSameDay(day, today);
                const isOtherMonth = !isCurrentMonth(day);

                return (
                  <button
                    key={index}
                    onClick={() => isCurrentMonth(day) && setSelectedDate(day)}
                    disabled={isOtherMonth}
                    className={`
                      aspect-square min-h-[60px] md:min-h-[90px] rounded-xl p-2 transition-all
                      ${isOtherMonth ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                      ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                      ${getProgressColor(progress)}
                      shadow-soft hover:shadow-card
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm md:text-base font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {day.getDate()}
                      </span>
                      {progress > 0 && isCurrentMonth(day) && (
                        <div className="mt-auto">
                          <div className="text-xs md:text-sm font-bold text-foreground">
                            {progress}%
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <span className="text-muted-foreground">Not started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-200" />
                <span className="text-muted-foreground">&lt;40%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-200" />
                <span className="text-muted-foreground">40-69%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-200" />
                <span className="text-muted-foreground">70-99%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/20" />
                <span className="text-muted-foreground">100%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
