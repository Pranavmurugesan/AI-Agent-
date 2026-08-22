import React from 'react';
import { LucideIcon, Lock } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  phaseTag: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  phaseTag,
}) => {
  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <span className="flex items-center space-x-1 text-[10px] text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
          <Lock className="w-2.5 h-2.5" />
          <span>{phaseTag}</span>
        </span>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-100 font-mono">{value}</span>
        <div className="p-2 bg-slate-900 rounded-lg text-slate-500 group-hover:text-blue-400 transition-colors border border-slate-800">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
};
