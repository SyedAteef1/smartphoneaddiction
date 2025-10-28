import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface MLStatusIndicatorProps {
  isConnected: boolean;
  onRetry?: () => void;
}

export const MLStatusIndicator: React.FC<MLStatusIndicatorProps> = ({ isConnected, onRetry }) => {
  const [show, setShow] = useState(!isConnected);

  useEffect(() => {
    setShow(!isConnected);
  }, [isConnected]);

  if (!show) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={16} color={Colors.warning} />
        <Text style={styles.text}>ML Backend Offline</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Ionicons name="refresh" size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    marginLeft: 8,
  },
  retryButton: {
    padding: 4,
  },
});
