# 🔨 Building the App for Real-Time Usage

## ⚠️ Important: Expo Go Limitation

**The real-time usage tracking DOES NOT work in Expo Go!**

Expo Go only supports built-in Expo modules. Since we're using a custom native module (`UsageStatsModule.java`) for Android usage tracking, you need to create a **development build**.

## Option 1: Local Development Build (Recommended)

### Prerequisites
- Android Studio installed
- Android SDK configured
- Physical Android device or emulator

### Steps

1. **Install dependencies:**
```bash
cd StickerSmash
npm install
```

2. **Pre-build the native code:**
```bash
npx expo prebuild --clean
```
This generates the `android/` and `ios/` folders with your native code.

3. **Build and run on Android:**
```bash
npx expo run:android
```
Or:
```bash
npm run android
```

4. **Connect your physical device:**
   - Enable USB Debugging on your Android device
   - Connect via USB
   - The app will install automatically

### What This Does
- Compiles the custom native module (`UsageStatsModule`)
- Installs the app directly on your device
- Allows real-time usage tracking to work

## Option 2: EAS Build (Cloud Build)

### Prerequisites
- EAS CLI installed
- Expo account (free)

### Steps

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Configure EAS Build:**
```bash
eas build:configure
```

4. **Create a development build:**
```bash
eas build --profile development --platform android
```

5. **Install on device:**
   - Download the APK from the EAS build page
   - Install on your Android device
   - Run the app

## Option 3: Create APK for Distribution

### For Testing
```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### For Production (with EAS)
```bash
eas build --profile production --platform android
```

## Verify It's Working

After building and installing:

1. **Open the app** (NOT Expo Go)
2. **Go to "Live" tab**
3. **Tap "Grant Permission"**
4. **Enable in Android Settings**
5. **Return to app**
6. **Use other apps** for 2-3 minutes
7. **Return to your app**
8. **Check "Live" tab** - should show real data!

## Troubleshooting

### "Module UsageStatsModule not found"
- You're still using Expo Go
- Build the app with `npx expo run:android`

### Build fails
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

### Permission not working
- Make sure you built the app (not using Expo Go)
- Manually enable: Settings → Apps → Special Access → Usage Access → Your App

### Can't connect device
```bash
# Check connected devices
adb devices

# Restart adb server
adb kill-server
adb start-server
```

## Development Workflow

### After code changes:
```bash
# JavaScript/TypeScript changes - hot reload works
# Just save the file

# Native code changes (Java/Kotlin)
npx expo run:android
```

## Quick Command Reference

```bash
# First time setup
npm install
npx expo prebuild --clean
npx expo run:android

# Rebuild after native changes
npx expo run:android

# View logs
npx react-native log-android

# Check connected devices
adb devices

# Install specific APK
adb install path/to/app.apk
```

## Key Differences: Expo Go vs Development Build

| Feature | Expo Go | Development Build |
|---------|---------|------------------|
| Custom Native Modules | ❌ No | ✅ Yes |
| Usage Stats Tracking | ❌ No | ✅ Yes |
| Quick Testing | ✅ Fast | ⚠️ Needs rebuild |
| Real Device Testing | ✅ Easy | ✅ Yes |
| Production Features | ⚠️ Limited | ✅ Full |

## Why This Matters

Your app uses:
- ✅ `UsageStatsModule.java` - Custom native module
- ✅ `UsageStatsService.java` - Background service
- ✅ Android UsageStatsManager API

These require a **real build**, not Expo Go.

## Next Steps

1. **Build the app** using Option 1 (fastest for development)
2. **Test on physical device**
3. **Grant permission in Settings**
4. **See real-time data working!**

---

**Need help?** Check Expo documentation: https://docs.expo.dev/develop/development-builds/create-a-build/


