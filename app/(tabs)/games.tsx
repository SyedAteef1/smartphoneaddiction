import React, { useState, useEffect } from 'react';
import { VoiceNotifications } from '../../utils/voiceNotifications';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { BackButton } from '../../components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { MemoryGame } from '../../components/games/MemoryGame';
import { BreathingGame } from '../../components/games/BreathingGame';
import { MathQuiz } from '../../components/games/MathQuiz';

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // Stop voice when leaving games page
  useEffect(() => {
    return () => {
      VoiceNotifications.stopSpeaking();
    };
  }, []);

  const games = [
    {
      id: 'memory',
      title: 'Memory Match',
      icon: '🧠',
      description: 'Match pairs of emojis to improve memory and concentration',
      benefit: 'Enhances memory & focus',
      color: '#FF6B6B',
    },
    {
      id: 'breathing',
      title: 'Calm Breathing',
      icon: '🧘',
      description: 'Follow the breathing circle to relax and reduce stress',
      benefit: 'Reduces anxiety & stress',
      color: '#4ECDC4',
    },
    {
      id: 'math',
      title: 'Quick Math',
      icon: '🔢',
      description: 'Solve fun math problems to sharpen your brain',
      benefit: 'Improves problem-solving',
      color: '#FFE66D',
    },
  ];

  return (
    <LinearGradient colors={['#e0c3fc', '#8ec5fc']} style={styles.gradient}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mindful Games</Text>
          <Text style={styles.subtitle}>Take a break and play something healthy!</Text>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="bulb" size={24} color={Colors.warning} />
            <Text style={styles.infoTitle}>Why Play These Games?</Text>
          </View>
          <Text style={styles.infoText}>
            These games help you relax, learn, and stay mentally healthy instead of endless scrolling!
          </Text>
        </Card>

        {games.map((game) => (
          <TouchableOpacity key={game.id} onPress={() => setActiveGame(game.id)}>
            <Card style={styles.gameCard}>
              <View style={[styles.gameIcon, { backgroundColor: game.color }]}>
                <Text style={styles.gameEmoji}>{game.icon}</Text>
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                <View style={styles.benefitBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.benefitText}>{game.benefit}</Text>
                </View>
              </View>
              <Ionicons name="play-circle" size={32} color={game.color} />
            </Card>
          </TouchableOpacity>
        ))}

        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Benefits of Mindful Gaming</Text>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>✨</Text>
            <Text style={styles.statText}>Reduces screen addiction</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🧠</Text>
            <Text style={styles.statText}>Improves cognitive skills</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>😌</Text>
            <Text style={styles.statText}>Promotes relaxation</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statText}>Educational & fun</Text>
          </View>
        </Card>

        <BackButton />
      </ScrollView>

      <Modal 
        visible={activeGame === 'memory'} 
        animationType="slide"
        onRequestClose={() => {
          VoiceNotifications.stopSpeaking();
          setActiveGame(null);
        }}
      >
        <MemoryGame onClose={() => {
          VoiceNotifications.stopSpeaking();
          setActiveGame(null);
        }} />
      </Modal>

      <Modal 
        visible={activeGame === 'breathing'} 
        animationType="slide"
        onRequestClose={() => {
          VoiceNotifications.stopSpeaking();
          setActiveGame(null);
        }}
      >
        <BreathingGame onClose={() => {
          VoiceNotifications.stopSpeaking();
          setActiveGame(null);
        }} />
      </Modal>

      <Modal 
        visible={activeGame === 'math'} 
        animationType="slide"
        onRequestClose={() => {
          VoiceNotifications.stopSpeaking();
          setActiveGame(null);
        }}
      >
        <MathQuiz onClose={() => {
          VoiceNotifications.stopSpeaking();
          setActiveGame(null);
        }} />
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  gameCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameEmoji: {
    fontSize: 32,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 6,
  },
  benefitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  statText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
