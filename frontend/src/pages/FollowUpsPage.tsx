import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { FollowUp, FollowUpStatus } from '../types/lead';
import { User } from '../types/api';
import { CalendarCheck, Clock, CheckCircle2, XCircle, AlertTriangle, AlertCircle, Check, UserCheck } from 'lucide-react';

interface FollowUpsPageProps {
  currentUser?: User | null;
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({ currentUser }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [counselors, setCounselors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus | 'ALL'>('ALL');
  const [counselorFilter, setCounselorFilter] = useState<string>('');
  const [todayOnly, setTodayOnly] = useState<boolean>(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');
  const [completing, setCompleting] = useState<boolean>(false);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError(null);
      const filterParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const data = await apiService.getFollowUps({ 
        status: filterParam,
        todayOnly: todayOnly || undefined,
        assignedToId: counselorFilter || undefined
      });
      setFollowUps(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load follow-up tasks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const data = await apiService.getUsers();
      setCounselors(data);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  useEffect(() => {
    fetchFollowUps();
  }, [statusFilter, counselorFilter, todayOnly]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp) return;

    try {
      setCompleting(true);
      await apiService.completeFollowUp(selectedFollowUp.id, { outcomeNotes });
      setSelectedFollowUp(null);
      setOutcomeNotes('');
      await fetchFollowUps();
    } catch (err: any) {
      alert(err.message || 'Failed to complete follow-up');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this follow-up reminder?')) return;
    try {
      await apiService.cancelFollowUp(id);
      await fetchFollowUps();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel follow-up');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-400" />
            Counselor Callback & Follow-Up Tasks
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student callbacks, scholarship follow-ups, and demo lecture confirmations.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Counselor Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'OVERDUE', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab as any);
                setTodayOnly(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab && !todayOnly
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}

          <button
            onClick={() => setTodayOnly(!todayOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              todayOnly
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            📅 Today's Tasks
          </button>
        </div>

        {counselors.length > 0 && currentUser?.role === 'ADMIN' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Counselor:</span>
            <select
              value={counselorFilter}
              onChange={(e) => setCounselorFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Institute Counselors</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Task List */}
      <div className="glass-panel border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading follow-ups...</div>
        ) : followUps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No follow-up tasks found for the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Student / Lead</th>
                  <th className="px-6 py-3">Scheduled Date & Time (IST)</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Assigned Counselor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {followUps.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100">{task.leadName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{task.leadPhone}</div>
                      {task.notes && (
                        <div className="text-[11px] text-slate-400 font-normal mt-1 italic">
                          "{task.notes}"
                        </div>
                      )}
                      {task.outcomeNotes && (
                        <div className="text-[11px] text-emerald-400/90 font-normal mt-1">
                          Outcome: {task.outcomeNotes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-[11px]">
                      {new Date(task.scheduledAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        task.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400' :
                        task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        task.priority === 'LOW' ? 'bg-slate-800 text-slate-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {task.assignedTo ? (
                        <span className="inline-flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          {task.assignedTo.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {task.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : task.overdue ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      ) : task.status === 'CANCELLED' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                          <XCircle className="w-3 h-3" /> Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {task.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedFollowUp(task)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium transition-all shadow"
                          >
                            <Check className="w-3 h-3" /> Complete
                          </button>
                          <button
                            onClick={() => handleCancel(task.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-[11px] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Modal */}
      {selectedFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100">
              Complete Follow-Up for {selectedFollowUp.leadName}
            </h2>
            <form onSubmit={handleComplete} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Outcome / Conversation Remarks *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Student attended demo class; agreed to pay token fee on Friday..."
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFollowUp(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-900/30"
                >
                  {completing ? 'Saving...' : 'Mark Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
