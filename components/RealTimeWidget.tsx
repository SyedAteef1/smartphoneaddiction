import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { useRealTimeUsage } from '../hooks/useRealTimeUsage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface RealTimeWidgetProps {
  compact?: boolean;
}

export const RealTimeWidget: React.FC<RealTimeWidgetProps> = ({ compact = false }) => {
  const router = useRouter();
  const {
    hasPermission,
    isTracking,
    getTotalScreenTime,
    getCurrentApp,
    getTopApps,
  } = useRealTimeUsage();

  const [pulseAnim] = useState(new Animated.Value(1));
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(getTotalScreenTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [getTotalScreenTime]);

  useEffect(() => {
    // Pulse animation
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isTracking]);

  if (!hasPermission) {
    return null;
  }

  const currentApp = getCurrentApp();
  const topApps = getTopApps(3);
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handlePress = () => {
    router.push('/(tabs)/realtime');
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={handlePress}>
        <View style={styles.compactHeader}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.compactTitle}>LIVE</Text>
        </View>
        <Text style={styles.compactTime}>{formatTime(currentTime)}</Text>
        {currentApp && (
          <Text style={styles.compactApp} numberOfLines={1}>
            {currentApp.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.headerTitle}>Real-Time Usage</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </View>

      <View style={styles.content}>
        <View style={styles.mainStat}>
          <Ionicons name="time-outline" size={32} color={Colors.primary} />
          <Text style={styles.mainTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.mainLabel}>Total Today</Text>
        </View>

        {currentApp && (
          <View style={styles.currentAppBadge}>
            <Ionicons name="phone-portrait" size={16} color={Colors.success} />
            <Text style={styles.currentAppText} numberOfLines={1}>
              Now: {currentApp.name}
            </Text>
          </View>
        )}

        {topApps.length > 0 && (
          <View style={styles.miniList}>
            {topApps.map((app, index) => (
              <View key={app.packageName} style={styles.miniItem}>
                <View style={styles.miniRank}>
                  <Text style={styles.miniRankText}>{index + 1}</Text>
                </View>
                <Text style={styles.miniAppName} numberOfLines={1}>
                  {app.name}
                </Text>
                <Text style={styles.miniTime}>
                  {formatTime(app.totalTime)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Ionicons name="sync" size={12} color={Colors.textLight} />
        <Text style={styles.footerText}>Updates every 5s • Tap for details</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
    minWidth: 120,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.danger,
    letterSpacing: 1,
  },
  compactTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  compactApp: {
    fontSize: 10,
    color: Colors.textLight,
  },
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    marginBottom: 12,
  },
  mainStat: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  mainTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  mainLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  currentAppBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentAppText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.success,
    marginLeft: 6,
    flex: 1,
  },
  miniList: {
    gap: 8,
  },
  miniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  miniRank: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  miniRankText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
  },
  miniAppName: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    marginRight: 8,
  },
  miniTime: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textLight,
    marginLeft: 4,
  },
});


