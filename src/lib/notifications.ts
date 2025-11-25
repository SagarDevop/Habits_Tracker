export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:MM format
  completionNotification: boolean;
}

const NOTIFICATION_SETTINGS_KEY = 'habitcalendar_notification_settings';

export const notifications = {
  // Request permission
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  // Check if notifications are supported and permitted
  isSupported: (): boolean => {
    return 'Notification' in window;
  },

  isPermissionGranted: (): boolean => {
    return notifications.isSupported() && Notification.permission === 'granted';
  },

  // Send a notification
  send: (title: string, options?: NotificationOptions) => {
    if (!notifications.isPermissionGranted()) {
      return;
    }

    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  },

  // Settings management
  getSettings: (): NotificationSettings => {
    const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return data
      ? JSON.parse(data)
      : {
          enabled: false,
          dailyReminder: true,
          reminderTime: '20:00',
          completionNotification: true,
        };
  },

  saveSettings: (settings: NotificationSettings) => {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    
    // Update scheduled reminders
    if (settings.enabled && settings.dailyReminder) {
      notifications.scheduleDailyReminder(settings.reminderTime);
    } else {
      notifications.cancelDailyReminder();
    }
  },

  // Daily reminder scheduling
  scheduleDailyReminder: (time: string) => {
    // Clear existing interval
    notifications.cancelDailyReminder();

    const [hours, minutes] = time.split(':').map(Number);
    
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        notifications.send('Daily Habit Reminder', {
          body: "Don't forget to track your habits today! 💪",
          tag: 'daily-reminder',
        });
      }
    };

    // Check every minute
    const intervalId = setInterval(checkTime, 60000);
    sessionStorage.setItem('notification_interval', intervalId.toString());
    
    // Check immediately
    checkTime();
  },

  cancelDailyReminder: () => {
    const intervalId = sessionStorage.getItem('notification_interval');
    if (intervalId) {
      clearInterval(Number(intervalId));
      sessionStorage.removeItem('notification_interval');
    }
  },

  // Completion notification
  sendCompletionNotification: () => {
    const settings = notifications.getSettings();
    if (settings.enabled && settings.completionNotification) {
      notifications.send('🎉 Perfect Day!', {
        body: 'You completed all your habits today! Keep up the great work!',
        tag: 'completion',
      });
    }
  },
};
