import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppUsageItem } from '../../components/AppUsageItem';
import { BackButton } from '../../components/BackButton';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/theme';
import { useAppUsage } from '../../hooks/useAppUsage';
import { useRealTimeUsage } from '../../hooks/useRealTimeUsage';
import { VoiceNotifications } from '../../utils/voiceNotifications';

export default function Apps() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [useLiveData, setUseLiveData] = useState(true);
  const { apps, totalTime, hasPermission: hasAppPermission, requestPermission, useRealData } = useAppUsage();
  const { getTopApps, getTotalScreenTime, hasPermission, requestPermission: requestRealTimePermission } = useRealTimeUsage();

  // Update timestamp when data changes
  useEffect(() => {
    if (apps.length > 0 || totalTime > 0) {
      setLastUpdate(new Date());
    }
  }, [apps, totalTime]);
  
  // Stop voice when leaving apps page
  useEffect(() => {
    return () => {
      VoiceNotifications.stopSpeaking();
    };
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Force a refresh of the data
      if (hasPermission) {
        await requestRealTimePermission();
      }
      if (hasAppPermission) {
        await requestPermission();
      }
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };
  
  // Use real-time data if available
  const realTimeApps = getTopApps(20);
  const realTimeTotal = getTotalScreenTime() / 60; // Convert to minutes
  
  console.log('📱 Apps screen - hasPermission:', hasPermission, 'realTimeApps:', realTimeApps.length, 'apps:', apps.length);
  
  const getCategoryIcon = (packageName: string): string => {
    if (packageName.includes('game')) return '🎮';
    if (packageName.includes('social') || packageName.includes('chat') || packageName.includes('whatsapp') || packageName.includes('messenger')) return '💬';
    if (packageName.includes('video') || packageName.includes('youtube') || packageName.includes('netflix')) return '📺';
    if (packageName.includes('browser') || packageName.includes('chrome')) return '🌐';
    if (packageName.includes('music') || packageName.includes('spotify')) return '🎵';
    if (packageName.includes('camera') || packageName.includes('photo')) return '📷';
    if (packageName.includes('mail') || packageName.includes('gmail')) return '📧';
    return '📱';
  };
  
  const getRandomColor = (): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#C7CEEA', '#FF8B94', '#A8E6CF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const generateDemoApps = () => [
    { name: 'YouTube', icon: '📺', timeSpent: 45, color: '#FF6B6B', packageName: 'demo' },
    { name: 'Instagram', icon: '💬', timeSpent: 32, color: '#4ECDC4', packageName: 'demo' },
    { name: 'WhatsApp', icon: '💬', timeSpent: 28, color: '#FFE66D', packageName: 'demo' },
    { name: 'Chrome', icon: '🌐', timeSpent: 22, color: '#95E1D3', packageName: 'demo' },
    { name: 'TikTok', icon: '📱', timeSpent: 18, color: '#C7CEEA', packageName: 'demo' },
  ];
  
  const getDemoTotal = () => 145;
  
  // Decide which data to show based on toggle
  const shouldShowLiveData = useLiveData && (hasPermission || hasAppPermission);
  
  const displayApps = shouldShowLiveData ? apps : generateDemoApps();
  const displayTotal = shouldShowLiveData ? totalTime : getDemoTotal();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>App Usage</Text>
          <Text style={styles.subtitle}>Track your daily app activity</Text>
        </View>
        <View style={styles.updateBadge}>
          <Ionicons name="sync" size={12} color={Colors.success} />
          <Text style={styles.updateText}>
            {lastUpdate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </Text>
        </View>
      </View>

      {/* Data Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, !useLiveData && styles.toggleButtonActive]}
          onPress={() => setUseLiveData(false)}
        >
          <Ionicons 
            name="eye-outline" 
            size={16} 
            color={!useLiveData ? '#fff' : Colors.textLight} 
          />
          <Text style={[styles.toggleText, !useLiveData && styles.toggleTextActive]}>
            Demo Mode
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleButton, useLiveData && styles.toggleButtonActive]}
          onPress={() => {
            setUseLiveData(true);
            if (!hasPermission && !hasAppPermission) {
              requestPermission();
              requestRealTimePermission();
            }
          }}
        >
          <Ionicons 
            name="pulse" 
            size={16} 
            color={useLiveData ? '#fff' : Colors.textLight} 
          />
          <Text style={[styles.toggleText, useLiveData && styles.toggleTextActive]}>
            Live Usage {shouldShowLiveData && '✓'}
          </Text>
        </TouchableOpacity>
      </View>

      {useLiveData && !hasPermission && !hasAppPermission && (
        <TouchableOpacity 
          style={styles.permissionBanner} 
          onPress={async () => {
            await requestPermission();
            await requestRealTimePermission();
          }}
        >
          <Ionicons name="shield-checkmark" size={24} color="#fff" />
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>Enable Real Usage Tracking</Text>
            <Text style={styles.permissionSubtitle}>Tap to grant permission and see your actual app usage</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Status Badge */}
      {shouldShowLiveData && (
        <View style={styles.liveStatusBadge}>
          <Ionicons name="radio" size={16} color={Colors.success} />
          <Text style={styles.liveStatusText}>
            LIVE DATA • Updates every 10 seconds
          </Text>
        </View>
      )}
      
      {!shouldShowLiveData && !useLiveData && (
        <View style={styles.demoStatusBadge}>
          <Ionicons name="eye-outline" size={16} color={Colors.warning} />
          <Text style={styles.demoStatusText}>
            DEMO MODE • Switch to Live Usage to see your real data
          </Text>
        </View>
      )}

      {displayApps.length === 0 && shouldShowLiveData && (
        <Card style={styles.emptyCard}>
          <Ionicons name="apps-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No App Usage Data Yet</Text>
          <Text style={styles.emptyText}>
            Start using your device to see app usage data here. Data updates every 10 seconds.
          </Text>
        </Card>
      )}

      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{displayApps.length}</Text>
            <Text style={styles.summaryLabel}>Apps Used</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{Math.round(displayTotal)}m</Text>
            <Text style={styles.summaryLabel}>Total Time</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{displayApps[0]?.name || 'N/A'}</Text>
            <Text style={styles.summaryLabel}>Most Used</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.listCard}>
        <Text style={styles.sectionTitle}>Breakdown by App</Text>
        {displayApps.map((app, index) => (
          <AppUsageItem key={index} app={app} totalTime={displayTotal} />
        ))}
      </Card>

      <Card style={styles.insightCard}>
        <Text style={styles.insightTitle}>💡 Insight</Text>
        <Text style={styles.insightText}>
          You spend most time on {displayApps[0]?.name}. Try limiting it to 30 minutes per day!
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  updateText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  toggleTextActive: {
    color: '#fff',
  },
  liveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  liveStatusText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  demoStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  demoStatusText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  listCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  insightCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#FFF9E6',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
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
  emptyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

