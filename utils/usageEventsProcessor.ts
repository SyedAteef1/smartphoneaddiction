// Usage Events Processor - Digital Wellbeing-like data processing
// This processes raw UsageEvents from Android to derive meaningful metrics

export interface UsageEvent {
  packageName: string;
  timestamp: number;
  eventType: number;
  className?: string;
}

export interface AppUsageSummary {
  packageName: string;
  appName?: string;
  screenTime: number; // in milliseconds
  launches: number;
  notifications: number;
  lastUsed?: number;
}

export interface ProcessedUsageData {
  [packageName: string]: AppUsageSummary;
}

// Event types from Android UsageEvents.Event
export const EVENT_TYPES = {
  NONE: 0,
  MOVE_TO_FOREGROUND: 1,
  MOVE_TO_BACKGROUND: 2,
  END_OF_DAY: 3,
  CONTINUE_PREVIOUS_DAY: 4,
  CONFIGURATION_CHANGE: 5,
  SYSTEM_INTERACTION: 6,
  USER_INTERACTION: 7,
  SHORTCUT_INVOCATION: 8,
  CHOOSER_ACTION: 9,
  NOTIFICATION_SEEN: 10,
  STANDBY_BUCKET_CHANGED: 11,
  NOTIFICATION_INTERRUPTION: 12,
  SLICE_PINNED_PRIV: 13,
  SLICE_PINNED: 14,
  SCREEN_INTERACTIVE: 15,
  SCREEN_NON_INTERACTIVE: 16,
  KEYGUARD_SHOWN: 17,
  KEYGUARD_HIDDEN: 18,
  FOREGROUND_SERVICE_START: 19,
  FOREGROUND_SERVICE_STOP: 20,
  CONTINUING_FOREGROUND_SERVICE: 21,
  ROLLOVER_FOREGROUND_SERVICE: 22,
  ACTIVITY_STOPPED: 23,
  ACTIVITY_DESTROYED: 24,
  FLUSH_TO_DISK: 25,
  DEVICE_SHUTDOWN: 26,
  DEVICE_STARTUP: 27,
  USER_UNLOCKED: 28,
  USER_STOPPED: 29,
  LOCUS_ID_SET: 30,
  APP_COMPONENT_USED: 31
};

/**
 * Process raw usage events into a summary with screen time, launches, and notifications
 * More accurate algorithm that matches Digital Wellbeing
 */
export const processUsageEvents = (
  rawEvents: UsageEvent[],
  appNames?: Map<string, string>
): ProcessedUsageData => {
  const usageSummary: ProcessedUsageData = {};
  let foregroundApp: string | null = null;
  let foregroundStartTime: number | null = null;
  let screenOn: boolean = true; // Assume screen is on initially

  // Sort events by timestamp to ensure chronological processing
  const sortedEvents = [...rawEvents].sort((a, b) => a.timestamp - b.timestamp);

  console.log(`📊 Processing ${sortedEvents.length} usage events`);

  sortedEvents.forEach((event, index) => {
    const { packageName, timestamp, eventType } = event;

    // Initialize app entry if it doesn't exist
    if (!usageSummary[packageName]) {
      usageSummary[packageName] = {
        packageName,
        appName: appNames?.get(packageName) || packageName,
        screenTime: 0,
        launches: 0,
        notifications: 0,
        lastUsed: timestamp
      };
    }

    // Update last used time
    if (timestamp > (usageSummary[packageName].lastUsed || 0)) {
      usageSummary[packageName].lastUsed = timestamp;
    }

    // Process screen state events
    if (eventType === EVENT_TYPES.SCREEN_NON_INTERACTIVE) {
      screenOn = false;
      // Close foreground app when screen turns off
      if (foregroundApp && foregroundStartTime) {
        const duration = timestamp - foregroundStartTime;
        if (duration > 0) {
          usageSummary[foregroundApp].screenTime += duration;
        }
        foregroundApp = null;
        foregroundStartTime = null;
      }
      return;
    } else if (eventType === EVENT_TYPES.SCREEN_INTERACTIVE) {
      screenOn = true;
      // Don't resume tracking - wait for next MOVE_TO_FOREGROUND
      return;
    }

    // Process app foreground/background events
    if (eventType === EVENT_TYPES.MOVE_TO_FOREGROUND) {
      // Only process if screen is on
      if (!screenOn) return;

      // Close previous app if one was open
      if (foregroundApp && foregroundStartTime && foregroundApp !== packageName) {
        const duration = timestamp - foregroundStartTime;
        if (duration > 0 && duration < 3600000) { // Sanity check: < 1 hour
          usageSummary[foregroundApp].screenTime += duration;
        }
      }
      
      // Start tracking new foreground app
      foregroundApp = packageName;
      foregroundStartTime = timestamp;
      usageSummary[packageName].launches++;
      
    } else if (eventType === EVENT_TYPES.MOVE_TO_BACKGROUND) {
      // Only close if this is the current foreground app
      if (packageName === foregroundApp && foregroundStartTime) {
        const duration = timestamp - foregroundStartTime;
        if (duration > 0 && duration < 3600000) { // Sanity check: < 1 hour
          usageSummary[foregroundApp].screenTime += duration;
        }
        foregroundApp = null;
        foregroundStartTime = null;
      }
      
    } else if (eventType === EVENT_TYPES.ACTIVITY_STOPPED) {
      // Activity stopped - similar to background for some apps
      if (packageName === foregroundApp && foregroundStartTime) {
        const duration = timestamp - foregroundStartTime;
        if (duration > 0 && duration < 3600000) {
          usageSummary[foregroundApp].screenTime += duration;
        }
        foregroundApp = null;
        foregroundStartTime = null;
      }
    }

    // Count notifications
    if (eventType === EVENT_TYPES.NOTIFICATION_INTERRUPTION || 
        eventType === EVENT_TYPES.NOTIFICATION_SEEN) {
      usageSummary[packageName].notifications++;
    }
  });

  // Handle the last app if it was left in the foreground
  if (foregroundApp && foregroundStartTime && screenOn) {
    const duration = Date.now() - foregroundStartTime;
    // Only add if duration is reasonable (not from yesterday)
    if (duration > 0 && duration < 3600000) { // < 1 hour
      usageSummary[foregroundApp].screenTime += duration;
    }
  }

  // Log summary
  const totalApps = Object.keys(usageSummary).length;
  const totalTime = Object.values(usageSummary).reduce((sum, app) => sum + app.screenTime, 0);
  console.log(`📊 Processed ${totalApps} apps, total time: ${formatScreenTime(totalTime)}`);

  return usageSummary;
};

