export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'QUALIFIED' 
  | 'FOLLOW_UP' 
  | 'CONVERTED' 
  | 'LOST';

export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'HOT' | 'WARM' | 'COLD';

export type LeadSource =
  | 'WEBSITE'
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'GOOGLE_ADS'
  | 'META_ADS'
  | 'REFERRAL'
  | 'WALK_IN'
  | 'OTHER';

export interface CourseSummary {
  id: string;
  name: string;
  code?: string;
  fee?: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  fee: number;
  duration: string; // e.g., "12 Weeks", "6 Months"
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type FollowUpStatus = 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';

export type FollowUpType = 'PHONE_CALL' | 'WHATSAPP' | 'IN_PERSON' | 'DEMO_CLASS';

export interface FollowUp {
  id: string;
  leadId: string;
  leadName?: string;
  leadPhone?: string;
  courseName?: string;
  assignedTo?: UserSummary;
  counselorId?: string;
  counselorName?: string;
  scheduledAt: string;
  type: FollowUpType;
  priority?: LeadPriority;
  notes: string;
  outcome?: string;
  outcomeNotes?: string;
  status: FollowUpStatus;
  overdue?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ActivityType = 
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'COUNSELOR_ASSIGNED'
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

export interface ActivityEvent {
  id: string;
  leadId: string;
  type: ActivityType;
  summary?: string;
  title: string;
  details?: string;
  description: string;
  metadata?: string;
  performedBy?: UserSummary | string;
  performedByName?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  leadId: string;
  content: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name?: string;
  studentName: string;
  phone: string;
  normalizedPhone?: string;
  email?: string;
  city?: string;
  qualification?: string;
  course?: CourseSummary;
  courseId?: string;
  courseName?: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  assignedTo?: UserSummary;
  assignedToId?: string;
  assignedToName?: string;
  notes?: string | Note[];
  followUps?: FollowUp[];
  activities?: ActivityEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  name?: string;
  studentName: string;
  phone: string;
  email?: string;
  city?: string;
  qualification?: string;
  courseId?: string;
  priority: LeadPriority;
  source: LeadSource;
  assignedToId?: string;
  assignedToUserId?: string;
  notes?: string;
  initialNote?: string;
}

export interface UpdateLeadRequest {
  name?: string;
  studentName?: string;
  phone?: string;
  email?: string;
  city?: string;
  qualification?: string;
  courseId?: string;
  priority?: LeadPriority;
  source?: LeadSource;
  assignedToId?: string;
  assignedToUserId?: string;
  notes?: string;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | 'ALL';
  priority?: LeadPriority | 'ALL';
  source?: LeadSource | 'ALL';
  courseId?: string | 'ALL';
  counselorId?: string | 'ALL';
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  last?: boolean;
}

export interface CounselorOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  inFollowUpLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  conversionRatePercent?: number;
  followUpsToday: number;
  overdueFollowUps: number;
  sourceDistribution: Record<string, number>;
  sources?: Array<{ source: string; count: number }>;
  pipeline?: {
    newCount: number;
    contactedCount: number;
    qualifiedCount: number;
    followUpCount: number;
    convertedCount: number;
    lostCount: number;
  };
  followUps?: {
    todayPending: number;
    overdue: number;
    completedToday: number;
  };
  recentLeads: Lead[];
  urgentFollowUps: FollowUp[];
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  description: string;
  fee: number;
  duration: string;
  active: boolean;
}

export interface UpdateCourseRequest {
  name?: string;
  code?: string;
  description?: string;
  fee?: number;
  duration?: string;
  active?: boolean;
}

export interface CreateFollowUpRequest {
  leadId: string;
  scheduledAt: string;
  type: FollowUpType;
  priority?: LeadPriority;
  counselorId?: string;
  assignedToUserId?: string;
  notes: string;
}
