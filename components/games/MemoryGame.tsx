import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/theme';
import { VoiceNotifications } from '../../utils/voiceNotifications';
import { Ionicons } from '@expo/vector-icons';

interface MemoryGameProps {
  onClose: () => void;
}

const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

export const MemoryGame: React.FC<MemoryGameProps> = ({ onClose }) => {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const shuffled = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardPress = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setTimeout(() => {
            VoiceNotifications.onGameCompleted('Memory Match', moves + 1);
            Alert.alert('🎉 You Won!', `Completed in ${moves + 1} moves!`, [{ text: 'Play Again', onPress: initGame }]);
          }, 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={32} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Memory Match 🧠</Text>
        <Text style={styles.moves}>Moves: {moves}</Text>
      </View>

      <Text style={styles.instruction}>Match all pairs of emojis!</Text>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, (flipped.includes(index) || matched.includes(index)) && styles.cardFlipped]}
            onPress={() => handleCardPress(index)}
          >
            <Text style={styles.cardText}>
              {flipped.includes(index) || matched.includes(index) ? card : '?'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={initGame}>
        <Text style={styles.resetText}>Reset Game</Text>
      </TouchableOpacity>
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
  moves: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  instruction: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  card: {
    width: 70,
    height: 70,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cardText: {
    fontSize: 32,
    color: '#fff',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
