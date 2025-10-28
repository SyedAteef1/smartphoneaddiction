import { useEffect, useState } from 'react';
import { NativeModules, Platform } from 'react-native';
import { AppBlocker } from '../utils/appBlocker';
import { DeviceUsageTracker } from '../utils/deviceUsage';
import { RealTimeTracker } from '../utils/realTimeTracker';
import { ScreenTimeSync } from '../utils/screenTimeSync';
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
  
  // Set up auto-refresh interval when we have permission and real data
  useEffect(() => {
    if (!hasPermission || !useRealData) return;
    
    console.log('🔄 Setting up auto-refresh every 10 seconds');
    // Refresh every 10 seconds for more dynamic updates
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing usage data...');
      fetchRealUsage();
    }, 10000);
    
    return () => {
      console.log('🔄 Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [hasPermission, useRealData]);
  
  // Fetch data immediately when permission is granted
  useEffect(() => {
    if (hasPermission && useRealData) {
      console.log('🔄 Permission granted, fetching real usage data...');
      fetchRealUsage();
    }
  }, [hasPermission, useRealData]);

  const initializeData = async () => {
    const supported = await DeviceUsageTracker.isSupported();
    if (supported && UsageStatsModule) {
      const permission = await checkPermission();
      setHasPermission(permission);
      if (permission) {
        setUseRealData(true);
        await fetchRealUsage();
        return;
      }
    }
    await loadData();
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
        
        // Give user time to grant permission before checking
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
      const startTime = new Date().setHours(0, 0, 0, 0);
      const endTime = Date.now();
      const statsMap = await UsageStatsModule.queryUsageStats(startTime, endTime);
      
      console.log('📊 ======================');
      console.log('📊 FETCHING REAL USAGE DATA');
      console.log('📊 Time range: Today from', new Date(startTime).toLocaleTimeString(), 'to', new Date(endTime).toLocaleTimeString());
      console.log('📊 Raw stats received:', Object.keys(statsMap || {}).length, 'apps');
      
      // Convert object/map to array
      const statsArray = Object.values(statsMap || {});
      console.log('📊 Stats array length:', statsArray.length);
      
      const mappedApps = statsArray.map((stat: any) => ({
        name: stat.packageName.split('.').pop() || stat.packageName,
        icon: getCategoryIcon(stat.packageName),
        timeSpent: Math.floor(stat.totalTime / 60000), // Convert ms to minutes
        color: getRandomColor(),
        packageName: stat.packageName,
      })).filter((app: AppUsage) => app.timeSpent > 0)
        .sort((a, b) => b.timeSpent - a.timeSpent); // Sort by most used
      
      console.log('📊 Mapped apps:', mappedApps.length, mappedApps.slice(0, 5));
      
      const newTotal = mappedApps.reduce((sum: number, app: AppUsage) => sum + app.timeSpent, 0);
      
      // Log if data changed
      const dataChanged = mappedApps.length !== apps.length || newTotal !== totalTime;
      if (dataChanged) {
        console.log('🔄 DATA CHANGED!');
        console.log('  Apps: ', apps.length, '->', mappedApps.length);
        console.log('  Time: ', totalTime, '->', newTotal, 'minutes');
        console.log('  Top 3 apps:', mappedApps.slice(0, 3).map(a => `${a.name}:${a.timeSpent}m`));
      }
      
      setApps(mappedApps);
      setTotalTime(newTotal);
      console.log('✅ Apps updated:', mappedApps.length, 'Total time:', newTotal, 'minutes');
      
      await VoiceNotifications.checkAndNotify(newTotal, dailyLimit);
      await AppBlocker.checkAndBlock(newTotal, dailyLimit);
      // Save today's data
      await storage.set('todayApps', mappedApps);
      await storage.set('todayTime', newTotal);
      await storage.set('lastSaveDate', new Date().toDateString());
    } catch (e) {
      console.error('Failed to fetch real usage:', e);
      await loadData();
    }
  };

  const loadData = async () => {
    await loadDynamicData();
  };

  const loadDynamicData = async () => {
    // First check for imported Screen Time data
    const screenTimeData = await ScreenTimeSync.getTodayData();
    
    if (screenTimeData) {
      // Use imported data
      setApps(screenTimeData.apps);
      setTotalTime(screenTimeData.totalUsage);
    } else {
      // Check if we have saved data from today
      const savedApps = await storage.get('todayApps');
      const savedTime = await storage.get('todayTime');
      const savedDate = await storage.get('lastSaveDate');
      const today = new Date().toDateString();
      
      if (savedDate === today && savedApps && savedTime !== null) {
        // Use saved data from today
        setApps(savedApps);
        setTotalTime(savedTime);
      } else {
        // New day - start fresh
        const initial = generateInitialApps();
        setApps(initial);
        setTotalTime(0);
        await storage.set('lastSaveDate', today);
        await storage.set('todayApps', initial);
        await storage.set('todayTime', 0);
      }
    }
    
    const savedLimit = await storage.get('dailyLimit') || 120;
    const savedPoints = await storage.get('points') || 0;
    setDailyLimit(savedLimit);
    setPoints(savedPoints);
  };



  const resetDaily = async () => {
    await RealTimeTracker.resetDaily();
    // Clear today's data
    await storage.set('todayApps', []);
    await storage.set('todayTime', 0);
    await storage.set('lastSaveDate', new Date().toDateString());
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

  const importScreenTime = async (minutes: number, appData: any[]) => {
    const success = await ScreenTimeSync.importFromScreenTime(minutes, appData);
    if (success) {
      setUseRealData(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadDynamicData();
    }
  };

  return { apps, totalTime, dailyLimit, points, resetDaily, updateLimit, addPoints, hasPermission, requestPermission, useRealData, getPetMood, importScreenTime };
};

const generateInitialApps = (): AppUsage[] => {
  // Start with 0 usage - will increment as user actually uses the app
  return [];
};

const getCategoryIcon = (packageName: string): string => {
  if (packageName.includes('game')) return '🎮';
  if (packageName.includes('social') || packageName.includes('chat')) return '💬';
  if (packageName.includes('video') || packageName.includes('youtube')) return '📺';
  if (packageName.includes('browser') || packageName.includes('chrome')) return '🌐';
  if (packageName.includes('music') || packageName.includes('spotify')) return '🎵';
  return '📱';
};

const getRandomColor = (): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA', '#FF8B94', '#A8E6CF'];
  return colors[Math.floor(Math.random() * colors.length)];
};
