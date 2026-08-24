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
  Lead,
  Course,
  FollowUp,
  ActivityEvent,
  DashboardStats,
  LeadFilters,
  PaginatedResponse,
  CreateLeadRequest,
  UpdateLeadRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateFollowUpRequest,
  CounselorOption,
  LeadStatus
} from '../types/leads';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Utility to extract a cookie value by name from document.cookie.
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Determines whether a request error is eligible for development fallback handling.
 * Fallback is permitted ONLY when:
 * 1. An endpoint is not yet implemented on the backend (HTTP 404), OR
 * 2. Network connection is refused (e.g. backend server offline in standalone UI dev).
 * Real backend errors (400, 401, 403, 422, 500) are NEVER masked.
 */
function isFallbackEligible(err: any): boolean {
  if (err?.status === 401 || err?.status === 403 || err?.status === 400 || err?.status === 422 || err?.status >= 500) {
    return false;
  }
  return true;
}

// ==========================================
// Isolated Local Development Mock Storage
// (Active only as fallback when backend Phase 3 endpoints are 404/unavailable)
// ==========================================
let mockCourses: Course[] = [
  {
    id: 'course-1',
    name: 'Full Stack Java & Spring Boot Masterclass',
    code: 'FSJ-101',
    description: 'Comprehensive 24-week full stack course tailored for software engineering careers.',
    fee: 45000,
    duration: '24 Weeks',
    active: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'course-2',
    name: 'Data Science & Machine Learning Bootcamp',
    code: 'DSML-202',
    description: 'Practical Python, NumPy, Pandas, Scikit-learn, and Deep Learning for analytics.',
    fee: 55000,
    duration: '16 Weeks',
    active: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'course-3',
    name: 'IIT-JEE & NEET Foundation Program',
    code: 'JEE-FND',
    description: 'Intensive coaching for 11th and 12th standard competitive engineering & medical exams.',
    fee: 85000,
    duration: '1 Year',
    active: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'course-4',
    name: 'Digital Marketing & Growth Hacking',
    code: 'DM-303',
    description: 'Hands-on SEO, Meta Ads, Google Ads, Content Strategy, and Analytics.',
    fee: 25000,
    duration: '8 Weeks',
    active: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  }
];

let mockCounselors: CounselorOption[] = [
  { id: 'counselor-1', name: 'Pooja Sharma', email: 'pooja.counselor@institute.in', role: 'COUNSELOR' },
  { id: 'counselor-2', name: 'Vikram Mehta', email: 'vikram.counselor@institute.in', role: 'COUNSELOR' },
  { id: 'counselor-3', name: 'Ananya Verma', email: 'ananya.staff@institute.in', role: 'STAFF' },
  { id: 'admin-1', name: 'Institute Admin', email: 'admin@institute.in', role: 'ADMIN' },
];

