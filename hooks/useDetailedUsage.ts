import { useState, useEffect, useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import {
  processUsageEvents,
  formatScreenTime,
  getTotalScreenTime,
  getSortedAppsByScreenTime,
  getSortedAppsByLaunches,
  type UsageEvent,
  type ProcessedUsageData,
  type AppUsageSummary
} from '../utils/usageEventsProcessor';

const { UsageStatsModule } = NativeModules;

export interface DetailedUsageState {
  usageData: ProcessedUsageData;
  sortedByScreenTime: AppUsageSummary[];
  sortedByLaunches: AppUsageSummary[];
  totalScreenTime: number;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

/**
 * Hook for detailed Digital Wellbeing-like usage tracking
 */
export const useDetailedUsage = (refreshInterval: number = 5000) => {
  const [state, setState] = useState<DetailedUsageState>({
    usageData: {},
    sortedByScreenTime: [],
    sortedByLaunches: [],
    totalScreenTime: 0,
    isLoading: true,
    error: null,
    hasPermission: false
  });

  /**
   * Check if usage stats permission is granted
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const hasPermission = await UsageStatsModule.hasUsageStatsPermission();
      setState(prev => ({ ...prev, hasPermission }));
      return hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, []);

  /**
   * Request usage stats permission
   */
  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await UsageStatsModule.requestUsageStatsPermission();
      // Check permission after a delay to give user time to grant it
      setTimeout(() => checkPermission(), 1000);
    } catch (error) {
      console.error('Error requesting permission:', error);
      setState(prev => ({ ...prev, error: 'Failed to request permission' }));
    }
  }, [checkPermission]);

  /**
   * Fetch and process detailed usage events
   */
  const fetchDetailedUsage = useCallback(async (startTime?: number, endTime?: number) => {
    if (Platform.OS !== 'android') {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Permission not granted'
        }));
        return;
      }

      // Default to today's data
      const now = Date.now();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const start = startTime || todayStart.getTime();
      const end = endTime || now;

      console.log('📊 Fetching usage events from', new Date(start), 'to', new Date(end));

      // Fetch raw events and basic stats in parallel for efficiency
      const [rawEvents, basicStats] = await Promise.all([
        UsageStatsModule.getUsageEvents(start, end),
        UsageStatsModule.getUsageStats(start, end)
      ]);
      
      console.log(`📊 Received ${rawEvents.length} usage events and ${basicStats.length} app stats`);

      // Create app name mapping from basic stats
      const appNames = new Map<string, string>();
      console.log('📊 Basic stats received:', basicStats.length, 'apps');
      basicStats.forEach((stat: any) => {
        console.log(`📦 Raw stat:`, JSON.stringify(stat));
        if (stat.packageName && stat.appName) {
          appNames.set(stat.packageName, stat.appName);
          console.log(`✅ Mapped: ${stat.packageName} -> ${stat.appName}`);
        } else {
          console.log(`❌ Missing appName for ${stat.packageName}`);
        }
      });

      console.log(`📊 Total mapped ${appNames.size} app names`);

      // Process events into meaningful data
      const usageData = processUsageEvents(rawEvents, appNames);
      const sortedByScreenTime = getSortedAppsByScreenTime(usageData);
      const sortedByLaunches = getSortedAppsByLaunches(usageData);
      const totalScreenTime = getTotalScreenTime(usageData);

      console.log('📊 Processed usage data:', {
        apps: Object.keys(usageData).length,
        totalScreenTime: formatScreenTime(totalScreenTime)
      });

      // Log top 5 apps for verification
      console.log('📱 Top 5 apps:');
      sortedByScreenTime.slice(0, 5).forEach((app, i) => {
        console.log(`  ${i + 1}. ${app.appName} (${app.packageName}): ${formatScreenTime(app.screenTime)}`);
      });

      setState({
        usageData,
        sortedByScreenTime,
        sortedByLaunches,
        totalScreenTime,
        isLoading: false,
        error: null,
        hasPermission: true
      });
    } catch (error: any) {
      console.error('Error fetching detailed usage:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch usage data'
      }));
    }
  }, [checkPermission]);

  /**
   * Get usage for a specific time range
   */
  const getUsageForRange = useCallback(async (hoursAgo: number) => {
    const end = Date.now();
    const start = end - (hoursAgo * 60 * 60 * 1000);
    await fetchDetailedUsage(start, end);
  }, [fetchDetailedUsage]);

  /**
   * Get usage for today
   */
  const getTodayUsage = useCallback(async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    await fetchDetailedUsage(todayStart.getTime(), Date.now());
  }, [fetchDetailedUsage]);

  /**
   * Get usage for yesterday
   */
  const getYesterdayUsage = useCallback(async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    await fetchDetailedUsage(yesterday.getTime(), yesterdayEnd.getTime());
  }, [fetchDetailedUsage]);

  /**
   * Get usage for the last 7 days
   */
  const getWeekUsage = useCallback(async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    await fetchDetailedUsage(weekAgo.getTime(), Date.now());
  }, [fetchDetailedUsage]);

  // Auto-refresh usage data
  useEffect(() => {
    const loadInitialData = async () => {
      await checkPermission();
      await getTodayUsage();
    };

    loadInitialData();

    const interval = setInterval(() => {
      if (state.hasPermission) {
        getTodayUsage();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    ...state,
    requestPermission,
    checkPermission,
    refresh: getTodayUsage,
    getTodayUsage,
    getYesterdayUsage,
    getWeekUsage,
    getUsageForRange,
    formatScreenTime
  };
};


