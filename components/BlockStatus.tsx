import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { Card } from './ui/Card';
import { AppBlocker } from '../utils/appBlocker';
import { Ionicons } from '@expo/vector-icons';

export const BlockStatus: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    setIsBlocked(AppBlocker.isBlocked);
    if (AppBlocker.isBlocked) {
      const remaining = await AppBlocker.getRemainingBreakTime();
      setRemainingTime(remaining);
      if (remaining === 0) {
        await AppBlocker.checkBreakComplete();
        setIsBlocked(false);
      }
    }
  };

  if (!isBlocked) return null;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={32} color={Colors.danger} />
        <Text style={styles.title}>Apps Blocked</Text>
      </View>
      <Text style={styles.message}>
        You've reached 90% of your daily limit. Take a break to unlock apps.
      </Text>
      {remainingTime > 0 && (
        <View style={styles.timerContainer}>
          <Ionicons name="time" size={24} color={Colors.primary} />
          <Text style={styles.timer}>{remainingTime} minutes remaining</Text>
        </View>
      )}
      <View style={styles.suggestions}>
        <Text style={styles.suggestionTitle}>What you can do:</Text>
        <Text style={styles.suggestion}>🎮 Play mindful games</Text>
        <Text style={styles.suggestion}>📚 Read a book</Text>
        <Text style={styles.suggestion}>🏃 Go outside and play</Text>
        <Text style={styles.suggestion}>🎨 Draw or be creative</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.danger,
    marginLeft: 12,
  },
  message: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
  },
  suggestions: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
  },
});
