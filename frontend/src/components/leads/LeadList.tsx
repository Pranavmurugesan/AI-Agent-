import React from 'react';
import { 
  Lead, 
  LeadStatus, 
  LeadPriority, 
  Course, 
  CounselorOption, 
  LeadFilters 
} from '../../types/leads';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  Eye, 
  Trash2, 
  AlertCircle,
  Plus,
  RefreshCw
} from 'lucide-react';

interface LeadListProps {
  leads: Lead[];
  totalElements: number;
  totalPages: number;
  filters: LeadFilters;
  courses: Course[];
  counselors: CounselorOption[];
  isLoading: boolean;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onSelectLead: (id: string) => void;
  onQuickStatusChange: (id: string, status: LeadStatus) => void;
  onQuickAssignCounselor: (id: string, counselorId: string) => void;
  onDeleteLead: (id: string) => void;
  onAddNew: () => void;
  onRefresh: () => void;
}

export const LeadList: React.FC<LeadListProps> = ({
  leads,
  totalElements,
  totalPages,
  filters,
  courses,
  counselors,
  isLoading,
  onFilterChange,
  onSelectLead,
  onQuickStatusChange,
  onQuickAssignCounselor,
  onDeleteLead,
  onAddNew,
  onRefresh,
}) => {
  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'HOT':
        return <span className="text-[11px] font-semibold text-rose-400 font-mono">🔥 HOT</span>;
      case 'WARM':
        return <span className="text-[11px] font-semibold text-amber-400 font-mono">⚡ WARM</span>;
      case 'COLD':
        return <span className="text-[11px] font-semibold text-blue-400 font-mono">❄️ COLD</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Top Action Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
              placeholder="Search enquiries by student name, phone, email, city..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2.5 self-end md:self-auto">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors border border-slate-800"
              title="Refresh Leads Table"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <button
              onClick={onAddNew}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Capture Enquiry</span>
            </button>
          </div>
        </div>

        {/* Multi-Filter Dropdown Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center space-x-1 text-slate-500 pr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onFilterChange({ status: e.target.value as any, page: 1 })}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="ALL">Status: All</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="FOLLOW_UP">Follow-up</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || 'ALL'}
            onChange={(e) => onFilterChange({ priority: e.target.value as any, page: 1 })}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="ALL">Priority: All</option>
            <option value="HOT">🔥 Hot</option>
            <option value="WARM">⚡ Warm</option>
            <option value="COLD">❄️ Cold</option>
          </select>

          {/* Course Filter */}
          <select
            value={filters.courseId || 'ALL'}
            onChange={(e) => onFilterChange({ courseId: e.target.value, page: 1 })}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs max-w-[160px] truncate"
          >
            <option value="ALL">Course: All</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          {/* Counselor Filter */}
          <select
            value={filters.counselorId || 'ALL'}
            onChange={(e) => onFilterChange({ counselorId: e.target.value, page: 1 })}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="ALL">Counselor: All</option>
            {counselors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={filters.source || 'ALL'}
            onChange={(e) => onFilterChange({ source: e.target.value as any, page: 1 })}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="ALL">Source: All</option>
            <option value="META_ADS">Meta Ads</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="WEBSITE">Website</option>
            <option value="WALK_IN">Walk-in</option>
            <option value="REFERRAL">Referral</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading student enquiries...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">No leads found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No student enquiries matched the current filters. Adjust your search or capture a new lead.
            </p>
            <button
              onClick={onAddNew}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture New Lead</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Student Details</th>
                  <th className="px-4 py-3.5">Target Course</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Assigned Counselor</th>
                  <th className="px-4 py-3.5">Source</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                    onClick={() => onSelectLead(lead.id)}
                  >
                    {/* Student Name & Phone */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                        {lead.studentName}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono pt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{lead.phone}</span>
                        {lead.city && <span>• {lead.city}</span>}
                      </div>
                    </td>

                    {/* Target Course */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="truncate font-medium text-slate-200">
                        {lead.courseName || 'General Enquiry'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Captured: {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      {getPriorityBadge(lead.priority)}
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => onQuickStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="FOLLOW_UP">Follow-up</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </td>

                    {/* Counselor Dropdown */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.assignedToId || ''}
                        onChange={(e) => onQuickAssignCounselor(lead.id, e.target.value)}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[140px] truncate"
                      >
                        <option value="">Unassigned</option>
                        {counselors.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                        {lead.source.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectLead(lead.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 rounded transition-colors"
                          title="View lead timeline & notes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete enquiry for ${lead.studentName}?`)) {
                              onDeleteLead(lead.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          title="Archive / Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Showing {leads.length} of {totalElements} leads</span>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1">
              <span>Page size:</span>
              <select
                value={filters.size}
                onChange={(e) => onFilterChange({ size: Number(e.target.value), page: 1 })}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFilterChange({ page: Math.max(1, filters.page - 1) })}
              disabled={filters.page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono">
              Page {filters.page} of {totalPages || 1}
            </span>

            <button
              onClick={() => onFilterChange({ page: Math.min(totalPages, filters.page + 1) })}
              disabled={filters.page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
