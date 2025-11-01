# Voice Guidance Feature

## Interactive Voice Feedback

### 1. Dashboard Entry
✅ Automatic greeting when opening dashboard:
- Morning: "Good morning, Champion! Ready for a great day..."
- Evening: "It's getting late. Consider reducing screen time..."

### 2. Screen Time Circle (Tap to Hear)
✅ Tap the circle to hear your status:

**< 50% used:**
"You have used X minutes out of Y minutes. That's only Z percent. Great job staying under your limit!"

**50-80% used:**
"You have used X minutes out of Y minutes. That's Z percent. Watch your time and take breaks!"

**80-100% used:**
"You have used X minutes out of Y minutes. That's Z percent. You're almost at your limit. Please wrap up soon!"

**> 100% (exceeded):**
"Warning! You have exceeded your limit by X minutes. You've used Y minutes when your limit is Z minutes. Time to take a break!"

### 3. Pet Card (Tap to Hear)
✅ Tap the pet to hear its mood:

**Happy (< 50%):**
"Your pet is very happy! Keep up the good screen time habits!"

**Okay (50-80%):**
"Your pet is doing okay. Try to take more breaks to make them happier!"

**Worried (80-100%):**
"Your pet is getting worried. You are using a lot of screen time today."

**Sad (> 100%):**
"Your pet is sad. You have exceeded your limit. Time to take a break!"

## How to Use

1. **Open Dashboard** → Hear greeting
2. **Tap Screen Time Circle** → Hear detailed status
3. **Tap Pet** → Hear pet's mood and advice

## Build & Test

```bash
npx expo run:android
```

1. Open dashboard → Hear greeting
2. Tap circle → Hear usage status
3. Tap pet → Hear pet mood
4. Use apps to change percentage
5. Tap again → Hear updated status

✅ Context-aware voice guidance
✅ Tap to hear details
✅ Updates based on real usage
