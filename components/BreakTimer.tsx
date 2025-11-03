import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { VoiceNotifications } from '../utils/voiceNotifications';
import { NativeAppBlocker } from '../utils/nativeAppBlocker';
import { Ionicons } from '@expo/vector-icons';

interface BreakTimerProps {
  visible: boolean;
  onClose: () => void;
}

export const BreakTimer: React.FC<BreakTimerProps> = ({ visible, onClose }) => {
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    if (!visible) {
      setSeconds(300); // Reset timer
      return;
    }
    
    console.log('✅ Break timer started - 5 minutes');
    
    return () => {
      console.log('✅ Break timer ended');
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleEndBreak();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [visible]);

  const handleEndBreak = async () => {
    await VoiceNotifications.onBreakEnd();
    onClose();
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name="leaf" size={64} color={Colors.success} />
          <Text style={styles.title}>Break Time!</Text>
          <Text style={styles.subtitle}>Rest your eyes and stretch</Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{minutes}:{secs.toString().padStart(2, '0')}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleEndBreak}>
            <Text style={styles.buttonText}>End Break</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  timerContainer: {
    marginVertical: 32,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
    color: Colors.success,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
