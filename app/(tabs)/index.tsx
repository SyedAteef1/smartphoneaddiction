import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlockStatus } from '../../components/BlockStatus';
import { BreakTimer } from '../../components/BreakTimer';
import { LiveUsageIndicator } from '../../components/LiveUsageIndicator';
import { MLInsights } from '../../components/MLInsights';
import { MLStatusIndicator } from '../../components/MLStatusIndicator';
import { LocalMLInsights } from '../../components/LocalMLInsights';
import { AddictionInsights } from '../../components/AddictionInsights';
import { TestConnection } from '../../components/TestConnection';
import { MLInsightsDashboard } from '../../components/MLInsightsDashboard';

import { RealTimeWidget } from '../../components/RealTimeWidget';
import { ScreenTimeCircle } from '../../components/ScreenTimeCircle';
import { Card } from '../../components/ui/Card';
import { VirtualPet } from '../../components/VirtualPet';
import { Colors } from '../../constants/theme';
import { useAppUsage } from '../../hooks/useAppUsage';
import { useMLInsights } from '../../hooks/useMLInsights';
import { useLocalML } from '../../hooks/useLocalML';
import { useRealTimeUsage } from '../../hooks/useRealTimeUsage';
import { storage } from '../../utils/storage';
import { VoiceNotifications } from '../../utils/voiceNotifications';

import { Ionicons } from '@expo/vector-icons';
import { VoicePopup } from '../../components/VoicePopup';
import { useVoicePopup } from '../../hooks/useVoicePopup';

