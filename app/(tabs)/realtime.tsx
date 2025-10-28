import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';
import { RealTimeUsageDisplay } from '../../components/RealTimeUsageDisplay';
import { useRealTimeUsage } from '../../hooks/useRealTimeUsage';
import { Ionicons } from '@expo/vector-icons';

export default function RealTimeScreen() {
  const {
    hasPermission,
    isTracking,
    loading,
    requestPermission,
    startTracking,
    stopTracking,
  } = useRealTimeUsage();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Auto-start tracking when permission is granted
    if (hasPermission && !isTracking) {
      startTracking();
    }
  }, [hasPermission]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.permissionContainer}>
          <Ionicons name="lock-closed" size={80} color="rgba(255,255,255,0.9)" />
          <Text style={styles.permissionTitle}>Enable Real-Time Tracking</Text>
          <Text style={styles.permissionDescription}>
            To see your live app usage, we need permission to access your device's usage statistics.
          </Text>
          
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestPermission}
          >
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Live app tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Real-time usage updates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Accurate app breakdown</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Privacy protected</Text>
            </View>
          </View>

          <Text style={styles.privacyNote}>
            🔒 Your data stays on your device and is never shared
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Real-Time Usage</Text>
            <Text style={styles.subtitle}>Live tracking of your screen time</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.trackingButton}
            onPress={isTracking ? stopTracking : startTracking}
          >
            <Ionicons 
              name={isTracking ? 'pause' : 'play'} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <RealTimeUsageDisplay />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              Your device tracks which apps you use in real-time. Data updates every 5 seconds 
              to give you the most accurate picture of your screen time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 40,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  featureList: {
    alignSelf: 'stretch',
    marginHorizontal: 40,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginLeft: 12,
  },
  privacyNote: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  trackingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  content: {
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
});


