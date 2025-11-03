import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/theme';

export const TestConnection = () => {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    
    const baseUrl = Platform.select({
      android: 'http://10.54.50.182:8001',
      ios: 'http://localhost:8001',
      default: 'http://localhost:8001'
    });
    
    const url = `${baseUrl}/api/addiction-insights/test_user`;
    console.log('🔍 Testing URL:', url);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url);
      const elapsed = Date.now() - startTime;
      
      console.log('📡 Response:', response.status, `(${elapsed}ms)`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Data:', data);
        setStatus(`✅ Connected! (${elapsed}ms)\nRisk: ${data.risk_assessment?.label}`);
      } else {
        setStatus(`❌ Error: ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      setStatus(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Test</Text>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Server Connection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    minHeight: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
