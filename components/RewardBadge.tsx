import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface RewardBadgeProps {
  title: string;
  icon: string;
  earned: boolean;
}

export const RewardBadge: React.FC<RewardBadgeProps> = ({ title, icon, earned }) => (
  <View style={[styles.container, !earned && styles.locked]}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  locked: {
    opacity: 0.4,
    borderColor: Colors.border,
  },
  icon: {
    fontSize: 32,
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});
