import React, { useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AppPage } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { FollowUpsPage } from './pages/FollowUpsPage';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<AppPage>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setActivePage('lead-detail');
  };

  const handleBackToLeads = () => {
    setSelectedLeadId(null);
    setActivePage('leads');
  };

  return (
    <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && (
        <DashboardPage
          onNavigateLeads={() => setActivePage('leads')}
          onNavigateFollowUps={() => setActivePage('follow-ups')}
        />
      )}
      {activePage === 'leads' && (
        <LeadsPage onSelectLead={handleSelectLead} />
      )}
      {activePage === 'lead-detail' && selectedLeadId && (
        <LeadDetailPage leadId={selectedLeadId} onBack={handleBackToLeads} />
      )}
      {activePage === 'courses' && (
        <CoursesPage />
      )}
      {activePage === 'follow-ups' && (
        <FollowUpsPage />
      )}
    </DashboardLayout>
  );
};

export default App;
