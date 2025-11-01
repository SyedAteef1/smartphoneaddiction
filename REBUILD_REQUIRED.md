# Rebuild Required - Native Modules Added

## Why Rebuild is Needed

We added new native Android modules:
1. ✅ NotificationModule.java
2. ✅ NotificationService.java
3. ✅ NotificationPackage.java

These require a **full rebuild** of the Android app.

## How to Rebuild

### Step 1: Clean Build
```bash
cd android
./gradlew clean
cd ..
```

### Step 2: Rebuild App
```bash
npx expo run:android
```

### Step 3: Grant Permissions
1. Open app
2. Grant "Usage Access" permission
3. Grant "Notification" permission (Android 13+)

## What Should Work After Rebuild

✅ Real-time tracker (updates every 10 seconds)
✅ Notifications in status bar
✅ Voice guidance (when app is open)
✅ Welcome notification on first install
✅ 30-minute reminders
✅ Limit alerts (50%, 75%, 90%, 100%)

## Troubleshooting

### If Real-Time Tracker Still Not Working:
1. Check Logcat for "UsageStats" logs
2. Verify permission granted in Settings → Apps → Your App → Usage Access
3. Pull down to refresh

### If Notifications Not Showing:
1. Check Settings → Apps → Your App → Notifications → Enabled
2. Check Logcat for "NotificationModule" errors
3. For Android 13+, grant notification permission when prompted

## Test Checklist

After rebuild, test:
- [ ] Dashboard shows real usage data
- [ ] Real-time tab shows live data
- [ ] Tap circle to hear voice
- [ ] Tap pet to hear voice
- [ ] Use phone for 30 mins → See notification
- [ ] Reach 50% limit → See notification + hear voice
- [ ] Exit app → Voice stops, notifications continue

## Build Command (One Line)

```bash
cd android && ./gradlew clean && cd .. && npx expo run:android
```

This will:
1. Clean old build
2. Rebuild with new native modules
3. Install on device
4. Everything should work!
