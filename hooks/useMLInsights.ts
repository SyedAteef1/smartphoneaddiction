import { useState, useEffect, useCallback } from 'react';
import { mlService, MLInsights, Predictions, BehaviorInsights, RecommendationItem, AddictionInsights } from '../utils/mlService';

export const useMLInsights = () => {
  const [insights, setInsights] = useState<MLInsights | null>(null);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [behaviorInsights, setBehaviorInsights] = useState<BehaviorInsights | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [addictionInsights, setAddictionInsights] = useState<AddictionInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realTimeInsights, setRealTimeInsights] = useState<any>(null);

  // ML features are optional and disabled by default

  const logUsage = useCallback(async (appName: string, duration: number) => {
    try {
      const result = await mlService.logUsage({
        app_name: appName,
        duration: duration
      });

      if (result) {
        setInsights(result);
        // Auto-refresh predictions after logging
        fetchPredictions();
      }
    } catch (err) {
      // Silent fail for usage logging
    }
  }, [fetchPredictions]);

  const fetchPredictions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await mlService.getPredictions();
      if (result) {
        setPredictions(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBehaviorInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await mlService.getBehaviorInsights();
      if (result) {
        setBehaviorInsights(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch behavior insights');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await mlService.getRecommendations();
      if (result) {
        setRecommendations(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAddictionInsights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await mlService.getAddictionInsights();
      if (result) {
        setAddictionInsights(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addiction insights');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const optimizeBreaks = useCallback(async (currentUsage: number, dailyPattern: number[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await mlService.optimizeBreaks(currentUsage, dailyPattern);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize breaks');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enable ML features with auto-retry
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchMLData = async () => {
      try {
        await Promise.all([
          fetchPredictions(),
          fetchBehaviorInsights(),
          fetchRecommendations()
        ]);
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchMLData, 2000 * retryCount); // Exponential backoff
        }
      }
    };

    fetchMLData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMLData, 300000);
    return () => clearInterval(interval);
  }, [fetchPredictions, fetchBehaviorInsights, fetchRecommendations]);

  return {
    insights,
    predictions,
    behaviorInsights,
    recommendations,
    addictionInsights,
    realTimeInsights,
    isLoading,
    error,
    logUsage,
    fetchPredictions,
    fetchBehaviorInsights,
    fetchRecommendations,
    fetchAddictionInsights,
    optimizeBreaks
  };
};