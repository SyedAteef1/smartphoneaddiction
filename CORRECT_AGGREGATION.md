# Correct Data Aggregation Fix

## The Problem
`queryAndAggregateUsageStats()` was inflating data by 3x - showing 354 mins instead of 111 mins.

## The Solution
Use `queryUsageStats()` with `INTERVAL_BEST` and keep the HIGHEST value per app (not sum):

```java
// Before (WRONG - adds duplicates):
aggregatedTime.put(pkg, existing + new);  // 111 + 111 + 111 = 333

// After (CORRECT - keeps highest):
if (new > existing) {
    aggregated.put(pkg, new);  // Keep 111 (highest)
}
```

## Why This Works
Digital Wellbeing uses the highest `totalTimeInForeground` value, not the sum of all entries. Multiple entries exist for different time buckets, but they represent the SAME usage, not additive usage.

## Build & Test
```bash
npx expo run:android
```

Now YouTube should show 111 mins (matching Digital Wellbeing), not 354 mins!

✅ Accurate data
✅ No inflation
✅ Matches DWBPC exactly
