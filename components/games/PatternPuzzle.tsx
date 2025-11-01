import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { VoiceNotifications } from '../../utils/voiceNotifications';

interface PatternPuzzleProps {
  onClose: () => void;
}

type PatternType = 'shapes' | 'colors' | 'numbers';

const shapes = ['●', '■', '▲', '◆', '★'];
const colors = ['🔴', '🔵', '🟢', '🟡', '🟣'];
const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

export const PatternPuzzle: React.FC<PatternPuzzleProps> = ({ onClose }) => {
  const [pattern, setPattern] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generatePattern();
  }, [level]);

  const generatePattern = () => {
    const types: PatternType[] = ['shapes', 'colors', 'numbers'];
    const patternType = types[Math.floor(Math.random() * types.length)];
    
    let items: string[];
    switch (patternType) {
      case 'shapes': items = shapes; break;
      case 'colors': items = colors; break;
      case 'numbers': items = numbers; break;
    }

    // Generate different pattern types based on level
    if (level <= 3) {
      // Simple repeating pattern: A, B, A, B, ?
      const a = items[Math.floor(Math.random() * items.length)];
      const b = items.filter(i => i !== a)[Math.floor(Math.random() * (items.length - 1))];
      const seq = [a, b, a, b];
      setPattern(seq);
      setCorrectAnswer(a);
    } else if (level <= 6) {
      // Three-part pattern: A, B, C, A, B, C, A, ?
      const a = items[Math.floor(Math.random() * items.length)];
      const remaining = items.filter(i => i !== a);
      const b = remaining[Math.floor(Math.random() * remaining.length)];
      const c = items.filter(i => i !== a && i !== b)[Math.floor(Math.random() * (items.length - 2))];
      const seq = [a, b, c, a, b, c, a];
      setPattern(seq);
      setCorrectAnswer(b);
    } else {
      // Complex growing pattern: A, A, B, A, A, B, B, ?
      const a = items[Math.floor(Math.random() * items.length)];
      const b = items.filter(i => i !== a)[Math.floor(Math.random() * (items.length - 1))];
      const seq = [a, a, b, a, a, b, b];
      setPattern(seq);
      setCorrectAnswer(b);
    }

    // Generate options including the correct answer
    const wrongOptions = items.filter(i => i !== correctAnswer).slice(0, 3);
    const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

  const handleAnswer = async (selected: string) => {
    if (selected === correctAnswer) {
      const newScore = score + (level * 10);
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setLevel(level + 1);
      
      if (newStreak % 3 === 0) {
        await VoiceNotifications.speak(`Brilliant! Level ${level + 1} unlocked!`, 'high');
      }
      
      Alert.alert(
        '🎯 Correct!', 
        `+${level * 10} points! Level ${level + 1}`, 
        [{ text: 'Next Pattern', onPress: () => {} }]
      );
    } else {
      setStreak(0);
      const lost = Math.max(0, score - 10);
      setScore(lost);
      Alert.alert(
        '❌ Not Quite', 
        `Correct answer: ${correctAnswer}\nThink about the pattern!`, 
        [{ text: 'Try Again', onPress: generatePattern }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={32} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pattern Puzzle 🧩</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.levelBadge}>
        <Ionicons name="trophy" size={20} color="#FFD700" />
        <Text style={styles.levelText}>Level {level}</Text>
      </View>

      <View style={styles.streakBadge}>
        <Ionicons name="flash" size={16} color={Colors.success} />
        <Text style={styles.streakText}>Streak: {streak}</Text>
      </View>

      <Text style={styles.instruction}>What comes next in this pattern?</Text>

      <View style={styles.patternContainer}>
        {pattern.map((item, index) => (
          <View key={index} style={styles.patternItem}>
            <Text style={styles.patternText}>{item}</Text>
          </View>
        ))}
        <View style={[styles.patternItem, styles.questionMark]}>
          <Text style={styles.patternText}>?</Text>
        </View>
      </View>

      <Text style={styles.optionsTitle}>Choose the next item:</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>🧠 Brain Benefits:</Text>
        <Text style={styles.benefitText}>✓ Improves pattern recognition</Text>
        <Text style={styles.benefitText}>✓ Enhances logical thinking</Text>
        <Text style={styles.benefitText}>✓ Boosts problem-solving skills</Text>
        <Text style={styles.benefitText}>✓ Develops spatial reasoning</Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  score: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 4,
  },
  instruction: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  patternContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  patternItem: {
    width: 60,
    height: 60,
    backgroundColor: Colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  questionMark: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  patternText: {
    fontSize: 32,
    color: Colors.text,
  },
  optionsTitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    width: 70,
    height: 70,
    backgroundColor: Colors.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionText: {
    fontSize: 32,
  },
  benefits: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
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

