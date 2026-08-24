import React, { useState, useEffect } from 'react';
import { CreateFollowUpRequest, FollowUpType, CounselorOption, Lead } from '../../types/leads';
import { 
  X, 
  Clock, 
  Calendar, 
  PhoneCall, 
  MessageSquare, 
  Users as UsersIcon, 
  Tv, 
  User as UserIcon,
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface FollowUpModalProps {
  isOpen: boolean;
  leadId?: string;
  leads?: Lead[];
  counselors: CounselorOption[];
  onClose: () => void;
  onSubmit: (data: CreateFollowUpRequest) => Promise<void>;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  leadId: initialLeadId,
  leads = [],
  counselors,
  onClose,
  onSubmit,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [type, setType] = useState<FollowUpType>('PHONE_CALL');
  const [counselorId, setCounselorId] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLeadId) {
      setSelectedLeadId(initialLeadId);
    } else if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
    }

    // Default scheduled time: tomorrow at 11:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
    setScheduledAt(localISOTime);

    if (counselors.length > 0 && !counselorId) {
      setCounselorId(counselors[0].id);
    }
    setError(null);
  }, [initialLeadId, leads, counselors, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedLeadId) {
      setError('Please select a student lead.');
      return;
    }
    if (!scheduledAt) {
      setError('Please select a scheduled date and time.');
      return;
    }
    if (!notes.trim()) {
      setError('Please provide notes or discussion agenda for the follow-up.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        leadId: selectedLeadId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        type,
        counselorId: counselorId || undefined,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule follow-up.');
    } finally {
      setLoading(false);
    }
  };

  const followUpTypes: { id: FollowUpType; label: string; icon: any }[] = [
    { id: 'PHONE_CALL', label: 'Phone Call', icon: PhoneCall },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
    { id: 'IN_PERSON', label: 'Center Visit', icon: UsersIcon },
    { id: 'DEMO_CLASS', label: 'Demo Class', icon: Tv },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Schedule Student Follow-up</h3>
              <p className="text-xs text-slate-400">Set reminder for counseling call or demo session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Lead */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Student Lead *
            </label>
            {initialLeadId ? (
              <div className="px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-200 font-medium">
                {leads.find(l => l.id === initialLeadId)?.studentName || `Lead #${initialLeadId}`}
              </div>
            ) : (
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Choose a student enquiry --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.studentName} ({l.phone}) - {l.courseName || 'General Enquiry'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Follow-up Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Communication Channel / Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {followUpTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-md shadow-blue-900/20'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Scheduled Date & Time *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Assigned Counselor
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={counselorId}
                  onChange={(e) => setCounselorId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {counselors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Agenda / Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Follow-up Agenda / Discussion Notes *
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Call to discuss 2nd installment plan and send batch timing schedule on WhatsApp..."
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all shadow-md shadow-blue-900/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Confirm Schedule</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
