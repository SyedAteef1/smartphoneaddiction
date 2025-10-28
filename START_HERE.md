# ⚡ START HERE - Fix Real-Time Tracking

## 🚨 The Problem

**You're using Expo Go** - that's why real-time tracking doesn't work!

Expo Go cannot run custom native modules like our usage tracking code.

---

## ✅ The Solution (5 Commands)

### 1. Connect Your Android Device

- Enable USB Debugging on your phone
- Connect via USB cable
- Allow USB debugging when prompted

### 2. Run These Commands

Open your terminal in the project folder and run:

```bash
# Step 1: Make sure you're in the right folder
cd D:\work\StickerSmash

# Step 2: Install dependencies
npm install

# Step 3: Generate native Android code
npx expo prebuild --clean

# Step 4: Build and install on your device (takes 5-10 min first time)
npx expo run:android

# Step 5: Wait for app to open on your device
```

### 3. Grant Permission

When the app opens:
1. Tap "Live" tab at bottom
2. Tap "Grant Permission"
3. Enable your app in Settings
4. Press Back

### 4. Test It

1. Press Home button
2. Use Instagram, YouTube, Chrome for 2-3 minutes
3. Open your app again
4. Go to "Live" tab
5. **See real data! ✅**

---

## What to Expect

### Before (Expo Go) ❌
```
Permission button does nothing
No real usage data
Module not found errors
```

### After (Built App) ✅
```
Permission opens Settings ✅
Real app usage shows up ✅
Updates every 5 seconds ✅
```

---

## Quick Check

**Am I using Expo Go?**
- ❌ App icon says "Expo Go"
- ❌ Scanned QR code to open
- ❌ See Metro bundler connection

**Am I using the built app?**
- ✅ Installed directly on device
- ✅ Custom app icon
- ✅ Can open without computer connected

---

## If You Get Stuck

### Error: "adb: command not found"
**Solution:** Install Android Studio first
- Download: https://developer.android.com/studio

### Error: "No devices found"
**Solution:** 
1. Enable USB Debugging on phone
2. Allow USB debugging permission
3. Run: `adb devices` to verify

### Build takes forever
**Solution:** This is normal for first build (5-10 minutes)
- Gradle downloads dependencies
- Just wait it out

### Still no real data after build
**Solution:**
1. Make sure you granted permission in Settings
2. Use other apps first to generate data
3. Wait 10 seconds and check Live tab

---

## Copy-Paste Commands

For quick access, here's everything in one block:

```bash
cd D:\work\StickerSmash
npm install
npx expo prebuild --clean
npx expo run:android
```

Then wait for build to complete and app to install!

---

## Summary

1. **Stop using Expo Go** ❌
2. **Run build commands** ✅
3. **Grant permission in Settings** ✅
4. **Use other apps** to generate data ✅
5. **See real-time tracking** working! 🎉

---

**After following these steps, your real-time tracking will work!**

Need more help? Check:
- `HOW_TO_BUILD.md` - Detailed step-by-step guide
- `BUILD_INSTRUCTIONS.md` - Technical documentation
- `REALTIME_QUICKSTART.md` - Quick start guide


