import React from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
};

export default App;
