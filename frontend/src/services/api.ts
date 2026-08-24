import {
  HealthResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Organization,
  CsrfResponse
} from '../types/api';
import {
  Course,
  CourseRequest,
  Lead,
  LeadCreateRequest,
  LeadUpdateRequest,
  LeadStatusUpdateRequest,
  LeadAssignRequest,
  LeadPageResponse,
  LeadActivity,
  ActivityLogRequest,
  FollowUp,
  FollowUpCreateRequest,
  FollowUpCompleteRequest,
  DashboardMetrics,
  LeadStatus,
  LeadSource,
  LeadPriority,
  FollowUpStatus
} from '../types/lead';

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

  // --- Auth & Health Endpoints ---

  public async getCsrfToken(): Promise<CsrfResponse> {
    return this.request<CsrfResponse>('/auth/csrf');
  }

  public async getHealthStatus(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  public async register(request: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  public async login(request: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  public async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  public async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  public async getCurrentOrganization(): Promise<Organization> {
    return this.request<Organization>('/organizations/me');
  }

  // --- Course Endpoints ---

  public async getCourses(includeInactive = false): Promise<Course[]> {
    return this.request<Course[]>(`/courses?includeInactive=${includeInactive}`);
  }

  public async getCourse(id: string): Promise<Course> {
    return this.request<Course>(`/courses/${id}`);
  }

  public async createCourse(request: CourseRequest): Promise<Course> {
    return this.request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  public async updateCourse(id: string, request: CourseRequest): Promise<Course> {
    return this.request<Course>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  public async deleteCourse(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Lead Endpoints ---

  public async getLeads(params: {
    search?: string;
    status?: LeadStatus;
    courseId?: string;
    assignedToId?: string;
    source?: LeadSource;
    priority?: LeadPriority;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  } = {}): Promise<LeadPageResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.courseId) query.set('courseId', params.courseId);
    if (params.assignedToId) query.set('assignedToId', params.assignedToId);
    if (params.source) query.set('source', params.source);
    if (params.priority) query.set('priority', params.priority);
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortDir) query.set('sortDir', params.sortDir);

    const queryString = query.toString();
    return this.request<LeadPageResponse>(`/leads${queryString ? `?${queryString}` : ''}`);
  }

  public async getLead(id: string): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`);
  }

  public async createLead(request: LeadCreateRequest): Promise<Lead> {
    return this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  public async updateLead(id: string, request: LeadUpdateRequest): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  public async updateLeadStatus(id: string, request: LeadStatusUpdateRequest): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  public async assignLead(id: string, request: LeadAssignRequest): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  public async deleteLead(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Lead Activity Endpoints ---

  public async getLeadActivities(leadId: string): Promise<LeadActivity[]> {
    return this.request<LeadActivity[]>(`/leads/${leadId}/activities`);
  }

  public async logActivity(leadId: string, request: ActivityLogRequest): Promise<LeadActivity> {
    return this.request<LeadActivity>(`/leads/${leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // --- Follow-Up Endpoints ---

  public async getFollowUps(params: {
    status?: FollowUpStatus;
    todayOnly?: boolean;
    assignedToId?: string;
  } = {}): Promise<FollowUp[]> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.todayOnly !== undefined) query.set('todayOnly', params.todayOnly.toString());
    if (params.assignedToId) query.set('assignedToId', params.assignedToId);

    const queryString = query.toString();
    return this.request<FollowUp[]>(`/follow-ups${queryString ? `?${queryString}` : ''}`);
  }

  public async createFollowUp(leadId: string, request: FollowUpCreateRequest): Promise<FollowUp> {
    return this.request<FollowUp>(`/leads/${leadId}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  public async completeFollowUp(id: string, request: FollowUpCompleteRequest = {}): Promise<FollowUp> {
    return this.request<FollowUp>(`/follow-ups/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  public async cancelFollowUp(id: string): Promise<FollowUp> {
    return this.request<FollowUp>(`/follow-ups/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  // --- Dashboard Metrics Endpoint ---

  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/dashboard/metrics');
  }
}

export const apiService = new ApiService();
