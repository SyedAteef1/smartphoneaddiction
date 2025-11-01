# Test Accuracy Guide

## Build & Test

```bash
npx expo run:android
```

## Check Logs

Open Android Studio Logcat and filter by "UsageStats" to see:

```
UsageStats: Querying from ... to ...
UsageStats: Received X entries
UsageStats: com.google.android.youtube: 111 mins
UsageStats: com.instagram.android: 45 mins
UsageStats: Final aggregated: X apps
UsageStats: Sending: YouTube (com.google.android.youtube): 111 mins
```

## Compare with Digital Wellbeing

1. Open Settings → Digital Wellbeing
2. Check YouTube usage time
3. Open your app
4. Check YouTube usage time
5. Compare the logs

## What to Look For

- **If logs show 111 mins** → Native module is correct
- **If app shows 354 mins** → React Native side is multiplying
- **If logs show 354 mins** → Native module is wrong

The logs will tell us exactly where the problem is!

## Expected Result

Logs and app should both show the same time as Digital Wellbeing.
