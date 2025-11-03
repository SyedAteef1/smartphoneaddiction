import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Colors } from '../constants/theme';

interface AddictionInsightsProps {
  userId?: string;
}

export const AddictionInsights: React.FC<AddictionInsightsProps> = ({ userId = 'default_user' }) => {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchInsights = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const baseUrl = Platform.select({
        android: 'http://10.54.50.182:8001',
        ios: 'http://localhost:8001',
        default: 'http://localhost:8001'
      });
      console.log('🔍 Fetching addiction insights from:', `${baseUrl}/api/addiction-insights/${userId}`);
      
      const response = await fetch(`${baseUrl}/api/addiction-insights/${userId}`);
      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📊 Data received:', result.status);
      
      if (result.status === 'success') {
        setData(result);
      }
    } catch (error) {
      console.error('❌ Failed to fetch addiction insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  if (loading) {
    return (
      <Card style={styles.emptyCard}>
        <Ionicons name="analytics-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>Analyzing AI insights...</Text>
        <Text style={styles.debugText}>Check console for logs</Text>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card style={styles.emptyCard}>
        <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No data available</Text>
        <Text style={styles.debugText}>Check adb logcat for errors</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInsights}>
          <Text style={styles.retryText}>Retry Connection</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  const { risk_assessment, insights, recommendations, three_day_summary, trend } = data;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={() => fetchInsights(true)}
        disabled={refreshing}
      >
        <Ionicons name="refresh" size={20} color={Colors.primary} />
        <Text style={styles.refreshText}>
          {refreshing ? 'Refreshing...' : 'Refresh Analysis'}
        </Text>
      </TouchableOpacity>

      <Card style={[styles.riskCard, { borderLeftColor: risk_assessment.color, borderLeftWidth: 4 }]}>
        <View style={styles.riskHeader}>
          <Ionicons name="shield-checkmark" size={32} color={risk_assessment.color} />
          <View style={styles.riskInfo}>
            <Text style={styles.riskLabel}>Addiction Risk</Text>
            <Text style={[styles.riskLevel, { color: risk_assessment.color }]}>
              {risk_assessment.label.toUpperCase()}
            </Text>
            <Text style={styles.riskProb}>
              {Math.round(risk_assessment.probability * 100)}% confidence
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.trendCard}>
        <View style={styles.cardHeader}>
          <Ionicons name={trend.icon} size={20} color={trend.color} />
          <Text style={styles.cardTitle}>3-Day Usage Trend</Text>
        </View>
        <View style={styles.dayGrid}>
          {[three_day_summary.day1, three_day_summary.day2, three_day_summary.day3].map((day, i) => (
            <View key={i} style={styles.dayItem}>
              <Text style={styles.dayLabel}>Day {i + 1}</Text>
              <Text style={styles.dayMinutes}>{day.total_minutes}m</Text>
              <View style={[styles.riskDot, { 
                backgroundColor: ['#4CAF50', '#FF9800', '#FF5722', '#D32F2F'][day.risk_level] 
              }]} />
            </View>
          ))}
        </View>
      </Card>

      {insights.length > 0 && (
        <Card style={styles.insightsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={20} color="#FF9800" />
            <Text style={styles.cardTitle}>AI Insights</Text>
          </View>
          {insights.map((insight: any, i: number) => (
            <View key={i} style={styles.insightItem}>
              <Ionicons 
                name={insight.icon} 
                size={18} 
                color={
                  insight.severity === 'critical' ? '#D32F2F' :
                  insight.severity === 'high' ? '#FF5722' :
                  insight.severity === 'moderate' ? '#FF9800' : '#4CAF50'
                } 
              />
              <Text style={styles.insightText}>{insight.message}</Text>
            </View>
          ))}
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card style={styles.recommendationsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>Recommendations</Text>
          </View>
          {recommendations.map((rec: string, i: number) => (
            <View key={i} style={styles.recItem}>
              <Text style={styles.recNumber}>{i + 1}</Text>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  riskCard: { marginBottom: 16 },
  riskHeader: { flexDirection: 'row', alignItems: 'center' },
  riskInfo: { marginLeft: 16, flex: 1 },
  riskLabel: { fontSize: 14, color: Colors.textLight },
  riskLevel: { fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  riskProb: { fontSize: 12, color: Colors.textLight },
  trendCard: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginLeft: 8, color: Colors.text },
  dayGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  dayItem: { alignItems: 'center' },
  dayLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 4 },
  dayMinutes: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  riskDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  insightsCard: { marginBottom: 16 },
  insightItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  insightText: { marginLeft: 12, fontSize: 14, color: Colors.text, flex: 1 },
  recommendationsCard: { marginBottom: 16 },
  recItem: { flexDirection: 'row', marginBottom: 10 },
  recNumber: { 
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#4CAF50',
    color: '#fff', textAlign: 'center', lineHeight: 24, fontWeight: 'bold', marginRight: 12
  },
  recText: { fontSize: 14, color: Colors.text, flex: 1 },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyText: { marginTop: 16, fontSize: 14, color: Colors.textLight },
  debugText: { marginTop: 8, fontSize: 12, color: '#999', fontStyle: 'italic' },
  retryButton: { marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  refreshText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
