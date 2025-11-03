import { useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';
import { AppBlocker } from '../utils/appBlocker';
import { RealTimeTracker } from '../utils/realTimeTracker';
import { storage } from '../utils/storage';
import { VoiceNotifications } from '../utils/voiceNotifications';

export interface AppUsage {
  name: string;
  icon: string;
  timeSpent: number;
  color: string;
  packageName?: string;
}

const { UsageStatsModule } = NativeModules;

export const useAppUsage = () => {
  const [apps, setApps] = useState<AppUsage[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(120);
  const [points, setPoints] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [useRealData, setUseRealData] = useState(false);

  useEffect(() => {
    initializeData();
    loadSavedLimit();
    RealTimeTracker.startTracking();
  }, []);

  const loadSavedLimit = async () => {
    const saved = await storage.get('dailyLimit');
    if (saved) {
      setDailyLimit(saved);
    }
  };
  
  useEffect(() => {
    if (!hasPermission || !useRealData) return;
    
    console.log('🔄 Setting up auto-refresh every 10 seconds');
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing usage data...');
      fetchRealUsage();
    }, 10000);
    
    return () => {
      console.log('🔄 Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [hasPermission, useRealData]);
  
  useEffect(() => {
    if (hasPermission && useRealData) {
      console.log('🔄 Permission granted, fetching real usage data...');
      fetchRealUsage();
    }
  }, [hasPermission, useRealData]);

  const initializeData = async () => {
    if (Platform.OS === 'android' && UsageStatsModule) {
      const permission = await checkPermission();
      setHasPermission(permission);
      if (permission) {
        setUseRealData(true);
        await fetchRealUsage();
      }
    }
  };

  const checkPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android' && UsageStatsModule) {
      try {
        const hasPermission = await UsageStatsModule.hasUsageStatsPermission();
        console.log('🔐 Permission check result:', hasPermission);
        return hasPermission;
      } catch (e) {
        console.error('🔐 Permission check error:', e);
        return false;
      }
    }
    return false;
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android' && UsageStatsModule) {
      try {
        console.log('🔓 Requesting permission...');
        await UsageStatsModule.requestUsageStatsPermission();
        
        setTimeout(async () => {
          const granted = await UsageStatsModule.hasUsageStatsPermission();
          console.log('🔓 Permission granted:', granted);
          setHasPermission(granted);
          if (granted) {
            setUseRealData(true);
            await fetchRealUsage();
          }
        }, 2000);
      } catch (e) {
        console.error('Permission request failed:', e);
      }
    }
  };

  const fetchRealUsage = async () => {
    if (!UsageStatsModule) return;
    try {
      // Get today from midnight (12:00 AM)
      const now = new Date();
      const calendar = new Date();
      calendar.setHours(0, 0, 0, 0);
      calendar.setMinutes(0);
      calendar.setSeconds(0);
      calendar.setMilliseconds(0);
      const startTime = calendar.getTime();
      const endTime = now.getTime();
      
      console.log('📊 Fetching today\'s usage from', new Date(startTime).toLocaleString(), 'to', new Date(endTime).toLocaleString());
      
      // Use getUsageEvents for accurate day-based tracking
      const rawEvents = await UsageStatsModule.getUsageEvents(startTime, endTime);
      console.log('📊 Received', rawEvents.length, 'events');
      
      // Process events to calculate screen time
      const appUsage: { [key: string]: { name: string; timeSpent: number; packageName: string } } = {};
      let foregroundApp: string | null = null;
      let foregroundStartTime: number = 0;
      
      rawEvents.forEach((event: any) => {
        const { packageName, appName, timestamp, eventType } = event;
        
        // Initialize app entry
        if (!appUsage[packageName]) {
          const displayName = appName || formatPackageName(packageName);
          console.log(`📱 App: ${packageName} -> ${displayName} (fromNative: ${appName ? 'yes' : 'no'})`);
          appUsage[packageName] = {
            name: displayName,
            timeSpent: 0,
            packageName: packageName,
          };
        }
        
        // MOVE_TO_FOREGROUND (1) or MOVE_TO_BACKGROUND (2)
        if (eventType === 1) { // MOVE_TO_FOREGROUND
          // Close previous app if one was open
          if (foregroundApp && foregroundStartTime) {
            const duration = timestamp - foregroundStartTime;
            appUsage[foregroundApp].timeSpent += duration;
          }
          foregroundApp = packageName;
          foregroundStartTime = timestamp;
        } else if (eventType === 2 && packageName === foregroundApp) { // MOVE_TO_BACKGROUND
          if (foregroundStartTime) {
            const duration = timestamp - foregroundStartTime;
            appUsage[foregroundApp].timeSpent += duration;
          }
          foregroundApp = null;
          foregroundStartTime = 0;
        }
      });
      
      // Handle current session if app is still foreground
      if (foregroundApp && foregroundStartTime) {
        const duration = endTime - foregroundStartTime;
        appUsage[foregroundApp].timeSpent += duration;
      }
      
      // Convert to array and format
      const mappedApps = Object.values(appUsage)
        .map((app) => ({
          name: app.name,
          icon: getCategoryIcon(app.packageName),
          timeSpent: Math.floor(app.timeSpent / 60000), // Convert ms to minutes
          color: getRandomColor(),
          packageName: app.packageName,
        }))
        .filter((app: AppUsage) => app.timeSpent > 0)
        .sort((a, b) => b.timeSpent - a.timeSpent);
      
      const newTotal = mappedApps.reduce((sum: number, app: AppUsage) => sum + app.timeSpent, 0);
      
      console.log('✅ Today\'s usage:', mappedApps.length, 'apps,', newTotal, 'min total');
      console.log('📊 Top 3:', mappedApps.slice(0, 3).map(a => `${a.name}: ${a.timeSpent}m`));
      
      setApps(mappedApps);
      setTotalTime(newTotal);
      
      await VoiceNotifications.checkAndNotify(newTotal, dailyLimit);
      await AppBlocker.checkAndBlock(newTotal, dailyLimit);
    } catch (e) {
      console.error('❌', e);
    }
  };

  const resetDaily = async () => {
    await RealTimeTracker.resetDaily();
    setApps([]);
    setTotalTime(0);
  };

  const updateLimit = async (newLimit: number) => {
    setDailyLimit(newLimit);
    await storage.set('dailyLimit', newLimit);
    // Force re-render by updating timestamp
    setApps([...apps]);
  };

  const addPoints = async (amount: number) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    await storage.set('points', newPoints);
  };

  const getPetMood = () => {
    const percentage = (totalTime / dailyLimit) * 100;
    if (percentage < 50) return 'happy';
    if (percentage < 80) return 'okay';
    if (percentage < 100) return 'worried';
    return 'sad';
  };

  return { apps, totalTime, dailyLimit, points, resetDaily, updateLimit, addPoints, hasPermission, requestPermission, useRealData, getPetMood };
};

