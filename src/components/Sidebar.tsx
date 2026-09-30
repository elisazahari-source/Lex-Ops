import React from 'react';
import { useLegal } from '../context/LegalContext';
import {
  FileText,
  CreditCard,
  Building,
  ShieldCheck,
  BookOpen,
  PlusCircle,
  LayoutGrid,
  FileCheck2,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Building2,
  BookmarkCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsQuickLdrfOpen,
    setIsDocumentationOpen,
    setActiveFilter,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useLegal();

  // If collapsed: render sleek icon-only strip with unhide button
  if (isSidebarCollapsed) {
    return (
      <aside className="w-13 border-r border-slate-300 bg-[#e4e7eb] flex flex-col justify-between shrink-0 select-none h-full py-3 items-center transition-all animate-fadeIn">
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Unhide / Expand Button */}
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            title="Expand Sidebar"
            className="w-8 h-8 rounded-md bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-slate-300 my-0.5" />

          {/* Quick LDRF Submit Icon */}
          <button
            onClick={() => setIsQuickLdrfOpen(true)}
            title="Quick LDRF Submit"
            className="w-8 h-8 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
          </button>

          {/* Icon Nav Items (No count badges) */}
          <button
            onClick={() => {
              setActiveTab('overview');
              setActiveFilter('all');
            }}
            title="Matter Overview"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveTab('agreements');
              setActiveFilter('all');
            }}
            title="Agreements & LDRF"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'agreements'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveTab('lods');
              setActiveFilter('all');
            }}
            title="Dispute & LOD"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'lods'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveTab('property');
              setActiveFilter('all');
            }}
            title="Property Leases"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'property'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveTab('ip');
              setActiveFilter('all');
            }}
            title="IP & Trademarks"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'ip'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-slate-300 my-0.5" />

          <button
            onClick={() => setActiveTab('payments')}
            title="Payment Tracker"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            title="Compliance Audits"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('counsel')}
            title="External Counsel"
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'counsel'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-300'
                : 'text-slate-700 hover:bg-slate-300/60'
            }`}
          >
            <Building className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setIsDocumentationOpen(true)}
            title="Documentation"
            className="w-8 h-8 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-300/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // Expanded Sidebar (w-60)
  return (
    <aside className="w-60 border-r border-slate-300 bg-[#e4e7eb] flex flex-col justify-between shrink-0 select-none h-full transition-all">
      {/* Top Section */}
      <div className="p-3 space-y-3">
        {/* Header Widget with Hide Toggle Button */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <FileCheck2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="leading-tight">
              <h2 className="text-[13px] font-bold text-slate-900 tracking-tight">
                Legal Operations
              </h2>
              <p className="text-[10.5px] text-slate-500 font-mono">
                Matter Portfolio v4.2
              </p>
            </div>
          </div>

          {/* Hide Sidebar Button */}
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            title="Hide Sidebar"
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-300/60 transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Quick LDRF Submit Button */}
        <button
          onClick={() => setIsQuickLdrfOpen(true)}
          className="w-full h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer group"
        >
          <PlusCircle className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
          <span>Quick LDRF Submit</span>
        </button>

        {/* Primary Navigation List (Main wordings only, no command or count badges) */}
        <nav className="space-y-1 pt-1">
          {/* Matter Overview */}
          <button
            onClick={() => {
              setActiveTab('overview');
              setActiveFilter('all');
            }}
            className={`w-full flex items-center px-2.5 py-2 rounded-md text-[12.5px] transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-300/80'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-slate-600" />
              <span>Matter Overview</span>
            </div>
          </button>

          {/* Agreements & LDRF */}
          <button
            onClick={() => {
              setActiveTab('agreements');
              setActiveFilter('all');
            }}
            className={`w-full flex items-center px-2.5 py-2 rounded-md text-[12.5px] transition-colors cursor-pointer ${
              activeTab === 'agreements'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-300/80'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Agreements &amp; LDRF</span>
            </div>
          </button>

          {/* Dispute & LOD Tracker */}
          <button
            onClick={() => {
              setActiveTab('lods');
              setActiveFilter('all');
            }}
            className={`w-full flex items-center px-2.5 py-2 rounded-md text-[12.5px] transition-colors cursor-pointer ${
              activeTab === 'lods'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-300/80'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-slate-600" />
              <span>Dispute / LOD</span>
            </div>
          </button>

          {/* Property Conveyancing & Leases */}
          <button
            onClick={() => {
              setActiveTab('property');
              setActiveFilter('all');
            }}
            className={`w-full flex items-center px-2.5 py-2 rounded-md text-[12.5px] transition-colors cursor-pointer ${
              activeTab === 'property'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-300/80'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Property Leases</span>
            </div>
          </button>

          {/* Intellectual Property & Trademarks */}
          <button
            onClick={() => {
              setActiveTab('ip');
              setActiveFilter('all');
            }}
            className={`w-full flex items-center px-2.5 py-2 rounded-md text-[12.5px] transition-colors cursor-pointer ${
              activeTab === 'ip'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-300/80'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookmarkCheck className="w-4 h-4 text-slate-600" />
              <span>IP &amp; Trademarks</span>
            </div>
          </button>

          {/* Divider */}
          <div className="pt-2 pb-1">
            <div className="h-px bg-slate-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-2.5 pt-2 pb-0.5">
              Operations &amp; Finance
            </span>
          </div>

          {/* Finance Payment Tracker */}
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center px-2.5 py-2 rounded-md text-[12.5px] transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-300/80'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4 text-slate-600" />
              <span>Payment</span>
            </div>
          </button>

          {/* Compliance Audits */}
          <button
            onClick={() => setActiveTab('compliance')}
            className={`w-full flex items-center px-2.5 py-2 rounded-md text-[12.5px] transition-colors cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-300/80'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Compliance Audits</span>
            </div>
          </button>

          {/* External Counsel */}
          <button
            onClick={() => setActiveTab('counsel')}
            className={`w-full flex items-center px-2.5 py-2 rounded-md text-[12.5px] transition-colors cursor-pointer ${
              activeTab === 'counsel'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs border border-slate-300/80'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-slate-600" />
              <span>External Counsel</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Bottom Section: Documentation & Info */}
      <div className="p-3 border-t border-slate-300 space-y-1">
        <button
          onClick={() => setIsDocumentationOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-slate-700 hover:text-slate-900 hover:bg-slate-300/60 rounded-md transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-slate-500" />
          <span>System Documentation</span>
        </button>

        <div className="pt-1.5 px-2 text-[10px] font-mono text-slate-500">
          LegalOps Counsel OS &bull; Live v4.2
        </div>
      </div>
    </aside>
  );
};
