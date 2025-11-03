/**
 * Local ML Predictor - Client-side predictions
 * Makes the app work like an ML project without backend
 */

export interface LocalPrediction {
  nextHourUsage: number;
  dailyTotalPrediction: number;
  peakHour: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  behaviorPattern: {
    type: string;
    confidence: number;
    description: string;
  };
}

export interface UsageHistory {
  apps: { name: string; timeSpent: number }[];
  totalTime: number;
  hourlyData: { hour: number; usage: number }[];
  timestamp: number;
}

/**
 * Simple linear regression for usage prediction
 */
function predictLinear(timestamps: number[], values: number[], targetTime: number): number {
  if (timestamps.length < 2) {
    return values[0] || 0;
  }

  // Simple linear interpolation
  const lastIndex = timestamps.length - 1;
  const x1 = timestamps[lastIndex - 1];
  const y1 = values[lastIndex - 1];
  const x2 = timestamps[lastIndex];
  const y2 = values[lastIndex];

  const slope = (y2 - y1) / (x2 - x1);
  const intercept = y2 - slope * x2;

  return Math.max(0, slope * targetTime + intercept);
}

/**
 * Detect behavior patterns in usage data
 */
function detectBehaviorPattern(history: UsageHistory[]): {
  type: string;
  confidence: number;
  description: string;
} {
  if (history.length < 3) {
    return {
      type: 'Insufficient Data',
      confidence: 0,
      description: 'Need more usage history to detect patterns'
    };
  }

  // Calculate average hourly usage
  const hourlyAverages: number[] = new Array(24).fill(0);
  const hourlyCounts: number[] = new Array(24).fill(0);

  history.forEach(h => {
    h.hourlyData.forEach(({ hour, usage }) => {
      hourlyAverages[hour] += usage;
      hourlyCounts[hour]++;
    });
  });

  // Normalize
  for (let i = 0; i < 24; i++) {
    if (hourlyCounts[i] > 0) {
      hourlyAverages[i] /= hourlyCounts[i];
    }
  }

  // Find peak hour
  const peakHour = hourlyAverages.indexOf(Math.max(...hourlyAverages));
  const totalUsage = history.reduce((sum, h) => sum + h.totalTime, 0) / history.length;

  // Classify behavior
  if (totalUsage < 60) {
    return {
      type: 'Light User',
      confidence: 0.85,
      description: `You're a light user with peak activity around ${peakHour}:00`
    };
  } else if (totalUsage < 180) {
    return {
      type: 'Moderate User',
      confidence: 0.75,
      description: `Moderate usage detected, busiest hour is ${peakHour}:00`
    };
  } else if (totalUsage < 300) {
    return {
      type: 'Heavy User',
      confidence: 0.90,
      description: `Heavy usage pattern with peak at ${peakHour}:00`
    };
  } else {
    return {
      type: 'Excessive User',
      confidence: 0.95,
      description: `Very high usage detected. Peak hour: ${peakHour}:00`
    };
  }
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  history: UsageHistory[],
  currentUsage: number,
  dailyLimit: number
): string[] {
  const recommendations: string[] = [];

  if (history.length === 0) {
    return [
      '📊 Start tracking to get personalized insights',
      '🎯 Set a daily limit that works for you',
      '⏰ Take regular breaks every 30 minutes'
    ];
  }

  const avgUsage = history.reduce((sum, h) => sum + h.totalTime, 0) / history.length;
  const usagePercentage = (currentUsage / dailyLimit) * 100;

  // Time-based recommendations
  if (usagePercentage < 50) {
    recommendations.push('🌟 Great job! You\'re well below your limit');
    recommendations.push('💡 This is a good time to plan tomorrow\'s usage');
  } else if (usagePercentage < 75) {
    recommendations.push('⚠️ You\'re approaching your daily limit');
    recommendations.push('🎯 Try to reduce usage in next few hours');
  } else if (usagePercentage < 100) {
    recommendations.push('🚨 You\'re almost at your limit!');
    recommendations.push('⏸️ Consider taking a break now');
  } else {
    recommendations.push('🚫 You\'ve exceeded your daily limit');
    recommendations.push('😴 Time for a device-free evening');
  }

  // Pattern-based recommendations
  if (avgUsage > dailyLimit * 0.9) {
    recommendations.push('📉 Consider increasing your daily limit by 30 minutes');
  }

  const peakHour = history[0]?.hourlyData.find(h => h.usage === Math.max(...history[0].hourlyData.map(d => d.usage)))?.hour || 0;
  if (peakHour >= 22 || peakHour <= 6) {
    recommendations.push('🌙 High late-night usage detected - try bedtime mode');
  }

  const topApps = history[0]?.apps.slice(0, 3) || [];
  if (topApps.length > 0) {
    recommendations.push(`🎯 Focus on reducing time in ${topApps[0]?.name}`);
  }

  return recommendations.slice(0, 5); // Max 5 recommendations
}

