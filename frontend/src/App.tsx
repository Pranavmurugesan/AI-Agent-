import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AppPage } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { apiService } from './services/api';
import { User, Organization } from './types/api';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<AppPage>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [authKey, setAuthKey] = useState<number>(0);

  const fetchSession = async () => {
    try {
      const [user, org] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getCurrentOrganization(),
      ]);
      setCurrentUser(user);
      setCurrentOrg(org);
    } catch {
      setCurrentUser(null);
      setCurrentOrg(null);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [authKey]);

  const handleAuthChange = () => {
    setAuthKey((prev) => prev + 1);
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setActivePage('lead-detail');
  };

  const handleBackToLeads = () => {
    setSelectedLeadId(null);
    setActivePage('leads');
  };

  return (
    <DashboardLayout 
      activePage={activePage} 
      onNavigate={setActivePage}
      currentUser={currentUser}
      currentOrg={currentOrg}
      onAuthChange={handleAuthChange}
    >
      {activePage === 'dashboard' && (
        <DashboardPage
          key={`dashboard-${authKey}`}
          onNavigateLeads={() => setActivePage('leads')}
          onNavigateFollowUps={() => setActivePage('follow-ups')}
        />
      )}
      {activePage === 'leads' && (
        <LeadsPage 
          key={`leads-${authKey}`}
          onSelectLead={handleSelectLead} 
          currentUser={currentUser}
        />
      )}
      {activePage === 'lead-detail' && selectedLeadId && (
        <LeadDetailPage 
          key={`lead-detail-${selectedLeadId}-${authKey}`}
          leadId={selectedLeadId} 
          onBack={handleBackToLeads} 
          currentUser={currentUser}
        />
      )}
      {activePage === 'courses' && (
        <CoursesPage 
          key={`courses-${authKey}`}
          currentUser={currentUser}
        />
      )}
      {activePage === 'follow-ups' && (
        <FollowUpsPage 
          key={`follow-ups-${authKey}`}
          currentUser={currentUser}
        />
      )}
    </DashboardLayout>
  );
};

export default App;
