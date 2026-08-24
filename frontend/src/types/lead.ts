export type LeadSource =
  | 'WEBSITE'
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'GOOGLE_ADS'
  | 'REFERRAL'
  | 'WALK_IN'
  | 'OTHER';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'FOLLOW_UP'
  | 'CONVERTED'
  | 'LOST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ActivityType =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'REOPENED'
  | 'NOTE_ADDED'
  | 'CALL_LOGGED'
  | 'MESSAGE_LOGGED'
  | 'EMAIL_LOGGED'
  | 'FOLLOW_UP_SCHEDULED'
  | 'FOLLOW_UP_COMPLETED'
  | 'FOLLOW_UP_CANCELLED'
  | 'COURSE_CHANGED'
  | 'CONVERTED'
  | 'LOST';

export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';

export interface Course {
  id: string;
  name: string;
  code?: string;
  description?: string;
  duration?: string;
  fee?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRequest {
  name: string;
  code?: string;
  description?: string;
  duration?: string;
  fee?: number;
  active?: boolean;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CourseSummary {
  id: string;
  name: string;
  code?: string;
  fee?: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  normalizedPhone: string;
  email?: string;
  course?: CourseSummary;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: UserSummary;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCreateRequest {
  name: string;
  phone: string;
  email?: string;
  courseId?: string;
  source?: LeadSource;
  priority?: LeadPriority;
  assignedToUserId?: string;
  notes?: string;
}

export interface LeadUpdateRequest {
  name: string;
  phone: string;
  email?: string;
  courseId?: string;
  source?: LeadSource;
  priority?: LeadPriority;
  notes?: string;
}

export interface LeadStatusUpdateRequest {
  status: LeadStatus;
  remarks?: string;
}

export interface LeadAssignRequest {
  assignedToUserId?: string;
  remarks?: string;
}

export interface LeadPageResponse {
  content: Lead[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  summary: string;
  details?: string;
  metadata?: string;
  performedBy?: UserSummary;
  createdAt: string;
}

export interface ActivityLogRequest {
  type: ActivityType;
  summary: string;
  details?: string;
  metadata?: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  assignedTo?: UserSummary;
  scheduledAt: string;
  status: FollowUpStatus;
  priority: LeadPriority;
  notes?: string;
  outcomeNotes?: string;
  completedAt?: string;
  overdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpCreateRequest {
  assignedToUserId?: string;
  scheduledAt: string;
  priority?: LeadPriority;
  notes?: string;
}

export interface FollowUpCompleteRequest {
  outcomeNotes?: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  pipeline: {
    newCount: number;
    contactedCount: number;
    qualifiedCount: number;
    followUpCount: number;
    convertedCount: number;
    lostCount: number;
  };
  followUps: {
    todayPending: number;
    overdue: number;
    completedToday: number;
  };
  conversionRatePercent: number;
  sources: Array<{ source: string; count: number }>;
}
