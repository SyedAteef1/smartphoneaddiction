# 📱 Real-Time App Usage Tracking Guide

## Overview

Your Screen Time Tracker app now includes a comprehensive **real-time app usage tracking system** that monitors and displays live app usage data on Android devices.

## 🏗️ Architecture

### 1. **Native Android Layer** (Java)

Located in: `android/app/src/main/java/com/screentime/tracker/`

#### `UsageStatsModule.java`
- React Native bridge module
- **Methods:**
  - `hasUsageStatsPermission()` - Checks if usage access is granted
  - `requestUsageStatsPermission()` - Opens Android settings
  - `startUsageTracking()` - Starts background service
  - `stopUsageTracking()` - Stops background service

#### `UsageStatsService.java`
- Background service that polls usage stats every 5 seconds
- Uses Android's `UsageStatsManager` API
- Sends data to React Native via DeviceEventEmitter
- **Data tracked:**
  - App name and package name
  - Total time in foreground (seconds)
  - Session time (time since last update)
  - Last time used timestamp

### 2. **React Native Layer**

#### **Hook: `useRealTimeUsage.ts`**
Main hook for accessing real-time usage data

```typescript
const {
  usageStats,        // Map of all app usage data
  hasPermission,     // Whether usage access is granted
  isTracking,        // Whether tracking is active
  loading,           // Initial loading state
  checkPermission,   // Check permission status
  requestPermission, // Request permission
  startTracking,     // Start tracking
  stopTracking,      // Stop tracking
  getTopApps,        // Get top N apps by usage
  getTotalScreenTime,// Get total screen time in seconds
  getCurrentApp,     // Get currently active app
} = useRealTimeUsage();
```

#### **Components**

##### 1. `RealTimeUsageDisplay.tsx`
Full-featured real-time display with:
- Live indicator with pulse animation
- Current app display
- Total stats (time + apps used)
- Top 5 apps with progress bars
- Real-time updates every second

##### 2. `RealTimeWidget.tsx`
Compact widget for embedding in other screens
- Two modes: `compact` and full
- Tap to navigate to full real-time screen
- Shows total time, current app, and top 3 apps

##### 3. `LiveUsageIndicator.tsx`
Simple inline indicator showing:
- Current app name
- Session duration (MM:SS format)
- Red pulsing dot for "live" effect

#### **Screens**

##### `app/(tabs)/realtime.tsx`
Dedicated full-screen real-time usage view
- Permission request flow
- Live tracking controls (play/pause)
- Pull-to-refresh
- Embedded `RealTimeUsageDisplay` component

## 🚀 Usage

### Basic Implementation

```typescript
import { useRealTimeUsage } from '../hooks/useRealTimeUsage';

export default function MyScreen() {
  const {
    hasPermission,
    getTotalScreenTime,
    getTopApps,
  } = useRealTimeUsage();

  const totalTime = getTotalScreenTime(); // in seconds
  const topApps = getTopApps(5); // top 5 apps

  return (
    <View>
      <Text>Total: {Math.round(totalTime / 60)} minutes</Text>
    </View>
  );
}
```

### Using the Widget

```typescript
import { RealTimeWidget } from '../components/RealTimeWidget';

// Full widget
<RealTimeWidget />

// Compact version
<RealTimeWidget compact />
```

### Using the Full Display

```typescript
import { RealTimeUsageDisplay } from '../components/RealTimeUsageDisplay';

<RealTimeUsageDisplay />
```

## 📊 Data Structure

### AppUsageData Interface

```typescript
interface AppUsageData {
  name: string;           // App display name
  packageName: string;    // Android package identifier
  totalTime: number;      // Total seconds in foreground
  sessionTime: number;    // Time since last update
  lastTimeUsed: number;   // Timestamp of last use
}
```

### UsageStats Type

```typescript
type UsageStats = {
  [packageName: string]: AppUsageData;
}
```

## 🔐 Permission Flow

### Android

1. **Request Permission:**
   ```typescript
   const { requestPermission } = useRealTimeUsage();
   await requestPermission();
   ```

2. **User Flow:**
   - App opens Android Settings > Usage Access
   - User grants permission to your app
   - App automatically detects permission on return

3. **Check Permission:**
   ```typescript
   const { hasPermission } = useRealTimeUsage();
   if (!hasPermission) {
     // Show permission request UI
   }
   ```

### Required Android Permissions

