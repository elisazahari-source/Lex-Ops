import React, { useState } from 'react';
import { LegalProvider, useLegal } from './context/LegalContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { SubTabBar } from './components/SubTabBar';
import { AgreementsTable } from './components/AgreementsTable';
import { LodTrackerTable } from './components/LodTrackerTable';
import { PropertyMattersTable } from './components/PropertyMattersTable';
import { IpTrademarksTable } from './components/IpTrademarksTable';
import { PaymentTrackerTable } from './components/PaymentTrackerTable';
import { ComplianceAuditsView } from './components/ComplianceAuditsView';
import { ExternalCounselView } from './components/ExternalCounselView';
import { MatterOverview } from './components/MatterOverview';
import { MatterInspectionDrawer } from './components/MatterInspectionDrawer';
import { NewIntakeModal } from './components/NewIntakeModal';
import { QuickLdrfModal } from './components/QuickLdrfModal';
import { DocumentationModal } from './components/DocumentationModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { PanelRightOpen, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    isInspectionDrawerOpen,
    setIsInspectionDrawerOpen,
    selectedMatter,
    setSelectedMatter,
    isGoogleDriveOpen,
    setIsGoogleDriveOpen,
  } = useLegal();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f8f9ff] flex flex-col font-sans text-[#0b1c30]">
      {/* Top Header Navigation */}
      <Header />

      {/* Main Work Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Central Content Canvas */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto p-3.5 lg:p-4.5 flex flex-col">
          {/* Top 2 Alert Metric Cards */}
          <MetricCards />

          {/* Sub Navigation Bar */}
          <SubTabBar />

          {/* Active Tab View */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && <MatterOverview />}
            {activeTab === 'agreements' && <AgreementsTable />}
            {activeTab === 'lods' && <LodTrackerTable />}
            {activeTab === 'property' && <PropertyMattersTable />}
            {activeTab === 'ip' && <IpTrademarksTable />}
            {activeTab === 'payments' && <PaymentTrackerTable />}
            {activeTab === 'compliance' && <ComplianceAuditsView />}
            {activeTab === 'counsel' && <ExternalCounselView />}
          </div>

          {/* Floating Drawer Re-open Tab if drawer is closed */}
          {!isInspectionDrawerOpen && selectedMatter && (
            <div
              className="fixed right-4 bottom-4 z-20 flex items-center bg-[#0b1c30] text-white rounded-full shadow-lg border border-slate-700/60 overflow-hidden text-[12px] font-medium transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <button
                onClick={() => setIsInspectionDrawerOpen(true)}
                title={`Click to re-open detailed inspection & audit drawer for ${selectedMatter.id}`}
                className="flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <PanelRightOpen className="w-4 h-4 text-amber-400" />
                <span>
                  Reopen Details:{' '}
                  <span className="font-mono font-semibold text-amber-300">
                    {selectedMatter.id}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setSelectedMatter(null)}
                title="Dismiss quick-access button"
                className="px-2 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer border-l border-slate-700/80"
                aria-label="Dismiss quick access button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </main>

        {/* Right Matter Inspection & Audit Drawer */}
        <MatterInspectionDrawer />
      </div>

      {/* Modals */}
      <NewIntakeModal />
      <QuickLdrfModal />
      <DocumentationModal />
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LegalProvider>
      <MainLayout />
    </LegalProvider>
  );
}
