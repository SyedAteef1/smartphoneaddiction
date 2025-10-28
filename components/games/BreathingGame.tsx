import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface BreathingGameProps {
  onClose: () => void;
}

export const BreathingGame: React.FC<BreathingGameProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [scaleAnim] = useState(new Animated.Value(1));
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const breathCycle = () => {
      // Inhale
      setPhase('inhale');
      Animated.timing(scaleAnim, {
        toValue: 2,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        // Hold
        setPhase('hold');
        setTimeout(() => {
          // Exhale
          setPhase('exhale');
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }).start(() => {
            setCycles(c => c + 1);
          });
        }, 2000);
      });
    };

    breathCycle();
    const interval = setInterval(breathCycle, 10000);
    return () => clearInterval(interval);
  }, [isActive]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={32} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Calm Breathing 🧘</Text>
        <Text style={styles.cycles}>{cycles} cycles</Text>
      </View>

      <Text style={styles.instruction}>
        Follow the circle to breathe deeply and relax your mind
      </Text>

      <View style={styles.breathingContainer}>
        <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]} />
        <Text style={styles.phaseText}>{getPhaseText()}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isActive && styles.buttonActive]}
        onPress={() => setIsActive(!isActive)}
      >
        <Text style={styles.buttonText}>{isActive ? 'Pause' : 'Start Breathing'}</Text>
      </TouchableOpacity>

      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>Benefits:</Text>
        <Text style={styles.benefitItem}>✨ Reduces stress and anxiety</Text>
        <Text style={styles.benefitItem}>🧠 Improves focus and clarity</Text>
        <Text style={styles.benefitItem}>😌 Promotes relaxation</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  cycles: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  instruction: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  phaseText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonActive: {
    backgroundColor: Colors.danger,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefits: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
});
