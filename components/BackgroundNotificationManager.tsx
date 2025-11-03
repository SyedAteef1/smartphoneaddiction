import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { VoiceNotifications } from '../utils/voiceNotifications';

export const BackgroundNotificationManager = () => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: string) => {
    if (nextAppState === 'active') {
      try {
        await VoiceNotifications.onMorningGreeting();
      } catch (e) {
        console.log('Voice notification skipped');
      }
    }
  };

  return null;
};
