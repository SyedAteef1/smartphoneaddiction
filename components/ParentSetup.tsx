import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/theme';
import { Card } from './ui/Card';
import { storage } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

export const ParentSetup: React.FC = () => {
  const [parentPhone, setParentPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadParentInfo();
  }, []);

  const loadParentInfo = async () => {
    const phone = await storage.get('parentPhone');
    if (phone) {
      setParentPhone(phone);
      setSaved(true);
    }
  };

  const saveParentInfo = async () => {
    if (!parentPhone) {
      Alert.alert('Error', 'Please enter parent phone number');
      return;
    }
    await storage.set('parentPhone', parentPhone);
    setSaved(true);
    Alert.alert('Success', 'Parent phone saved! SMS alerts will be sent when limit is exceeded.');
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="call" size={24} color={Colors.primary} />
        <Text style={styles.title}>Parent Alert Setup</Text>
      </View>
      <Text style={styles.description}>
        Enter parent's phone number to receive SMS alerts when screen time limit is exceeded
      </Text>
      <TextInput
        style={styles.input}
        value={parentPhone}
        onChangeText={setParentPhone}
        placeholder="+1234567890"
        keyboardType="phone-pad"
        editable={!saved}
      />
      {!saved ? (
        <TouchableOpacity style={styles.button} onPress={saveParentInfo}>
          <Text style={styles.buttonText}>Save Phone Number</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.savedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.savedText}>SMS Alerts Enabled</Text>
        </View>
      )}
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
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
  },
  savedText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
