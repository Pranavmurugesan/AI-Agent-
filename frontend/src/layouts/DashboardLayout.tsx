import React, { useState } from 'react';
import { Sidebar, AppView } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenQuickLead?: () => void;
  onOpenAuthModal?: () => void;
  leadsCount?: number;
  followUpsCount?: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  currentView,
  onNavigate,
  onOpenQuickLead,
  onOpenAuthModal,
  leadsCount,
  followUpsCount
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        currentView={currentView}
        onNavigate={(view) => {
          onNavigate(view);
          setSidebarOpen(false);
        }}
        leadsCount={leadsCount}
        followUpsCount={followUpsCount}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onOpenQuickLead={onOpenQuickLead}
          onOpenAuthModal={onOpenAuthModal}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
