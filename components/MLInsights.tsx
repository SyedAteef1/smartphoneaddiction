import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { Card } from './ui/Card';
import { useMLInsights } from '../hooks/useMLInsights';

export const MLInsights: React.FC = () => {
  const {
    insights,
    predictions,
    behaviorInsights,
    recommendations,
    realTimeInsights,
    isLoading,
    error,
    fetchPredictions,
    fetchBehaviorInsights,
    fetchRecommendations
  } = useMLInsights();

  useEffect(() => {
    fetchPredictions();
    fetchBehaviorInsights();
    fetchRecommendations();
  }, []);

  if (error) {
    return (
      <Card style={styles.errorCard}>
        <Ionicons name="warning" size={24} color={Colors.danger} />
        <Text style={styles.errorText}>ML insights unavailable</Text>
      </Card>
    );
  }

  if (!predictions && !behaviorInsights && !recommendations.length && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Card style={styles.emptyCard}>
          <Ionicons name="analytics-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>ML Backend Not Connected</Text>
          <Text style={styles.emptyText}>Start the ML backend server to see AI-powered insights</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            fetchPredictions();
            fetchBehaviorInsights();
            fetchRecommendations();
          }}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Real-time Insights */}
      {realTimeInsights && (
        <Card style={styles.realtimeCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="pulse" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Live ML Analysis</Text>
          </View>
          
          {realTimeInsights.anomaly_detected && (
            <View style={styles.alertBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.alertText}>Unusual usage pattern detected</Text>
            </View>
          )}
          
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Risk Level:</Text>
            <Text style={[styles.metricValue, { 
              color: realTimeInsights.risk_level === 'high' ? Colors.danger : 
                     realTimeInsights.risk_level === 'medium' ? Colors.warning : Colors.success 
            }]}>
              {realTimeInsights.risk_level?.toUpperCase()}
            </Text>
          </View>
        </Card>
      )}

      {/* Usage Predictions */}
      {predictions && (
        <Card style={styles.predictionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Usage Predictions</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {Math.round(predictions.confidence_score * 100)}% confident
              </Text>
            </View>
          </View>
          
          <View style={styles.predictionGrid}>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionValue}>
                {Math.round(predictions.next_hour_usage)}m
              </Text>
              <Text style={styles.predictionLabel}>Next Hour</Text>
            </View>
            <View style={styles.predictionItem}>
              <Text style={styles.predictionValue}>
                {Math.round(predictions.daily_total_prediction)}m
              </Text>
              <Text style={styles.predictionLabel}>Daily Total</Text>
            </View>
          </View>

          {/* Risk Assessment */}
          {predictions.risk_assessment && (
            <View style={styles.riskSection}>
              <Text style={styles.sectionTitle}>Risk Assessment</Text>
              <View style={[styles.riskBadge, { 
                backgroundColor: predictions.risk_assessment.risk_level === 'high' ? '#FFE6E6' : 
                                predictions.risk_assessment.risk_level === 'medium' ? '#FFF3E0' : '#E8F5E9'
              }]}>
                <Text style={[styles.riskText, {
                  color: predictions.risk_assessment.risk_level === 'high' ? Colors.danger : 
                         predictions.risk_assessment.risk_level === 'medium' ? Colors.warning : Colors.success
                }]}>
                  {predictions.risk_assessment.risk_level.toUpperCase()} RISK
                </Text>
              </View>
              
              {predictions.risk_assessment.risk_factors.map((factor, index) => (
                <Text key={index} style={styles.riskFactor}>• {factor}</Text>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Behavior Analysis */}
      {behaviorInsights && (
        <Card style={styles.behaviorCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Behavior Analysis</Text>
          </View>
          
          <View style={styles.clusterInfo}>
            <Text style={styles.clusterLabel}>User Type:</Text>
            <Text style={styles.clusterName}>
              {behaviorInsights.behavior_cluster.cluster_name}
            </Text>
            <View style={styles.stabilityBar}>
              <View 
                style={[styles.stabilityFill, { 
                  width: `${behaviorInsights.behavior_cluster.stability * 100}%` 
                }]} 
              />
            </View>
            <Text style={styles.stabilityText}>
              {Math.round(behaviorInsights.behavior_cluster.stability * 100)}% stable
            </Text>
          </View>

          {/* Anomalies */}
          {behaviorInsights.anomalies.length > 0 && (
            <View style={styles.anomaliesSection}>
              <Text style={styles.sectionTitle}>Behavioral Anomalies</Text>
              {behaviorInsights.anomalies.map((anomaly, index) => (
                <View key={index} style={styles.anomalyItem}>
                  <Ionicons 
                    name="warning" 
                    size={16} 
                    color={anomaly.severity === 'high' ? Colors.danger : Colors.warning} 
                  />
                  <Text style={styles.anomalyText}>{anomaly.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Usage Patterns */}
          <View style={styles.patternsSection}>
            <Text style={styles.sectionTitle}>Usage Patterns</Text>
            <Text style={styles.patternText}>
              Peak usage: {behaviorInsights.patterns.peak_usage_hour}:00
            </Text>
            <Text style={styles.patternText}>
              Consistency: {Math.round(behaviorInsights.patterns.consistency_score * 100)}%
            </Text>
          </View>
        </Card>
      )}

      {/* Break Recommendations */}
      {predictions?.break_recommendations && predictions.break_recommendations.length > 0 && (
        <Card style={styles.breaksCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Smart Break Schedule</Text>
          </View>
          
          {predictions.break_recommendations.map((breakRec, index) => (
            <View key={index} style={styles.breakItem}>
              <View style={styles.breakTime}>
                <Text style={styles.breakTimeText}>
                  +{breakRec.time_offset}m
                </Text>
              </View>
              <View style={styles.breakInfo}>
                <Text style={styles.breakType}>{breakRec.type.replace('_', ' ')}</Text>
                <Text style={styles.breakActivity}>{breakRec.activity}</Text>
                <Text style={styles.breakDuration}>{breakRec.duration} minutes</Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* ML Recommendations */}
      {recommendations.length > 0 && (
        <Card style={styles.recommendationsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={20} color={Colors.warning} />
            <Text style={styles.cardTitle}>AI Recommendations</Text>
          </View>
          
          {recommendations.slice(0, 3).map((recommendation, index) => (
            <TouchableOpacity key={index} style={styles.recommendationItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {isLoading && (
        <Card style={styles.loadingCard}>
          <Ionicons name="refresh" size={24} color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing usage patterns...</Text>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: Colors.danger,
    fontSize: 14,
  },
  realtimeCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  predictionCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  behaviorCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  breaksCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  recommendationsCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.textLight,
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: {
    marginLeft: 6,
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '500',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  predictionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  predictionItem: {
    alignItems: 'center',
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  predictionLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  riskSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  riskFactor: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  clusterInfo: {
    marginBottom: 16,
  },
  clusterLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  clusterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  stabilityBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 4,
  },
  stabilityFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  stabilityText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  anomaliesSection: {
    marginBottom: 16,
  },
  anomalyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  anomalyText: {
    marginLeft: 8,
    fontSize: 12,
    color: Colors.textLight,
    flex: 1,
  },
  patternsSection: {
    marginBottom: 16,
  },
  patternText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  breakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakTime: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  breakTimeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  breakInfo: {
    flex: 1,
  },
  breakType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  breakActivity: {
    fontSize: 12,
    color: Colors.textLight,
  },
  breakDuration: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});