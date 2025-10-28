import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { Colors } from '../constants/theme';
import { Card } from './ui/Card';
import { useRealTimeUsage } from '../hooks/useRealTimeUsage';
import { Ionicons } from '@expo/vector-icons';

export const RealTimeUsageDisplay: React.FC = () => {
  const {
    usageStats,
    hasPermission,
    isTracking,
    getTotalScreenTime,
    getTopApps,
    getCurrentApp,
  } = useRealTimeUsage();

  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!hasPermission) {
    return (
      <Card style={styles.noPermissionCard}>
        <Ionicons name="lock-closed" size={32} color={Colors.textLight} />
        <Text style={styles.noPermissionText}>
          Enable Usage Access for Real-Time Tracking
        </Text>
      </Card>
    );
  }

  const totalTime = getTotalScreenTime();
  const topApps = getTopApps(5);
  const currentApp = getCurrentApp();
  const totalAppsUsed = Object.keys(usageStats).length;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Live Status Indicator */}
      <View style={styles.liveHeader}>
        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
        <Text style={styles.liveText}>LIVE</Text>
        <Text style={styles.liveSubtext}>
          {isTracking ? 'Tracking active' : 'Tracking paused'}
        </Text>
      </View>

      {/* Current App */}
      {currentApp && (
        <Card style={styles.currentAppCard}>
          <View style={styles.currentAppHeader}>
            <Ionicons name="phone-portrait" size={24} color={Colors.primary} />
            <Text style={styles.currentAppLabel}>Currently Active</Text>
          </View>
          <Text style={styles.currentAppName}>{currentApp.name}</Text>
          <Text style={styles.currentAppTime}>
            {formatTime(currentApp.totalTime)}
          </Text>
        </Card>
      )}

      {/* Total Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="time" size={28} color="#667eea" />
          <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
          <Text style={styles.statLabel}>Total Today</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="apps" size={28} color="#764ba2" />
          <Text style={styles.statValue}>{totalAppsUsed}</Text>
          <Text style={styles.statLabel}>Apps Used</Text>
        </Card>
      </View>

      {/* Top Apps List */}
      {topApps.length > 0 && (
        <Card style={styles.topAppsCard}>
          <Text style={styles.topAppsTitle}>📊 Top Apps Right Now</Text>
          {topApps.map((app, index) => (
            <View key={app.packageName} style={styles.appItem}>
              <View style={styles.appRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName} numberOfLines={1}>
                  {app.name}
                </Text>
                <View style={styles.appTimeBar}>
                  <View 
                    style={[
                      styles.appTimeBarFill,
                      { 
                        width: `${(app.totalTime / topApps[0].totalTime) * 100}%`,
                        backgroundColor: getAppColor(index)
                      }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.appTime}>
                {formatTime(app.totalTime)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Real-Time Updates Info */}
      <View style={styles.updateInfo}>
        <Ionicons name="sync" size={14} color={Colors.textLight} />
        <Text style={styles.updateText}>
          Updates every 5 seconds
        </Text>
      </View>
    </View>
  );
};

const getAppColor = (index: number): string => {
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4ECDC4', '#FF6B6B'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger,
    marginRight: 8,
  },
  liveText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.danger,
    marginRight: 12,
  },
  liveSubtext: {
    fontSize: 12,
    color: Colors.textLight,
  },
  currentAppCard: {
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  currentAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentAppLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  currentAppName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 4,
  },
  currentAppTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  topAppsCard: {
    marginBottom: 16,
  },
  topAppsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
  },
  appInfo: {
    flex: 1,
    marginRight: 12,
  },
  appName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  appTimeBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  appTimeBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  appTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 60,
    textAlign: 'right',
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  updateText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  noPermissionCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noPermissionText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 12,
    textAlign: 'center',
  },
});


