import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ContractsView } from './components/ContractsView';
import { ChangeRequestsView } from './components/ChangeRequestsView';
import { DelayAttributionView } from './components/DelayAttributionView';
import { AuditTrailView } from './components/AuditTrailView';
import { ReportsExportModal } from './components/ReportsExportModal';
import { NewChangeRequestModal } from './components/NewChangeRequestModal';
import { SupabaseModal } from './components/SupabaseModal';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showNewCrModal, setShowNewCrModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenExport={() => setShowExportModal(true)}
        onOpenSupabase={() => setShowSupabaseModal(true)}
      />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenNewCr={() => setShowNewCrModal(true)}
            onOpenExport={() => setShowExportModal(true)}
          />
        )}
        {activeTab === 'contracts' && <ContractsView />}
        {activeTab === 'changeRequests' && (
          <ChangeRequestsView onOpenNewCr={() => setShowNewCrModal(true)} />
        )}
        {activeTab === 'delayAttribution' && <DelayAttributionView />}
        {activeTab === 'audit' && <AuditTrailView />}
      </main>

      {/* Global Modals */}
      {showExportModal && <ReportsExportModal onClose={() => setShowExportModal(false)} />}
      {showNewCrModal && <NewChangeRequestModal onClose={() => setShowNewCrModal(false)} />}
      {showSupabaseModal && <SupabaseModal onClose={() => setShowSupabaseModal(false)} />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
