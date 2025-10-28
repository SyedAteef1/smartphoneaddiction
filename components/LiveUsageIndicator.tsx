import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/theme';
import { RealTimeTracker } from '../utils/realTimeTracker';
import { useRealTimeUsage } from '../hooks/useRealTimeUsage';
import { Ionicons } from '@expo/vector-icons';

export const LiveUsageIndicator: React.FC = () => {
  const [currentApp, setCurrentApp] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const { hasPermission, getCurrentApp, getTotalScreenTime } = useRealTimeUsage();

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
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

  useEffect(() => {
    const interval = setInterval(() => {
      // Try to get real-time data first
      if (hasPermission) {
        const realCurrentApp = getCurrentApp();
        if (realCurrentApp) {
          setCurrentApp(realCurrentApp.name);
          const duration = Math.floor(realCurrentApp.totalTime);
          setSessionTime(duration);
          return;
        }
      }
      
      // Fallback to RealTimeTracker
      if (RealTimeTracker.currentSession) {
        setCurrentApp(RealTimeTracker.currentSession.appName);
        const duration = Math.floor((Date.now() - RealTimeTracker.currentSession.startTime) / 1000);
        setSessionTime(duration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasPermission, getCurrentApp]);

  if (!currentApp) return null;

  const minutes = Math.floor(sessionTime / 60);
  const seconds = sessionTime % 60;
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;

  const timeDisplay = hours > 0 
    ? `${hours}h ${displayMinutes}m`
    : `${minutes}m ${seconds}s`;

  return (
    <View style={styles.container}>
      <View style={styles.indicator}>
        <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
        <Ionicons name="radio-button-on" size={12} color={Colors.danger} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>LIVE NOW</Text>
        <Text style={styles.text} numberOfLines={1}>
          {currentApp}
        </Text>
        <Text style={styles.time}>{timeDisplay}</Text>
      </View>
      {hasPermission && (
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  indicator: {
    position: 'relative',
    marginRight: 12,
    width: 12,
    height: 12,
  },
  pulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.danger,
    opacity: 0.3,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.danger,
    letterSpacing: 1,
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
  },
  badge: {
    marginLeft: 8,
  },
});
