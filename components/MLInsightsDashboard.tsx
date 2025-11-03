import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Colors } from '../constants/theme';
import { useAppUsage } from '../hooks/useAppUsage';

const screenWidth = Dimensions.get('window').width;

export const MLInsightsDashboard = () => {
  const { apps, totalTime, dailyLimit } = useAppUsage();
  const [riskLevel, setRiskLevel] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const [topApps, setTopApps] = useState<{name: string; time: number}[]>([]);

  useEffect(() => {
    analyzeUsage();
  }, [apps, totalTime]);

  const analyzeUsage = () => {
    // Calculate risk level
    const percentage = (totalTime / dailyLimit) * 100;
    let risk = 0;
    if (percentage > 100) risk = 3;
    else if (percentage > 80) risk = 2;
    else if (percentage > 50) risk = 1;
    setRiskLevel(risk);

    // Generate insights
    const newInsights: string[] = [];
    
    if (apps.length > 0) {
      const mostUsed = apps[0];
      newInsights.push(`${mostUsed.name} is your most used app (${mostUsed.timeSpent}min)`);
    }
    
    if (totalTime > dailyLimit) {
      newInsights.push(`You've exceeded your limit by ${totalTime - dailyLimit} minutes`);
    } else if (percentage > 75) {
      newInsights.push(`You're at ${Math.round(percentage)}% of your daily limit`);
    }
    
    if (apps.length > 10) {
      newInsights.push(`You've used ${apps.length} different apps today`);
    }

    setInsights(newInsights);
    setTopApps(apps.slice(0, 5).map(a => ({ name: a.name, time: a.timeSpent })));
  };

  const getRiskColor = () => {
    const colors = ['#4CAF50', '#FF9800', '#FF5722', '#D32F2F'];
    return colors[riskLevel];
  };

  const getRiskLabel = () => {
    const labels = ['Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk'];
    return labels[riskLevel];
  };

  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#667eea' }
  };

  const pieData = topApps.map((app, index) => ({
    name: app.name,
    population: app.time,
    color: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'][index],
    legendFontColor: Colors.text,
    legendFontSize: 12
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Risk Assessment */}
      <Card style={[styles.riskCard, { borderLeftColor: getRiskColor(), borderLeftWidth: 6 }]}>
        <View style={styles.riskHeader}>
          <Ionicons name="shield-checkmark" size={40} color={getRiskColor()} />
          <View style={styles.riskInfo}>
            <Text style={styles.riskLabel}>Addiction Risk</Text>
            <Text style={[styles.riskLevel, { color: getRiskColor() }]}>
              {getRiskLabel().toUpperCase()}
            </Text>
            <Text style={styles.riskDetail}>
              {totalTime} / {dailyLimit} minutes used
            </Text>
          </View>
        </View>
      </Card>

      {/* Top Apps Pie Chart */}
      {pieData.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 Top Apps Distribution</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card>
      )}

      {/* Daily Usage Bar Chart */}
      {apps.length > 0 && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>📈 App Usage Breakdown</Text>
          <BarChart
            data={{
              labels: topApps.map(a => a.name.substring(0, 8)),
              datasets: [{ data: topApps.map(a => a.time) }]
            }}
            width={screenWidth - 60}
            height={220}
            yAxisLabel=""
            yAxisSuffix="m"
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </Card>
      )}

      {/* AI Insights */}
      <Card style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <Ionicons name="bulb" size={24} color="#FF9800" />
          <Text style={styles.insightsTitle}>AI Insights</Text>
        </View>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
        {insights.length === 0 && (
          <Text style={styles.noInsights}>Start using apps to see insights</Text>
        )}
      </Card>

      {/* Recommendations */}
      <Card style={styles.recommendationsCard}>
        <View style={styles.recommendationsHeader}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={styles.recommendationsTitle}>Recommendations</Text>
        </View>
        {riskLevel >= 2 && (
          <>
            <Text style={styles.recommendation}>• Set app timers for top 3 apps</Text>
            <Text style={styles.recommendation}>• Take a 15-minute break now</Text>
            <Text style={styles.recommendation}>• Try alternative activities</Text>
          </>
        )}
        {riskLevel === 1 && (
          <>
            <Text style={styles.recommendation}>• Monitor usage closely</Text>
            <Text style={styles.recommendation}>• Set break reminders</Text>
          </>
        )}
        {riskLevel === 0 && (
          <Text style={styles.recommendation}>• Great job! Keep up the healthy habits</Text>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  riskCard: { marginBottom: 16 },
  riskHeader: { flexDirection: 'row', alignItems: 'center' },
  riskInfo: { marginLeft: 16, flex: 1 },
  riskLabel: { fontSize: 14, color: Colors.textLight },
  riskLevel: { fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  riskDetail: { fontSize: 12, color: Colors.textLight },
  chartCard: { marginBottom: 16, alignItems: 'center' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: Colors.text },
  chart: { marginVertical: 8, borderRadius: 16 },
  insightsCard: { marginBottom: 16 },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  insightsTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: Colors.text },
  insightItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  insightText: { marginLeft: 10, fontSize: 14, color: Colors.text, flex: 1 },
  noInsights: { fontSize: 14, color: Colors.textLight, fontStyle: 'italic' },
  recommendationsCard: { marginBottom: 30 },
  recommendationsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  recommendationsTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: Colors.text },
  recommendation: { fontSize: 14, color: Colors.text, marginBottom: 8, lineHeight: 20 },
});
