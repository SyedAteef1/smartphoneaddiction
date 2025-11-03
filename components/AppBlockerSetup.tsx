import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Colors } from '../constants/theme';
import { NativeAppBlocker, COMMON_APPS } from '../utils/nativeAppBlocker';

export const AppBlockerSetup: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasAccessibility, setHasAccessibility] = useState(false);
  const [blockedApps, setBlockedApps] = useState<string[]>([]);

  useEffect(() => {
    checkAccessibility();
  }, []);

  const checkAccessibility = async () => {
    const enabled = await NativeAppBlocker.isAccessibilityEnabled();
    setHasAccessibility(enabled);
  };

  const toggleApp = (packageName: string) => {
    setBlockedApps(prev => 
      prev.includes(packageName)
        ? prev.filter(app => app !== packageName)
        : [...prev, packageName]
    );
  };

  const handleStartBlocking = async () => {
    if (!hasAccessibility) {
      Alert.alert(
        'Enable Accessibility',
        'Please enable the accessibility service to use app blocking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => NativeAppBlocker.openAccessibilitySettings() }
        ]
      );
      return;
    }

    if (blockedApps.length === 0) {
      Alert.alert('No Apps Selected', 'Please select at least one app to block.');
      return;
    }

    try {
      await NativeAppBlocker.startBlocking(blockedApps);
      setIsEnabled(true);
      Alert.alert('Success', `Blocking ${blockedApps.length} apps`);
    } catch (error) {
      Alert.alert('Error', 'Failed to start app blocker');
    }
  };

  const handleStopBlocking = async () => {
    try {
      await NativeAppBlocker.stopBlocking();
      setIsEnabled(false);
      Alert.alert('Stopped', 'App blocker has been stopped');
    } catch (error) {
      Alert.alert('Error', 'Failed to stop app blocker');
    }
  };

  const apps = [
    { name: 'Instagram', package: COMMON_APPS.INSTAGRAM, icon: 'logo-instagram' },
    { name: 'Facebook', package: COMMON_APPS.FACEBOOK, icon: 'logo-facebook' },
    { name: 'TikTok', package: COMMON_APPS.TIKTOK, icon: 'musical-notes' },
    { name: 'YouTube', package: COMMON_APPS.YOUTUBE, icon: 'logo-youtube' },
    { name: 'Twitter', package: COMMON_APPS.TWITTER, icon: 'logo-twitter' },
    { name: 'Snapchat', package: COMMON_APPS.SNAPCHAT, icon: 'camera' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={hasAccessibility ? 'checkmark-circle' : 'alert-circle'} 
            size={32} 
            color={hasAccessibility ? Colors.success : Colors.warning} 
          />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {hasAccessibility ? 'Ready to Block' : 'Setup Required'}
            </Text>
            <Text style={styles.statusText}>
              {hasAccessibility 
                ? 'Accessibility service is enabled' 
                : 'Enable accessibility to block apps'}
            </Text>
          </View>
        </View>
        
        {!hasAccessibility && (
          <TouchableOpacity 
            style={styles.setupButton}
            onPress={() => NativeAppBlocker.openAccessibilitySettings()}
          >
            <Text style={styles.setupButtonText}>Enable Accessibility</Text>
          </TouchableOpacity>
        )}
      </Card>

      <Card style={styles.appsCard}>
        <Text style={styles.sectionTitle}>Select Apps to Block</Text>
        {apps.map((app) => (
          <TouchableOpacity
            key={app.package}
            style={styles.appItem}
            onPress={() => toggleApp(app.package)}
          >
            <View style={styles.appInfo}>
              <Ionicons name={app.icon as any} size={24} color={Colors.primary} />
              <Text style={styles.appName}>{app.name}</Text>
            </View>
            <Switch
              value={blockedApps.includes(app.package)}
              onValueChange={() => toggleApp(app.package)}
            />
          </TouchableOpacity>
        ))}
      </Card>

      <View style={styles.actions}>
        {!isEnabled ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.startButton]}
            onPress={handleStartBlocking}
          >
            <Ionicons name="lock-closed" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Start Blocking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.stopButton]}
            onPress={handleStopBlocking}
          >
            <Ionicons name="lock-open" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Stop Blocking</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statusCard: { margin: 20 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statusInfo: { marginLeft: 12, flex: 1 },
  statusTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  statusText: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
  setupButton: { 
    backgroundColor: Colors.primary, 
    padding: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  setupButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  appsCard: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 16 },
  appItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12 
  },
  appInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appName: { fontSize: 16, color: Colors.text },
  actions: { paddingHorizontal: 20, marginBottom: 30 },
  actionButton: { 
    flexDirection: 'row', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  startButton: { backgroundColor: Colors.danger },
  stopButton: { backgroundColor: Colors.success },
  actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
