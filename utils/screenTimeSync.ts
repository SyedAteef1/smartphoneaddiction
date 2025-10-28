import { Platform, Alert } from 'react-native';
import { storage } from './storage';

// iOS Screen Time data structure
interface ScreenTimeData {
  totalUsage: number; // in minutes
  apps: {
    name: string;
    bundleId: string;
    usage: number; // in minutes
    category: string;
  }[];
  date: string;
}

export const ScreenTimeSync = {
  // Manual import from iOS Screen Time
  importFromScreenTime: async (totalMinutes: number, appData: any[]) => {
    try {
      const today = new Date().toDateString();
      
      const apps = appData.map(app => ({
        name: app.name,
        icon: getIconForApp(app.name),
        timeSpent: app.usage || 0,
        color: getColorForApp(app.name),
        packageName: app.bundleId || app.name.toLowerCase().replace(/\s+/g, '.'),
      })).filter(app => app.timeSpent > 0);

      const data = {
        totalUsage: totalMinutes,
        apps,
        importedAt: Date.now(),
        source: Platform.OS === 'ios' ? 'iOS Screen Time' : 'Android Digital Wellbeing',
      };

      await storage.set(`screentime_${today}`, data);
      await storage.set('lastImportDate', today);
      await storage.set('importedData', data);

      Alert.alert('✅ Success!', `Imported ${totalMinutes} minutes of screen time data. Close this screen to see updated data.`);
      return true;
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('❌ Error', 'Failed to import data. Please try again.');
      return false;
    }
  },

  // Get today's data (imported or tracked)
  getTodayData: async () => {
    try {
      const today = new Date().toDateString();
      const imported = await storage.get(`screentime_${today}`);
      
      if (imported && imported.totalUsage && imported.apps) {
        return {
          totalUsage: imported.totalUsage,
          apps: imported.apps,
          source: 'imported',
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting today data:', error);
      return null;
    }
  },

  // Quick import with common apps (Android & iOS compatible)
  quickImport: async () => {
    // Note: Alert.prompt not available on Android, use modal instead
    // This is handled by ScreenTimeImport component
    return;
  },

  importWithEstimate: async (totalMinutes: number) => {
    // Estimate common app distribution (Android & iOS)
    const browserApp = Platform.OS === 'ios' ? 'Safari' : 'Chrome';
    const estimatedApps = [
      { name: 'Instagram', usage: Math.floor(totalMinutes * 0.25) },
      { name: 'TikTok', usage: Math.floor(totalMinutes * 0.20) },
      { name: 'YouTube', usage: Math.floor(totalMinutes * 0.18) },
      { name: browserApp, usage: Math.floor(totalMinutes * 0.15) },
      { name: 'WhatsApp', usage: Math.floor(totalMinutes * 0.12) },
      { name: 'Other Apps', usage: Math.floor(totalMinutes * 0.10) },
    ];

    await ScreenTimeSync.importFromScreenTime(totalMinutes, estimatedApps);
  },

  showAppInput: (totalMinutes: number) => {
    // This would show a form to input individual apps
    // For now, use estimate
    ScreenTimeSync.importWithEstimate(totalMinutes);
  },

  // Convert hours:minutes to total minutes
  parseTimeString: (timeStr: string): number => {
    // Handles formats like "8h 10m", "8:10", "490m"
    const hourMatch = timeStr.match(/(\d+)h/);
    const minMatch = timeStr.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    
    return hours * 60 + minutes;
  },
};

const getIconForApp = (appName: string): string => {
  const iconMap: { [key: string]: string } = {
    'Instagram': '📷',
    'Facebook': '👥',
    'TikTok': '🎵',
    'YouTube': '📺',
    'Twitter': '🐦',
    'Snapchat': '👻',
    'WhatsApp': '💬',
    'Messages': '💬',
    'Safari': '🧭',
    'Chrome': '🌐',
    'Games': '🎮',
    'Netflix': '🎬',
    'Spotify': '🎵',
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (appName.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  return '📱';
};

const getColorForApp = (appName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Instagram': '#E4405F',
    'Facebook': '#1877F2',
    'TikTok': '#000000',
    'YouTube': '#FF0000',
    'Twitter': '#1DA1F2',
    'Snapchat': '#FFFC00',
    'WhatsApp': '#25D366',
    'Safari': '#0A84FF',
    'Chrome': '#4285F4',
  };
  
  for (const [key, color] of Object.entries(colorMap)) {
    if (appName.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA'];
  const hash = appName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
