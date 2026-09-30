import React from 'react';
import { useLegal } from '../context/LegalContext';
import {
  FileText,
  CreditCard,
  Building,
  ShieldCheck,
  Settings,
  BookOpen,
  PlusCircle,
  LayoutGrid,
  FileCheck2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  Scale,
  Building2,
  BookmarkCheck,
} from 'lucide-react';
import { ActiveTab } from '../types/legal';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    counts,
    setIsQuickLdrfOpen,
    setIsDocumentationOpen,
    setActiveFilter,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useLegal();

  const handlePaymentClick = () => {
    setActiveTab('payments');
  };

  const handleComplianceClick = () => {
    setActiveTab('compliance');
  };

  const handleExternalCounselClick = () => {
    setActiveTab('counsel');
  };

  // If collapsed: render sleek icon-only strip with unhide button
  if (isSidebarCollapsed) {
    return (
      <aside className="w-13 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 select-none h-full py-3 items-center transition-all animate-fadeIn">
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Unhide / Expand Button */}
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            title="Expand Sidebar (Unhide)"
            className="w-8 h-8 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-slate-200 my-1" />

          {/* Quick LDRF Submit Icon */}
          <button
            onClick={() => setIsQuickLdrfOpen(true)}
            title="Quick LDRF Submit"
            className="w-8 h-8 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
          </button>

          {/* Icon Nav Items */}
          <button
            onClick={() => {
              setActiveTab('overview');
              setActiveFilter('all');
            }}
            title="Matter Overview"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveTab('agreements');
              setActiveFilter('all');
            }}
            title={`Agreements & LDRF (${counts.agreements})`}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer relative ${
              activeTab === 'agreements'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={handlePaymentClick}
            title="External Legal Fees & Payment Tracker"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
          </button>

          {/* Compliance Audits */}
          <button
            onClick={handleComplianceClick}
            title="Compliance & Statutory Audits"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* External Counsel */}
          <button
            onClick={handleExternalCounselClick}
            title="External Counsel & Law Firms"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'counsel'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setIsDocumentationOpen(true)}
            title="PRD Documentation"
            className="w-8 h-8 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // Expanded Sidebar (w-60)
  return (
    <aside className="w-60 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 select-none h-full transition-all">
      {/* Top Section */}
      <div className="p-3 space-y-3">
        {/* Header Widget with Hide Toggle Button */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
              <FileCheck2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">
                Legal Operations
              </h2>
              <p className="text-[10.5px] text-slate-400 font-mono">
                Matter Portfolio v4.2
              </p>
            </div>
          </div>

          {/* Hide Sidebar Button (Requirement 5) */}
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            title="Hide Sidebar"
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Quick LDRF Submit Button */}
        <button
          onClick={() => setIsQuickLdrfOpen(true)}
          className="w-full h-8 px-3 rounded-md bg-[#eff4ff] hover:bg-[#e5eeff] text-blue-700 font-medium text-[12px] flex items-center justify-center gap-1.5 border border-blue-200 transition-colors shadow-2xs cursor-pointer group"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600 group-hover:scale-105 transition-transform" />
          <span>Quick LDRF Submit</span>
        </button>

        {/* Primary Navigation List */}
        <nav className="space-y-0.5 pt-1">
          {/* Matter Overview */}
          <button
            onClick={() => {
              setActiveTab('overview');
              setActiveFilter('all');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12px] transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span>Matter Overview</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              Command
            </span>
          </button>

          {/* Agreements & LDRF */}
          <button
            onClick={() => {
              setActiveTab('agreements');
              setActiveFilter('all');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12px] transition-colors cursor-pointer ${
              activeTab === 'agreements'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Agreements &amp; LDRF</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${
                activeTab === 'agreements'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts.agreements}
            </span>
          </button>

          {/* Payments Tracker */}
          <button
            onClick={handlePaymentClick}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12px] transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>Payment</span>
            </div>
            {counts.lateFinanceInvoices > 0 ? (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 tabular-nums font-medium">
                {counts.lateFinanceInvoices} late &bull; RM {Math.round(counts.lateFinanceAmountMYR / 1000)}k
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                All Current
              </span>
            )}
          </button>

          {/* Compliance Audits (Requirement 5) */}
          <button
            onClick={handleComplianceClick}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12px] transition-colors cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Compliance Audits</span>
            </div>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
              Q4 Open
            </span>
          </button>

          {/* External Counsel (Requirement 5) */}
          <button
            onClick={handleExternalCounselClick}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12px] transition-colors cursor-pointer ${
              activeTab === 'counsel'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500" />
              <span>External Counsel</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {counts.externalLawFirms} firms
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Section: Documentation & Info */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={() => setIsDocumentationOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>Documentation (PRD v1.3)</span>
        </button>

        <div className="pt-1.5 px-2 text-[10px] font-mono text-slate-400">
          LegalOps Counsel OS &bull; Live v4.2
        </div>
      </div>
    </aside>
  );
};
