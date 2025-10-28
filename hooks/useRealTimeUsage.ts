import { useState, useEffect } from 'react';
import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';

const { UsageStatsModule } = NativeModules;

export interface AppUsageData {
  name: string;
  packageName: string;
  totalTime: number; // in seconds
  sessionTime: number; // time since last update
  lastTimeUsed: number;
}

export interface UsageStats {
  [packageName: string]: AppUsageData;
}

export const useRealTimeUsage = () => {
  const [usageStats, setUsageStats] = useState<UsageStats>({});
  const [hasPermission, setHasPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (hasPermission && Platform.OS === 'android') {
      const subscription = DeviceEventEmitter.addListener(
        'usageStatsUpdate',
        (data: UsageStats) => {
          setUsageStats(data);
        }
      );

      return () => subscription.remove();
    }
  }, [hasPermission]);

  const checkPermission = async () => {
    try {
      if (Platform.OS === 'android' && UsageStatsModule) {
        const permission = await UsageStatsModule.hasUsageStatsPermission();
        setHasPermission(permission);
      }
    } catch (error) {
      console.error('Error checking usage stats permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      console.log('🔹 requestPermission called');
      console.log('🔹 Platform:', Platform.OS);
      console.log('🔹 UsageStatsModule:', UsageStatsModule);
      
      if (Platform.OS === 'android') {
        if (!UsageStatsModule) {
          console.error('❌ UsageStatsModule is NULL - Native module not loaded!');
          alert('Native module not found. Please rebuild the app.');
          return;
        }
        
        console.log('✅ Calling UsageStatsModule.requestUsageStatsPermission()');
        await UsageStatsModule.requestUsageStatsPermission();
        console.log('✅ Permission request sent, checking after 1 second...');
        
        // Check permission again after user returns from settings
        setTimeout(checkPermission, 1000);
      }
    } catch (error) {
      console.error('❌ Error requesting usage stats permission:', error);
      alert('Error: ' + (error as Error).message);
    }
  };

  const startTracking = async () => {
    try {
      if (Platform.OS === 'android' && UsageStatsModule && hasPermission) {
        await UsageStatsModule.startUsageTracking();
        setIsTracking(true);
      }
    } catch (error) {
      console.error('Error starting usage tracking:', error);
    }
  };

  const stopTracking = async () => {
    try {
      if (Platform.OS === 'android' && UsageStatsModule) {
        await UsageStatsModule.stopUsageTracking();
        setIsTracking(false);
      }
    } catch (error) {
      console.error('Error stopping usage tracking:', error);
    }
  };

  // Get top apps by usage time
  const getTopApps = (limit: number = 10): AppUsageData[] => {
    return Object.values(usageStats)
      .filter(app => app.totalTime > 0)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, limit);
  };

  // Get total screen time for today
  const getTotalScreenTime = (): number => {
    return Object.values(usageStats)
      .reduce((total, app) => total + app.totalTime, 0);
  };

  // Get currently active app (most recently used)
  const getCurrentApp = (): AppUsageData | null => {
    const apps = Object.values(usageStats);
    if (apps.length === 0) return null;
    
    return apps.reduce((latest, app) => 
      app.lastTimeUsed > latest.lastTimeUsed ? app : latest
    );
  };

  return {
    usageStats,
    hasPermission,
    isTracking,
    loading,
    checkPermission,
    requestPermission,
    startTracking,
    stopTracking,
    getTopApps,
    getTotalScreenTime,
    getCurrentApp,
  };
};