/**
 * Convert milliseconds to human-readable format
 */
export const formatScreenTime = (milliseconds: number): string => {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Get total screen time across all apps
 */
export const getTotalScreenTime = (usageData: ProcessedUsageData): number => {
  return Object.values(usageData).reduce((total, app) => total + app.screenTime, 0);
};

/**
 * Check if a package is a system/launcher app that should be filtered
 */
const isSystemOrLauncher = (packageName: string): boolean => {
  const systemPatterns = [
    'com.android.systemui',
    'com.android.launcher',
    'com.google.android.apps.nexuslauncher',
    'com.sec.android.app.launcher',
    'com.miui.home',
    'com.huawei.android.launcher',
    'com.oneplus.launcher',
    'com.oppo.launcher',
    'com.realme.launcher',
    'com.nothing.launcher',
    'android',
    'com.android.settings',
    'com.android.vending', // Play Store (often auto-opened)
    'com.google.android.packageinstaller',
    'com.android.documentsui',
    'com.android.inputmethod',
    'com.samsung.android.app.aodservice',
    'com.samsung.android.incallui',
    'com.google.android.apps.wellbeing', // Digital Wellbeing itself
  ];
  
  return systemPatterns.some(pattern => packageName.includes(pattern));
};

/**
 * Get sorted apps by screen time (shows all apps by default)
 */
export const getSortedAppsByScreenTime = (usageData: ProcessedUsageData, includeSystem: boolean = true): AppUsageSummary[] => {
  return Object.values(usageData)
    .filter(app => {
      // Must have screen time
      if (app.screenTime <= 0) return false;
      
      // Filter system apps only if explicitly requested
      if (!includeSystem && isSystemOrLauncher(app.packageName)) return false;
      
      // Filter apps with very short usage (< 0.5 second, likely glitches)
      if (app.screenTime < 500) return false;
      
      return true;
    })
    .sort((a, b) => b.screenTime - a.screenTime);
};

/**
 * Get apps sorted by launch count (shows all apps by default)
 */
export const getSortedAppsByLaunches = (usageData: ProcessedUsageData, includeSystem: boolean = true): AppUsageSummary[] => {
  return Object.values(usageData)
    .filter(app => {
      // Must have launches
      if (app.launches <= 0) return false;
      
      // Filter system apps only if explicitly requested
      if (!includeSystem && isSystemOrLauncher(app.packageName)) return false;
      
      return true;
    })
    .sort((a, b) => b.launches - a.launches);
};

/**
 * Get apps sorted by notifications
 */
export const getSortedAppsByNotifications = (usageData: ProcessedUsageData): AppUsageSummary[] => {
  return Object.values(usageData)
    .filter(app => app.notifications > 0)
    .sort((a, b) => b.notifications - a.notifications);
};

/**
 * Get screen time for a specific time range (e.g., last hour, last 6 hours)
 */
export const getScreenTimeForRange = (
  events: UsageEvent[],
  startTime: number,
  endTime: number
): ProcessedUsageData => {
  const filteredEvents = events.filter(
    event => event.timestamp >= startTime && event.timestamp <= endTime
  );
  return processUsageEvents(filteredEvents);
};


