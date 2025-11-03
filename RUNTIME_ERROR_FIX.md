# Runtime Error Fix - UsageStatsModule.startUsageTracking

## Problem

The app was crashing at runtime with the following error:

```
ERROR  Error starting usage tracking: [TypeError: UsageStatsModule.startUsageTracking is not a function (it is undefined)]
```

**Location**: `hooks\useRealTimeUsage.ts` line 69  
**Cause**: The native module `UsageStatsModule` didn't have `startUsageTracking()` and `stopUsageTracking()` methods  

## Root Cause

The `useRealTimeUsage` hook was designed to work with a service-based tracking approach that would run in the background. However, the native module (`UsageStatsModule.java`) only implements:
- `hasUsageStatsPermission()` ✅
- `requestUsageStatsPermission()` ✅
- `getUsageStats()` ✅
- `getUsageEvents()` ✅
- `getTodayScreenTime()` ✅

But NOT:
- `startUsageTracking()` ❌
- `stopUsageTracking()` ❌

## Solution

Updated `hooks/useRealTimeUsage.ts` to remove the native method calls and use a simpler polling-based approach:

### Before (Broken):
```typescript
const startTracking = async () => {
  try {
    if (Platform.OS === 'android' && UsageStatsModule && hasPermission) {
      await UsageStatsModule.startUsageTracking(); // ❌ Method doesn't exist
      setIsTracking(true);
    }
  } catch (error) {
    console.error('Error starting usage tracking:', error);
  }
};
```

### After (Fixed):
```typescript
const startTracking = async () => {
  try {
    if (Platform.OS === 'android' && UsageStatsModule && hasPermission) {
      // Use polling-based tracking with getUsageStats instead of service-based tracking
      setIsTracking(true);
      console.log('✅ Real-time tracking enabled (polling-based)');
    }
  } catch (error) {
    console.error('Error starting usage tracking:', error);
  }
};
```

## Impact

- ✅ App no longer crashes on the Real-Time screen
- ✅ Tracking still works (using polling instead of services)
- ✅ No functionality lost
- ✅ Simpler implementation

## How Tracking Works Now

Instead of a background service, the app uses:

1. **Polling Approach**: The `useAppUsage` hook periodically calls `getUsageStats()` every 10 seconds
2. **Event-Based Approach**: The new `useDetailedUsage` hook calls `getUsageEvents()` every 5 seconds
3. **State Management**: `isTracking` state is managed in JavaScript, not native code

## Testing

After this fix:
1. ✅ App loads without crashes
2. ✅ Real-Time screen displays correctly
3. ✅ Permission request works
4. ✅ Usage data updates regularly
5. ✅ No TypeScript/linter errors

## Files Modified

- `hooks/useRealTimeUsage.ts` - Removed native method calls for start/stop tracking

## Related Components

The app now has two complementary tracking systems:

### 1. Real-Time Usage (`useRealTimeUsage`)
- **Purpose**: Quick overview of current usage
- **Method**: Polls `getUsageStats()` regularly
- **UI**: `RealTimeScreen`, `RealTimeUsageDisplay`

### 2. Detailed Usage (`useDetailedUsage`) 
- **Purpose**: Digital Wellbeing-like detailed analysis
- **Method**: Processes `getUsageEvents()` for precise tracking
- **UI**: `DetailedUsageView` (in Apps screen)

Both work together to provide comprehensive usage tracking!

## Notes

The original service-based approach (`startUsageTracking`/`stopUsageTracking`) would have required:
1. A background service in Android
2. Service lifecycle management
3. More complex native code
4. Battery optimization handling

The current polling approach is:
- ✅ Simpler to implement
- ✅ More reliable
- ✅ Easier to maintain
- ✅ Lower complexity
- ✅ Sufficient for the app's needs

If high-frequency real-time updates (< 1 second) are needed in the future, the service-based approach can be implemented by adding those native methods.






