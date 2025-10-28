import { AppState, AppStateStatus } from 'react-native';
import { storage } from './storage';
import { VoiceNotifications } from './voiceNotifications';
import { AppBlocker } from './appBlocker';

interface AppSession {
  appName: string;
  startTime: number;
  endTime?: number;
  duration: number;
}

export const RealTimeTracker = {
  currentSession: null as AppSession | null,
  isTracking: false,
  dailyLimit: 120,

  startTracking: async () => {
    if (RealTimeTracker.isTracking) return;
    RealTimeTracker.isTracking = true;

    const limit = await storage.get('dailyLimit') || 120;
    RealTimeTracker.dailyLimit = limit;

    // Track app state changes
    AppState.addEventListener('change', RealTimeTracker.handleAppStateChange);

    // Start session
    RealTimeTracker.currentSession = {
      appName: 'Screen Time Tracker',
      startTime: Date.now(),
      duration: 0,
    };

    // Check usage every minute
    setInterval(async () => {
      await RealTimeTracker.updateCurrentSession();
      await RealTimeTracker.checkThresholds();
    }, 60000);
  },

  handleAppStateChange: async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground
      RealTimeTracker.currentSession = {
        appName: 'Screen Time Tracker',
        startTime: Date.now(),
        duration: 0,
      };
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App went to background
      await RealTimeTracker.endCurrentSession();
    }
  },

  updateCurrentSession: async () => {
    if (!RealTimeTracker.currentSession) return;

    const now = Date.now();
    const duration = Math.floor((now - RealTimeTracker.currentSession.startTime) / 60000);
    RealTimeTracker.currentSession.duration = duration;

    // Save to daily log
    await RealTimeTracker.saveToDailyLog();
  },

  endCurrentSession: async () => {
    if (!RealTimeTracker.currentSession) return;

    RealTimeTracker.currentSession.endTime = Date.now();
    await RealTimeTracker.saveToDailyLog();
    RealTimeTracker.currentSession = null;
  },

  saveToDailyLog: async () => {
    const today = new Date().toDateString();
    const dailyLog = await storage.get(`usage_${today}`) || [];
    
    if (RealTimeTracker.currentSession) {
      dailyLog.push({
        ...RealTimeTracker.currentSession,
        timestamp: Date.now(),
      });
      await storage.set(`usage_${today}`, dailyLog);
    }
  },

  getTodayUsage: async (): Promise<number> => {
    const today = new Date().toDateString();
    const dailyLog = await storage.get(`usage_${today}`) || [];
    
    const total = dailyLog.reduce((sum: number, session: AppSession) => {
      return sum + session.duration;
    }, 0);

    return total;
  },

  checkThresholds: async () => {
    const totalUsage = await RealTimeTracker.getTodayUsage();
    const percentage = (totalUsage / RealTimeTracker.dailyLimit) * 100;

    await VoiceNotifications.checkAndNotify(totalUsage, RealTimeTracker.dailyLimit);
    await AppBlocker.checkAndBlock(totalUsage, RealTimeTracker.dailyLimit);

    // Store last check
    await storage.set('lastUsageCheck', {
      time: Date.now(),
      usage: totalUsage,
      percentage,
    });
  },

  getAppBreakdown: async (): Promise<any[]> => {
    const today = new Date().toDateString();
    const dailyLog = await storage.get(`usage_${today}`) || [];

    // Group by app name
    const breakdown: { [key: string]: number } = {};
    dailyLog.forEach((session: AppSession) => {
      if (!breakdown[session.appName]) {
        breakdown[session.appName] = 0;
      }
      breakdown[session.appName] += session.duration;
    });

    // Convert to array and sort
    return Object.entries(breakdown)
      .map(([name, duration]) => ({
        name,
        timeSpent: duration,
        icon: RealTimeTracker.getAppIcon(name),
        color: RealTimeTracker.getAppColor(name),
      }))
      .sort((a, b) => b.timeSpent - a.timeSpent);
  },

  getAppIcon: (appName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Instagram': '📷',
      'Facebook': '👥',
      'TikTok': '🎵',
      'YouTube': '📺',
      'Twitter': '🐦',
      'Snapchat': '👻',
      'WhatsApp': '💬',
      'Chrome': '🌐',
      'Safari': '🧭',
      'Games': '🎮',
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (appName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '📱';
  },

  getAppColor: (appName: string): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA', '#FF8B94'];
    const hash = appName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  },

  resetDaily: async () => {
    const today = new Date().toDateString();
    await storage.remove(`usage_${today}`);
    RealTimeTracker.currentSession = null;
  },
};
