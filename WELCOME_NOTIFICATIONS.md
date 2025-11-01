# Welcome & Status Bar Notifications

## Features Added

### 1. First Install Welcome
✅ When user installs and opens app first time:
- **Voice**: "Welcome to Screen Time Tracker! I'm here to help you build healthy digital habits. Let's get started, Champion!"
- **Notification**: Shows in notification panel and status bar
- Only shows once on first install

### 2. Periodic Status Bar Reminders
✅ Every 30 minutes of usage:
- **Notification**: "⏰ Screen Time Reminder"
- **Message**: "You've used X mins. Y mins remaining."
- Shows in status bar and notification panel
- User can see without opening app

### 3. Limit Alerts (Already Implemented)
✅ At 50%, 75%, 90%, 100%:
- **Voice** (if app open)
- **Notification** (always shows)
- Appears in status bar

## How It Works

```
First Install
    ↓
Open App → Voice + Notification: "Welcome!"
    ↓
Use Phone
    ↓
Every 30 mins → Notification: "Used X mins, Y remaining"
    ↓
Reach 50% → Voice + Notification: "Half your limit used"
    ↓
Reach 75% → Voice + Notification: "75% used"
    ↓
Reach 90% → Voice + Notification: "Only 10% left"
    ↓
Reach 100% → Voice + Notification: "Limit reached!"
```

## Notifications Show In:
✅ Status bar (top of phone)
✅ Notification panel (swipe down)
✅ Lock screen (if enabled)

## Build & Test

```bash
npx expo run:android
```

### Test First Install:
1. Uninstall app
2. Install fresh
3. Open app
4. Hear welcome voice + see notification

### Test Reminders:
1. Use phone for 30 mins
2. See notification: "Used 30 mins, 90 remaining"
3. Use for 60 mins
4. See notification: "Used 60 mins, 60 remaining"

✅ Welcome on first install
✅ Status bar reminders every 30 mins
✅ Voice + notification for limits
