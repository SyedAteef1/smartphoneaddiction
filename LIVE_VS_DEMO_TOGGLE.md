# Live Usage vs Demo Mode Toggle

## What I Fixed

Your app was showing **generic/demo data** instead of your **real live usage** (43 minutes today). I've added a **prominent toggle button** so you can easily switch between Demo Mode and Live Usage.

## New Features Added ✨

### 1. **Toggle Button at the Top**
- Two big buttons: **Demo Mode** and **Live Usage**
- The active mode is highlighted in blue with a checkmark
- Tap to instantly switch between modes

### 2. **Status Badges**
- **Green "LIVE DATA" badge**: Shows when you're viewing real usage that updates every 10 seconds
- **Yellow "DEMO MODE" badge**: Shows when you're viewing demo data

### 3. **Visual Indicators**
- **Timestamp**: Updates every 10 seconds when in Live mode
- **Checkmark (✓)**: Appears next to "Live Usage" when active
- **Icons**: 
  - 🟢 Radio icon for Live Data
  - 👁️ Eye icon for Demo Mode

## How to Use

### Switch to Live Usage (Your Real Data):
1. Open the **Apps** tab
2. Tap the **"Live Usage"** button at the top
3. If you haven't granted permission, it will automatically prompt you
4. You'll see:
   - Green "LIVE DATA" badge
   - Your actual apps and times
   - Timestamp updating every 10 seconds
   - Your real total (e.g., 43 minutes)

### Switch to Demo Mode:
1. Tap the **"Demo Mode"** button
2. You'll see:
   - Yellow "DEMO MODE" badge
   - Generic sample data (YouTube: 45m, Instagram: 32m, etc.)
   - Total: 145 minutes

## What You Should See Now

### Apps Tab - Live Usage Mode:
```
┌─────────────────────────────────────┐
│ [👁️ Demo Mode] [🟢 Live Usage ✓]   │  ← Toggle buttons
│                                     │
│ 🟢 LIVE DATA • Updates every 10s    │  ← Status badge
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 📊 Summary                          │
│ 16 Apps Used | 43m Total | hotstar │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 📺 Hotstar        213m        50%  │
│ ████████████░░░░░░░░░░░░░░░░░░░░  │
│                                     │
│ 📱 Launcher       119m        28%  │
│ ███████░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                     │
│ ... (more apps)                     │
└─────────────────────────────────────┘
```

### Apps Tab - Demo Mode:
```
┌─────────────────────────────────────┐
│ [🟢 Demo Mode ✓] [Live Usage]       │  ← Toggle buttons
│                                     │
│ 👁️ DEMO MODE • Switch to see real  │  ← Status badge
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 📊 Summary                          │
│ 5 Apps Used | 145m Total | YouTube │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ 📺 YouTube        45m         31%  │
│ █████████░░░░░░░░░░░░░░░░░░░░░░░  │
│                                     │
│ 💬 Instagram      32m         22%  │
│ ██████░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                     │
│ ... (demo apps)                     │
└─────────────────────────────────────┘
```

## Console Logs to Watch

When in **Live Usage** mode, you'll see:
```
📊 ======================
📊 FETCHING REAL USAGE DATA
📊 Time range: Today from 12:00:00 AM to 3:45:23 PM
📊 Raw stats received: 24 apps
📊 Stats array length: 24
📊 Mapped apps: 16 [...]
✅ Apps updated: 16 Total time: 43 minutes

🔄 Setting up auto-refresh every 10 seconds
🔄 Auto-refreshing usage data...
🔄 DATA CHANGED!
  Apps: 16 -> 17
  Time: 43 -> 45 minutes
  Top 3 apps: hotstar:213m, launcher:119m, youtube:19m
```

## Testing It

### To verify Live Data is working:
1. Switch to **Live Usage** mode
2. Use YouTube or another app for 2-3 minutes
3. Return to your app
4. Within 10 seconds, you should see:
   - The time increase
   - Console log "🔄 DATA CHANGED!"
   - Timestamp update

### To see Demo Mode:
1. Tap **Demo Mode**
2. Instantly see sample data (145 minutes total)
3. No permission needed

## Key Benefits

✅ **No More Confusion**: Clear which data you're viewing  
✅ **Easy Toggle**: Switch modes with one tap  
✅ **Real-Time Updates**: Live data refreshes every 10 seconds  
✅ **Visual Feedback**: Badges, icons, and checkmarks show status  
✅ **Permission Flow**: Auto-prompts for permission when needed  

## Files Modified

1. **app/(tabs)/apps.tsx**: Added toggle, status badges, and mode logic
2. **app/(tabs)/index.tsx**: Fixed to use correct data source
3. **hooks/useAppUsage.ts**: Enhanced logging for debugging

---

**Now your app clearly shows whether you're viewing LIVE data (43m) or DEMO data (145m)!** 🎉

