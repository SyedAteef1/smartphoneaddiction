import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { RewardBadge } from '../../components/RewardBadge';
import { BackButton } from '../../components/BackButton';
import { useAppUsage } from '../../hooks/useAppUsage';
import { VoiceNotifications } from '../../utils/voiceNotifications';
import { useVoicePopup } from '../../hooks/useVoicePopup';
import { VoicePopup } from '../../components/VoicePopup';
import { Ionicons } from '@expo/vector-icons';

export default function Rewards() {
  const { points, totalTime, dailyLimit } = useAppUsage();
  const { popup, showSuccess, hidePopup } = useVoicePopup();
  const level = Math.floor(points / 100) + 1;
  const nextLevelPoints = level * 100;
  const progress = ((points % 100) / 100) * 100;
  const [previousLevel, setPreviousLevel] = useState(level);

  // Stop voice when leaving rewards page
  useEffect(() => {
    return () => {
      VoiceNotifications.stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (level > previousLevel) {
      VoiceNotifications.onLevelUp(level);
      setPreviousLevel(level);
    }
  }, [level]);

  const badges = [
    { title: 'First Day', icon: '🌟', earned: true },
    { title: 'Week Warrior', icon: '🏆', earned: true },
    { title: 'Time Master', icon: '⏰', earned: totalTime < dailyLimit },
    { title: 'Break Taker', icon: '☕', earned: false },
    { title: 'Book Lover', icon: '📚', earned: false },
    { title: 'Outdoor Hero', icon: '🌳', earned: false },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Rewards</Text>
        <Text style={styles.subtitle}>Keep up the great work!</Text>
      </View>

      <Card style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View>
            <Text style={styles.levelLabel}>Current Level</Text>
            <Text style={styles.levelValue}>Level {level}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>🎯</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{points} / {nextLevelPoints} points</Text>
        </View>
      </Card>

      <Card style={styles.pointsCard}>
        <Text style={styles.sectionTitle}>Earn Points</Text>
        <View style={styles.pointItem}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          <Text style={styles.pointText}>Stay under daily limit</Text>
          <Text style={styles.pointValue}>+50</Text>
        </View>
        <View style={styles.pointItem}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          <Text style={styles.pointText}>Take 5 breaks</Text>
          <Text style={styles.pointValue}>+30</Text>
        </View>
        <View style={styles.pointItem}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          <Text style={styles.pointText}>Complete daily challenge</Text>
          <Text style={styles.pointValue}>+100</Text>
        </View>
      </Card>

      <Card style={styles.badgesCard}>
        <Text style={styles.sectionTitle}>Achievement Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {badges.map((badge, index) => (
            <RewardBadge key={index} {...badge} />
          ))}
        </ScrollView>
      </Card>

      <Card style={styles.rewardsCard}>
        <Text style={styles.sectionTitle}>Redeem Rewards</Text>
        <TouchableOpacity style={styles.rewardItem} onPress={() => {
          if (points >= 500) {
            VoiceNotifications.onRewardRedeemed('30 minutes extra gaming time');
            showSuccess('Reward Unlocked!', 'You redeemed 30 minutes extra gaming time!');
          }
        }}>
          <Text style={styles.rewardIcon}>🎮</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>30 min Extra Gaming</Text>
            <Text style={styles.rewardCost}>500 points</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rewardItem} onPress={() => {
          if (points >= 1000) VoiceNotifications.onRewardRedeemed('pizza night');
        }}>
          <Text style={styles.rewardIcon}>🍕</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Pizza Night</Text>
            <Text style={styles.rewardCost}>1000 points</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rewardItem} onPress={() => {
          if (points >= 750) VoiceNotifications.onRewardRedeemed('movie night');
        }}>
          <Text style={styles.rewardIcon}>🎬</Text>
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Movie Night</Text>
            <Text style={styles.rewardCost}>750 points</Text>
          </View>
        </TouchableOpacity>
      </Card>

      <BackButton />
      <VoicePopup {...popup} onClose={hidePopup} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  levelCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.primary,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelEmoji: {
    fontSize: 32,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  pointsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
  },
  pointValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  badgesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  rewardsCard: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  rewardCost: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
