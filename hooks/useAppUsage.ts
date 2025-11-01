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
    RealTimeTracker.startTracking();
  }, []);
  
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
      const calendar = new Date();
      calendar.setHours(0, 0, 0, 0);
      const startTime = calendar.getTime();
      const endTime = Date.now();
      
      const statsArray = await UsageStatsModule.getUsageStats(startTime, endTime);
      
      const mappedApps = statsArray
        .map((stat: any) => ({
          name: stat.appName || formatPackageName(stat.packageName),
          icon: getCategoryIcon(stat.packageName),
          timeSpent: Math.floor(stat.totalTimeInForeground / 60000),
          color: getRandomColor(),
          packageName: stat.packageName,
        }))
        .filter((app: AppUsage) => app.timeSpent > 0)
        .sort((a, b) => b.timeSpent - a.timeSpent);
      
      const newTotal = mappedApps.reduce((sum: number, app: AppUsage) => sum + app.timeSpent, 0);
      
      console.log('✅', mappedApps.length, 'apps,', newTotal, 'min total');
      
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
  const parts = packageName.split('.');
  if (parts.length === 0) return packageName;
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
