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

export interface Organization {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export type UserRole = 'ADMIN' | 'COUNSELOR' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  organization: Organization;
}

export interface AuthResponse {
  message: string;
  expiresInMs: number;
  user: User;
}

export interface LoginRequest {
  organizationSlug: string;
  email: string;
  password: string;
}

export interface RegisterRequest {
  organizationName: string;
  organizationSlug?: string;
  name: string;
  email: string;
  password: string;
}

export interface CsrfResponse {
  token?: string;
  headerName?: string;
  parameterName?: string;
  message?: string;
}
