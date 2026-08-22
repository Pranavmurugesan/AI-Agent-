import {
  HealthResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Organization,
  CsrfResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Utility to extract a cookie value by name from document.cookie.
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

class ApiService {
  /**
   * Core request wrapper configured with HttpOnly credentials,
   * CSRF protection (X-XSRF-TOKEN), and standard error parsing.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Attach CSRF token on state-changing requests (POST, PUT, PATCH, DELETE)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Ensure cookies (jwt_token HttpOnly + XSRF-TOKEN) are automatically sent
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Fallback if response is not JSON
        }
        throw new Error(errorMessage);
      }

      // If empty response (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(error.message || 'Unable to connect to backend server.');
    }
  }

  /**
   * Initializes or fetches CSRF token information.
   * GET /api/v1/auth/csrf
   */
  public async getCsrfToken(): Promise<CsrfResponse> {
    return this.request<CsrfResponse>('/auth/csrf');
  }

  /**
   * Health check API endpoint call
   * GET /api/v1/health
   */
  public async getHealthStatus(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  /**
   * Register a new Institute and Admin user
   * POST /api/v1/auth/register
   */
  public async register(request: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Login to an Institute account
   * POST /api/v1/auth/login
   */
  public async login(request: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Logout current session (clears HttpOnly jwt_token cookie)
   * POST /api/v1/auth/logout
   */
  public async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * Get current authenticated user details
   * GET /api/v1/users/me
   */
  public async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  /**
   * Get current authenticated organization details
   * GET /api/v1/organizations/me
   */
  public async getCurrentOrganization(): Promise<Organization> {
    return this.request<Organization>('/organizations/me');
  }
}

export const apiService = new ApiService();
