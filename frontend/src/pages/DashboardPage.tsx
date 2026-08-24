import React, { useState, useEffect, useCallback } from 'react';
import { DashboardStats, LeadSource } from '../types/leads';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { HealthWidget } from '../components/HealthWidget';
import { 
  Users, 
  Flame, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Share2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AppView } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate?: (view: AppView) => void;
  onSelectLead?: (leadId: string) => void;
  onOpenQuickLead?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigate, 
  onSelectLead,
  onOpenQuickLead 
}) => {
  const { user, organization } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDashboardMetrics();
      setStats(data);
    } catch {
      // Handled by service fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const sourceLabels: Record<LeadSource, string> = {
    META_ADS: 'Meta Ads',
    GOOGLE_ADS: 'Google Search Ads',
    WEBSITE: 'Institute Website',
    WALK_IN: 'Walk-in Desk',
    REFERRAL: 'Student Referral',
    OTHER: 'Other Channels',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 3 — Core Lead Management Engine Active</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Institute Portal: <strong className="text-slate-200">{organization?.name || 'Apex Coaching Institute'}</strong>. Real-time conversion tracking, counselor follow-ups, and student pipeline management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {onOpenQuickLead && (
              <button
                onClick={onOpenQuickLead}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-900/30 flex items-center space-x-2"
              >
                <span>+ Capture Lead</span>
              </button>
            )}

            <button
              onClick={fetchMetrics}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors border border-slate-800"
              title="Refresh Dashboard Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS ROW 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enquiries */}
        <div 
          onClick={() => onNavigate && onNavigate('leads')}
          className="glass-card rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Student Enquiries</span>
            <div className="p-2 bg-slate-900 rounded-lg text-blue-400 border border-slate-800 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {stats?.totalLeads ?? '--'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">All Sources</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>New: <strong className="text-blue-400">{stats?.newLeads ?? 0}</strong></span>
            <span>Contacted: <strong className="text-cyan-400">{stats?.contactedLeads ?? 0}</strong></span>
          </div>
        </div>

        {/* Qualified Leads */}
        <div 
          onClick={() => onNavigate && onNavigate('leads')}
          className="glass-card rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Qualified Prospects</span>
            <div className="p-2 bg-slate-900 rounded-lg text-purple-400 border border-slate-800 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {stats?.qualifiedLeads ?? '--'}
            </span>
            <span className="text-[11px] text-purple-400 font-medium">High Intent</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            In Follow-up: <strong className="text-amber-400">{stats?.inFollowUpLeads ?? 0}</strong>
          </div>
        </div>

        {/* Converted Students & Rate */}
        <div 
          onClick={() => onNavigate && onNavigate('leads')}
          className="glass-card rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Admissions Converted</span>
            <div className="p-2 bg-slate-900 rounded-lg text-emerald-400 border border-slate-800 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {stats?.convertedLeads ?? '--'}
            </span>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              ({stats?.conversionRate ?? 0}% Rate)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Lost: <strong className="text-rose-400">{stats?.lostLeads ?? 0}</strong>
          </div>
        </div>

        {/* Follow-up Reminders */}
        <div 
          onClick={() => onNavigate && onNavigate('follow-ups')}
          className="glass-card rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Follow-ups Today</span>
            <div className="p-2 bg-slate-900 rounded-lg text-amber-400 border border-slate-800 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {stats?.followUpsToday ?? '--'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Scheduled</span>
          </div>
          <div className="mt-2 text-[11px] flex items-center justify-between">
            <span className="text-slate-400">Overdue:</span>
            <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
              (stats?.overdueFollowUps || 0) > 0 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' 
                : 'text-emerald-400'
            }`}>
              {stats?.overdueFollowUps ?? 0} Pending
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: ADMISSIONS PIPELINE FUNNEL & SOURCE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Pipeline Visual */}
        <div className="glass-card rounded-xl p-5 sm:p-6 border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">Admissions Conversion Funnel</h3>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('leads')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-medium"
              >
                <span>View All Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {/* Step 1: New */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">1. New Enquiries</span>
                <span className="font-mono text-slate-400">{stats?.newLeads ?? 0} leads</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats?.totalLeads ? ((stats.newLeads || 0) / stats.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Step 2: Contacted */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">2. First Contact Made</span>
                <span className="font-mono text-slate-400">{stats?.contactedLeads ?? 0} leads</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats?.totalLeads ? ((stats.contactedLeads || 0) / stats.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Step 3: Qualified */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">3. Qualified & Budget Confirmed</span>
                <span className="font-mono text-slate-400">{stats?.qualifiedLeads ?? 0} leads</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats?.totalLeads ? ((stats.qualifiedLeads || 0) / stats.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Step 4: In Follow-up */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">4. Active Counseling & Demo Sessions</span>
                <span className="font-mono text-slate-400">{stats?.inFollowUpLeads ?? 0} leads</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats?.totalLeads ? ((stats.inFollowUpLeads || 0) / stats.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Step 5: Converted */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold">5. Enrolled & Converted</span>
                <span className="font-mono text-emerald-400 font-bold">{stats?.convertedLeads ?? 0} students</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats?.totalLeads ? ((stats.convertedLeads || 0) / stats.totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div className="glass-card rounded-xl p-5 sm:p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Acquisition Channels</h3>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            {stats?.sourceDistribution && Object.entries(stats.sourceDistribution).map(([sourceKey, count]) => {
              const label = sourceLabels[sourceKey as LeadSource] || sourceKey;
              const pct = stats.totalLeads ? Math.round((count / stats.totalLeads) * 100) : 0;

              return (
                <div key={sourceKey} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{label}</span>
                    <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: URGENT FOLLOW-UPS & RECENT LEADS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Follow-ups Action List */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Urgent Follow-ups Queue</h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('follow-ups')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              )}
            </div>

            {(!stats?.urgentFollowUps || stats.urgentFollowUps.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No immediate follow-ups scheduled.
              </p>
            ) : (
              <div className="space-y-2.5">
                {stats.urgentFollowUps.map((fu) => {
                  const isOverdue = new Date(fu.scheduledAt).getTime() < Date.now();
                  return (
                    <div
                      key={fu.id}
                      onClick={() => onSelectLead && fu.leadId && onSelectLead(fu.leadId)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isOverdue 
                          ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700' 
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-slate-200 truncate">
                            {fu.leadName || 'Student'}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] text-rose-400 font-bold font-mono">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{fu.notes}</p>
                      </div>

                      <div className="text-right flex-shrink-0 text-[11px] font-mono text-slate-400">
                        {new Date(fu.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Enquiries Feed */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-200">Recent Student Enquiries</h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('leads')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                </button>
              )}
            </div>

            {(!stats?.recentLeads || stats.recentLeads.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No recent enquiries captured yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {stats.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead && onSelectLead(lead.id)}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-200 truncate">
                          {lead.studentName}
                        </span>
                        <span className="text-[10px] text-blue-400 font-mono">
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {lead.courseName || lead.phone}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: HEALTH CHECK MONITOR */}
      <div className="pt-2">
        <HealthWidget />
      </div>
    </div>
  );
};
