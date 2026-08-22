export interface HealthResponse {
  status: string;
  service: string;
  timestamp?: string;
}

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastChecked: Date | null;
}
