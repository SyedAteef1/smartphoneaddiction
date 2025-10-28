import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlockStatus } from '../../components/BlockStatus';
import { BreakTimer } from '../../components/BreakTimer';
import { LiveUsageIndicator } from '../../components/LiveUsageIndicator';
import { MLInsights } from '../../components/MLInsights';
import { MLStatusIndicator } from '../../components/MLStatusIndicator';
import { PermissionRequest } from '../../components/PermissionRequest';
import { RealTimeWidget } from '../../components/RealTimeWidget';
import { ScreenTimeCircle } from '../../components/ScreenTimeCircle';
import { Card } from '../../components/ui/Card';
import { VirtualPet } from '../../components/VirtualPet';
import { Colors } from '../../constants/theme';
import { useAppUsage } from '../../hooks/useAppUsage';
import { useMLInsights } from '../../hooks/useMLInsights';
import { useRealTimeUsage } from '../../hooks/useRealTimeUsage';
import { storage } from '../../utils/storage';
import { VoiceNotifications } from '../../utils/voiceNotifications';

import { Ionicons } from '@expo/vector-icons';
import { VoicePopup } from '../../components/VoicePopup';
import { useVoicePopup } from '../../hooks/useVoicePopup';

export default function Dashboard() {
  const [showBreak, setShowBreak] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [showMLInsights, setShowMLInsights] = useState(false);
  const { popup, showSuccess, showWarning, hidePopup } = useVoicePopup();
  const { totalTime, dailyLimit, points, hasPermission, requestPermission, useRealData } = useAppUsage();
  const { logUsage, predictions, fetchPredictions } = useMLInsights();

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
    checkPermissionStatus();
    const initVoice = async () => {
      const childName = await storage.get('childName') || 'Champion';
      await VoiceNotifications.onMorningGreeting(childName);
      await VoiceNotifications.onEveningReminder();
    };
    initVoice();
  }, []);

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

  const checkPermissionStatus = async () => {
    const dismissed = await storage.get('permissionDismissed');
    if (Platform.OS === 'android' && !dismissed && !hasPermission) {
      setShowPermission(true);
    }
  };

  const handlePermissionGranted = async () => {
    await storage.set('permissionDismissed', true);
    setShowPermission(false);
    await VoiceNotifications.speak('Permission granted! You can now track real usage data.');
  };
  // Use real-time data if available, otherwise fall back to simulated data
  const realTimeTotal = getTotalScreenTime() / 60; // Convert seconds to minutes
  // Always prefer the hook's totalTime as it's already handling real vs demo data
  const currentTotalTime = totalTime;
  const percentage = (currentTotalTime / dailyLimit) * 100;
  
  console.log('📊 Dashboard - totalTime:', totalTime, 'useRealData:', useRealData, 'hasPermission:', hasPermission);

  // Check usage and trigger voice notifications
  useEffect(() => {
    if (currentTotalTime > 0) {
      VoiceNotifications.checkAndNotify(currentTotalTime, dailyLimit);
    }
  }, [currentTotalTime, dailyLimit]);

  const getStatusMessage = () => {
    if (percentage < 50) return { text: "Great job! 🌟", color: Colors.success };
    if (percentage < 80) return { text: "Watch your time ⚠️", color: Colors.warning };
    return { text: "Limit reached! 🚫", color: Colors.danger };
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

      {!hasPermission && (
        <TouchableOpacity style={styles.permissionBanner} onPress={requestPermission}>
          <Ionicons name="shield-checkmark" size={24} color="#fff" />
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>Enable Real Tracking</Text>
            <Text style={styles.permissionSubtitle}>Tap to grant usage access</Text>
          </View>
        </TouchableOpacity>
      )}

      {useRealData && (
        <View style={styles.realDataBadge}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.realDataText}>Live Data Active</Text>
        </View>
      )}

      {showPermission && (
        <PermissionRequest onPermissionGranted={handlePermissionGranted} />
      )}

      <MLStatusIndicator 
        isConnected={predictions !== null} 
        onRetry={fetchPredictions}
      />

      <BlockStatus />
      <LiveUsageIndicator />

      <Card style={styles.petCard}>
        <VirtualPet timeSpent={currentTotalTime} limit={dailyLimit} />
      </Card>

      <Card style={styles.mainCard}>
        <Text style={styles.cardTitle}>Today's Screen Time</Text>
        <ScreenTimeCircle timeSpent={currentTotalTime} limit={dailyLimit} />
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={styles.statusText}>{status.text}</Text>
        </View>
      </Card>

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

      <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={24} color={Colors.warning} />
          <Text style={styles.tipsTitle}>Daily Tips</Text>
        </View>
        <Text style={styles.tipText}>• Take a 5-minute break every 30 minutes</Text>
        <Text style={styles.tipText}>• Try reading a book instead!</Text>
        <Text style={styles.tipText}>• Play outside for 30 minutes today</Text>
      </Card>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.breakButton} onPress={async () => {
          setShowBreak(true);
          await VoiceNotifications.onBreakStart(5);
          showSuccess('Break Time!', 'Great choice! Rest your eyes and stretch.');
        }}>
          <Ionicons name="pause-circle" size={24} color="#fff" />
          <Text style={styles.breakButtonText}>Take a Break</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.mlButton} onPress={() => setShowMLInsights(true)}>
          <Ionicons name="analytics" size={24} color="#fff" />
          <Text style={styles.mlButtonText}>AI Insights</Text>
        </TouchableOpacity>
      </View>
      
      <BreakTimer visible={showBreak} onClose={() => setShowBreak(false)} />
      <VoicePopup {...popup} onClose={hidePopup} />
      
      <Modal 
        visible={showMLInsights} 
        animationType="slide" 
        presentationStyle="pageSheet"
        onRequestClose={() => {
          VoiceNotifications.stopSpeaking();
          setShowMLInsights(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI-Powered Insights</Text>
            <TouchableOpacity onPress={() => {
              VoiceNotifications.stopSpeaking();
              setShowMLInsights(false);
            }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <MLInsights />
        </View>
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
    marginBottom: 20,
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
  breakButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  mlButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#9C27B0',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
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
});
