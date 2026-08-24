import React, { useEffect, useState } from 'react';
import { HealthWidget } from '../components/HealthWidget';
import { StatCard } from '../components/StatCard';
import { apiService } from '../services/api';
import { DashboardMetrics } from '../types/lead';
import { Users, CheckCircle2, CalendarCheck, TrendingUp, Sparkles } from 'lucide-react';

interface DashboardPageProps {
  onNavigateLeads?: () => void;
  onNavigateFollowUps?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateLeads, onNavigateFollowUps }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiService.getDashboardMetrics();
        setMetrics(data);
      } catch {
        // Unauthenticated or offline fallback
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Phase 3 — Lead Management Engine Active</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            AI Lead Conversion System
          </h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl">
            Target Market: <strong className="text-slate-200">Indian Coaching & Training Institutes</strong>. Real-time funnel tracking, counselor assignments, and automated inquiry deduplication.
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Leads"
          value={metrics ? metrics.totalLeads.toString() : '--'}
          subtitle="Registered inquiries across institute"
          icon={Users}
          phaseTag="Live"
        />
        <StatCard
          title="Follow-Ups Today"
          value={metrics ? metrics.followUps.todayPending.toString() : '--'}
          subtitle={metrics && metrics.followUps.overdue > 0 ? `${metrics.followUps.overdue} overdue tasks` : 'Pending counselor callbacks'}
          icon={CalendarCheck}
          phaseTag="Tasks"
        />
        <StatCard
          title="Converted Admissions"
          value={metrics ? metrics.pipeline.convertedCount.toString() : '--'}
          subtitle={`Conversion Rate: ${metrics ? metrics.conversionRatePercent : 0}%`}
          icon={TrendingUp}
          phaseTag="Enrolled"
        />
        <StatCard
          title="AI Readiness"
          value="Structured"
          subtitle="Audit timeline & domain data ready"
          icon={Sparkles}
          phaseTag="Phase 5/6"
        />
      </div>

      {/* Funnel Pipeline Stages */}
      {metrics && (
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admission Pipeline Funnel Breakdown
            </h3>
            <div className="flex items-center gap-4 text-xs">
              {onNavigateFollowUps && (
                <button onClick={onNavigateFollowUps} className="text-blue-400 hover:underline">
                  View Tasks →
                </button>
              )}
              {onNavigateLeads && (
                <button onClick={onNavigateLeads} className="text-blue-400 hover:underline font-semibold">
                  View All Leads →
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/40">
              <span className="text-[10px] uppercase font-semibold text-blue-400">NEW</span>
              <div className="text-xl font-bold text-slate-100 mt-1">{metrics.pipeline.newCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] uppercase font-semibold text-slate-400">CONTACTED</span>
              <div className="text-xl font-bold text-slate-100 mt-1">{metrics.pipeline.contactedCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40">
              <span className="text-[10px] uppercase font-semibold text-indigo-400">QUALIFIED</span>
              <div className="text-xl font-bold text-slate-100 mt-1">{metrics.pipeline.qualifiedCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40">
              <span className="text-[10px] uppercase font-semibold text-amber-400">FOLLOW UP</span>
              <div className="text-xl font-bold text-slate-100 mt-1">{metrics.pipeline.followUpCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
              <span className="text-[10px] uppercase font-semibold text-emerald-400">CONVERTED</span>
              <div className="text-xl font-bold text-emerald-300 mt-1">{metrics.pipeline.convertedCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/40">
              <span className="text-[10px] uppercase font-semibold text-rose-400">LOST</span>
              <div className="text-xl font-bold text-slate-400 mt-1">{metrics.pipeline.lostCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* System Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthWidget />
        </div>

        {/* Lead Source Breakdown */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Inquiry Source Channels
          </h3>
          {metrics && metrics.sources.length > 0 ? (
            <div className="space-y-2">
              {metrics.sources.map((src) => (
                <div key={src.source} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="font-medium text-slate-300">{src.source}</span>
                  <span className="font-mono text-blue-400 font-semibold">{src.count} leads</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No source data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
