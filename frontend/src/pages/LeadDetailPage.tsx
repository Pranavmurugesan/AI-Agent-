import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Lead, LeadActivity, LeadStatus, LeadPriority, ActivityType } from '../types/lead';
import { User } from '../types/api';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  BookOpen, 
  UserCheck, 
  CalendarPlus, 
  MessageSquarePlus, 
  Activity, 
  AlertCircle,
  UserPlus
} from 'lucide-react';

interface LeadDetailPageProps {
  leadId: string;
  onBack: () => void;
  currentUser?: User | null;
}

export const LeadDetailPage: React.FC<LeadDetailPageProps> = ({ leadId, onBack, currentUser }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [counselors, setCounselors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Reassign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [assignRemarks, setAssignRemarks] = useState<string>('');
  const [assigning, setAssigning] = useState<boolean>(false);

  // New Follow-Up Form State
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [followUpNotes, setFollowUpNotes] = useState<string>('');
  const [followUpPriority, setFollowUpPriority] = useState<LeadPriority>('MEDIUM');
  const [schedulingFollowUp, setSchedulingFollowUp] = useState<boolean>(false);

  // New Activity Log Form State
  const [activityType, setActivityType] = useState<ActivityType>('CALL_LOGGED');
  const [activitySummary, setActivitySummary] = useState<string>('');
  const [activityDetails, setActivityDetails] = useState<string>('');
  const [loggingActivity, setLoggingActivity] = useState<boolean>(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [leadData, activityData, usersData] = await Promise.all([
        apiService.getLead(leadId),
        apiService.getLeadActivities(leadId),
        apiService.getUsers().catch(() => [] as User[]),
      ]);
      setLead(leadData);
      setActivities(activityData);
      setCounselors(usersData);
      if (leadData.assignedTo) {
        setAssigneeId(leadData.assignedTo.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [leadId]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || newStatus === lead.status) return;
    try {
      setUpdatingStatus(true);
      const updated = await apiService.updateLeadStatus(lead.id, {
        status: newStatus,
        remarks: `Status updated via Student Profile to ${newStatus}`,
      });
      setLead(updated);
      const activityData = await apiService.getLeadActivities(lead.id);
      setActivities(activityData);
    } catch (err: any) {
      alert(err.message || 'Failed to update lead status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    try {
      setAssigning(true);
      const updated = await apiService.assignLead(lead.id, {
        assignedToUserId: assigneeId || undefined,
        remarks: assignRemarks.trim() || undefined,
      });
      setLead(updated);
      setIsAssignModalOpen(false);
      setAssignRemarks('');
      const activityData = await apiService.getLeadActivities(lead.id);
      setActivities(activityData);
    } catch (err: any) {
      alert(err.message || 'Failed to reassign counselor');
    } finally {
      setAssigning(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !scheduledAt) return;

    try {
      setSchedulingFollowUp(true);
      await apiService.createFollowUp(lead.id, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        priority: followUpPriority,
        notes: followUpNotes,
      });
      setScheduledAt('');
      setFollowUpNotes('');
      alert('Follow-up task scheduled successfully!');
      const activityData = await apiService.getLeadActivities(lead.id);
      setActivities(activityData);
    } catch (err: any) {
      alert(err.message || 'Failed to schedule follow-up');
    } finally {
      setSchedulingFollowUp(false);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !activitySummary.trim()) return;

    try {
      setLoggingActivity(true);
      await apiService.logActivity(lead.id, {
        type: activityType,
        summary: activitySummary.trim(),
        details: activityDetails.trim() || undefined,
      });
      setActivitySummary('');
      setActivityDetails('');
      const activityData = await apiService.getLeadActivities(lead.id);
      setActivities(activityData);
    } catch (err: any) {
      alert(err.message || 'Failed to log activity');
    } finally {
      setLoggingActivity(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading student profile...</div>;
  }

  if (error || !lead) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </button>
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error || 'Lead not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads List
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Lead ID: <span className="font-mono text-slate-200">{lead.id.substring(0, 8)}...</span>
          </span>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Student Details & Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Profile Card */}
          <div className="glass-panel border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-slate-100">{lead.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  lead.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                  lead.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {lead.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {lead.source}
                </span>
                <span className="text-[11px] text-slate-400">
                  Inquired {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {/* Pipeline Status Selector */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pipeline Funnel Stage
              </label>
              <select
                disabled={updatingStatus || lead.status === 'CONVERTED'}
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="NEW">NEW (Fresh Inquiry)</option>
                <option value="CONTACTED">CONTACTED (Counselor Call Completed)</option>
                <option value="QUALIFIED">QUALIFIED (Eligible & Budget Match)</option>
                <option value="FOLLOW_UP">FOLLOW_UP (Active Decision Stage)</option>
                <option value="CONVERTED">CONVERTED (Admitted & Enrolled)</option>
                <option value="LOST">LOST (Competitor / Dropped)</option>
              </select>
              {lead.status === 'CONVERTED' && (
                <p className="text-[10px] text-emerald-400 font-medium">
                  ✓ Student is admitted. Converted status is locked.
                </p>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="font-mono">{lead.phone}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Normalized: {lead.normalizedPhone}</div>
                </div>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-slate-300">
                <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Target: <strong className="text-slate-100">{lead.course ? lead.course.name : 'Undecided / General'}</strong></span>
              </div>
              
              {/* Counselor Assignment with Reassign Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-slate-300">
                  <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Counselor: <strong className="text-slate-100">{lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}</strong></span>
                </div>
                {currentUser?.role === 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] border border-slate-700 transition-colors"
                  >
                    <UserPlus className="w-3 h-3" /> Reassign
                  </button>
                )}
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Inquiry Notes</span>
                <div className="p-3 rounded-lg bg-slate-900/90 text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {lead.notes}
                </div>
              </div>
            )}
          </div>

          {/* Quick Schedule Follow-up Box */}
          <div className="glass-panel border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-blue-400" />
              Schedule Next Callback / Follow-Up
            </h3>
            <form onSubmit={handleScheduleFollowUp} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Priority</label>
                <select
                  value={followUpPriority}
                  onChange={(e) => setFollowUpPriority(e.target.value as LeadPriority)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Callback Agenda / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Discuss batch timing preferences and scholarship token..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={schedulingFollowUp}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow transition-all"
              >
                {schedulingFollowUp ? 'Scheduling...' : 'Set Reminder'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Activity Stream & Manual Logging */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Manual Activity Logger Box */}
          <div className="glass-panel border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-blue-400" />
              Log Counselor Interaction
            </h3>
            <form onSubmit={handleLogActivity} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Interaction Type</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as ActivityType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="CALL_LOGGED">Phone Call</option>
                    <option value="NOTE_ADDED">Internal Note</option>
                    <option value="MESSAGE_LOGGED">WhatsApp / SMS</option>
                    <option value="EMAIL_LOGGED">Email</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1">Summary *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spoke with mother regarding hostel facility and batch timings"
                    value={activitySummary}
                    onChange={(e) => setActivitySummary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Detailed Discussion Points</label>
                <textarea
                  rows={2}
                  placeholder="Parent concerns, scholarship expectation, mock class schedule..."
                  value={activityDetails}
                  onChange={(e) => setActivityDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loggingActivity}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition-all"
                >
                  {loggingActivity ? 'Logging...' : 'Post to Timeline'}
                </button>
              </div>
            </form>
          </div>

          {/* Activity Timeline Stream */}
          <div className="glass-panel border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Lead Audit Timeline
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recorded activity history.</p>
            ) : (
              <div className="space-y-4 border-l-2 border-slate-800 pl-4 ml-2">
                {activities.map((act) => (
                  <div key={act.id} className="relative space-y-1">
                    <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-slate-950" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{act.summary}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.createdAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    {act.details && (
                      <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        {act.details}
                      </p>
                    )}
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>By: <strong className="text-slate-400">{act.performedBy ? act.performedBy.name : 'System Automated'}</strong></span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{act.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Counselor Reassignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100">
              Reassign Counselor for {lead.name}
            </h2>
            <form onSubmit={handleReassign} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Counselor *</label>
                <select
                  required
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Counselor</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Assignment Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Reassigned due to language preference..."
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow"
                >
                  {assigning ? 'Reassigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
