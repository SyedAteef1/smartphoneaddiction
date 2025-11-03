import { useState, useEffect, useCallback } from 'react';
import { 
  generateLocalMLPredictions, 
  createDemoMLInsights,
  type LocalPrediction 
} from '../utils/localMLPredictor';

export const useLocalML = (totalUsage: number, dailyLimit: number) => {
  const [predictions, setPredictions] = useState<LocalPrediction | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeUsage = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate ML analysis delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate predictions
    const mlInsights = createDemoMLInsights(totalUsage, dailyLimit);
    setPredictions(mlInsights);
    setConfidence(mlInsights.behaviorPattern.confidence);
    
    setIsAnalyzing(false);
  }, [totalUsage, dailyLimit]);

  // Auto-analyze when usage changes
  useEffect(() => {
    if (totalUsage > 0) {
      analyzeUsage();
    }
  }, [totalUsage, analyzeUsage]);

  return {
    predictions,
    confidence,
    isAnalyzing,
    analyzeUsage
  };
};


