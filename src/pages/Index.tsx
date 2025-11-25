import { useState, useEffect } from 'react';
import { HabitSetup } from '@/components/HabitSetup';
import { CalendarView } from '@/components/CalendarView';
import { Analytics } from '@/components/Analytics';
import { Settings } from '@/components/Settings';
import { storage } from '@/lib/storage';

type View = 'setup' | 'calendar' | 'analytics' | 'settings';

const Index = () => {
  const [view, setView] = useState<View>('setup');

  useEffect(() => {
    if (storage.isSetupComplete()) {
      setView('calendar');
    }
  }, []);

  return (
    <>
      {view === 'setup' && <HabitSetup onComplete={() => setView('calendar')} />}
      {view === 'calendar' && (
        <CalendarView 
          onNavigateAnalytics={() => setView('analytics')}
          onNavigateSettings={() => setView('settings')}
        />
      )}
      {view === 'analytics' && <Analytics onBack={() => setView('calendar')} />}
      {view === 'settings' && <Settings onBack={() => setView('calendar')} />}
    </>
  );
};

export default Index;
