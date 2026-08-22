import React from 'react';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, Server } from 'lucide-react';

export const HealthWidget: React.FC = () => {
  const { data, loading, error, lastChecked, refetch } = useHealthCheck(15000);

  const isConnected = !loading && !error && data?.status === 'UP';

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 shadow-xl transition-all duration-300 hover:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Backend API Status</h3>
            <p className="text-xs text-slate-400">Spring Boot REST Service (/api/v1/health)</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh Health Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {loading && !data && !error ? (
          <div className="flex items-center space-x-2 py-2 px-3 bg-slate-900/60 rounded-lg text-slate-400 text-xs animate-pulse">
            <Activity className="w-4 h-4 text-blue-400 animate-spin" />
            <span>Checking connection to Spring Boot backend...</span>
          </div>
        ) : isConnected ? (
          <div className="flex items-center justify-between py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">
                Backend Status: <strong className="text-emerald-200">Connected</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800/50">
              {data.service}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between py-2 px-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-medium text-rose-300">
                Backend Status: <strong className="text-rose-200">Unavailable</strong>
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="text-[11px] px-2 py-0.5 bg-rose-900/40 hover:bg-rose-900/80 text-rose-200 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {error && (
          <div className="text-[11px] text-rose-400 bg-rose-950/40 p-2.5 rounded border border-rose-900/30 font-mono">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Target: http://localhost:8080/api/v1/health</span>
          {lastChecked && (
            <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};
