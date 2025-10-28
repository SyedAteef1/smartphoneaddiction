import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/theme';
import { VoiceNotifications } from '../../utils/voiceNotifications';
import { Ionicons } from '@expo/vector-icons';

interface MathQuizProps {
  onClose: () => void;
}

export const MathQuiz: React.FC<MathQuizProps> = ({ onClose }) => {
  const [question, setQuestion] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = () => {
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    
    let answer = 0;
    switch (operator) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '×': answer = num1 * num2; break;
    }

    const wrongAnswers = [
      answer + Math.floor(Math.random() * 5) + 1,
      answer - Math.floor(Math.random() * 5) - 1,
      answer + Math.floor(Math.random() * 10) + 5,
    ];

    const allOptions = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    setQuestion({ num1, num2, operator, answer });
    setOptions(allOptions);
  };

  const handleAnswer = async (selected: number) => {
    if (selected === question.answer) {
      const newScore = score + 10;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak % 5 === 0) {
        await VoiceNotifications.speak(`Amazing! ${newStreak} correct answers in a row!`, 'high');
      }
      Alert.alert('🎉 Correct!', `+10 points! Streak: ${newStreak}`, [{ text: 'Next', onPress: generateQuestion }]);
    } else {
      setStreak(0);
      Alert.alert('❌ Wrong', `Correct answer: ${question.answer}`, [{ text: 'Try Again', onPress: generateQuestion }]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={32} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Quick Math 🔢</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.streakBadge}>
        <Ionicons name="flame" size={20} color={Colors.warning} />
        <Text style={styles.streakText}>Streak: {streak}</Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>
          {question.num1} {question.operator} {question.num2} = ?
        </Text>
      </View>

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

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>💡 Math Tips:</Text>
        <Text style={styles.tipText}>• Take your time to think</Text>
        <Text style={styles.tipText}>• Practice makes perfect</Text>
        <Text style={styles.tipText}>• Build your streak for bonus points!</Text>
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
  score: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.warning,
    marginLeft: 6,
  },
  questionContainer: {
    backgroundColor: Colors.primary,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  question: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  optionButton: {
    width: '48%',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tips: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
});
