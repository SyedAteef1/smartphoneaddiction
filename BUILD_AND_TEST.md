# Build and Test - Real Data Fix

## Quick Build

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx expo run:android
```

## Test Steps

1. **Open the app**
2. **Go to "App Usage" tab**
3. **Tap "Enable Real Usage Tracking"**
4. **Grant permission in Android settings**
5. **Come back to app**
6. **See YOUR real apps with real usage times**

## What You Should See

✅ Apps YOU actually have on your phone
✅ Usage times that match Digital Wellbeing
✅ Updates every 10 seconds
✅ Real app names (YouTube, WhatsApp, etc.)

## What You Should NOT See

❌ Hardcoded apps you don't have
❌ Fake usage times
❌ Demo mode toggle
❌ Generic app names

## Verify It's Working

1. **Check logs in terminal:**
   - Look for: `✅ [App Name] ([package]): X minutes`
   - This shows real apps being fetched

2. **Compare with Digital Wellbeing:**
   - Open Settings → Digital Wellbeing
   - Compare usage times
   - Should match (within a few minutes)

3. **Use your phone:**
   - Use any app for 2-3 minutes
   - Pull down to refresh in the app
   - See the updated time

## Troubleshooting

**Problem:** Still seeing fake apps
**Solution:** Make sure you granted "Usage Access" permission

**Problem:** No apps showing
**Solution:** Use your phone for a few minutes, then refresh

**Problem:** Permission not working
**Solution:** Go to Settings → Apps → StickerSmash → Permissions → Usage Access → Enable

---

That's it! Your app now shows 100% real data from Digital Wellbeing! 🎉
