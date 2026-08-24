import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock,
  BookOpen,
  MessageSquare, 
  Bot, 
  BarChart3, 
  Settings, 
  GraduationCap,
  Sparkles,
  Lock
} from 'lucide-react';

export type AppView = 'dashboard' | 'leads' | 'follow-ups' | 'courses' | 'lead-detail';

interface SidebarProps {
  isOpen: boolean;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  leadsCount?: number;
  followUpsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  currentView, 
  onNavigate,
  leadsCount,
  followUpsCount
}) => {
  const navItems = [
    { 
      id: 'dashboard' as AppView, 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      unlocked: true, 
      phase: 'Phase 3' 
    },
    { 
      id: 'leads' as AppView, 
      label: 'Enquiries & Leads', 
      icon: Users, 
      unlocked: true, 
      count: leadsCount,
      phase: 'Phase 3' 
    },
    { 
      id: 'follow-ups' as AppView, 
      label: 'Follow-ups Engine', 
      icon: Clock, 
      unlocked: true, 
      count: followUpsCount,
      phase: 'Phase 3' 
    },
    { 
      id: 'courses' as AppView, 
      label: 'Course Catalog', 
      icon: BookOpen, 
      unlocked: true, 
      phase: 'Phase 3' 
    },
    { 
      id: 'conversations' as any, 
      label: 'Conversations', 
      icon: MessageSquare, 
      unlocked: false, 
      phase: 'Phase 4' 
    },
    { 
      id: 'ai-qualifier' as any, 
      label: 'AI Qualifier Agent', 
      icon: Bot, 
      unlocked: false, 
      phase: 'Phase 6' 
    },
    { 
      id: 'analytics' as any, 
      label: 'Institute Analytics', 
      icon: BarChart3, 
      unlocked: false, 
      phase: 'Phase 9' 
    },
    { 
      id: 'settings' as any, 
      label: 'System Settings', 
      icon: Settings, 
      unlocked: false, 
      phase: 'Phase 10' 
    },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-800 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 flex flex-col`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
        <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 flex-shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-sm text-slate-100 leading-tight truncate">AI Lead Engine</h1>
          <p className="text-[11px] text-slate-400 truncate">Institute SaaS Portal</p>
        </div>
      </div>

      {/* Target Market Indicator */}
      <div className="mx-4 my-3 p-3 rounded-lg bg-blue-950/40 border border-blue-900/50">
        <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Coaching Workspace</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Indian Coaching & Training Institutes
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
          Lead Conversion Engine
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'leads' && currentView === 'lead-detail');

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.unlocked) {
                  onNavigate(item.id);
                }
              }}
              disabled={!item.unlocked}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : item.unlocked 
                    ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/70 cursor-pointer' 
                    : 'text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>

              {item.unlocked ? (
                typeof item.count === 'number' && item.count > 0 ? (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                ) : null
              ) : (
                <span className="flex items-center space-x-1 text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 flex-shrink-0">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{item.phase}</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Phase Status */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">Phase 3</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 font-medium">
            Core Engine Live
          </span>
        </div>
      </div>
    </aside>
  );
};
