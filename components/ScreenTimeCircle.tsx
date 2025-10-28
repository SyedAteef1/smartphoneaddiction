import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface ScreenTimeCircleProps {
  timeSpent: number;
  limit: number;
}

export const ScreenTimeCircle: React.FC<ScreenTimeCircleProps> = ({ timeSpent, limit }) => {
  const percentage = Math.min((timeSpent / limit) * 100, 100);
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage < 50) return Colors.success;
    if (percentage < 80) return Colors.warning;
    return Colors.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <View style={[styles.progressRing, { borderColor: getColor(), borderWidth: strokeWidth }]}>
          <View style={styles.innerCircle}>
            <Text style={styles.timeText}>{timeSpent}</Text>
            <Text style={styles.minutesText}>minutes</Text>
            <Text style={styles.limitText}>of {limit}m</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
  },
  minutesText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  limitText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
});