export default function Dashboard() {
  const [showBreak, setShowBreak] = useState(false);
  const [showMLInsights, setShowMLInsights] = useState(false);
  const [showMLDashboard, setShowMLDashboard] = useState(false);
  const { popup, showSuccess, showWarning, hidePopup } = useVoicePopup();
  const { totalTime, dailyLimit, points, hasPermission, requestPermission, useRealData } = useAppUsage();
  const { logUsage, predictions, fetchPredictions } = useMLInsights();
  const { predictions: localML, isAnalyzing, confidence } = useLocalML(totalTime, dailyLimit);

  // Stop voice when leaving dashboard
  useEffect(() => {
    return () => {
      VoiceNotifications.stopSpeaking();
    };
  }, []);
  const {
    usageStats,
    hasPermission: hasRealTimePermission,
    isTracking,
    startTracking,
    stopTracking,
    getTotalScreenTime,
    getTopApps,
    getCurrentApp
  } = useRealTimeUsage();

  useEffect(() => {
    const initVoice = async () => {
      try {
        const childName = await storage.get('childName') || 'Champion';
        const isFirstTime = await storage.get('isFirstTime');
        if (isFirstTime === null || isFirstTime === true) {
          await storage.set('isFirstTime', false);
          const welcomeMsg = `Welcome to Screen Time Tracker! I'm here to help you build healthy digital habits. Let's get started, ${childName}!`;
          await VoiceNotifications.speak(welcomeMsg, 'normal');
          await VoiceNotifications.showNotification('👋 Welcome!', welcomeMsg);
        } else {
          await VoiceNotifications.onMorningGreeting(childName);
          await VoiceNotifications.onEveningReminder();
        }
      } catch (e) {
        console.log('Voice init skipped:', e);
      }
    };
    initVoice();
  }, []);

  const speakScreenTimeStatus = async () => {
    const percentage = (currentTotalTime / dailyLimit) * 100;
    let message = '';
    
    if (percentage < 50) {
      message = `You have used ${currentTotalTime} minutes out of ${dailyLimit} minutes. That's only ${Math.round(percentage)} percent. Great job staying under your limit!`;
    } else if (percentage < 80) {
      message = `You have used ${currentTotalTime} minutes out of ${dailyLimit} minutes. That's ${Math.round(percentage)} percent. Watch your time and take breaks!`;
    } else if (percentage < 100) {
      message = `You have used ${currentTotalTime} minutes out of ${dailyLimit} minutes. That's ${Math.round(percentage)} percent. You're almost at your limit. Please wrap up soon!`;
    } else {
      const overBy = Math.round(currentTotalTime - dailyLimit);
      message = `Warning! You have exceeded your limit by ${overBy} minutes. You've used ${currentTotalTime} minutes when your limit is ${dailyLimit} minutes. Time to take a break!`;
    }
    
    await VoiceNotifications.speak(message, 'normal');
  };

  useEffect(() => {
    if (hasRealTimePermission && !isTracking) {
      startTracking();
    }
  }, [hasRealTimePermission]);

  // Auto-log usage to ML backend
  useEffect(() => {
    if (currentTotalTime > 0) {
      logUsage('SmashSticker', currentTotalTime);
    }
  }, [Math.floor(currentTotalTime / 5), logUsage]); // Log every 5 minutes of usage


  const currentTotalTime = totalTime;
  const percentage = (currentTotalTime / dailyLimit) * 100;
  
  console.log('📊 Dashboard Update:');
  console.log('  Total Time:', currentTotalTime, 'mins');
  console.log('  Daily Limit:', dailyLimit, 'mins');
  console.log('  Percentage:', percentage.toFixed(1), '%');
  console.log('  Real Data:', useRealData, '| Permission:', hasPermission);
  
  // Show last update time
  const [lastUpdateTime, setLastUpdateTime] = React.useState(new Date());

  // Update timestamp when screen time changes
  useEffect(() => {
    setLastUpdateTime(new Date());
  }, [currentTotalTime]);

  // Check usage and trigger voice + notifications
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        if (currentTotalTime > 0) {
          await VoiceNotifications.checkAndNotify(currentTotalTime, dailyLimit);
          
          const lastReminder = Math.floor(currentTotalTime / 30);
          const currentReminder = Math.floor(currentTotalTime / 30);
          if (lastReminder !== currentReminder && currentTotalTime % 30 === 0) {
            const remaining = Math.max(0, dailyLimit - currentTotalTime);
            await VoiceNotifications.showNotification(
              '⏰ Screen Time Reminder',
              `You've used ${currentTotalTime} mins. ${remaining} mins remaining.`
            );
          }
        }
      } catch (e) {
        console.log('Notification check skipped');
      }
    };
    checkNotifications();
  }, [currentTotalTime, dailyLimit]);

  const getStatusMessage = () => {
    console.log('  Status Check: percentage =', percentage);
    if (percentage < 50) return { text: "Great job! 🌟", color: Colors.success };
    if (percentage < 80) return { text: "Watch your time ⚠️", color: Colors.warning };
    if (percentage < 100) return { text: "Almost at limit! ⚠️", color: Colors.warning };
    const overBy = Math.round(currentTotalTime - dailyLimit);
    return { text: `Over limit by ${overBy}m! 🚫`, color: Colors.danger };
  };

  const status = getStatusMessage();

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Champion! 👋</Text>
        <View style={styles.pointsBadge}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.pointsText}>{points}</Text>
        </View>
      </View>

      {/* ML Backend status */}
      <MLStatusIndicator 
        isConnected={predictions !== null} 
        onRetry={fetchPredictions}
      />

      <BlockStatus />
      <LiveUsageIndicator />

      <TouchableOpacity onPress={async () => {
        try {
          const petMood = currentTotalTime < dailyLimit * 0.5 ? 'happy' : 
                          currentTotalTime < dailyLimit * 0.8 ? 'okay' : 
                          currentTotalTime < dailyLimit ? 'worried' : 'sad';
          await VoiceNotifications.onPetInteraction(petMood);
        } catch (e) {
          console.log('Pet interaction skipped');
        }
      }}>
        <Card style={styles.petCard}>
          <VirtualPet timeSpent={currentTotalTime} limit={dailyLimit} />
        </Card>
      </TouchableOpacity>



      <TouchableOpacity onPress={async () => {
        try {
          await speakScreenTimeStatus();
        } catch (e) {
          console.log('Voice skipped');
        }
      }}>
        <Card style={styles.mainCard}>
          <Text style={styles.cardTitle}>Today's Screen Time</Text>
          <Text style={styles.cardSubtitle}>
            {useRealData ? 'Tap to hear your status' : 'Waiting for permission...'}
          </Text>
          <ScreenTimeCircle timeSpent={currentTotalTime} limit={dailyLimit} />
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </Card>
      </TouchableOpacity>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Ionicons name="time-outline" size={32} color={Colors.primary} />
          <Text style={styles.statValue}>{Math.max(0, dailyLimit - currentTotalTime).toFixed(0)}m</Text>
          <Text style={styles.statLabel}>Time Left</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="trending-down" size={32} color={Colors.success} />
          <Text style={styles.statValue}>-15%</Text>
          <Text style={styles.statLabel}>vs Yesterday</Text>
        </Card>
      </View>

      {hasRealTimePermission && (
        <View style={styles.widgetContainer}>
          <RealTimeWidget />
        </View>
      )}

      {/* Local ML Insights */}
      <LocalMLInsights 
        predictions={localML} 
        isAnalyzing={isAnalyzing} 
        confidence={confidence} 
      />

      <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={24} color={Colors.warning} />
          <Text style={styles.tipsTitle}>Daily Tips</Text>
        </View>
        <Text style={styles.tipText}>• Take a 5-minute break every 30 minutes</Text>
        <Text style={styles.tipText}>• Try reading a book instead!</Text>
        <Text style={styles.tipText}>• Play outside for 30 minutes today</Text>
      </Card>

      <TouchableOpacity 
        style={styles.analyzeButton} 
        onPress={() => setShowMLDashboard(true)}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.analyzeGradient}
        >
          <Ionicons name="analytics" size={28} color="#fff" />
          <Text style={styles.analyzeText}>ML Insights & Analytics</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.breakButtonFull} 
        onPress={async () => {
          try {
            await VoiceNotifications.onBreakStart(5);
          } catch (e) {
            console.log('Voice skipped');
          }
          setShowBreak(true);
        }}
      >
        <Ionicons name="pause-circle" size={24} color="#fff" />
        <Text style={styles.breakButtonText}>Take a Break</Text>
      </TouchableOpacity>
      
      <BreakTimer visible={showBreak} onClose={() => setShowBreak(false)} />
      <VoicePopup {...popup} onClose={hidePopup} />
      
      <Modal 
        visible={showMLDashboard} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMLDashboard(false)}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Ionicons name="analytics" size={24} color="#fff" />
                <Text style={styles.modalTitle}>ML Insights</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMLDashboard(false)}>
                <Ionicons name="close-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <MLInsightsDashboard />
          </View>
        </LinearGradient>
      </Modal>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 6,
  },
  liveTrackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 16,
    gap: 6,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  liveTrackingText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mainCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
  breakButtonFull: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  breakButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  permissionBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.warning,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  permissionText: {
    marginLeft: 12,
    flex: 1,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  realDataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  realDataText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  petCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  widgetContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  analyzeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  analyzeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
});
