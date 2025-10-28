import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';
import { AppUsage } from '../hooks/useAppUsage';

interface AppUsageItemProps {
  app: AppUsage;
  totalTime: number;
}

export const AppUsageItem: React.FC<AppUsageItemProps> = ({ app, totalTime }) => {
  const percentage = totalTime > 0 ? (app.timeSpent / totalTime) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{app.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{app.name}</Text>
          <Text style={styles.time}>{app.timeSpent} minutes</Text>
        </View>
        <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${percentage}%`, backgroundColor: app.color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  time: {
    fontSize: 13,
    color: Colors.textLight,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 3,
  },
});
