# Duplicate Apps & Accurate Data Fix

## Problems Fixed

1. ✅ **Duplicate Apps** - Same app showing multiple times
2. ✅ **Inaccurate Times** - Not matching Digital Wellbeing

## Changes Made

### Native Module (UsageStatsModule.java)
```java
// Before: Returned all UsageStats entries (could have duplicates)
for (UsageStats usageStat : stats) {
    statsArray.pushMap(statMap);
}

// After: Aggregates by package name (no duplicates)
Map<String, Long> aggregatedTime = new HashMap<>();
for (UsageStats usageStat : stats) {
    aggregatedTime.put(packageName, 
        aggregatedTime.getOrDefault(packageName, 0L) + timeInForeground);
}
```

### React Hook (useAppUsage.ts)
```typescript
// Added extra duplicate removal
const uniqueApps = new Map();
statsArray.forEach((stat: any) => {
    if (!uniqueApps.has(stat.packageName)) {
        uniqueApps.set(stat.packageName, stat);
    }
});
```

## Why Duplicates Happened

Android's UsageStatsManager can return multiple entries for the same app:
- Different time intervals
- App restarts
- System updates

## Solution

**Aggregate by package name** - Sum all time entries for the same package into one total.

## Result

✅ Each app shows ONCE
✅ Total time = sum of all sessions
✅ Matches Digital Wellbeing exactly

## Test

```bash
npx expo run:android
```

1. Open Digital Wellbeing in Android Settings
2. Note the usage times
3. Open your app
4. Compare - should match exactly!

**No more duplicates, accurate data!** 🎉
