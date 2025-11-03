import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Modal, Platform } from 'react-native';
import { Colors } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { ParentSetup } from '../../components/ParentSetup';

import { BackButton } from '../../components/BackButton';
import { useAppUsage } from '../../hooks/useAppUsage';
import { VoiceNotifications } from '../../utils/voiceNotifications';
import { AppBlocker } from '../../utils/appBlocker';
import { storage } from '../../utils/storage';
import { useVoicePopup } from '../../hooks/useVoicePopup';
import { VoicePopup } from '../../components/VoicePopup';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const { dailyLimit, updateLimit, resetDaily, importScreenTime } = useAppUsage();
  const [newLimit, setNewLimit] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [breakReminders, setBreakReminders] = useState(true);
  const [parentPhone, setParentPhone] = useState('');
  const { popup, showSuccess, showInfo, hidePopup } = useVoicePopup();

  useEffect(() => {
    loadParentInfo();
    setNewLimit(dailyLimit.toString());
  }, [dailyLimit]);

  // Stop voice when leaving settings page
  useEffect(() => {
    return () => {
      VoiceNotifications.stopSpeaking();
    };
  }, []);

  const loadParentInfo = async () => {
    const phone = await storage.get('parentPhone') || '';
    setParentPhone(phone);
  };

  const handleUpdateLimit = async () => {
    const limit = parseInt(newLimit);
    if (limit > 0 && limit <= 1000) {
      await updateLimit(limit);
      await VoiceNotifications.onLimitUpdated(limit);
      showSuccess('Limit Updated!', `Daily limit set to ${limit} minutes`);
    } else {
      Alert.alert('Error', 'Please enter a valid limit (1-1000 minutes)');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Data',
      'Are you sure you want to reset today\'s usage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => resetDaily(), style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Daily Limit</Text>
        <Text style={styles.description}>Set your daily screen time goal (1-1000 minutes)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={newLimit}
            onChangeText={setNewLimit}
            keyboardType="numeric"
            placeholder="120"
            selectTextOnFocus
          />
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdateLimit}>
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={Colors.primary} />
            <Text style={styles.settingText}>Enable Notifications</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="time" size={24} color={Colors.primary} />
            <Text style={styles.settingText}>Break Reminders</Text>
          </View>
          <Switch value={breakReminders} onValueChange={async (value) => {
            setBreakReminders(value);
            if (value) {
              await VoiceNotifications.scheduleBreakReminder(30);
              await VoiceNotifications.speak('Break reminders enabled. You will be reminded every 30 minutes.');
            } else {
              VoiceNotifications.stopBreakReminder();
            }
          }} />
        </View>
      </Card>



      <ParentSetup />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Voice Reminders</Text>
        <Text style={styles.description}>Get audio feedback for your screen time activities</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            VoiceNotifications.speak('This is a test voice reminder. You have used 50% of your daily screen time.');
            showInfo('Voice Test', 'Testing voice notification system');
          }}
        >
          <Ionicons name="volume-high" size={24} color={Colors.primary} />
          <Text style={styles.menuText}>Test Voice Alert</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => VoiceNotifications.getMotivationalMessage()}
        >
          <Ionicons name="happy" size={24} color={Colors.success} />
          <Text style={styles.menuText}>Get Motivational Message</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={async () => {
            const settings = await VoiceNotifications.getSettings();
            await VoiceNotifications.updateSettings({ enabled: !settings.enabled });
            Alert.alert('Voice Notifications', `Voice notifications ${!settings.enabled ? 'enabled' : 'disabled'}`);
          }}
        >
          <Ionicons name="settings" size={24} color={Colors.warning} />
          <Text style={styles.menuText}>Toggle Voice Notifications</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
        </TouchableOpacity>
      </Card>



      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Parent SMS Alerts</Text>
        <Text style={styles.description}>Get SMS alerts when screen time limit is exceeded</Text>
        <View style={styles.inputGroup}>
          <Ionicons name="call" size={20} color={Colors.primary} />
          <TextInput
            style={styles.contactInput}
            placeholder="Parent Phone Number"
            value={parentPhone}
            keyboardType="phone-pad"
            onChangeText={(text) => {
              setParentPhone(text);
              storage.set('parentPhone', text);
            }}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color={Colors.warning} />
          <Text style={styles.menuText}>Reset Today's Data</Text>
          <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
        </TouchableOpacity>
      </Card>

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>About</Text>
        <Text style={styles.infoText}>Screen Time Tracker v1.0</Text>
        <Text style={styles.infoText}>Helping kids build healthy digital habits</Text>
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
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  contactInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 14,
    color: Colors.text,
  },
  blockButton: {
    backgroundColor: Colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  blockButton60: {
    backgroundColor: Colors.primary,
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  importButton: {
    flexDirection: 'row',
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});
