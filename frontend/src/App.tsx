import React, { useState } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { CoursesPage } from './pages/CoursesPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { AuthModal } from './components/auth/AuthModal';
import { LeadModal } from './components/leads/LeadModal';
import { AppView } from './components/Sidebar';
import { apiService } from './services/api';
import { Course, CounselorOption, CreateLeadRequest } from './types/leads';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Global modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuickLeadModalOpen, setIsQuickLeadModalOpen] = useState(false);

  // Cached meta for quick lead modal
  const [courses, setCourses] = useState<Course[]>([]);
  const [counselors, setCounselors] = useState<CounselorOption[]>([]);

  const handleOpenQuickLead = async () => {
    try {
      const [cList, coList] = await Promise.all([
        apiService.getCourses(),
        apiService.getCounselors(),
      ]);
      setCourses(cList);
      setCounselors(coList);
    } catch {
      // Fallback in service
    }
    setIsQuickLeadModalOpen(true);
  };

  const handleQuickLeadSubmit = async (data: CreateLeadRequest) => {
    await apiService.createLead(data);
    setIsQuickLeadModalOpen(false);
    // Navigate to leads view to see new lead
    setCurrentView('leads');
  };

  const handleSelectLeadFromAnywhere = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentView('leads');
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'leads') {
      setSelectedLeadId(null);
    }
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Initializing Institute Session...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={handleNavigate}
      onOpenQuickLead={handleOpenQuickLead}
      onOpenAuthModal={() => setIsAuthModalOpen(true)}
    >
      {/* Route Views */}
      {currentView === 'dashboard' && (
        <DashboardPage
          onNavigate={handleNavigate}
          onSelectLead={handleSelectLeadFromAnywhere}
          onOpenQuickLead={handleOpenQuickLead}
        />
      )}

      {currentView === 'leads' && (
        <LeadsPage
          selectedLeadId={selectedLeadId}
          onSelectLeadId={setSelectedLeadId}
        />
      )}

      {currentView === 'follow-ups' && (
        <FollowUpsPage onSelectLead={handleSelectLeadFromAnywhere} />
      )}

      {currentView === 'courses' && (
        <CoursesPage />
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen || (!isAuthenticated && false)}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <LeadModal
        isOpen={isQuickLeadModalOpen}
        courses={courses}
        counselors={counselors}
        onClose={() => setIsQuickLeadModalOpen(false)}
        onSubmit={handleQuickLeadSubmit as any}
      />
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