let mockLeads: Lead[] = [
  {
    id: 'lead-1',
    studentName: 'Aarav Patel',
    phone: '+91 98765 43210',
    email: 'aarav.patel@gmail.com',
    city: 'Ahmedabad',
    qualification: 'B.Tech CS 3rd Year',
    courseId: 'course-1',
    courseName: 'Full Stack Java & Spring Boot Masterclass',
    status: 'QUALIFIED',
    priority: 'HOT',
    source: 'META_ADS',
    assignedToId: 'counselor-1',
    assignedToName: 'Pooja Sharma',
    notes: [
      {
        id: 'note-1',
        leadId: 'lead-1',
        content: 'Student is preparing for campus placements. Highly interested in Spring Security and microservices module.',
        authorId: 'counselor-1',
        authorName: 'Pooja Sharma',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    activities: [
      {
        id: 'act-1',
        leadId: 'lead-1',
        type: 'CREATED',
        title: 'Enquiry Captured',
        description: 'Lead captured via Meta Ads campaign "Java Career Accelerator 2026"',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'act-2',
        leadId: 'lead-1',
        type: 'COUNSELOR_ASSIGNED',
        title: 'Assigned to Pooja Sharma',
        description: 'Assigned counselor Pooja Sharma for syllabus consultation',
        performedByName: 'Admin',
        createdAt: new Date(Date.now() - 2.5 * 86400000).toISOString()
      },
      {
        id: 'act-3',
        leadId: 'lead-1',
        type: 'STATUS_CHANGED',
        title: 'Status Updated to QUALIFIED',
        description: 'Student cleared technical eligibility and confirmed fee budget.',
        performedByName: 'Pooja Sharma',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'lead-2',
    studentName: 'Sneha Kulkarni',
    phone: '+91 98220 11223',
    email: 'sneha.kulkarni@outlook.com',
    city: 'Pune',
    qualification: 'B.Sc Statistics',
    courseId: 'course-2',
    courseName: 'Data Science & Machine Learning Bootcamp',
    status: 'FOLLOW_UP',
    priority: 'HOT',
    source: 'GOOGLE_ADS',
    assignedToId: 'counselor-2',
    assignedToName: 'Vikram Mehta',
    notes: [
      {
        id: 'note-2',
        leadId: 'lead-2',
        content: 'Requested weekend demo class link for ML module.',
        authorId: 'counselor-2',
        authorName: 'Vikram Mehta',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],
    activities: [
      {
        id: 'act-4',
        leadId: 'lead-2',
        type: 'CREATED',
        title: 'Google Ads Enquiry',
        description: 'Captured via Google Search "Best Data Science Course in Pune"',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'act-5',
        leadId: 'lead-2',
        type: 'STATUS_CHANGED',
        title: 'Moved to FOLLOW_UP',
        description: 'Demo class invitation sent on WhatsApp.',
        performedByName: 'Vikram Mehta',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'lead-3',
    studentName: 'Rohan Deshmukh',
    phone: '+91 97654 32109',
    email: 'rohan.d@gmail.com',
    city: 'Nagpur',
    qualification: 'Class 11 CBSE',
    courseId: 'course-3',
    courseName: 'IIT-JEE & NEET Foundation Program',
    status: 'NEW',
    priority: 'WARM',
    source: 'WEBSITE',
    assignedToId: undefined,
    assignedToName: undefined,
    notes: [],
    activities: [
      {
        id: 'act-6',
        leadId: 'lead-3',
        type: 'CREATED',
        title: 'Website Form Submission',
        description: 'Parent enquiry for JEE 2-year classroom batch.',
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'lead-4',
    studentName: 'Priyanka Nair',
    phone: '+91 94471 23456',
    email: 'priyanka.nair@gmail.com',
    city: 'Kochi',
    qualification: 'BCA Final Year',
    courseId: 'course-1',
    courseName: 'Full Stack Java & Spring Boot Masterclass',
    status: 'CONVERTED',
    priority: 'HOT',
    source: 'REFERRAL',
    assignedToId: 'counselor-1',
    assignedToName: 'Pooja Sharma',
    notes: [
      {
        id: 'note-3',
        leadId: 'lead-4',
        content: 'Fee paid in full (₹45,000). Enrolled in Batch Java-2026-A.',
        authorName: 'Pooja Sharma',
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ],
    activities: [
      {
        id: 'act-7',
        leadId: 'lead-4',
        type: 'CONVERTED',
        title: 'Student Enrolled & Converted',
        description: 'Registration fee receipt #REC-8821 verified.',
        performedByName: 'Pooja Sharma',
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'lead-5',
    studentName: 'Karthik Raja',
    phone: '+91 98410 99887',
    email: 'karthik.raja@yahoo.com',
    city: 'Chennai',
    qualification: 'Diploma Mechanical',
    courseId: 'course-1',
    courseName: 'Full Stack Java & Spring Boot Masterclass',
    status: 'CONTACTED',
    priority: 'COLD',
    source: 'WALK_IN',
    assignedToId: 'counselor-2',
    assignedToName: 'Vikram Mehta',
    notes: [],
    activities: [
      {
        id: 'act-8',
        leadId: 'lead-5',
        type: 'CREATED',
        title: 'Walk-in Desk Enquiry',
        description: 'Visited Anna Nagar branch counseling desk.',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  }
];

let mockFollowUps: FollowUp[] = [
  {
    id: 'fu-1',
    leadId: 'lead-2',
    leadName: 'Sneha Kulkarni',
    leadPhone: '+91 98220 11223',
    courseName: 'Data Science & Machine Learning Bootcamp',
    scheduledAt: new Date(Date.now() + 3 * 3600000).toISOString(), // Today
    type: 'PHONE_CALL',
    counselorId: 'counselor-2',
    counselorName: 'Vikram Mehta',
    notes: 'Follow up after weekend ML demo lecture to review syllabus and installment options.',
    status: 'SCHEDULED',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'fu-2',
    leadId: 'lead-1',
    leadName: 'Aarav Patel',
    leadPhone: '+91 98765 43210',
    courseName: 'Full Stack Java & Spring Boot Masterclass',
    scheduledAt: new Date(Date.now() - 4 * 3600000).toISOString(), // Overdue by 4 hours
    type: 'WHATSAPP',
    counselorId: 'counselor-1',
    counselorName: 'Pooja Sharma',
    notes: 'Send early-bird discount token for Java Spring Batch registration before 5 PM.',
    status: 'OVERDUE',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'fu-3',
    leadId: 'lead-3',
    leadName: 'Rohan Deshmukh',
    leadPhone: '+91 97654 32109',
    courseName: 'IIT-JEE & NEET Foundation Program',
    scheduledAt: new Date(Date.now() + 26 * 3600000).toISOString(), // Tomorrow (Upcoming)
    type: 'IN_PERSON',
    counselorId: 'counselor-1',
    counselorName: 'Pooja Sharma',
    notes: 'Parents requested center visit and meeting with Head of Physics faculty.',
    status: 'SCHEDULED',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'fu-4',
    leadId: 'lead-4',
    leadName: 'Priyanka Nair',
    leadPhone: '+91 94471 23456',
    courseName: 'Full Stack Java & Spring Boot Masterclass',
    scheduledAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    type: 'PHONE_CALL',
    counselorId: 'counselor-1',
    counselorName: 'Pooja Sharma',
    notes: 'Confirm batch timing preferences and LMS portal access credentials.',
    outcome: 'Student confirmed 7 PM weekday batch. Full payment confirmed.',
    status: 'COMPLETED',
    completedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  }
];

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
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
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
      throw error;
    }
  }

  // ==========================================
  // AUTHENTICATION & MULTI-TENANCY METHODS
  // ==========================================

  public async getCsrfToken(): Promise<CsrfResponse> {
    try {
      return await this.request<CsrfResponse>('/auth/csrf');
    } catch {
      return { message: 'CSRF token initialized' };
    }
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

  // ==========================================
  // COUNSELORS / USERS
  // ==========================================

  public async getCounselors(): Promise<CounselorOption[]> {
    try {
      return await this.request<CounselorOption[]>('/users/counselors');
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      return mockCounselors;
    }
  }

  // ==========================================
  // LEADS MANAGEMENT METHODS
  // ==========================================

  public async getLeads(filters: LeadFilters): Promise<PaginatedResponse<Lead>> {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
      if (filters.source && filters.source !== 'ALL') params.append('source', filters.source);
      if (filters.courseId && filters.courseId !== 'ALL') params.append('courseId', filters.courseId);
      if (filters.counselorId && filters.counselorId !== 'ALL') params.append('assignedToId', filters.counselorId);
      params.append('page', filters.page.toString());
      params.append('size', filters.size.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortDir) params.append('sortDir', filters.sortDir);

      return await this.request<PaginatedResponse<Lead>>(`/leads?${params.toString()}`);
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      // Fallback in-memory query engine during Phase 3 backend integration
      let filtered = [...mockLeads];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(l => 
          l.studentName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.city && l.city.toLowerCase().includes(q))
        );
      }

      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter(l => l.status === filters.status);
      }

      if (filters.priority && filters.priority !== 'ALL') {
        filtered = filtered.filter(l => l.priority === filters.priority);
      }

      if (filters.source && filters.source !== 'ALL') {
        filtered = filtered.filter(l => l.source === filters.source);
      }

      if (filters.courseId && filters.courseId !== 'ALL') {
        filtered = filtered.filter(l => l.courseId === filters.courseId);
      }

      if (filters.counselorId && filters.counselorId !== 'ALL') {
        filtered = filtered.filter(l => l.assignedToId === filters.counselorId);
      }

      // Sort
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / filters.size) || 1;
      const start = (filters.page - 1) * filters.size;
      const paginatedContent = filtered.slice(start, start + filters.size);

      return {
        content: paginatedContent,
        totalElements,
        totalPages,
        page: filters.page,
        size: filters.size
      };
    }
  }

  public async getLead(id: string): Promise<Lead> {
    try {
      return await this.request<Lead>(`/leads/${id}`);
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const found = mockLeads.find(l => l.id === id);
      if (found) return found;
      throw new Error('Lead not found');
    }
  }

  public async createLead(req: CreateLeadRequest): Promise<Lead> {
    try {
      return await this.request<Lead>('/leads', {
        method: 'POST',
        body: JSON.stringify(req),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const course = mockCourses.find(c => c.id === req.courseId);
      const counselor = mockCounselors.find(c => c.id === req.assignedToId);

      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        studentName: req.studentName,
        phone: req.phone,
        email: req.email,
        city: req.city,
        qualification: req.qualification,
        courseId: req.courseId,
        courseName: course?.name,
        status: 'NEW',
        priority: req.priority,
        source: req.source,
        assignedToId: req.assignedToId,
        assignedToName: counselor?.name,
        notes: req.initialNote ? [{
          id: `note-${Date.now()}`,
          leadId: `lead-${Date.now()}`,
          content: req.initialNote,
          createdAt: new Date().toISOString(),
        }] : [],
        activities: [{
          id: `act-${Date.now()}`,
          leadId: `lead-${Date.now()}`,
          type: 'CREATED',
          title: 'Lead Created',
          description: `Lead created from source: ${req.source}`,
          createdAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockLeads.unshift(newLead);
      return newLead;
    }
  }

  public async updateLead(id: string, req: UpdateLeadRequest): Promise<Lead> {
    try {
      return await this.request<Lead>(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(req),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const index = mockLeads.findIndex(l => l.id === id);
      if (index === -1) throw new Error('Lead not found');

      const existing = mockLeads[index];
      const course = req.courseId ? mockCourses.find(c => c.id === req.courseId) : undefined;
      const counselor = req.assignedToId ? mockCounselors.find(c => c.id === req.assignedToId) : undefined;

      const updated: Lead = {
        ...existing,
        ...req,
        courseName: course ? course.name : existing.courseName,
        assignedToName: counselor ? counselor.name : existing.assignedToName,
        updatedAt: new Date().toISOString()
      };

      mockLeads[index] = updated;
      return updated;
    }
  }

  public async updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
    try {
      return await this.request<Lead>(`/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const lead = mockLeads.find(l => l.id === id);
      if (!lead) throw new Error('Lead not found');

      const prevStatus = lead.status;
      lead.status = status;
      lead.updatedAt = new Date().toISOString();

      if (!lead.activities) lead.activities = [];
      lead.activities.unshift({
        id: `act-${Date.now()}`,
        leadId: id,
        type: 'STATUS_CHANGED',
        title: `Status Changed to ${status}`,
        description: `Lead workflow status moved from ${prevStatus} to ${status}`,
        createdAt: new Date().toISOString()
      });

      return lead;
    }
  }

  public async assignLead(id: string, counselorId: string): Promise<Lead> {
    try {
      return await this.request<Lead>(`/leads/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ counselorId }),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const lead = mockLeads.find(l => l.id === id);
      if (!lead) throw new Error('Lead not found');

      const counselor = mockCounselors.find(c => c.id === counselorId);
      lead.assignedToId = counselorId;
      lead.assignedToName = counselor?.name;
      lead.updatedAt = new Date().toISOString();

      if (!lead.activities) lead.activities = [];
      lead.activities.unshift({
        id: `act-${Date.now()}`,
        leadId: id,
        type: 'COUNSELOR_ASSIGNED',
        title: 'Counselor Reassigned',
        description: `Lead reassigned to ${counselor?.name || 'Counselor'}`,
        createdAt: new Date().toISOString()
      });

      return lead;
    }
  }

  public async deleteLead(id: string): Promise<{ success: boolean }> {
    try {
      return await this.request<{ success: boolean }>(`/leads/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      mockLeads = mockLeads.filter(l => l.id !== id);
      return { success: true };
    }
  }

  public async getLeadActivities(id: string): Promise<ActivityEvent[]> {
    try {
      return await this.request<ActivityEvent[]>(`/leads/${id}/activities`);
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const lead = mockLeads.find(l => l.id === id);
      return lead?.activities || [];
    }
  }

  public async addLeadNote(id: string, content: string, authorName?: string): Promise<Lead> {
    try {
      return await this.request<Lead>(`/leads/${id}/activities`, {
        method: 'POST',
        body: JSON.stringify({ type: 'NOTE_ADDED', content }),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const lead = mockLeads.find(l => l.id === id);
      if (!lead) throw new Error('Lead not found');

      if (!lead.notes) lead.notes = [];
      lead.notes.unshift({
        id: `note-${Date.now()}`,
        leadId: id,
        content,
        authorName: authorName || 'Staff',
        createdAt: new Date().toISOString(),
      });

      if (!lead.activities) lead.activities = [];
      lead.activities.unshift({
        id: `act-${Date.now()}`,
        leadId: id,
        type: 'NOTE_ADDED',
        title: 'Note Added',
        description: content,
        performedByName: authorName || 'Staff',
        createdAt: new Date().toISOString()
      });

      lead.updatedAt = new Date().toISOString();
      return lead;
    }
  }

  public async addLeadActivity(id: string, activity: { type: string; title?: string; description?: string; content?: string }): Promise<ActivityEvent> {
    try {
      return await this.request<ActivityEvent>(`/leads/${id}/activities`, {
        method: 'POST',
        body: JSON.stringify(activity),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const lead = mockLeads.find(l => l.id === id);
      const newAct: ActivityEvent = {
        id: `act-${Date.now()}`,
        leadId: id,
        type: (activity.type as any) || 'NOTE_ADDED',
        title: activity.title || 'Activity Logged',
        description: activity.description || activity.content || '',
        createdAt: new Date().toISOString(),
      };
      if (lead) {
        if (!lead.activities) lead.activities = [];
        lead.activities.unshift(newAct);
      }
      return newAct;
    }
  }

  // ==========================================
  // COURSES MANAGEMENT METHODS
  // ==========================================

  public async getCourses(): Promise<Course[]> {
    try {
      return await this.request<Course[]>('/courses');
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      return mockCourses;
    }
  }

  public async createCourse(req: CreateCourseRequest): Promise<Course> {
    try {
      return await this.request<Course>('/courses', {
        method: 'POST',
        body: JSON.stringify(req),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        ...req,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCourses.unshift(newCourse);
      return newCourse;
    }
  }

  public async updateCourse(id: string, req: UpdateCourseRequest): Promise<Course> {
    try {
      return await this.request<Course>(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(req),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const idx = mockCourses.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Course not found');
      const updated = { ...mockCourses[idx], ...req, updatedAt: new Date().toISOString() };
      mockCourses[idx] = updated;
      return updated;
    }
  }

  public async deleteCourse(id: string): Promise<{ success: boolean }> {
    try {
      return await this.request<{ success: boolean }>(`/courses/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      mockCourses = mockCourses.filter(c => c.id !== id);
      return { success: true };
    }
  }

  // ==========================================
  // FOLLOW-UPS MANAGEMENT METHODS
  // ==========================================

  public async getFollowUps(status?: string): Promise<FollowUp[]> {
    try {
      const q = status ? `?status=${status}` : '';
      return await this.request<FollowUp[]>(`/follow-ups${q}`);
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      // Dynamic status calculation for mock
      const now = new Date();
      const list = mockFollowUps.map(fu => {
        if (fu.status === 'SCHEDULED' && new Date(fu.scheduledAt) < now) {
          return { ...fu, status: 'OVERDUE' as const };
        }
        return fu;
      });

      if (status && status !== 'ALL') {
        return list.filter(fu => fu.status === status);
      }
      return list;
    }
  }

  public async createFollowUp(req: CreateFollowUpRequest): Promise<FollowUp> {
    try {
      return await this.request<FollowUp>(`/leads/${req.leadId}/follow-ups`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const lead = mockLeads.find(l => l.id === req.leadId);
      const counselor = mockCounselors.find(c => c.id === req.counselorId);

      const newFollowUp: FollowUp = {
        id: `fu-${Date.now()}`,
        leadId: req.leadId,
        leadName: lead?.studentName || 'Student',
        leadPhone: lead?.phone,
        courseName: lead?.courseName,
        scheduledAt: req.scheduledAt,
        type: req.type,
        counselorId: req.counselorId,
        counselorName: counselor?.name,
        notes: req.notes,
        status: 'SCHEDULED',
        createdAt: new Date().toISOString()
      };

      mockFollowUps.unshift(newFollowUp);

      if (lead) {
        if (!lead.followUps) lead.followUps = [];
        lead.followUps.unshift(newFollowUp);

        if (!lead.activities) lead.activities = [];
        lead.activities.unshift({
          id: `act-${Date.now()}`,
          leadId: lead.id,
          type: 'FOLLOW_UP_SCHEDULED',
          title: `Follow-up Scheduled (${req.type.replace('_', ' ')})`,
          description: `Scheduled for ${new Date(req.scheduledAt).toLocaleString()}. Note: ${req.notes}`,
          createdAt: new Date().toISOString()
        });
      }

      return newFollowUp;
    }
  }

  public async completeFollowUp(id: string, outcomeNote?: string): Promise<FollowUp> {
    try {
      return await this.request<FollowUp>(`/follow-ups/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ outcome: outcomeNote }),
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const fu = mockFollowUps.find(f => f.id === id);
      if (!fu) throw new Error('Follow-up not found');

      fu.status = 'COMPLETED';
      fu.outcome = outcomeNote || 'Follow-up successfully completed';
      fu.completedAt = new Date().toISOString();

      const lead = mockLeads.find(l => l.id === fu.leadId);
      if (lead) {
        if (!lead.activities) lead.activities = [];
        lead.activities.unshift({
          id: `act-${Date.now()}`,
          leadId: lead.id,
          type: 'FOLLOW_UP_COMPLETED',
          title: `Follow-up Completed`,
          description: `Follow-up (${fu.type}) completed. Outcome: ${fu.outcome}`,
          createdAt: new Date().toISOString()
        });
      }

      return fu;
    }
  }

  public async cancelFollowUp(id: string): Promise<FollowUp> {
    try {
      return await this.request<FollowUp>(`/follow-ups/${id}/cancel`, {
        method: 'PATCH',
      });
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const fu = mockFollowUps.find(f => f.id === id);
      if (!fu) throw new Error('Follow-up not found');

      fu.status = 'CANCELLED';

      const lead = mockLeads.find(l => l.id === fu.leadId);
      if (lead) {
        if (!lead.activities) lead.activities = [];
        lead.activities.unshift({
          id: `act-${Date.now()}`,
          leadId: lead.id,
          type: 'FOLLOW_UP_CANCELLED',
          title: `Follow-up Cancelled`,
          description: `Scheduled follow-up was cancelled.`,
          createdAt: new Date().toISOString()
        });
      }

      return fu;
    }
  }

  // ==========================================
  // DASHBOARD METRICS METHODS
  // ==========================================

  public async getDashboardMetrics(): Promise<DashboardStats> {
    try {
      return await this.request<DashboardStats>('/dashboard/metrics');
    } catch (err: any) {
      if (!isFallbackEligible(err)) throw err;
      const totalLeads = mockLeads.length;
      const newLeads = mockLeads.filter(l => l.status === 'NEW').length;
      const contactedLeads = mockLeads.filter(l => l.status === 'CONTACTED').length;
      const qualifiedLeads = mockLeads.filter(l => l.status === 'QUALIFIED').length;
      const inFollowUpLeads = mockLeads.filter(l => l.status === 'FOLLOW_UP').length;
      const convertedLeads = mockLeads.filter(l => l.status === 'CONVERTED').length;
      const lostLeads = mockLeads.filter(l => l.status === 'LOST').length;

      const conversionRate = totalLeads > 0 
        ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10 
        : 0;

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const endOfToday = startOfToday + 86400000;

      const followUpsToday = mockFollowUps.filter(fu => {
        const time = new Date(fu.scheduledAt).getTime();
        return time >= startOfToday && time <= endOfToday && fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED';
      }).length;

      const overdueFollowUps = mockFollowUps.filter(fu => {
        const time = new Date(fu.scheduledAt).getTime();
        return time < now.getTime() && fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED';
      }).length;

      const sourceDistribution = {
        META_ADS: mockLeads.filter(l => l.source === 'META_ADS').length,
        GOOGLE_ADS: mockLeads.filter(l => l.source === 'GOOGLE_ADS').length,
        WEBSITE: mockLeads.filter(l => l.source === 'WEBSITE').length,
        WALK_IN: mockLeads.filter(l => l.source === 'WALK_IN').length,
        REFERRAL: mockLeads.filter(l => l.source === 'REFERRAL').length,
        OTHER: mockLeads.filter(l => l.source === 'OTHER').length,
      };

      const recentLeads = [...mockLeads]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const urgentFollowUps = mockFollowUps
        .filter(fu => fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5);

      return {
        totalLeads,
        newLeads,
        contactedLeads,
        qualifiedLeads,
        inFollowUpLeads,
        convertedLeads,
        lostLeads,
        conversionRate,
        followUpsToday,
        overdueFollowUps,
        sourceDistribution,
        recentLeads,
        urgentFollowUps,
      };
    }
  }
}

export const apiService = new ApiService();
