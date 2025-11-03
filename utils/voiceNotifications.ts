import * as Speech from 'expo-speech';
import * as SMS from 'expo-sms';
import { storage } from './storage';
import { Platform, NativeModules, AppState } from 'react-native';

const { NotificationModule } = NativeModules;

interface VoiceSettings {
  enabled: boolean;
  pitch: number;
  rate: number;
  language: string;
}

let lastNotificationTime: { [key: string]: number } = {};
let breakReminderInterval: NodeJS.Timeout | null = null;

export const VoiceNotifications = {
  // Core speech function
  speak: async (message: string, priority: 'low' | 'normal' | 'high' = 'normal') => {
    const settings = await VoiceNotifications.getSettings();
    if (!settings.enabled) return;

    // Only speak if app is in foreground
    if (AppState.currentState === 'active') {
      const pitchMap = { low: 0.9, normal: 1.0, high: 1.1 };
      const rateMap = { low: 0.85, normal: 0.9, high: 0.95 };

      await Speech.speak(message, {
        language: settings.language,
        pitch: pitchMap[priority],
        rate: rateMap[priority],
      });
    }
  },

  // Show notification (works even when app is closed)
  showNotification: async (title: string, message: string) => {
    try {
      if (Platform.OS === 'android' && NotificationModule) {
        await NotificationModule.showNotification(title, message);
      }
    } catch (e) {
      // Silently fail if notification module not available
    }
  },

  stopSpeaking: () => {
    Speech.stop();
  },

  // Get voice settings
  getSettings: async (): Promise<VoiceSettings> => {
    const saved = await storage.get('voiceSettings');
    return saved || { enabled: true, pitch: 1.0, rate: 0.9, language: 'en-US' };
  },

  // Update voice settings
  updateSettings: async (settings: Partial<VoiceSettings>) => {
    const current = await VoiceNotifications.getSettings();
    await storage.set('voiceSettings', { ...current, ...settings });
  },

  // Prevent duplicate notifications within time window
  shouldNotify: (key: string, cooldownMs: number = 60000): boolean => {
    const now = Date.now();
    const last = lastNotificationTime[key] || 0;
    if (now - last < cooldownMs) return false;
    lastNotificationTime[key] = now;
    return true;
  },

  // Usage-based notifications
  checkAndNotify: async (timeSpent: number, limit: number) => {
    const percentage = (timeSpent / limit) * 100;
    const percentRounded = Math.round(percentage);
    
    if (percentage >= 50 && percentage < 60 && VoiceNotifications.shouldNotify('50percent', 300000)) {
      const msg = `You have used ${percentRounded}% of your daily screen time. Great job staying aware!`;
      await VoiceNotifications.speak(msg, 'normal');
      await VoiceNotifications.showNotification('Screen Time Alert', msg);
    } else if (percentage >= 75 && percentage < 85 && VoiceNotifications.shouldNotify('75percent', 300000)) {
      const msg = `You have used ${percentRounded}% of your daily limit. Consider wrapping up soon.`;
      await VoiceNotifications.speak(msg, 'normal');
      await VoiceNotifications.showNotification('Screen Time Warning', msg);
    } else if (percentage >= 90 && percentage < 100 && VoiceNotifications.shouldNotify('90percent', 180000)) {
      const remaining = Math.round(100 - percentage);
      const msg = `⚠️ Alert! You have used ${percentRounded}% of your screen time. Only ${remaining}% remaining. Please finish your activities.`;
      await VoiceNotifications.speak(msg, 'high');
      await VoiceNotifications.showNotification('⚠️ Screen Time Alert', msg);
    } else if (percentage >= 100 && VoiceNotifications.shouldNotify('100percent', 300000)) {
      const exceeded = Math.round(percentage - 100);
      const msg = exceeded > 0 
        ? `🚫 You have exceeded your limit by ${exceeded}%! Time to take a break and do something else.`
        : `🚫 Daily screen time limit reached (100%)! Time to take a break and do something else.`;
      await VoiceNotifications.speak(msg, 'high');
      await VoiceNotifications.showNotification('🚫 Limit Exceeded', msg);
      await VoiceNotifications.alertParent(timeSpent, limit);
    }
  },

  // Interaction-based notifications
  onAppOpen: async (appName: string) => {
    if (VoiceNotifications.shouldNotify(`app_${appName}`, 1800000)) {
      await VoiceNotifications.speak(`Opening ${appName}. Remember to take breaks!`, 'low');
    }
  },

  onBreakStart: async (duration: number) => {
    await VoiceNotifications.speak(`Great choice! Starting a ${duration} minute break. Rest your eyes and stretch.`, 'normal');
  },

  onBreakEnd: async () => {
    await VoiceNotifications.speak('Break time is over. You can return to your activities now. Remember to stay mindful!', 'normal');
  },

  onPointsEarned: async (points: number, reason: string) => {
    if (points >= 50) {
      await VoiceNotifications.speak(`Awesome! You earned ${points} points for ${reason}. Keep up the great work!`, 'normal');
    }
  },

  onLevelUp: async (newLevel: number) => {
    await VoiceNotifications.speak(`Congratulations! You have reached level ${newLevel}! You are building amazing habits!`, 'high');
  },

  onBadgeUnlocked: async (badgeName: string) => {
    await VoiceNotifications.speak(`Achievement unlocked! You earned the ${badgeName} badge!`, 'high');
  },

  onLimitUpdated: async (newLimit: number) => {
    await VoiceNotifications.speak(`Daily limit updated to ${newLimit} minutes. Stay focused on your goals!`, 'normal');
  },

  onDailyGoalAchieved: async () => {
    await VoiceNotifications.speak('Amazing! You stayed under your daily limit. You earned bonus points!', 'high');
  },

  onAppBlocked: async (duration: number) => {
    await VoiceNotifications.speak(`Apps are now blocked for ${duration} minutes. Use this time for focused activities!`, 'normal');
  },

  onAppUnblocked: async () => {
    await VoiceNotifications.speak('Apps are now unblocked. Welcome back! Remember to use your time wisely.', 'normal');
  },

  onMorningGreeting: async (name: string = 'Champion') => {
    const hour = new Date().getHours();
    if (hour < 12 && VoiceNotifications.shouldNotify('morning', 86400000)) {
      await VoiceNotifications.speak(`Good morning, ${name}! Ready for a great day with healthy screen time habits?`, 'normal');
    }
  },

  onEveningReminder: async () => {
    const hour = new Date().getHours();
    if (hour >= 20 && VoiceNotifications.shouldNotify('evening', 86400000)) {
      await VoiceNotifications.speak('It is getting late. Consider reducing screen time before bed for better sleep.', 'normal');
    }
  },

  onRewardRedeemed: async (rewardName: string) => {
    await VoiceNotifications.speak(`Congratulations! You redeemed ${rewardName}. Enjoy your reward!`, 'high');
  },

  onGameCompleted: async (gameName: string, score: number) => {
    await VoiceNotifications.speak(`Great job completing ${gameName}! You scored ${score} points.`, 'normal');
  },

  onPetInteraction: async (mood: string) => {
    const messages = {
      happy: 'Your pet is very happy! Keep up the good screen time habits!',
      okay: 'Your pet is doing okay. Try to take more breaks to make them happier!',
      worried: 'Your pet is getting worried. You are using a lot of screen time today.',
      sad: 'Your pet is sad. You have exceeded your limit. Time to take a break!'
    };
    if (VoiceNotifications.shouldNotify(`pet_${mood}`, 600000)) {
      await VoiceNotifications.speak(messages[mood as keyof typeof messages] || messages.okay, 'normal');
    }
  },

  // Parent alert
  alertParent: async (timeSpent: number, limit: number) => {
    const parentPhone = await storage.get('parentPhone');
    
    if (parentPhone) {
      const message = `⚠️ ALERT: Your child has exceeded their daily screen time limit. Used: ${timeSpent} minutes, Limit: ${limit} minutes.`;
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync([parentPhone], message);
      }
    }
  },

  // Break reminder system
  scheduleBreakReminder: async (intervalMinutes: number = 30) => {
    if (breakReminderInterval) {
      clearInterval(breakReminderInterval);
    }
    
    breakReminderInterval = setInterval(() => {
      VoiceNotifications.speak('Time for a break! Rest your eyes and stretch for a few minutes.', 'normal');
    }, intervalMinutes * 60000);
  },

  stopBreakReminder: () => {
    if (breakReminderInterval) {
      clearInterval(breakReminderInterval);
      breakReminderInterval = null;
    }
  },

  // Motivational messages
  getMotivationalMessage: async () => {
    const messages = [
      'You are doing great! Keep building healthy habits!',
      'Remember, balance is key. Take breaks and stay active!',
      'Your future self will thank you for these good habits!',
      'Every minute of mindful screen time counts!',
      'You are in control of your digital wellbeing!'
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    await VoiceNotifications.speak(message, 'normal');
  },
};
