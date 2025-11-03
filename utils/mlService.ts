import AsyncStorage from '@react-native-async-storage/async-storage';

// Use different URLs based on platform
import { Platform } from 'react-native';

const ML_API_BASE = Platform.select({
  android: 'http://10.54.50.182:8001/api',  // Your local network IP
  ios: 'http://localhost:8001/api',      // iOS simulator
  default: 'http://localhost:8001/api'
});

export interface UsageData {
  app_name: string;
  duration: number;
  timestamp: Date;
  user_id: string;
}

export interface MLInsights {
  predicted_next_usage: number;
  anomaly_detected: boolean;
  risk_level: string;
  recommendations: string[];
}

export interface Predictions {
  next_hour_usage: number;
  daily_total_prediction: number;
  app_predictions: Record<string, number>;
  break_recommendations: Array<{
    time_offset: number;
    duration: number;
    type: string;
    activity: string;
  }>;
  confidence_score: number;
  risk_assessment: {
    risk_level: string;
    risk_score: number;
    risk_factors: string[];
    recommendations: string[];
  };
}

export interface BehaviorInsights {
  behavior_cluster: {
    cluster: number;
    cluster_name: string;
    cluster_stats: Record<string, number>;
    stability: number;
  };
  anomalies: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  patterns: {
    peak_usage_hour: number;
    peak_usage_day: number;
    consistency_score: number;
  };
  insights: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
  recommendations: string[];
}

export type RecommendationItem = string | {
  type: string;
  message: string;
  priority: string;
};

export interface AddictionInsights {
  status: string;
  user_id: string;
  risk_assessment: {
    level: number;
    label: string;
    probability: number;
    color: string;
  };
  insights: Array<{
    icon: string;
    message: string;
    severity: string;
    type: string;
  }>;
  recommendations: string[];
  three_day_summary: {
    day1: { date: string; total_minutes: number; risk_level: number };
    day2: { date: string; total_minutes: number; risk_level: number };
    day3: { date: string; total_minutes: number; risk_level: number };
  };
  trend: {
    direction: string;
    icon: string;
    color: string;
  };
}

class MLService {
  private ws: WebSocket | null = null;
  private userId: string = 'default_user';

  constructor() {
    this.initializeUserId();
  }

  private async initializeUserId() {
    try {
      let userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('user_id', userId);
      }
      this.userId = userId;
    } catch (error) {
      console.error('Error initializing user ID:', error);
    }
  }

  async connectWebSocket(onMessage?: (data: any) => void) {
    // WebSocket disabled for React Native compatibility
    console.log('WebSocket connection skipped - using REST API only');
  }

  async sendUsageUpdate(usageData: Partial<UsageData>) {
    // Use REST API instead of WebSocket
    await this.logUsage(usageData);
  }

  async logUsage(usageData: Partial<UsageData>): Promise<MLInsights | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${ML_API_BASE}/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...usageData,
          user_id: this.userId,
          timestamp: new Date().toISOString()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.insights;
    } catch (error) {
      return null;
    }
  }

  async getPredictions(): Promise<Predictions | null> {
    try {
      const response = await fetch(`${ML_API_BASE}/predictions/${this.userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.predictions;
    } catch (error) {
      return null;
    }
  }

  async getBehaviorInsights(): Promise<BehaviorInsights | null> {
    try {
      const response = await fetch(`${ML_API_BASE}/insights/${this.userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.insights;
    } catch (error) {
      return null;
    }
  }

  async getRecommendations(): Promise<RecommendationItem[] | null> {
    try {
      const response = await fetch(`${ML_API_BASE}/recommendations/${this.userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.recommendations;
    } catch (error) {
      return null;
    }
  }

  async optimizeBreaks(currentUsage: number, dailyPattern: number[]): Promise<any> {
    try {
      const response = await fetch(`${ML_API_BASE}/break-optimization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_usage: currentUsage,
          daily_pattern: dailyPattern,
          user_id: this.userId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.break_schedule;
    } catch (error) {
      return null;
    }
  }

  async getAddictionInsights(): Promise<AddictionInsights | null> {
    try {
      const response = await fetch(`${ML_API_BASE}/addiction-insights/${this.userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.status === 'success' ? result : null;
    } catch (error) {
      return null;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const mlService = new MLService();