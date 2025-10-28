import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { VirtualPet } from '../../components/VirtualPet';
import { BackButton } from '../../components/BackButton';
import { useAppUsage } from '../../hooks/useAppUsage';
import { Ionicons } from '@expo/vector-icons';

export default function Pet() {
  const { totalTime, dailyLimit, getPetMood } = useAppUsage();
  const mood = getPetMood();

  const petStats = [
    { icon: 'heart', label: 'Happiness', value: mood === 'happy' ? '100%' : mood === 'okay' ? '70%' : mood === 'worried' ? '40%' : '10%', color: Colors.danger },
    { icon: 'fitness', label: 'Energy', value: mood === 'happy' ? '100%' : mood === 'okay' ? '65%' : mood === 'worried' ? '35%' : '5%', color: Colors.warning },
    { icon: 'star', label: 'Mood', value: mood === 'happy' ? 'Excellent' : mood === 'okay' ? 'Good' : mood === 'worried' ? 'Worried' : 'Sad', color: Colors.primary },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Virtual Pet</Text>
        <Text style={styles.subtitle}>Keep your pet happy by managing screen time!</Text>
      </View>

      <Card style={styles.petCard}>
        <VirtualPet timeSpent={totalTime} limit={dailyLimit} />
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Pet Stats</Text>
        {petStats.map((stat, index) => (
          <View key={index} style={styles.statRow}>
            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.tipsCard}>
        <Text style={styles.sectionTitle}>How to Keep Your Pet Happy</Text>
        <View style={styles.tipRow}>
          <Text style={styles.tipIcon}>✅</Text>
          <Text style={styles.tipText}>Stay under your daily screen time limit</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipIcon}>✅</Text>
          <Text style={styles.tipText}>Take regular breaks every 30 minutes</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipIcon}>✅</Text>
          <Text style={styles.tipText}>Earn points by building healthy habits</Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipIcon}>✅</Text>
          <Text style={styles.tipText}>Play outside and read books</Text>
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Did You Know?</Text>
        <Text style={styles.infoText}>
          Your virtual pet's mood reflects your screen time habits. The happier your pet, the healthier your digital lifestyle!
        </Text>
      </Card>

      <BackButton />
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
  petCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#E3F2FD',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
});
