import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { VoiceNotifications } from '../../utils/voiceNotifications';

interface MindfulnessGardenProps {
  onClose: () => void;
}

type Activity = 'breathe' | 'gratitude' | 'affirmation' | 'meditation';

const affirmations = [
  "I am calm and peaceful 🌸",
  "I am doing my best today 🌟",
  "I am kind to myself and others 💚",
  "I am growing stronger every day 🌱",
  "I am grateful for this moment 🙏",
  "I am loved and I am enough 💖",
  "I choose happiness today 😊",
  "I am brave and capable 🦋",
];

const gratitudePrompts = [
  "Something that made you smile today",
  "A person you're thankful for",
  "A place you love to visit",
  "Something beautiful you saw",
  "A skill you're learning",
  "A favorite food or treat",
];

export const MindfulnessGarden: React.FC<MindfulnessGardenProps> = ({ onClose }) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [flowers, setFlowers] = useState<string[]>([]);
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [scale] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isBreathing) {
      startBreathingCycle();
    }
  }, [isBreathing, breathPhase]);

  const startBreathingCycle = () => {
    const durations = { in: 4000, hold: 2000, out: 4000 };
    
    Animated.sequence([
      Animated.timing(scale, {
        toValue: breathPhase === 'in' ? 1.5 : breathPhase === 'hold' ? 1.5 : 1,
        duration: durations[breathPhase],
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (isBreathing) {
        if (breathPhase === 'in') {
          setBreathPhase('hold');
        } else if (breathPhase === 'hold') {
          setBreathPhase('out');
        } else {
          setBreathPhase('in');
          setBreathCount(breathCount + 1);
          if (breathCount + 1 >= 5) {
            completeBreathing();
          }
        }
      }
    });
  };

  const startBreathing = async () => {
    setActivity('breathe');
    setIsBreathing(true);
    setBreathCount(0);
    setBreathPhase('in');
    await VoiceNotifications.speak('Let\'s take 5 deep breaths together. Breathe in...', 'low');
  };

  const completeBreathing = async () => {
    setIsBreathing(false);
    plantFlower('🌺');
    await VoiceNotifications.speak('Well done! You completed your breathing exercise!', 'high');
  };

  const showAffirmation = async () => {
    setActivity('affirmation');
    const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setCurrentAffirmation(affirmation);
    plantFlower('🌻');
    await VoiceNotifications.speak(affirmation.replace(/[🌸🌟💚🌱🙏💖😊🦋]/g, ''), 'normal');
  };

  const showGratitude = () => {
    setActivity('gratitude');
    const prompt = gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)];
    setCurrentPrompt(prompt);
    plantFlower('🌷');
  };

  const startMeditation = async () => {
    setActivity('meditation');
    plantFlower('🌼');
    await VoiceNotifications.speak('Close your eyes. Focus on the present moment. You are safe and peaceful.', 'low');
  };

  const plantFlower = (emoji: string) => {
    setFlowers([...flowers, emoji]);
  };

  const resetGarden = () => {
    setFlowers([]);
    setActivity(null);
    setBreathCount(0);
    setIsBreathing(false);
  };

  const getBreathText = () => {
    if (breathPhase === 'in') return 'Breathe In... 🌬️';
    if (breathPhase === 'hold') return 'Hold... 🤲';
    return 'Breathe Out... 😌';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={32} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Mindfulness Garden 🌸</Text>
        <TouchableOpacity onPress={resetGarden}>
          <Ionicons name="refresh" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.gardenContainer}>
        <Text style={styles.gardenTitle}>Your Peaceful Garden</Text>
        <View style={styles.garden}>
          {flowers.length === 0 ? (
            <Text style={styles.emptyGarden}>Complete activities to grow flowers! 🌱</Text>
          ) : (
            <View style={styles.flowersContainer}>
              {flowers.map((flower, index) => (
                <Text key={index} style={styles.flower}>{flower}</Text>
              ))}
            </View>
          )}
        </View>
        <Text style={styles.flowerCount}>🌸 {flowers.length} flowers grown</Text>
      </View>

      {!activity && (
        <>
          <Text style={styles.subtitle}>Choose a mindfulness activity:</Text>
          
          <TouchableOpacity style={[styles.activityCard, { backgroundColor: '#E3F2FD' }]} onPress={startBreathing}>
            <Text style={styles.activityIcon}>🌬️</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Breathing Exercise</Text>
              <Text style={styles.activityDesc}>Calm your mind with deep breaths</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.activityCard, { backgroundColor: '#FFF9E6' }]} onPress={showAffirmation}>
            <Text style={styles.activityIcon}>💭</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Positive Affirmation</Text>
              <Text style={styles.activityDesc}>Boost your confidence with kind words</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.activityCard, { backgroundColor: '#E8F5E9' }]} onPress={showGratitude}>
            <Text style={styles.activityIcon}>🙏</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Gratitude Moment</Text>
              <Text style={styles.activityDesc}>Think about what you're thankful for</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.activityCard, { backgroundColor: '#F3E5F5' }]} onPress={startMeditation}>
            <Text style={styles.activityIcon}>🧘</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Quick Meditation</Text>
              <Text style={styles.activityDesc}>Find peace in the present moment</Text>
            </View>
          </TouchableOpacity>
        </>
      )}

      {activity === 'breathe' && isBreathing && (
        <View style={styles.breathingContainer}>
          <Text style={styles.breathPhaseText}>{getBreathText()}</Text>
          <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]} />
          <Text style={styles.breathCounter}>Breath {breathCount + 1} of 5</Text>
        </View>
      )}

      {activity === 'affirmation' && (
        <View style={styles.activityResult}>
          <Text style={styles.affirmationText}>{currentAffirmation}</Text>
          <Text style={styles.affirmationSubtext}>Repeat this to yourself 3 times</Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => setActivity(null)}>
            <Text style={styles.doneButtonText}>Done ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {activity === 'gratitude' && (
        <View style={styles.activityResult}>
          <Text style={styles.promptTitle}>Think about:</Text>
          <Text style={styles.promptText}>"{currentPrompt}"</Text>
          <Text style={styles.promptSubtext}>Take a moment to appreciate it 💚</Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => setActivity(null)}>
            <Text style={styles.doneButtonText}>Done ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {activity === 'meditation' && (
        <View style={styles.activityResult}>
          <Text style={styles.meditationText}>🧘 Close your eyes</Text>
          <Text style={styles.meditationText}>🌟 Focus on now</Text>
          <Text style={styles.meditationText}>💫 You are peaceful</Text>
          <Text style={styles.meditationText}>💖 You are safe</Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => setActivity(null)}>
            <Text style={styles.doneButtonText}>Done ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>💚 Mental Health Benefits:</Text>
        <Text style={styles.benefitText}>✓ Reduces stress and anxiety</Text>
        <Text style={styles.benefitText}>✓ Improves emotional regulation</Text>
        <Text style={styles.benefitText}>✓ Boosts mood and positivity</Text>
        <Text style={styles.benefitText}>✓ Develops self-awareness</Text>
        <Text style={styles.benefitText}>✓ Enhances focus and calm</Text>
      </View>
    </ScrollView>
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
  gardenContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  gardenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  garden: {
    width: '100%',
    minHeight: 100,
    backgroundColor: '#C8E6C9',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGarden: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  flowersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  flower: {
    fontSize: 32,
  },
  flowerCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  activityDesc: {
    fontSize: 13,
    color: Colors.textLight,
  },
  breathingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  breathPhaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 30,
  },
  breathCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  breathCounter: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 30,
  },
  activityResult: {
    backgroundColor: Colors.card,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  affirmationText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  affirmationSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  promptSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  meditationText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  doneButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefits: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
  },
});

