# Voice & Notification Feature

## What Was Added

### 1. Background Notifications
✅ Notifications work even when app is closed
✅ Shows popup alerts for screen time limits
✅ User gets notified at 50%, 75%, 90%, 100% usage

### 2. Voice Only When App is Active
✅ Voice speaks only when app is in foreground
✅ Stops automatically when user exits app
✅ No voice in background or recent apps

## How It Works

```
User reaches 75% limit
    ↓
If app is OPEN → Voice speaks + Notification
If app is CLOSED → Notification only
    ↓
User exits app → Voice stops immediately
```

## Notifications Trigger At:
- **50%** - "You have used half of your daily screen time"
- **75%** - "You have used 75% of your daily limit"
- **90%** - "⚠️ Only 10% remaining"
- **100%** - "🚫 Limit reached! Time to take a break"

## Build & Test

```bash
npx expo run:android
```

1. Use apps to reach 50% limit
2. See notification popup
3. Exit your app
4. Continue using other apps
5. Get notifications even when app is closed
6. Voice only speaks when app is open

✅ Notifications work in background
✅ Voice only when app is active
✅ User stays informed always
