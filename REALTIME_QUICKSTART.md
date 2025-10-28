# 🚀 Real-Time Usage Quick Start

## ⚠️ CRITICAL: You CANNOT Use Expo Go!

**Real-time usage tracking requires custom native modules and WILL NOT WORK in Expo Go!**

You must create a **development build** first. See `BUILD_INSTRUCTIONS.md` for details.

## Get Started in 3 Steps

### 1️⃣ Build and Run the App

**🚫 DO NOT use Expo Go - it won't work!**

**✅ Use development build instead:**

```bash
# Navigate to your project
cd StickerSmash

# Install dependencies
npm install

# Build with native code (REQUIRED!)
npx expo prebuild --clean

# Run on Android device
npx expo run:android
```

⚠️ **Important Notes**:
- Real-time tracking **requires a physical Android device** (emulators may not work properly)
- You **MUST build the app** - Expo Go does not support custom native modules
- First build takes 5-10 minutes

### 2️⃣ Grant Usage Access Permission

When you first open the app:

1. **Dashboard** will show a banner: "Enable Real Tracking"
2. Tap the banner or go to the **"Live" tab**
3. Tap **"Grant Permission"** button
4. Android will open **Settings > Usage Access**
5. Find your app and **toggle it ON**
6. Press back to return to the app

🎉 Permission granted! The app will automatically detect it.

### 3️⃣ View Real-Time Usage

#### Option A: Live Tab (Recommended)
- Tap the **"Live"** tab (pulse icon) in the bottom navigation
- See real-time updates every 5 seconds
- View currently active apps
- Check top apps with progress bars

#### Option B: Dashboard Widget
- Stay on the **"Dashboard"** tab
- Scroll down to see the **Real-Time Usage widget**
- Shows compact view with total time and top 3 apps
- Tap widget to open full Live screen

#### Option C: Apps Screen
- Go to **"Apps"** tab
- If permission is granted, it shows live data instead of simulated

## 🧪 Testing

### Generate Some Usage Data

1. **Leave the app** (press Home button)
2. **Open other apps** on your device:
   - Chrome browser
   - YouTube
   - Instagram
   - Games
   - Any other app
3. **Use each app for 1-2 minutes**
4. **Return to Screen Time Tracker**
5. Go to **"Live" tab**

You should see:
- ✅ Total screen time updated
- ✅ List of apps you just used
- ✅ Current/most recent app highlighted
- ✅ Live indicator pulsing (red dot)

### Watch Live Updates

1. Keep the app open on **"Live" tab**
2. Notice the data refreshes every **5 seconds**
3. Watch the "Updates every 5 seconds" indicator
4. See the pulse animation on the LIVE badge

## 📊 Where to See Real-Time Data

| Location | What You'll See |
|----------|-----------------|
| **Dashboard** | - LiveUsageIndicator at top<br>- RealTimeWidget (if permission granted)<br>- Total time in ScreenTimeCircle |
| **Live Tab** | - Full real-time display<br>- Current app card<br>- Total stats<br>- Top 5 apps with bars |
| **Apps Tab** | - Real app usage breakdown<br>- Actual time per app<br>- Live totals |

## 🎨 UI Elements Explained

### Live Indicator (Red Pulsing Dot)
```
🔴 LIVE | Tracking active
```
- Shows tracking is active
- Pulses every second
- Red color for visibility

### Current App Card
```
📱 Currently Active
   Instagram
   45m 23s
```
- Shows the most recently used app
- Updates in real-time
- Large, prominent display

### Top Apps List
```
1. Instagram ████████████ 45m
2. YouTube   ██████       23m
3. Chrome    ███          12m
```
- Ranked by usage time
- Visual progress bars
- Updates live

## 🔧 Controls

### Start/Stop Tracking
- Top-right button in **Live tab**
- ▶️ Play icon = Start tracking
- ⏸️ Pause icon = Stop tracking

### Refresh Data
- Pull down on Live screen to refresh
- Data auto-updates every 5 seconds anyway

## ⚠️ Common Issues

### "No Data Showing"
**Solution:**
1. Check permission is granted (Settings > Apps > Special Access > Usage Access)
2. Use some other apps first to generate data
3. Wait for daily stats to accumulate
4. Restart the app

### "Permission Not Working"
**Solution:**
1. Uninstall and reinstall the app
2. Manually enable in Settings:
   - Settings → Apps → Special Access → Usage Access → [Your App] → Enable
3. Grant permission again from the app

### "Still Seeing Simulated Data"
**Solution:**
- Make sure you're on a **physical device**, not emulator
- Check the dashboard shows **"Live Data Active"** badge
- Verify permission is actually granted

### "Using Expo Go - No Real Data"
**This is the most common issue!**

**Problem:** You're running the app through Expo Go
**Solution:** 
1. Exit Expo Go completely
2. Build the app properly:
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```
3. Install the built app on your device
4. Open the NEW app (not Expo Go)

**How to tell if you're using Expo Go:**
- ❌ You scanned a QR code to open the app
- ❌ The app icon says "Expo Go"
- ❌ You see "Connected to Metro" at bottom

**How to tell if you're using the built app:**
- ✅ App was installed directly on device
- ✅ App icon shows your custom icon
- ✅ App name is "Screen Time Tracker" (or your app name)
- ✅ No "Expo Go" branding

## 📱 Expected Behavior

### First Launch
1. App shows simulated/demo data
2. Permission banner appears
3. After granting permission:
   - Banner disappears
   - "Live Data Active" badge shows
   - Real data loads within 5-10 seconds

### During Use
- Data updates every 5 seconds
- Current app changes as you switch apps
- Total time increases continuously
- Top apps ranking adjusts dynamically

### When Tracking Stops
- Tap pause button in Live tab
- Data freezes at current state
- Tap play to resume

## 🎯 Next Steps

After confirming real-time tracking works:

1. **Set a Daily Limit** (Settings tab)
2. **Check ML Insights** (Dashboard → AI Insights button)
3. **Play Games** to earn rewards (Games tab)
4. **Take Care of Pet** (Pet tab)
5. **Earn Rewards** for staying under limit (Rewards tab)

## 💡 Pro Tips

1. **Leave app open** while using other apps to see live updates when you return
2. **Check "Apps" tab** for detailed breakdown by app
3. **Use the widget** on dashboard for quick glance at usage
4. **Pull to refresh** if data seems stale
5. **Check Live tab** multiple times throughout the day

## 🔍 Debugging

### Check Tracking Status

```typescript
// In your code
const { isTracking, hasPermission } = useRealTimeUsage();

console.log('Has Permission:', hasPermission);
console.log('Is Tracking:', isTracking);
```

### View Raw Data

Open React Native debugger and check:
```typescript
const { usageStats } = useRealTimeUsage();
console.log('Usage Stats:', usageStats);
```

## 📞 Need Help?

1. Check the detailed guide: `REALTIME_USAGE_GUIDE.md`
2. Review the code in:
   - `hooks/useRealTimeUsage.ts`
   - `app/(tabs)/realtime.tsx`
   - `components/RealTimeUsageDisplay.tsx`
3. Check Android logs:
   ```bash
   npx react-native log-android
   ```

---

**Enjoy real-time tracking! 🎉**

