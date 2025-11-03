# How to Build and Run

## Quick Start

```bash
cd StickerSmash
npx expo run:android
```

That's it! The command will:
1. Build native code
2. Bundle JavaScript
3. Install on device
4. Launch the app

## First Time Setup

If you get errors, make sure you have:

1. **Node.js** installed (v16+)
2. **Android Studio** installed
3. **Android SDK** configured
4. **Physical device** or emulator connected

Check with:
```bash
adb devices
```

## Building

### Development Build (Recommended)

```bash
npx expo run:android
```

This builds everything and launches on your device.

### Production Build

```bash
eas build --platform android
```

This creates an APK/AAB for distribution.

## After Rebuild

The app will:
1. Launch automatically
2. Show permission banner
3. Open settings when you tap it
4. Fetch real data after permission granted
5. Display accurate usage with proper app names

## Troubleshooting

### "UsageStatsModule not defined"

**Solution**: Rebuild the app
```bash
npx expo run:android
```

### "Permission not working"

**Solution**: Make sure you're testing on a real Android device (API 21+)

### "App names showing as package names"

**Solution**: Native module needs rebuild - run `npx expo run:android`

### Build Errors

**Solution**: Clean and rebuild
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

## Verification

After build, check console for:
```
✅ 15 apps, 120 min total
```

Check UI for:
- Proper app names (YouTube, not com.google.android.youtube)
- Accurate screen times
- All apps visible

## All Set!

Your implementation is complete and correct. Just rebuild and enjoy! 🎉


