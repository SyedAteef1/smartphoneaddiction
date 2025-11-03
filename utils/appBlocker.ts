import { Alert, Platform, NativeModules } from 'react-native';
import { storage } from './storage';
import * as Speech from 'expo-speech';

const { AppBlockerModule } = NativeModules;

export const AppBlocker = {
  isBlocked: false,
  blockedApps: [] as string[],

  checkAndBlock: async (timeSpent: number, limit: number) => {
    const percentage = (timeSpent / limit) * 100;
    
    if (percentage >= 90 && !AppBlocker.isBlocked) {
      await AppBlocker.activateBlock();
    } else if (percentage < 90 && AppBlocker.isBlocked) {
      await AppBlocker.deactivateBlock();
    }
  },

  activateBlock: async () => {
    AppBlocker.isBlocked = true;
    await storage.set('appBlocked', true);
    
    await Speech.speak('You have reached 90% of your screen time limit. Apps are now blocked for your wellbeing.');
    
    Alert.alert(
      '🚫 Apps Blocked',
      'You\'ve used 90% of your daily limit. Time to take a break! Apps will be available after a rest period.',
      [
        { text: 'Take Break', onPress: () => AppBlocker.startBreakTimer() },
        { text: 'Play Games', onPress: () => {} },
      ]
    );

    if (Platform.OS === 'android' && AppBlockerModule) {
      try {
        // Block major time-wasting apps
        const appsToBlock = [
          'com.instagram.android',           // Instagram
          'com.facebook.katana',             // Facebook
          'com.snapchat.android',            // Snapchat
          'com.twitter.android',             // Twitter
          'com.zhiliaoapp.musically',        // TikTok
          'com.google.android.youtube',      // YouTube
          'com.whatsapp',                    // WhatsApp
          'com.reddit.frontpage',            // Reddit
          'com.netflix.mediaclient',         // Netflix
          'in.startv.hotstar',               // Hotstar
          'com.linkedin.android',            // LinkedIn
          'com.pinterest',                   // Pinterest
        ];
        AppBlocker.blockedApps = appsToBlock;
        
        // Start native blocking service
        if (AppBlockerModule && AppBlockerModule.startBlockingService) {
          await AppBlockerModule.startBlockingService(appsToBlock);
          console.log('✅ App blocking activated for ' + appsToBlock.length + ' apps');
        }
      } catch (e) {
        console.error('Failed to block apps:', e);
      }
    }
  },

  deactivateBlock: async () => {
    AppBlocker.isBlocked = false;
    await storage.set('appBlocked', false);
    AppBlocker.blockedApps = [];
    
    // Stop native blocking service
    if (Platform.OS === 'android' && AppBlockerModule) {
      try {
        if (AppBlockerModule.stopBlockingService) {
          await AppBlockerModule.stopBlockingService();
          console.log('✅ App blocking deactivated');
        }
      } catch (e) {
        console.error('Failed to stop blocking:', e);
      }
    }
  },

  startBreakTimer: async () => {
    await storage.set('breakStartTime', Date.now());
    await AppBlocker.activateBlock(); // Activate blocking when break starts
    Alert.alert('✅ Break Started', 'Take a 15-minute break. Apps are blocked until then.');
  },

  checkBreakComplete: async (): Promise<boolean> => {
    const breakStart = await storage.get('breakStartTime');
    if (!breakStart) return false;
    
    const elapsed = Date.now() - breakStart;
    const breakDuration = 15 * 60 * 1000; // 15 minutes
    
    if (elapsed >= breakDuration) {
      await storage.remove('breakStartTime');
      await AppBlocker.deactivateBlock();
      Alert.alert('🎉 Break Complete!', 'You can now use apps again. Remember to use them wisely!');
      return true;
    }
    return false;
  },

  getRemainingBreakTime: async (): Promise<number> => {
    const breakStart = await storage.get('breakStartTime');
    if (!breakStart) return 0;
    
    const elapsed = Date.now() - breakStart;
    const breakDuration = 15 * 60 * 1000;
    const remaining = Math.max(0, breakDuration - elapsed);
    
    return Math.ceil(remaining / 1000 / 60); // minutes
  },

  manualBlock: async (duration: number) => {
    await AppBlocker.activateBlock();
    await storage.set('manualBlockEnd', Date.now() + duration * 60 * 1000);
    Alert.alert('✅ Apps Blocked', `Apps blocked for ${duration} minutes. Use this time wisely!`);
  },
};
