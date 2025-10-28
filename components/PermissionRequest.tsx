import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Colors } from '../constants/theme';
import { Card } from './ui/Card';
import { Ionicons } from '@expo/vector-icons';

interface PermissionRequestProps {
  onPermissionGranted: () => void;
}

export const PermissionRequest: React.FC<PermissionRequestProps> = ({ onPermissionGranted }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || Platform.OS !== 'android') return null;

  const requestPermission = () => {
    // Open Android Usage Access Settings
    Linking.openSettings();
  };

  const handleDismiss = () => {
    setDismissed(true);
    onPermissionGranted();
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
      </View>
      
      <Text style={styles.title}>Enable Real Usage Tracking</Text>
      <Text style={styles.description}>
        Since you're using Expo Go, automatic tracking isn't available. But you can easily import your real usage from Digital Wellbeing!
      </Text>

      <View style={styles.steps}>
        <Text style={styles.stepTitle}>📱 How to see YOUR real data:</Text>
        <Text style={styles.step}>1. Open Android Settings</Text>
        <Text style={styles.step}>2. Go to Digital Wellbeing & parental controls</Text>
        <Text style={styles.step}>3. Note your total usage (e.g., 8h 10m)</Text>
        <Text style={styles.step}>4. Return here and tap "Import My Data"</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleDismiss}>
        <Ionicons name="download" size={20} color="#fff" />
        <Text style={styles.buttonText}>Import My Data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleDismiss}>
        <Text style={styles.skipText}>Use Demo Data</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={Colors.primary} />
        <Text style={styles.infoText}>
          This permission is safe and only reads app usage times. No personal data is collected.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  steps: {
    width: '100%',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  step: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
    paddingLeft: 8,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipText: {
    color: Colors.textLight,
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    marginLeft: 8,
    lineHeight: 16,
  },
});
