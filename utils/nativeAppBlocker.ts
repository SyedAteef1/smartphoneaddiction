import { NativeModules, Platform } from 'react-native';

const { AppBlockerModule } = NativeModules;

export class NativeAppBlocker {
  static async startBreakMode(durationMinutes: number = 5): Promise<void> {
    if (Platform.OS !== 'android' || !AppBlockerModule) {
      console.log('Break mode only available on Android');
      return;
    }

    try {
      await AppBlockerModule.startBreakMode(durationMinutes);
      console.log('✅ Break mode started - ALL apps blocked for', durationMinutes, 'minutes');
    } catch (error) {
      console.error('❌ Failed to start break mode:', error);
      throw error;
    }
  }

  static async stopBreakMode(): Promise<void> {
    if (Platform.OS !== 'android' || !AppBlockerModule) {
      return;
    }

    try {
      await AppBlockerModule.stopBreakMode();
      console.log('✅ Break mode ended');
    } catch (error) {
      console.error('❌ Failed to stop break mode:', error);
      throw error;
    }
  }

  static async startBlocking(appPackages: string[]): Promise<void> {
    if (Platform.OS !== 'android' || !AppBlockerModule) {
      console.log('App blocker only available on Android');
      return;
    }

    try {
      await AppBlockerModule.startBlockingService(appPackages);
      console.log('✅ App blocker started for', appPackages.length, 'apps');
    } catch (error) {
      console.error('❌ Failed to start app blocker:', error);
      throw error;
    }
  }

  static async stopBlocking(): Promise<void> {
    if (Platform.OS !== 'android' || !AppBlockerModule) {
      return;
    }

    try {
      await AppBlockerModule.stopBlockingService();
      console.log('✅ App blocker stopped');
    } catch (error) {
      console.error('❌ Failed to stop app blocker:', error);
      throw error;
    }
  }

  static async openAccessibilitySettings(): Promise<void> {
    if (Platform.OS !== 'android' || !AppBlockerModule) {
      return;
    }

    try {
      await AppBlockerModule.openAccessibilitySettings();
    } catch (error) {
      console.error('❌ Failed to open settings:', error);
      throw error;
    }
  }

  static async isAccessibilityEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android' || !AppBlockerModule) {
      return false;
    }

    try {
      return await AppBlockerModule.isAccessibilityEnabled();
    } catch (error) {
      console.error('❌ Failed to check accessibility:', error);
      return false;
    }
  }
}

// Common app package names for blocking
export const COMMON_APPS = {
  INSTAGRAM: 'com.instagram.android',
  FACEBOOK: 'com.facebook.katana',
  TIKTOK: 'com.zhiliaoapp.musically',
  YOUTUBE: 'com.google.android.youtube',
  TWITTER: 'com.twitter.android',
  SNAPCHAT: 'com.snapchat.android',
  WHATSAPP: 'com.whatsapp',
  TELEGRAM: 'org.telegram.messenger',
  REDDIT: 'com.reddit.frontpage',
  NETFLIX: 'com.netflix.mediaclient',
};
