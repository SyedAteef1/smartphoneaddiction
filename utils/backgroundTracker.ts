import { NativeModules, Platform } from 'react-native';

const { UsageTrackerModule } = NativeModules;

export const BackgroundTracker = {
  start: async () => {
    if (Platform.OS === 'android') {
      try {
        const { startService } = require('react-native').NativeModules;
        // Start the background service
        await UsageTrackerModule?.startTracking();
      } catch (e) {
        console.error('Failed to start background tracker:', e);
      }
    }
  },

  stop: async () => {
    if (Platform.OS === 'android') {
      try {
        await UsageTrackerModule?.stopTracking();
      } catch (e) {
        console.error('Failed to stop background tracker:', e);
      }
    }
  },
};
