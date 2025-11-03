import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { Card } from './ui/Card';
import type { LocalPrediction } from '../utils/localMLPredictor';

interface LocalMLInsightsProps {
  predictions: LocalPrediction | null;
  isAnalyzing: boolean;
  confidence: number;
}

export const LocalMLInsights: React.FC<LocalMLInsightsProps> = ({ 
  predictions, 
  isAnalyzing, 
  confidence 
}) => {
  if (isAnalyzing) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>🤖 AI Analyzing Usage Patterns...</Text>
        </View>
      </Card>
    );
  }

  if (!predictions) {
    return null;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return Colors.danger;
      case 'medium': return Colors.warning;
      case 'low': return Colors.success;
      default: return Colors.textLight;
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return 'alert-circle';
      case 'medium': return 'warning';
      case 'low': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={24} color={Colors.primary} />
        <Text style={styles.title}>🤖 AI-Powered Insights</Text>
      </View>

      {/* Behavior Pattern */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Behavior Pattern</Text>
        <View style={styles.patternBox}>
          <Text style={styles.patternType}>{predictions.behaviorPattern.type}</Text>
          <Text style={styles.patternDesc}>{predictions.behaviorPattern.description}</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>
              {Math.round(predictions.behaviorPattern.confidence * 100)}% Confidence
            </Text>
          </View>
        </View>
      </View>

      {/* Risk Assessment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <View style={styles.riskBox}>
          <Ionicons 
            name={getRiskIcon(predictions.riskLevel)} 
            size={32} 
            color={getRiskColor(predictions.riskLevel)} 
          />
          <Text style={[styles.riskLevel, { color: getRiskColor(predictions.riskLevel) }]}>
            {predictions.riskLevel.toUpperCase()} RISK
          </Text>
        </View>
      </View>

      {/* Predictions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Predictions</Text>
        <View style={styles.predictionGrid}>
          <View style={styles.predictionCard}>
            <Ionicons name="time-outline" size={24} color={Colors.primary} />
            <Text style={styles.predictionValue}>{predictions.nextHourUsage}m</Text>
            <Text style={styles.predictionLabel}>Next Hour</Text>
          </View>
          <View style={styles.predictionCard}>
            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
            <Text style={styles.predictionValue}>{predictions.dailyTotalPrediction}m</Text>
            <Text style={styles.predictionLabel}>Today Total</Text>
          </View>
          <View style={styles.predictionCard}>
            <Ionicons name="trending-up-outline" size={24} color={Colors.primary} />
            <Text style={styles.predictionValue}>{predictions.peakHour}:00</Text>
            <Text style={styles.predictionLabel}>Peak Hour</Text>
          </View>
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 AI Recommendations</Text>
        {predictions.recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* ML Badge */}
      <View style={styles.mlBadge}>
        <Ionicons name="code-slash" size={16} color={Colors.textLight} />
        <Text style={styles.mlBadgeText}>
          Powered by Local ML • {Math.round(confidence * 100)}% Confidence
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  patternBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  patternType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  patternDesc: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  riskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  predictionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  predictionCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  predictionLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  recommendationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  mlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  mlBadgeText: {
    fontSize: 11,
    color: Colors.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
});


