export type LeadStatus = 
  | 'NEW' 
  | 'CONTACTED' 
  | 'QUALIFIED' 
  | 'FOLLOW_UP' 
  | 'CONVERTED' 
  | 'LOST';

export type LeadPriority = 'HOT' | 'WARM' | 'COLD';

export type LeadSource = 
  | 'META_ADS' 
  | 'GOOGLE_ADS' 
  | 'WEBSITE' 
  | 'WALK_IN' 
  | 'REFERRAL' 
  | 'OTHER';

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

export type FollowUpStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';

export type FollowUpType = 'PHONE_CALL' | 'WHATSAPP' | 'IN_PERSON' | 'DEMO_CLASS';

export interface FollowUp {
  id: string;
  leadId: string;
  leadName?: string;
  leadPhone?: string;
  courseName?: string;
  scheduledAt: string;
  type: FollowUpType;
  counselorId?: string;
  counselorName?: string;
  notes: string;
  outcome?: string;
  status: FollowUpStatus;
  completedAt?: string;
  createdAt: string;
}

export type ActivityType = 
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'COUNSELOR_ASSIGNED'
  | 'NOTE_ADDED'
  | 'FOLLOW_UP_SCHEDULED'
  | 'FOLLOW_UP_COMPLETED'
  | 'FOLLOW_UP_CANCELLED'
  | 'CONVERTED'
  | 'LOST';

export interface ActivityEvent {
  id: string;
  leadId: string;
  type: ActivityType;
  title: string;
  description: string;
  performedBy?: string;
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
  studentName: string;
  phone: string;
  email?: string;
  city?: string;
  qualification?: string;
  courseId?: string;
  courseName?: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  assignedToId?: string;
  assignedToName?: string;
  notes?: Note[];
  followUps?: FollowUp[];
  activities?: ActivityEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  studentName: string;
  phone: string;
  email?: string;
  city?: string;
  qualification?: string;
  courseId?: string;
  priority: LeadPriority;
  source: LeadSource;
  assignedToId?: string;
  initialNote?: string;
}

export interface UpdateLeadRequest {
  studentName?: string;
  phone?: string;
  email?: string;
  city?: string;
  qualification?: string;
  courseId?: string;
  priority?: LeadPriority;
  source?: LeadSource;
  assignedToId?: string;
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
  sortDir?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
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
  followUpsToday: number;
  overdueFollowUps: number;
  sourceDistribution: Record<LeadSource, number>;
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
  counselorId?: string;
  notes: string;
}