const formatPackageName = (packageName: string): string => {
  // Smart extraction of app name from package
  // Examples: in.star.hotstar -> Hotstar
  //           com.android.calculator -> Calculator
  //           com.google.android.calendar -> Calendar
  
  const parts = packageName.split('.');
  if (parts.length === 0) return packageName;
  
  // Known app names that need special handling
  const knownApps: { [key: string]: string } = {
    'hotstar': 'Hotstar',
    'alarmclock': 'Alarm Clock',
    'pdfreader': 'PDF Reader',
    'pdfviewer': 'PDF Viewer',
    'cloudmessaging': 'Cloud Messaging',
    'phonepe': 'PhonePe',
    'paytm': 'Paytm',
    'myntra': 'Myntra',
    'flipkart': 'Flipkart',
    'swiggy': 'Swiggy',
    'zomato': 'Zomato',
    'weather': 'Weather',
    'weather2': 'Weather',
    'calculator': 'Calculator',
    'calendar': 'Calendar',
    'photos': 'Photos',
    'contacts': 'Contacts',
    'dialer': 'Dialer',
    'clock': 'Clock',
    'gallery': 'Gallery',
    'camera': 'Camera',
    'maps': 'Maps',
    'settings': 'Settings',
    'launcher': 'Launcher',
    'phonemanager': 'Phone Manager',
    'gamecenter': 'Game Center',
    'homeessentials': 'Home Essentials',
    'netmirror': 'Net Mirror',
    'naviapp': 'Navigation',
    'jioplay': 'Jio Play',
    'myjio': 'My Jio',
  };
  
  // Find the most meaningful part (skip common suffixes)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i].toLowerCase();
    
    // Check if it's a known app
    if (knownApps[part]) {
      return knownApps[part];
    }
    
    // Handle camelCase names (e.g., "startv", "hotstar")
    if (part.length > 4 && /[A-Z]/.test(parts[i])) {
      const camelCase = parts[i];
      return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    }
    
    // Skip common suffixes
    if (!['app', 'android', 'mobile', 'client', 'application', 'star', 'meesho', 'supply'].includes(part) && part.length > 2) {
      const name = parts[i];
      // Capitalize properly
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  
  // Fallback: use last part
  const name = parts[parts.length - 1];
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const getCategoryIcon = (packageName: string): string => {
  const pkg = packageName.toLowerCase();
  if (pkg.includes('game')) return '🎮';
  if (pkg.includes('social') || pkg.includes('chat') || pkg.includes('whatsapp') || pkg.includes('messenger')) return '💬';
  if (pkg.includes('video') || pkg.includes('youtube') || pkg.includes('netflix')) return '📺';
  if (pkg.includes('browser') || pkg.includes('chrome')) return '🌐';
  if (pkg.includes('music') || pkg.includes('spotify')) return '🎵';
  if (pkg.includes('camera') || pkg.includes('photo') || pkg.includes('instagram')) return '📷';
  if (pkg.includes('mail') || pkg.includes('gmail')) return '📧';
  return '📱';
};

const getRandomColor = (): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA', '#FF8B94', '#A8E6CF'];
  return colors[Math.floor(Math.random() * colors.length)];
};
