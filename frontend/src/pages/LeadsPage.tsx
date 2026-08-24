import React, { useState, useEffect, useCallback } from 'react';
import { LeadList } from '../components/leads/LeadList';
import { LeadModal } from '../components/leads/LeadModal';
import { LeadDetailView } from '../components/leads/LeadDetailView';
import { FollowUpModal } from '../components/followups/FollowUpModal';
import { 
  Lead, 
  Course, 
  CounselorOption, 
  LeadFilters, 
  LeadStatus, 
  CreateLeadRequest, 
  UpdateLeadRequest,
  CreateFollowUpRequest
} from '../types/leads';
import { apiService } from '../services/api';
import { Users, AlertCircle } from 'lucide-react';

interface LeadsPageProps {
  selectedLeadId?: string | null;
  onSelectLeadId?: (id: string | null) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ 
  selectedLeadId: initialSelectedLeadId,
  onSelectLeadId 
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [counselors, setCounselors] = useState<CounselorOption[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Lead Detail view
  const [activeLeadId, setActiveLeadId] = useState<string | null>(initialSelectedLeadId || null);

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpLeadId, setFollowUpLeadId] = useState<string | undefined>(undefined);

  // Filters state
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    source: 'ALL',
    courseId: 'ALL',
    counselorId: 'ALL',
    page: 1,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  });

  useEffect(() => {
    if (initialSelectedLeadId !== undefined) {
      setActiveLeadId(initialSelectedLeadId);
    }
  }, [initialSelectedLeadId]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [leadsResp, coursesList, counselorsList] = await Promise.all([
        apiService.getLeads(filters),
        apiService.getCourses(),
        apiService.getCounselors(),
      ]);

      setLeads(leadsResp.content);
      setTotalElements(leadsResp.totalElements);
      setTotalPages(leadsResp.totalPages);
      setCourses(coursesList);
      setCounselors(counselorsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load student leads.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = (newFilters: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSelectLead = (id: string | null) => {
    setActiveLeadId(id);
    if (onSelectLeadId) onSelectLeadId(id);
  };

  const handleQuickStatusChange = async (id: string, status: LeadStatus) => {
    try {
      const updated = await apiService.updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err: any) {
      alert(err.message || 'Failed to update lead status');
    }
  };

  const handleQuickAssignCounselor = async (id: string, counselorId: string) => {
    try {
      const updated = await apiService.assignLead(id, counselorId);
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err: any) {
      alert(err.message || 'Failed to assign counselor');
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await apiService.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setTotalElements((prev) => Math.max(0, prev - 1));
      if (activeLeadId === id) {
        handleSelectLead(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete lead');
    }
  };

  const handleCreateOrUpdateLead = async (data: CreateLeadRequest | UpdateLeadRequest) => {
    if (leadToEdit) {
      const updated = await apiService.updateLead(leadToEdit.id, data as UpdateLeadRequest);
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    } else {
      const created = await apiService.createLead(data as CreateLeadRequest);
      setLeads((prev) => [created, ...prev]);
      setTotalElements((prev) => prev + 1);
    }
  };

  const handleAddNote = async (id: string, content: string) => {
    const updated = await apiService.addLeadNote(id, content);
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleScheduleFollowUp = async (data: CreateFollowUpRequest) => {
    await apiService.createFollowUp(data);
    fetchLeads();
  };

  const handleCompleteFollowUp = async (fuId: string, outcome?: string) => {
    await apiService.completeFollowUp(fuId, outcome);
    fetchLeads();
  };

  // Find currently active lead for detail view
  const activeLead = activeLeadId ? leads.find((l) => l.id === activeLeadId) : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      {!activeLeadId && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Student Enquiries & Leads</h2>
              <p className="text-xs text-slate-400">
                Filter admissions pipeline, track counselor interactions, and nurture student conversions
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Detail View vs Table View */}
      {activeLeadId && activeLead ? (
        <LeadDetailView
          lead={activeLead}
          counselors={counselors}
          courses={courses}
          onBack={() => handleSelectLead(null)}
          onUpdateStatus={handleQuickStatusChange}
          onAssignCounselor={handleQuickAssignCounselor}
          onAddNote={handleAddNote}
          onEditLead={(lead) => {
            setLeadToEdit(lead);
            setIsLeadModalOpen(true);
          }}
          onScheduleFollowUp={(id) => {
            setFollowUpLeadId(id);
            setIsFollowUpModalOpen(true);
          }}
          onCompleteFollowUp={handleCompleteFollowUp}
        />
      ) : (
        <LeadList
          leads={leads}
          totalElements={totalElements}
          totalPages={totalPages}
          filters={filters}
          courses={courses}
          counselors={counselors}
          isLoading={isLoading}
          onFilterChange={handleFilterChange}
          onSelectLead={handleSelectLead}
          onQuickStatusChange={handleQuickStatusChange}
          onQuickAssignCounselor={handleQuickAssignCounselor}
          onDeleteLead={handleDeleteLead}
          onAddNew={() => {
            setLeadToEdit(null);
            setIsLeadModalOpen(true);
          }}
          onRefresh={fetchLeads}
        />
      )}

      {/* Lead Create / Edit Modal */}
      <LeadModal
        isOpen={isLeadModalOpen}
        leadToEdit={leadToEdit}
        courses={courses}
        counselors={counselors}
        onClose={() => {
          setIsLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        onSubmit={handleCreateOrUpdateLead}
      />

      {/* Follow-up Schedule Modal */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        leadId={followUpLeadId}
        leads={leads}
        counselors={counselors}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setFollowUpLeadId(undefined);
        }}
        onSubmit={handleScheduleFollowUp}
      />
    </div>
  );
};
