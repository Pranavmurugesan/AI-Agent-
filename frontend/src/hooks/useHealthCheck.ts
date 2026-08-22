import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { ApiState, HealthResponse } from '../types/api';

export function useHealthCheck(pollIntervalMs: number = 30000) {
  const [state, setState] = useState<ApiState<HealthResponse>>({
    data: null,
    loading: true,
    error: null,
    lastChecked: null,
  });

  const checkHealth = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiService.getHealthStatus();
      setState({
        data,
        loading: false,
        error: null,
        lastChecked: new Date(),
      });
    } catch (err: any) {
      setState({
        data: null,
        loading: false,
        error: err.message || 'Backend service unavailable',
        lastChecked: new Date(),
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, pollIntervalMs);
    return () => clearInterval(interval);
  }, [checkHealth, pollIntervalMs]);

  return { ...state, refetch: checkHealth };
}
