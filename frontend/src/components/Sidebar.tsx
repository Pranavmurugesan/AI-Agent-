import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen,
  CalendarCheck,
  MessageSquare, 
  Bot, 
  BarChart3, 
  Settings, 
  GraduationCap,
  Sparkles,
  Lock
} from 'lucide-react';

export type AppPage = 'dashboard' | 'leads' | 'lead-detail' | 'courses' | 'follow-ups';

interface SidebarProps {
  isOpen: boolean;
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard' as AppPage, label: 'Dashboard', icon: LayoutDashboard, available: true, phase: 'Phase 1-3' },
    { id: 'leads' as AppPage, label: 'Enquiries & Leads', icon: Users, available: true, phase: 'Phase 3' },
    { id: 'courses' as AppPage, label: 'Courses Catalog', icon: BookOpen, available: true, phase: 'Phase 3' },
    { id: 'follow-ups' as AppPage, label: 'Counselor Tasks', icon: CalendarCheck, available: true, phase: 'Phase 3' },
    { id: 'conversations' as any, label: 'Conversations', icon: MessageSquare, available: false, phase: 'Phase 4' },
    { id: 'ai-qualifier' as any, label: 'AI Qualifier Agent', icon: Bot, available: false, phase: 'Phase 6' },
    { id: 'analytics' as any, label: 'Institute Analytics', icon: BarChart3, available: false, phase: 'Phase 9' },
    { id: 'settings' as any, label: 'System Settings', icon: Settings, available: false, phase: 'Phase 10' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-800 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
        <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-100 leading-tight">AI Lead Conversion</h1>
          <p className="text-[11px] text-slate-400">Coaching Institute SaaS</p>
        </div>
      </div>

      {/* Target Market Indicator */}
      <div className="mx-4 my-4 p-3 rounded-lg bg-blue-950/40 border border-blue-900/50">
        <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Target Market</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Indian Coaching & Training Institutes
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (activePage === 'lead-detail' && item.id === 'leads');
          return (
            <button
              key={item.label}
              disabled={!item.available}
              onClick={() => item.available && onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : item.available
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {!item.available && (
                <span className="flex items-center space-x-1 text-[10px] text-slate-600 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
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
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20 font-medium">
            Lead Engine Active
          </span>
        </div>
      </div>
    </aside>
  );
};
