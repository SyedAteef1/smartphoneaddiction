import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../constants/theme';
import { VoiceNotifications } from '../utils/voiceNotifications';
import { Ionicons } from '@expo/vector-icons';

interface VoicePopupProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  type?: 'success' | 'warning' | 'info' | 'error';
  onClose: () => void;
  autoClose?: number;
  speakMessage?: boolean;
}

export const VoicePopup: React.FC<VoicePopupProps> = ({
  visible,
  title,
  message,
  icon = 'notifications',
  type = 'info',
  onClose,
  autoClose = 3000,
  speakMessage = true,
}) => {
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      if (speakMessage) {
        VoiceNotifications.speak(message, type === 'error' || type === 'warning' ? 'high' : 'normal');
      }
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      if (autoClose > 0) {
        const timer = setTimeout(onClose, autoClose);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success': return { bg: Colors.success, icon: 'checkmark-circle' };
      case 'warning': return { bg: Colors.warning, icon: 'warning' };
      case 'error': return { bg: Colors.danger, icon: 'close-circle' };
      default: return { bg: Colors.primary, icon: icon };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.popup, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconContainer, { backgroundColor: typeStyles.bg }]}>
            <Ionicons name={typeStyles.icon as any} size={40} color="#fff" />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: typeStyles.bg }]} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
