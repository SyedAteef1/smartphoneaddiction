# Digital Wellbeing Real Data Fix

## Problem
The app was showing generic/hardcoded data instead of real usage data from Android's Digital Wellbeing (UsageStatsManager).

## Solution Applied

### 1. Enhanced Native Module (UsageStatsModule.java)
**What was changed:**
- Added PackageManager integration to fetch actual app names instead of just package names
- Now returns both `packageName` and `appName` fields
- `appName` contains the real app name (e.g., "YouTube", "WhatsApp", "Chrome")
- Falls back to formatted package name if app is not found

**Key improvement:**
```java
// Get actual app name from PackageManager
String appName = packageName;
try {
    android.content.pm.ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
    appName = pm.getApplicationLabel(appInfo).toString();
} catch (android.content.pm.PackageManager.NameNotFoundException e) {
    // Fallback to formatted package name
    String[] parts = packageName.split("\\.");
    if (parts.length > 0) {
        appName = parts[parts.length - 1];
        appName = appName.substring(0, 1).toUpperCase() + appName.substring(1);
    }
}
appData.putString("appName", appName);
```

### 2. Updated React Native Hook (useAppUsage.ts)
**What was changed:**
- Modified `fetchRealUsage()` to use the `appName` field from native module
- Changed from: `name: stat.packageName.split('.').pop()`
- Changed to: `name: stat.appName || stat.packageName.split('.').pop()`

**Result:**
- Now displays actual app names like "YouTube", "Instagram", "WhatsApp"
- Instead of generic names like "youtube", "instagram", "whatsapp"

## How It Works

### Data Flow:
1. **Native Android Layer** (UsageStatsModule.java)
   - Queries Android's UsageStatsManager API
   - Gets usage data from Digital Wellbeing
   - Fetches actual app names using PackageManager
   - Returns data with both package name and display name

2. **React Native Layer** (useAppUsage.ts)
   - Receives data from native module
   - Uses the real app names provided
   - Updates UI with accurate information
   - Auto-refreshes every 10 seconds when permission is granted

3. **UI Layer** (apps.tsx)
   - Displays real app names
   - Shows actual usage time from Digital Wellbeing
   - Updates in real-time

## Verification

### To verify the fix is working:

1. **Check Logs:**
   ```
   Look for these log messages in Android Studio Logcat:
   - "✅ [App Name] ([package]): X minutes"
   - This shows the real app name being fetched
   ```

2. **Check UI:**
   - Open the "App Usage" tab
   - Toggle to "Live Usage" mode
   - Grant permission when prompted
   - You should see:
     - Real app names (YouTube, WhatsApp, etc.)
     - Actual usage times from today
     - Data updates every 10 seconds

3. **Compare with Digital Wellbeing:**
   - Open Android Settings → Digital Wellbeing
   - Compare the usage times
   - They should match (within a few minutes due to refresh intervals)

## Important Notes

### Permissions Required:
- `android.permission.PACKAGE_USAGE_STATS` - Already declared in AndroidManifest.xml
- User must grant "Usage Access" permission in Android settings
- The app will prompt for this permission automatically

### Data Accuracy:
- Data comes directly from Android's UsageStatsManager
- Same source as Digital Wellbeing app
- Updates every 10 seconds when app is open
- Shows usage from midnight (00:00) to current time

### No Hardcoded Data:
- All data is now fetched from the system
- No demo/mock data when permission is granted
- Real-time updates from actual device usage

## Testing Steps

1. **Build the app:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

2. **Grant permission:**
   - Open the app
   - Go to "App Usage" tab
   - Tap "Enable Real Usage Tracking"
   - Grant "Usage Access" permission

3. **Verify data:**
   - Check that app names are real (not generic)
   - Verify usage times match Digital Wellbeing
   - Use your phone for a few minutes
   - Refresh and see updated times

## Files Modified

1. `android/app/src/main/java/com/screentime/tracker/UsageStatsModule.java`
   - Added PackageManager integration
   - Added appName field to response

2. `hooks/useAppUsage.ts`
   - Updated to use appName from native module
   - Improved data mapping

## No Files Deleted
As requested, no files were deleted. All existing functionality remains intact.
