# 🔧 How to Build Your App (Step-by-Step)

## Why You Need This

Your app uses **custom native Android code** for real-time usage tracking. This code **CANNOT run in Expo Go**. You need to build the app yourself.

## Before You Start

### What You Need:
- ✅ A physical Android device (phone/tablet)
- ✅ USB cable to connect device to computer
- ✅ Android Studio installed (or Android SDK)
- ✅ About 10-15 minutes for first build

### Don't Have Android Studio?
Download here: https://developer.android.com/studio

---

## Step-by-Step Guide

### Step 1: Prepare Your Device

1. **Enable Developer Options** on your Android device:
   - Go to **Settings → About Phone**
   - Tap **Build Number** 7 times
   - You'll see "You are now a developer!"

2. **Enable USB Debugging**:
   - Go to **Settings → Developer Options**
   - Turn ON **USB Debugging**

3. **Connect your device** to computer via USB

4. **Check connection**:
   ```bash
   adb devices
   ```
   You should see your device listed.

### Step 2: Open Terminal/Command Prompt

Navigate to your project:
```bash
cd D:\work\StickerSmash
```

### Step 3: Install Dependencies

```bash
npm install
```

Wait for installation to complete (2-3 minutes).

### Step 4: Prebuild Native Code

This generates the Android native project:

```bash
npx expo prebuild --clean
```

**What this does:**
- Creates `android/` folder with native code
- Includes your custom `UsageStatsModule.java`
- Sets up all Android configurations

Wait for this to complete (1-2 minutes).

### Step 5: Build and Install

```bash
npx expo run:android
```

**What happens now:**
1. ⏳ Gradle downloads dependencies (3-5 minutes first time)
2. 🔨 Compiles Java/Kotlin code
3. 📦 Builds APK
4. 📲 Installs on your device automatically
5. 🚀 Launches the app

**Total time:** 5-10 minutes for first build

### Step 6: Grant Permission

Once the app opens on your device:

1. Go to **"Live"** tab (pulse icon)
2. Tap **"Grant Permission"** button
3. Android opens **Settings**
4. Find your app in the list
5. **Toggle ON** the permission
6. Press **Back** to return to your app

### Step 7: Test It!

1. **Press Home** button (leave your app)
2. **Open other apps**:
   - Chrome
   - YouTube
   - Instagram
   - Any apps you want to track
3. **Use them for 2-3 minutes**
4. **Return to your Screen Time app**
5. **Go to "Live" tab**
6. **See real data!** 🎉

---

## Visual Flow

```
Expo Go (❌ Doesn't Work)
    ↓
npx expo prebuild
    ↓
npx expo run:android
    ↓
App installs on device ✅
    ↓
Grant permission
    ↓
Use other apps
    ↓
See real-time data! 🎉
```

---

## Troubleshooting

### "adb: command not found"

**Problem:** Android SDK not in PATH

**Solution:**
1. Install Android Studio
2. Add to PATH:
   ```bash
   # Windows
   set PATH=%PATH%;C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools
   
   # Mac/Linux
   export PATH=$PATH:~/Library/Android/sdk/platform-tools
   ```

### "No devices found"

**Problem:** Device not connected or USB debugging not enabled

**Solution:**
1. Check USB cable is data cable (not charge-only)
2. Enable USB debugging on device
3. On device, tap "Allow" when asked about USB debugging
4. Run `adb devices` to verify

### Build fails with Gradle error

**Solution 1:** Clean and retry
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

**Solution 2:** Delete and rebuild
```bash
rm -rf android
rm -rf node_modules
npm install
npx expo prebuild --clean
npx expo run:android
```

### "Module not found" error

**Problem:** Still using Expo Go or build didn't complete

**Solution:**
1. Make sure the app was built and installed (not Expo Go)
2. Rebuild: `npx expo run:android`
3. Open the newly installed app

### Device not authorized

**Problem:** You didn't allow USB debugging on device

**Solution:**
1. Disconnect and reconnect USB
2. On device, tap "Allow" on USB debugging prompt
3. Check "Always allow from this computer"
4. Run `adb devices` again

---

## Quick Commands Cheat Sheet

```bash
# Check device connected
adb devices

# First time build
npm install
npx expo prebuild --clean
npx expo run:android

# Rebuild after code changes
npx expo run:android

# View app logs
npx react-native log-android

# Restart Metro bundler
npm start -- --reset-cache

# Uninstall app from device
adb uninstall com.screentime.tracker
```

---

## After First Build

### Making Changes

**JavaScript/TypeScript changes:**
- Just save the file
- App hot-reloads automatically ✅

**Native code changes (Java files):**
- Run `npx expo run:android` again 🔄

---

## Alternative: Build APK File

If you want to install on multiple devices:

```bash
cd android
./gradlew assembleRelease
```

APK location:
```
android/app/build/outputs/apk/release/app-release.apk
```

Transfer this APK to any Android device and install it!

---

## Success Checklist

After building, you should see:

- ✅ New app icon on device (not Expo Go)
- ✅ App name: "StickerSmash" or your custom name
- ✅ "Live" tab shows permission screen
- ✅ After granting permission, real data appears
- ✅ Dashboard shows "Live Data Active" badge

---

## Still Stuck?

1. **Check logs:**
   ```bash
   npx react-native log-android
   ```

2. **Verify Android Studio setup:**
   - Open Android Studio
   - Go to SDK Manager
   - Ensure Android SDK Platform 34 is installed

3. **Ask for help:**
   - Include error message
   - Include output of `adb devices`
   - Include output of build command

---

## Summary

1. ❌ **Don't use Expo Go** - it won't work
2. ✅ **Run:** `npx expo prebuild --clean`
3. ✅ **Run:** `npx expo run:android`
4. ✅ **Grant permission** in Android Settings
5. ✅ **Use other apps** to generate data
6. ✅ **See real-time tracking** working!

**Your app is now ready! 🚀**


