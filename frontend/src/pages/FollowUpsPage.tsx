import React, { useState, useEffect, useCallback } from 'react';
import { FollowUpList } from '../components/followups/FollowUpList';
import { FollowUpModal } from '../components/followups/FollowUpModal';
import { FollowUp, CounselorOption, Lead, CreateFollowUpRequest } from '../types/leads';
import { apiService } from '../services/api';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';

interface FollowUpsPageProps {
  onSelectLead?: (leadId: string) => void;
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({ onSelectLead }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [counselors, setCounselors] = useState<CounselorOption[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fuList, cList, leadsResp] = await Promise.all([
        apiService.getFollowUps(),
        apiService.getCounselors(),
        apiService.getLeads({ page: 1, size: 50 }),
      ]);
      setFollowUps(fuList);
      setCounselors(cList);
      setLeads(leadsResp.content);
    } catch (err: any) {
      setError(err.message || 'Failed to load follow-ups.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateFollowUp = async (data: CreateFollowUpRequest) => {
    const created = await apiService.createFollowUp(data);
    setFollowUps((prev) => [created, ...prev]);
  };

  const handleComplete = async (id: string, outcomeNote?: string) => {
    try {
      const updated = await apiService.completeFollowUp(id, outcomeNote);
      setFollowUps((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err: any) {
      alert(err.message || 'Failed to complete follow-up');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const updated = await apiService.cancelFollowUp(id);
      setFollowUps((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel follow-up');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Student Follow-ups & Reminders</h2>
            <p className="text-xs text-slate-400">
              Track counseling calls, WhatsApp follow-ups, and demo class admissions
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="self-start sm:self-auto p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors"
          title="Refresh Follow-ups"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main List */}
      <FollowUpList
        followUps={followUps}
        isLoading={isLoading}
        onComplete={handleComplete}
        onCancel={handleCancel}
        onAddNew={() => setIsModalOpen(true)}
        onSelectLead={onSelectLead}
      />

      {/* Schedule Modal */}
      <FollowUpModal
        isOpen={isModalOpen}
        leads={leads}
        counselors={counselors}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateFollowUp}
      />
    </div>
  );
};