/**
 * Main prediction function
 */
export function generateLocalMLPredictions(
  history: UsageHistory[],
  currentUsage: number,
  dailyLimit: number,
  currentHour: number
): LocalPrediction {
  // Calculate current trend
  const recentTimestamps = history.slice(-6).map((h, i) => i);
  const recentUsage = history.slice(-6).map(h => h.totalTime);
  
  // Predict next hour
  const nextHourUsage = predictLinear(recentTimestamps, recentUsage, recentTimestamps.length);
  
  // Predict daily total
  const hourlyRate = currentUsage / Math.max(1, currentHour);
  const remainingHours = 24 - currentHour;
  const projectedUsage = currentUsage + (hourlyRate * remainingHours * 0.8); // Conservative estimate

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const usagePercentage = (currentUsage / dailyLimit) * 100;
  if (usagePercentage > 90) {
    riskLevel = 'high';
  } else if (usagePercentage > 70) {
    riskLevel = 'medium';
  }

  // Detect behavior pattern
  const behaviorPattern = detectBehaviorPattern(history);

  // Generate recommendations
  const recommendations = generateRecommendations(history, currentUsage, dailyLimit);

  return {
    nextHourUsage: Math.round(nextHourUsage),
    dailyTotalPrediction: Math.round(projectedUsage),
    peakHour: history[0]?.hourlyData.find(h => h.usage === Math.max(...history[0].hourlyData.map(d => d.usage)))?.hour || 0,
    riskLevel,
    recommendations,
    behaviorPattern
  };
}

/**
 * Generate hourly breakdown for predictions
 */
export function generateHourlyBreakdown(
  history: UsageHistory[],
  currentHour: number
): { hour: number; predictedUsage: number; actualUsage: number }[] {
  const breakdown: { hour: number; predictedUsage: number; actualUsage: number }[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const historicalData = history.map(h => h.hourlyData.find(d => d.hour === hour)?.usage || 0);
    const avgUsage = historicalData.length > 0 
      ? historicalData.reduce((sum, u) => sum + u, 0) / historicalData.length 
      : 0;
    
    breakdown.push({
      hour,
      predictedUsage: Math.round(avgUsage * 1.1), // Slight upward trend
      actualUsage: hour <= currentHour && history[0] 
        ? history[0].hourlyData.find(d => d.hour === hour)?.usage || 0 
        : 0
    });
  }
  
  return breakdown;
}

/**
 * Create demo ML insights for presentation
 */
export function createDemoMLInsights(totalUsage: number, dailyLimit: number): LocalPrediction {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Simulate some history
  const mockHistory: UsageHistory[] = [
    {
      apps: [
        { name: 'YouTube', timeSpent: 45 },
        { name: 'WhatsApp', timeSpent: 30 },
        { name: 'Instagram', timeSpent: 20 }
      ],
      totalTime: totalUsage * 0.9,
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        usage: i >= 9 && i <= 18 ? Math.random() * 15 + 5 : Math.random() * 3
      })),
      timestamp: Date.now() - 86400000 // Yesterday
    },
    {
      apps: [
        { name: 'YouTube', timeSpent: 40 },
        { name: 'WhatsApp', timeSpent: 35 },
        { name: 'Chrome', timeSpent: 25 }
      ],
      totalTime: totalUsage * 0.95,
      hourlyData: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        usage: i >= 9 && i <= 18 ? Math.random() * 15 + 5 : Math.random() * 3
      })),
      timestamp: Date.now() - 172800000 // 2 days ago
    }
  ];

  return generateLocalMLPredictions(mockHistory, totalUsage, dailyLimit, currentHour);
}


