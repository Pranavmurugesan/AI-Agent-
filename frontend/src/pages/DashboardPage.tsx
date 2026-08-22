import React from 'react';
import { HealthWidget } from '../components/HealthWidget';
import { StatCard } from '../components/StatCard';
import { Users, Bot, MessageSquareText, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Phase 1 — Project Foundation Established</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            AI Lead Conversion System
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl">
            Target Market: <strong className="text-slate-200">Indian Coaching & Training Institutes</strong>. Phase 1 delivers a modular, scalable Spring Boot REST API, React UI, PostgreSQL connectivity, and unified health monitoring.
          </p>
        </div>
      </div>

      {/* Primary Section: Health & System Connectivity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthWidget />
        </div>

        {/* Foundation Summary Panel */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Foundation Architecture</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Frontend Stack</span>
                <span className="font-mono text-blue-400">React + TypeScript + Vite</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Backend API</span>
                <span className="font-mono text-emerald-400">Java 21 + Spring Boot 3.4</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Database Engine</span>
                <span className="font-mono text-purple-400">PostgreSQL 16</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Security: Zero hardcoded secrets</span>
            <span className="font-mono text-emerald-400">Environment Driven</span>
          </div>
        </div>
      </div>

      {/* Placeholder Metrics (Future Phases Roadmap) */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          System Overview (Upcoming Modules)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Student Enquiries"
            value="--"
            subtitle="Capture module planned for Phase 3"
            icon={Users}
            phaseTag="Phase 3"
          />
          <StatCard
            title="Automated Follow-ups"
            value="--"
            subtitle="Conversation tracking planned for Phase 4"
            icon={MessageSquareText}
            phaseTag="Phase 4"
          />
          <StatCard
            title="AI Qualified Leads"
            value="--"
            subtitle="AI Qualification Agent planned for Phase 6"
            icon={Bot}
            phaseTag="Phase 6"
          />
        </div>
      </div>

      {/* Roadmap Note */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>System Foundation ready. Ready to proceed to Phase 2 (Authentication) upon explicit approval.</span>
        </div>
        <a 
          href="/docs/roadmap.md" 
          target="_blank" 
          rel="noreferrer"
          className="hidden sm:flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium"
        >
          <span>View 10-Phase Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
