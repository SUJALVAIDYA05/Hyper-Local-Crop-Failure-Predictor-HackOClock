import { useState, useCallback } from 'react';
import type { AnalyzeResponse } from '../types';
import { analysisApi, type AnalyzeRequest } from '../api/client';

export interface UseRiskAnalysisResult {
  data: AnalyzeResponse | null;
  loading: boolean;
  error: string | null;
  analyze: (request: AnalyzeRequest) => Promise<void>;
  reset: () => void;
}

export function useRiskAnalysis(): UseRiskAnalysisResult {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (request: AnalyzeRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await analysisApi.analyze(request);
      if (response.success) {
        setData(response);
      } else {
        setError(response.error?.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, analyze, reset };
}
