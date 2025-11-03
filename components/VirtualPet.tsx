import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { VoiceNotifications } from '../utils/voiceNotifications';

interface VirtualPetProps {
  timeSpent: number;
  limit: number;
}

export const VirtualPet: React.FC<VirtualPetProps> = ({ timeSpent, limit }) => {
  const [bounceAnim] = useState(new Animated.Value(0));
  const [lastMood, setLastMood] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const percentage = (timeSpent / limit) * 100;

  useEffect(() => {
    setCurrentPercentage(percentage);
  }, [timeSpent, limit, percentage]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getPetState = () => {
    if (percentage < 50) {
      return {
        emoji: '😺',
        mood: 'happy',
        moodText: 'Very Happy!',
        message: 'Great job! I love when you use your time wisely!',
        color: Colors.success,
        bg: '#E8F5E9',
      };
    } else if (percentage < 80) {
      return {
        emoji: '😸',
        mood: 'okay',
        moodText: 'Happy',
        message: 'You\'re doing well! Let\'s take a break soon.',
        color: Colors.warning,
        bg: '#FFF9E6',
      };
    } else if (percentage < 100) {
      return {
        emoji: '😿',
        mood: 'worried',
        moodText: 'Worried',
        message: 'I\'m getting worried... Please finish up soon!',
        color: Colors.warning,
        bg: '#FFF3E0',
      };
    } else {
      return {
        emoji: '😾',
        mood: 'sad',
        moodText: 'Very Sad',
        message: 'I\'m so sad... You\'ve used too much screen time!',
        color: Colors.danger,
        bg: '#FFEBEE',
      };
    }
  };

  const petState = getPetState();

  useEffect(() => {
    if (petState.mood !== lastMood && lastMood !== '') {
      VoiceNotifications.onPetInteraction(petState.mood);
    }
    setLastMood(petState.mood);
  }, [petState.mood]);

  return (
    <View style={[styles.container, { backgroundColor: petState.bg }]}>
      <TouchableOpacity onPress={() => VoiceNotifications.onPetInteraction(petState.mood)}>
        <Animated.View style={[styles.petContainer, { transform: [{ translateY: bounceAnim }] }]}>
          <Text style={styles.petEmoji}>{petState.emoji}</Text>
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={[styles.mood, { color: petState.color }]}>{petState.moodText}</Text>
        <Text style={styles.message}>{petState.message}</Text>
      </View>
      <View style={styles.healthBar}>
        <View style={styles.healthBarBg}>
          <View 
            style={[
              styles.healthBarFill, 
              { 
                width: `${Math.max(0, 100 - percentage)}%`,
                backgroundColor: petState.color 
              }
            ]} 
          />
        </View>
        <Text style={styles.healthText}>Pet Health: {Math.max(0, 100 - Math.floor(percentage))}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  petContainer: {
    marginBottom: 16,
  },
  petEmoji: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mood: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  healthBar: {
    width: '100%',
    alignItems: 'center',
  },
  healthBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
});
