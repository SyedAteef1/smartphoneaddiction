# Background Voice Notifications Setup

## Overview
This implementation enables pop-up voice notifications in the status bar that work even when the screen time tracker app isn't actively in use.

## Features
✅ Background usage tracking
✅ Status bar notifications
✅ Voice announcements (when app is active)
✅ Automatic threshold alerts (50%, 75%, 90%, 100%)
✅ Works even when app is closed
✅ Minimal battery impact

## How It Works

### 1. Background Service
- `UsageTrackerService.java` runs in the background
- Checks usage every 1 minute
- Sends notifications at key thresholds

### 2. Native Notification Module
- `NotificationModule.java` handles Android notifications
- Shows status bar notifications with sound/vibration
- Works independently of app state

### 3. Voice Integration
- When app is active: Voice + Notification
- When app is closed: Notification only
- Configurable voice settings

## Build Instructions

### Step 1: Rebuild Android App
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Step 2: Grant Permissions
The app will request:
- Usage Stats Access
- Notification Permission
- (Optional) SMS for parent alerts

### Step 3: Test Notifications
1. Open the app
2. Set a daily limit in Settings
3. Close the app
4. Use your phone normally
5. You'll receive notifications at 50%, 75%, 90%, and 100% usage

## Usage in Code

### Start Background Tracking
```typescript
import { BackgroundTracker } from './utils/backgroundTracker';

// Start tracking
await BackgroundTracker.start();
```

### Manual Notifications
```typescript
import { VoiceNotifications } from './utils/voiceNotifications';

// Show notification
await VoiceNotifications.showNotification(
  'Screen Time Alert',
  'You have used 75% of your daily limit'
);

// Voice + notification (when app is active)
await VoiceNotifications.checkAndNotify(timeSpent, limit);
```

### Configure Voice Settings
```typescript
await VoiceNotifications.updateSettings({
  enabled: true,
  pitch: 1.0,
  rate: 0.9,
  language: 'en-US'
});
```

## Notification Thresholds

| Usage | Notification | Priority | Cooldown |
|-------|-------------|----------|----------|
| 50%   | "Half of daily limit used" | Normal | 5 min |
| 75%   | "Consider wrapping up soon" | Normal | 5 min |
| 90%   | "Only 10% remaining" | High | 3 min |
| 100%  | "Limit reached!" | High | 5 min |

## Customization

### Change Check Interval
Edit `UsageTrackerService.java`:
```java
private static final int CHECK_INTERVAL = 60000; // milliseconds
```

### Add Custom Thresholds
Edit `checkThresholds()` method in `UsageTrackerService.java`

### Modify Notification Style
Edit `NotificationModule.java` to customize:
- Icon
- Sound
- Vibration pattern
- LED color

## Troubleshooting

### Notifications Not Showing
1. Check notification permissions in Android Settings
2. Ensure battery optimization is disabled for the app
3. Verify Usage Stats permission is granted

### Service Not Running
1. Check logcat: `adb logcat | grep UsageTracker`
2. Restart the app
3. Manually start: `BackgroundTracker.start()`

### Voice Not Working
1. Check voice settings: `VoiceNotifications.getSettings()`
2. Ensure app is in foreground for voice
3. Test with: `VoiceNotifications.speak('Test message')`

## Battery Optimization
- Service checks every 1 minute (minimal impact)
- Uses Android's UsageStatsManager (efficient)
- Notifications use system resources
- Estimated battery impact: <1% per day

## Privacy & Permissions
- Usage data stays on device
- No data sent to external servers
- Parent SMS alerts are optional
- User controls all settings