Add to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" 
    tools:ignore="ProtectedPermissions" />
```

## 🎨 UI Components Locations

- **Dashboard (`/(tabs)/index.tsx`)**: Shows `LiveUsageIndicator` + `RealTimeWidget`
- **Apps Screen (`/(tabs)/apps.tsx`)**: Uses real-time data for app breakdown
- **Real-Time Tab (`/(tabs)/realtime.tsx`)**: Dedicated full-screen view
- **Tab Navigation**: New "Live" tab with pulse icon

## ⚡ Performance

- **Update Frequency**: 5 seconds (configurable in `UsageStatsService.java`)
- **Background Service**: Runs as Android Service, memory efficient
- **Event Emitter**: Uses React Native's `DeviceEventEmitter` for real-time updates
- **UI Updates**: React components re-render on state changes

## 🔧 Configuration

### Change Update Interval

Edit `UsageStatsService.java`:

```java
private static final int UPDATE_INTERVAL = 5000; // 5 seconds
// Change to:
private static final int UPDATE_INTERVAL = 10000; // 10 seconds
```

### Customize Top Apps Limit

```typescript
const topApps = getTopApps(10); // Get top 10 instead of 5
```

## 📱 Testing

### Emulator Testing
⚠️ **Note**: Usage stats may not work properly in emulators. Test on a physical Android device for accurate results.

### Manual Testing Steps

1. Grant usage access permission
2. Use various apps on your device
3. Return to the app
4. Check the "Live" tab for real-time updates
5. Verify data updates every 5 seconds

## 🐛 Troubleshooting

### No Data Showing
- Ensure permission is granted
- Check that tracking service is started
- Verify device is not in emulator
- Check Android version (API 21+ required)

### Permission Not Working
- Manually open Settings > Apps > Special Access > Usage Access
- Find your app and enable it
- Return to app and refresh

### Service Not Running
```typescript
const { startTracking } = useRealTimeUsage();
await startTracking();
```

## 🔄 Data Flow

```
Android UsageStatsManager
    ↓
UsageStatsService (polls every 5s)
    ↓
DeviceEventEmitter.emit('usageStatsUpdate')
    ↓
useRealTimeUsage hook (listens)
    ↓
React Components (auto-update)
```

## 📈 Future Enhancements

Potential additions:
- [ ] iOS Screen Time API integration
- [ ] Historical data charts
- [ ] App category grouping
- [ ] Custom tracking intervals
- [ ] Export data to CSV
- [ ] Weekly/monthly reports
- [ ] Compare with friends (social features)

## 🎯 Best Practices

1. **Always check permission before accessing data**
   ```typescript
   if (!hasPermission) {
     requestPermission();
     return;
   }
   ```

2. **Start tracking on app launch**
   ```typescript
   useEffect(() => {
     if (hasPermission && !isTracking) {
       startTracking();
     }
   }, [hasPermission]);
   ```

3. **Stop speaking/sounds when leaving screens**
   ```typescript
   useEffect(() => {
     return () => {
       VoiceNotifications.stopSpeaking();
     };
   }, []);
   ```

4. **Format time consistently**
   ```typescript
   const formatTime = (seconds: number) => {
     const hours = Math.floor(seconds / 3600);
     const minutes = Math.floor((seconds % 3600) / 60);
     return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
   };
   ```

## 📚 Related Files

- `hooks/useRealTimeUsage.ts` - Main hook
- `hooks/useAppUsage.ts` - App usage management
- `utils/realTimeTracker.ts` - Tracking utilities
- `components/LiveUsageIndicator.tsx` - Inline indicator
- `components/RealTimeWidget.tsx` - Widget component
- `components/RealTimeUsageDisplay.tsx` - Full display
- `app/(tabs)/realtime.tsx` - Dedicated screen
- Native: `UsageStatsModule.java`, `UsageStatsService.java`

## 🎉 Features Summary

✅ Real-time app usage tracking (5-second updates)  
✅ Live current app display  
✅ Top apps ranking with visual bars  
✅ Total screen time calculation  
✅ Background service for continuous tracking  
✅ Permission request flow  
✅ Multiple UI components (widget, display, indicator)  
✅ Dedicated "Live" tab  
✅ Pull-to-refresh support  
✅ Animated live indicators  
✅ Seamless integration with existing app features  

---

**Need help?** Check the code comments or reach out to the development team!


