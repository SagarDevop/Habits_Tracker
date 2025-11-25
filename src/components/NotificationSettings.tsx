import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, BellOff } from 'lucide-react';
import { notifications } from '@/lib/notifications';
import { toast } from '@/hooks/use-toast';

export function NotificationSettings() {
  const [settings, setSettings] = useState(notifications.getSettings());
  const [permissionGranted, setPermissionGranted] = useState(notifications.isPermissionGranted());

  useEffect(() => {
    // Initialize daily reminder if enabled
    if (settings.enabled && settings.dailyReminder) {
      notifications.scheduleDailyReminder(settings.reminderTime);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await notifications.requestPermission();
    setPermissionGranted(granted);

    if (granted) {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      notifications.saveSettings(newSettings);
      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive habit reminders',
      });
    } else {
      toast({
        title: 'Permission Denied',
        description: 'Please enable notifications in your browser settings',
        variant: 'destructive',
      });
    }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notifications.saveSettings(newSettings);
  };

  const sendTestNotification = () => {
    if (!permissionGranted) {
      toast({
        title: 'Enable Notifications First',
        description: 'Please enable notifications to send a test',
        variant: 'destructive',
      });
      return;
    }

    notifications.send('Test Notification', {
      body: 'This is how your habit reminders will look! 🔔',
    });

    toast({
      title: 'Test Sent',
      description: 'Check your notifications',
    });
  };

  if (!notifications.isSupported()) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <BellOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Notifications are not supported in this browser</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Get reminders to track your habits
          </p>
        </div>
      </div>

      {!permissionGranted ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Enable browser notifications to receive daily reminders and completion celebrations.
          </p>
          <Button onClick={handleEnableNotifications} className="w-full">
            Enable Notifications
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled" className="flex-1">
              <div className="font-medium">Enable Notifications</div>
              <div className="text-sm text-muted-foreground">
                Turn notifications on/off
              </div>
            </Label>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-reminder" className="flex-1">
                  <div className="font-medium">Daily Reminder</div>
                  <div className="text-sm text-muted-foreground">
                    Get a daily reminder to check your habits
                  </div>
                </Label>
                <Switch
                  id="daily-reminder"
                  checked={settings.dailyReminder}
                  onCheckedChange={(checked) => updateSetting('dailyReminder', checked)}
                />
              </div>

              {settings.dailyReminder && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="reminder-time">Reminder Time</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => updateSetting('reminderTime', e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="completion" className="flex-1">
                  <div className="font-medium">Completion Celebration</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when you complete all habits
                  </div>
                </Label>
                <Switch
                  id="completion"
                  checked={settings.completionNotification}
                  onCheckedChange={(checked) => updateSetting('completionNotification', checked)}
                />
              </div>

              <Button variant="outline" onClick={sendTestNotification} className="w-full">
                Send Test Notification
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
