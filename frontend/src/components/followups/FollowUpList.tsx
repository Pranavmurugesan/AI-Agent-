import React, { useState } from 'react';
import { FollowUp, FollowUpType } from '../../types/leads';
import { 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Users as UsersIcon, 
  Tv, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Plus,
  ArrowUpRight,
  Calendar
} from 'lucide-react';

interface FollowUpListProps {
  followUps: FollowUp[];
  isLoading: boolean;
  onComplete: (id: string, outcomeNote?: string) => void;
  onCancel: (id: string) => void;
  onAddNew: () => void;
  onSelectLead?: (leadId: string) => void;
}

export type FollowUpTab = 'TODAY' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED' | 'ALL';

export const FollowUpList: React.FC<FollowUpListProps> = ({
  followUps,
  isLoading,
  onComplete,
  onCancel,
  onAddNew,
  onSelectLead,
}) => {
  const [activeTab, setActiveTab] = useState<FollowUpTab>('TODAY');
  const [searchTerm, setSearchTerm] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [outcomeNote, setOutcomeNote] = useState('');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 86400000;

  // Counts for tabs
  const todayCount = followUps.filter(fu => {
    const time = new Date(fu.scheduledAt).getTime();
    return time >= startOfToday && time <= endOfToday && fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED';
  }).length;

  const overdueCount = followUps.filter(fu => {
    const time = new Date(fu.scheduledAt).getTime();
    return time < now.getTime() && fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED';
  }).length;

  const upcomingCount = followUps.filter(fu => {
    const time = new Date(fu.scheduledAt).getTime();
    return time > endOfToday && fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED';
  }).length;

  const completedCount = followUps.filter(fu => fu.status === 'COMPLETED').length;

  // Filtering based on tab
  const filteredFollowUps = followUps.filter(fu => {
    const time = new Date(fu.scheduledAt).getTime();

    // Tab check
    if (activeTab === 'TODAY') {
      if (fu.status === 'COMPLETED' || fu.status === 'CANCELLED') return false;
      if (time < startOfToday || time > endOfToday) return false;
    } else if (activeTab === 'UPCOMING') {
      if (fu.status === 'COMPLETED' || fu.status === 'CANCELLED') return false;
      if (time <= endOfToday) return false;
    } else if (activeTab === 'OVERDUE') {
      if (fu.status === 'COMPLETED' || fu.status === 'CANCELLED') return false;
      if (time >= now.getTime()) return false;
    } else if (activeTab === 'COMPLETED') {
      if (fu.status !== 'COMPLETED') return false;
    }

    // Search check
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchLead = fu.leadName?.toLowerCase().includes(q);
      const matchPhone = fu.leadPhone?.includes(q);
      const matchNotes = fu.notes.toLowerCase().includes(q);
      const matchCounselor = fu.counselorName?.toLowerCase().includes(q);
      return matchLead || matchPhone || matchNotes || matchCounselor;
    }

    return true;
  });

  const getTypeBadge = (type: FollowUpType) => {
    switch (type) {
      case 'PHONE_CALL':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            <PhoneCall className="w-3 h-3" />
            <span>Call</span>
          </span>
        );
      case 'WHATSAPP':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <MessageSquare className="w-3 h-3" />
            <span>WhatsApp</span>
          </span>
        );
      case 'IN_PERSON':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
            <UsersIcon className="w-3 h-3" />
            <span>Center Visit</span>
          </span>
        );
      case 'DEMO_CLASS':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            <Tv className="w-3 h-3" />
            <span>Demo Session</span>
          </span>
        );
    }
  };

  const handleConfirmComplete = (id: string) => {
    onComplete(id, outcomeNote.trim() || undefined);
    setCompletingId(null);
    setOutcomeNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Filters */}
        <div className="flex items-center space-x-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('TODAY')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'TODAY' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Today</span>
            {todayCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-800 text-white">
                {todayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'OVERDUE' 
                ? 'bg-rose-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Overdue</span>
            {overdueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-900 text-rose-200">
                {overdueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'UPCOMING' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Upcoming</span>
            {upcomingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {upcomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'COMPLETED' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Completed</span>
            {completedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {completedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ALL' 
                ? 'bg-slate-700 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Follow-ups
          </button>
        </div>

        {/* Action button */}
        <button
          onClick={onAddNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-900/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by student name, phone, or notes..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Follow-up Cards & List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 border border-slate-800 animate-pulse h-28" />
          ))}
        </div>
      ) : filteredFollowUps.length === 0 ? (
        <div className="glass-card rounded-xl p-12 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">No follow-ups in this view</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm 
              ? 'No scheduled activities match your search keyword.' 
              : activeTab === 'OVERDUE' 
                ? 'Great job! There are no overdue follow-ups for your institute.'
                : 'Schedule a follow-up reminder to nurture incoming student enquiries.'}
          </p>
          {!searchTerm && (
            <button
              onClick={onAddNew}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Follow-up</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFollowUps.map((fu) => {
            const isOverdue = new Date(fu.scheduledAt).getTime() < now.getTime() && fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED';
            const scheduledDate = new Date(fu.scheduledAt);

            return (
              <div
                key={fu.id}
                className={`glass-card rounded-xl p-5 border transition-all ${
                  isOverdue 
                    ? 'border-rose-900/60 bg-rose-950/10 hover:border-rose-800' 
                    : fu.status === 'COMPLETED' 
                      ? 'border-emerald-900/40 bg-emerald-950/5 hover:border-emerald-800/60'
                      : 'border-slate-800 hover:border-slate-700'
                } flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                {/* Left info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(fu.type)}

                    {isOverdue && (
                      <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        <span>OVERDUE REMINDER</span>
                      </span>
                    )}

                    {fu.status === 'COMPLETED' && (
                      <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        <span>COMPLETED</span>
                      </span>
                    )}

                    {fu.status === 'CANCELLED' && (
                      <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                        <XCircle className="w-3 h-3" />
                        <span>CANCELLED</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                      <span>{fu.leadName || 'Student Enquiry'}</span>
                      {onSelectLead && fu.leadId && (
                        <button
                          onClick={() => onSelectLead(fu.leadId)}
                          className="text-blue-400 hover:text-blue-300 text-xs inline-flex items-center space-x-0.5 font-normal"
                        >
                          <span>(View Lead)</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </h4>

                    {fu.leadPhone && (
                      <span className="text-xs text-slate-400 font-mono">
                        • {fu.leadPhone}
                      </span>
                    )}

                    {fu.courseName && (
                      <span className="text-xs text-slate-400">
                        • Course: <strong className="text-slate-300">{fu.courseName}</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    <strong className="text-slate-400 font-medium">Notes:</strong> {fu.notes}
                  </p>

                  {fu.outcome && (
                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-800/30 text-xs text-emerald-300">
                      <strong>Outcome:</strong> {fu.outcome}
                    </div>
                  )}
                </div>

                {/* Right time & actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 flex-shrink-0">
                  <div className="text-left md:text-right space-y-0.5">
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{scheduledDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>at {scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {fu.counselorName && (
                      <p className="text-[11px] text-slate-400">
                        Counselor: <span className="text-slate-300 font-medium">{fu.counselorName}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {fu.status !== 'COMPLETED' && fu.status !== 'CANCELLED' && (
                    <div className="flex items-center space-x-2">
                      {completingId === fu.id ? (
                        <div className="flex flex-col space-y-2 p-2 bg-slate-900 rounded-lg border border-slate-700">
                          <input
                            type="text"
                            value={outcomeNote}
                            onChange={(e) => setOutcomeNote(e.target.value)}
                            placeholder="Call outcome / next step..."
                            className="px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                          />
                          <div className="flex items-center space-x-1 justify-end">
                            <button
                              onClick={() => setCompletingId(null)}
                              className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleConfirmComplete(fu.id)}
                              className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium"
                            >
                              Save Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setCompletingId(fu.id)}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('Cancel this scheduled follow-up?')) {
                                onCancel(fu.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Cancel follow-up"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
