import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { Colors } from '../constants/theme';
import { Card } from './ui/Card';
import { Ionicons } from '@expo/vector-icons';

interface ScreenTimeImportProps {
  onImport: (minutes: number, apps: any[]) => void;
}

export const ScreenTimeImport: React.FC<ScreenTimeImportProps> = ({ onImport }) => {
  const [totalMinutes, setTotalMinutes] = useState('');
  const [apps, setApps] = useState([
    { name: 'Instagram', usage: '' },
    { name: 'TikTok', usage: '' },
    { name: 'YouTube', usage: '' },
    { name: 'Safari', usage: '' },
    { name: 'Messages', usage: '' },
  ]);

  const handleQuickImport = () => {
    const minutes = parseInt(totalMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      alert('Please enter a valid number of minutes');
      return;
    }
    const distribution = [
      { name: 'Instagram', usage: Math.floor(minutes * 0.25) },
      { name: 'TikTok', usage: Math.floor(minutes * 0.20) },
      { name: 'YouTube', usage: Math.floor(minutes * 0.18) },
      { name: Platform.OS === 'ios' ? 'Safari' : 'Chrome', usage: Math.floor(minutes * 0.15) },
      { name: 'Messages', usage: Math.floor(minutes * 0.12) },
      { name: 'Other', usage: Math.floor(minutes * 0.10) },
    ];
    onImport(minutes, distribution);
  };

  const handleDetailedImport = () => {
    const minutes = parseInt(totalMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      alert('Please enter total screen time');
      return;
    }
    const appData = apps
      .filter(app => app.usage && parseInt(app.usage) > 0)
      .map(app => ({
        name: app.name,
        usage: parseInt(app.usage) || 0,
      }));
    
    if (appData.length === 0) {
      alert('Please enter at least one app usage');
      return;
    }
    onImport(minutes, appData);
  };

  const parseTimeInput = (input: string): string => {
    // Convert "8h 10m" to "490"
    const hourMatch = input.match(/(\d+)h/);
    const minMatch = input.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    
    return (hours * 60 + minutes).toString();
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="download" size={24} color={Colors.primary} />
        <Text style={styles.title}>Import Screen Time Data</Text>
      </View>
      
      <Text style={styles.description}>
        Import your actual usage from {Platform.OS === 'ios' ? 'iOS Screen Time (Settings → Screen Time)' : 'Android Digital Wellbeing (Settings → Digital Wellbeing)'}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Total Screen Time Today</Text>
        <TextInput
          style={styles.input}
          value={totalMinutes}
          onChangeText={(text) => {
            const parsed = parseTimeInput(text);
            setTotalMinutes(parsed || text);
          }}
          placeholder="e.g., 8h 10m or 490"
          keyboardType="numeric"
        />
        <Text style={styles.hint}>Your current: 8h 10m = 490 minutes</Text>
      </View>

      <TouchableOpacity style={styles.quickButton} onPress={handleQuickImport}>
        <Ionicons name="flash" size={20} color="#fff" />
        <Text style={styles.quickButtonText}>Quick Import (Auto-distribute)</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.sectionTitle}>Detailed Breakdown (Optional)</Text>
      <ScrollView style={styles.appList}>
        {apps.map((app, index) => (
          <View key={index} style={styles.appRow}>
            <Text style={styles.appName}>{app.name}</Text>
            <TextInput
              style={styles.appInput}
              value={app.usage}
              onChangeText={(text) => {
                const newApps = [...apps];
                newApps[index].usage = text;
                setApps(newApps);
              }}
              placeholder="mins"
              keyboardType="numeric"
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.detailedButton} onPress={handleDetailedImport}>
        <Text style={styles.detailedButtonText}>Import with Details</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 4,
  },
  quickButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  appList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  appName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  appInput: {
    width: 80,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailedButton: {
    backgroundColor: Colors.secondary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
