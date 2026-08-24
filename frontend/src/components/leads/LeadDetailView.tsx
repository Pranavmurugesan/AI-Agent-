import React, { useState } from 'react';
import { 
  Lead, 
  LeadStatus, 
  LeadPriority, 
  CounselorOption, 
  Course, 
  ActivityType
} from '../../types/leads';
import { useAuth } from '../../hooks/useAuth';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Send, 
  UserCheck, 
  Flame, 
  Calendar, 
  MessageSquare, 
  Edit3, 
  Share2, 
  PhoneCall, 
  Tv, 
  Users as UsersIcon,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface LeadDetailViewProps {
  lead: Lead;
  counselors: CounselorOption[];
  courses: Course[];
  onBack: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => Promise<void>;
  onAssignCounselor: (id: string, counselorId: string) => Promise<void>;
  onAddNote: (id: string, content: string) => Promise<void>;
  onEditLead: (lead: Lead) => void;
  onScheduleFollowUp: (leadId: string) => void;
  onCompleteFollowUp: (fuId: string, outcome?: string) => Promise<void>;
}

export const LeadDetailView: React.FC<LeadDetailViewProps> = ({
  lead,
  counselors,
  courses,
  onBack,
  onUpdateStatus,
  onAssignCounselor,
  onAddNote,
  onEditLead,
  onScheduleFollowUp,
  onCompleteFollowUp,
}) => {
  const { user } = useAuth();
  const [noteContent, setNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'notes' | 'followups'>('timeline');

  const statusPipeline: { id: LeadStatus; label: string; description: string }[] = [
    { id: 'NEW', label: 'New Lead', description: 'Captured enquiry' },
    { id: 'CONTACTED', label: 'Contacted', description: 'First call made' },
    { id: 'QUALIFIED', label: 'Qualified', description: 'Eligible & interested' },
    { id: 'FOLLOW_UP', label: 'Follow-up', description: 'Counseling in progress' },
    { id: 'CONVERTED', label: 'Converted', description: 'Enrolled & fee paid' },
  ];

  const currentStatusIndex = statusPipeline.findIndex(s => s.id === lead.status);
  const isLost = lead.status === 'LOST';

  const course = courses.find(c => c.id === lead.courseId);

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsAddingNote(true);
    try {
      await onAddNote(lead.id, noteContent.trim());
      setNoteContent('');
    } finally {
      setIsAddingNote(false);
    }
  };

  const getPriorityBadge = (p: LeadPriority) => {
    switch (p) {
      case 'HOT':
        return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">🔥 Hot Priority</span>;
      case 'WARM':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">⚡ Warm Priority</span>;
      case 'COLD':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">❄️ Cold Priority</span>;
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'CREATED':
        return <Share2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'STATUS_CHANGED':
        return <CheckCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'COUNSELOR_ASSIGNED':
        return <UserCheck className="w-3.5 h-3.5 text-purple-400" />;
      case 'NOTE_ADDED':
        return <MessageSquare className="w-3.5 h-3.5 text-slate-300" />;
      case 'FOLLOW_UP_SCHEDULED':
      case 'FOLLOW_UP_COMPLETED':
      case 'FOLLOW_UP_CANCELLED':
        return <Clock className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CONVERTED':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'LOST':
        return <Clock className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Leads</span>
        </button>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button
            onClick={() => onScheduleFollowUp(lead.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Follow-up</span>
          </button>

          <button
            onClick={() => onEditLead(lead)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/30 flex-shrink-0">
              {lead.studentName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-100 truncate">{lead.studentName}</h2>
                {getPriorityBadge(lead.priority)}
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[11px] font-mono">
                  Source: {lead.source}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center space-x-1.5 hover:text-blue-400 transition-colors font-mono"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lead.phone}</span>
                </a>

                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center space-x-1.5 hover:text-blue-400 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{lead.email}</span>
                  </a>
                )}

                {lead.city && (
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{lead.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Counselor Assignment & Lost Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <div className="text-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Counselor</span>
                <select
                  value={lead.assignedToId || ''}
                  onChange={(e) => onAssignCounselor(lead.id, e.target.value)}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="" className="bg-slate-900">Unassigned</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {lead.status !== 'LOST' ? (
              <button
                onClick={() => onUpdateStatus(lead.id, 'LOST')}
                className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl border border-rose-900/40 transition-colors"
              >
                Mark as Lost / Dropped
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(lead.id, 'FOLLOW_UP')}
                className="px-3 py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 rounded-xl border border-blue-900/40 transition-colors"
              >
                Reopen Enquiry
              </button>
            )}
          </div>
        </div>

        {/* STATUS PIPELINE STEPPER */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Admissions Conversion Pipeline</span>
            {isLost && (
              <span className="text-rose-400 font-semibold px-2 py-0.5 bg-rose-950/40 rounded border border-rose-800/40">
                Lead Marked as LOST / UNRESPONSIVE
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {statusPipeline.map((step, idx) => {
              const isPastOrCurrent = !isLost && currentStatusIndex >= idx;
              const isCurrent = !isLost && lead.status === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => onUpdateStatus(lead.id, step.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40 ring-2 ring-blue-400/30'
                      : isPastOrCurrent
                        ? 'bg-blue-950/30 text-blue-300 border-blue-800/50 hover:bg-blue-900/40'
                        : 'bg-slate-900/40 text-slate-500 border-slate-800 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono opacity-70">0{idx + 1}</span>
                    {isPastOrCurrent && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-xs font-bold">{step.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{step.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Course & Education Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center space-x-1">
              <BookOpen className="w-3 h-3 text-blue-400" />
              <span>Target Course</span>
            </span>
            <div className="text-xs font-bold text-slate-100">
              {course?.name || lead.courseName || 'General Enquiry'}
            </div>
            {course && (
              <div className="text-[11px] font-mono text-emerald-400">
                Fee: ₹{course.fee.toLocaleString('en-IN')} ({course.duration})
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center space-x-1">
              <GraduationCap className="w-3 h-3 text-blue-400" />
              <span>Qualification</span>
            </span>
            <div className="text-xs font-bold text-slate-100">
              {lead.qualification || 'Not Specified'}
            </div>
            <div className="text-[11px] text-slate-500">
              Captured: {new Date(lead.createdAt).toLocaleDateString('en-IN')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-500 flex items-center space-x-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Lead Priority & Source</span>
            </span>
            <div className="text-xs font-bold text-slate-100">
              {lead.priority} Intent
            </div>
            <div className="text-[11px] text-slate-500">
              Acquisition: {lead.source.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Timeline, Notes, Follow-ups */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activity Timeline ({lead.activities?.length || 0})
          </button>

          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'notes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Counselor Notes ({lead.notes?.length || 0})
          </button>

          <button
            onClick={() => setActiveSubTab('followups')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'followups'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Follow-ups ({lead.followUps?.length || 0})
          </button>
        </div>

        {/* TAB 1: ACTIVITY TIMELINE */}
        {activeSubTab === 'timeline' && (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enquiry Event History
            </h4>

            {!lead.activities || lead.activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No activity history recorded yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {lead.activities.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Circle bullet */}
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      {getActivityIcon(act.type)}
                    </div>

                    <div className="glass-card p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{act.title}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(act.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                      {act.performedByName && (
                        <span className="text-[10px] text-slate-500 block pt-0.5">
                          By {act.performedByName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COUNSELOR NOTES */}
        {activeSubTab === 'notes' && (
          <div className="space-y-5">
            {/* Add note form */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Add Counselor Discussion Note
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record syllabus discussion, scholarship discount agreed, parent concerns..."
                  className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isAddingNote || !noteContent.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-900/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Logged Notes
              </h4>

              {(!lead.notes || (Array.isArray(lead.notes) && lead.notes.length === 0)) ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                  No notes logged yet. Add your first note above.
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.isArray(lead.notes) ? (
                    lead.notes.map((n: any) => (
                      <div key={n.id || n.createdAt} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-blue-400">
                            {n.authorName || user?.name || 'Staff Member'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : 'Just now'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{n.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-400">
                          {user?.name || 'Staff Member'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {lead.updatedAt ? new Date(lead.updatedAt).toLocaleString('en-IN') : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{lead.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FOLLOW-UPS */}
        {activeSubTab === 'followups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Scheduled Follow-ups for {lead.studentName}
              </h4>
              <button
                onClick={() => onScheduleFollowUp(lead.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Follow-up</span>
              </button>
            </div>

            {!lead.followUps || lead.followUps.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No follow-ups scheduled for this student. Click 'Schedule Follow-up' to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {lead.followUps.map((fu) => {
                  const date = new Date(fu.scheduledAt);
                  const isDone = fu.status === 'COMPLETED';

                  return (
                    <div
                      key={fu.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                            {fu.type === 'PHONE_CALL' && <PhoneCall className="w-3.5 h-3.5 text-blue-400" />}
                            {fu.type === 'WHATSAPP' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                            {fu.type === 'IN_PERSON' && <UsersIcon className="w-3.5 h-3.5 text-purple-400" />}
                            {fu.type === 'DEMO_CLASS' && <Tv className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{fu.type.replace('_', ' ')}</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                            isDone ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {fu.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{fu.notes}</p>
                        {fu.outcome && (
                          <p className="text-xs text-emerald-400">Outcome: {fu.outcome}</p>
                        )}
                        <div className="text-[11px] font-mono text-slate-500">
                          {date.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {!isDone && (
                        <button
                          onClick={() => onCompleteFollowUp(fu.id, 'Completed from lead details view')}
                          className="self-start sm:self-auto px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
