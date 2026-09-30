import React from 'react';
import { useLegal } from '../context/LegalContext';
import {
  Scale,
  FileText,
  Building2,
  BookmarkCheck,
  CreditCard,
  Clock,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Building,
  Calendar,
} from 'lucide-react';
import { formatCurrency, formatDateDisplay, getDaysRemaining } from '../utils/dateUtils';
import { AgreementStage } from '../types/legal';

export const MatterOverview: React.FC = () => {
  const {
    agreements,
    lods,
    properties,
    ips,
    counts,
    setActiveTab,
    setActiveFilter,
    setSelectedMatter,
    setIsInspectionDrawerOpen,
    setIsNewIntakeModalOpen,
    setNewIntakeDefaultType,
  } = useLegal();

  // Financial Exposure calculation across active LODs
  const totalLODClaimExposure = lods
    .filter((l) => l.stage !== 'Response Sent - Closed')
    .reduce((acc, curr) => acc + curr.claimAmount, 0);

  // Turnaround Time (TAT) average for agreements
  const executedAgreements = agreements.filter((a) => a.stage === 'Executed / Signed');
  const avgTatDays =
    executedAgreements.length > 0
      ? Math.round(
          executedAgreements.reduce((acc, curr) => acc + curr.tatDaysElapsed, 0) /
            executedAgreements.length
        )
      : 28;

  // Stages count for agreements
  const stageCounts: { stage: AgreementStage; label: string; count: number }[] = [
    { stage: 'LDRF Received / Drafting', label: 'Drafting / Intake', count: agreements.filter((a) => a.stage === 'LDRF Received / Drafting').length },
    { stage: 'Internal Stakeholder Review', label: 'Internal Review', count: agreements.filter((a) => a.stage === 'Internal Stakeholder Review').length },
    { stage: 'Sent to Counterparty (External Review)', label: 'External Counterparty', count: agreements.filter((a) => a.stage === 'Sent to Counterparty (External Review)').length },
    { stage: 'Reverted to Legal for Finalisation', label: 'Finalisation', count: agreements.filter((a) => a.stage === 'Reverted to Legal for Finalisation').length },
    { stage: 'Executed / Signed', label: 'Executed / Signed', count: executedAgreements.length },
    { stage: 'Active / Pending Renewal', label: 'Active Renewal', count: agreements.filter((a) => a.stage === 'Active / Pending Renewal').length },
  ];

  const handleInspectMatter = (type: 'agreement' | 'lod' | 'property' | 'ip', id: string) => {
    setSelectedMatter({ type, id });
    setIsInspectionDrawerOpen(true);
  };

  const handleOpenIntake = (type: 'agreement' | 'lod' | 'property' | 'ip') => {
    setNewIntakeDefaultType(type);
    setIsNewIntakeModalOpen(true);
  };

  return (
    <div className="space-y-3.5">
      {/* Executive Command Header Strip */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0b1c30] text-white flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[13.5px] font-bold text-slate-900 tracking-tight">
                Matter Operations Command Overview
              </h2>
              <span className="px-2 py-0.2 rounded text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Portfolio SLA Monitored
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500">
              33 total active matters under governance across contract lifecycles, disputes, real estate & IP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenIntake('agreement')}
            className="px-2.5 py-1 text-[11.5px] font-medium text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded transition-colors cursor-pointer"
          >
            + LDRF
          </button>
          <button
            onClick={() => handleOpenIntake('lod')}
            className="px-2.5 py-1 text-[11.5px] font-medium text-slate-700 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded transition-colors cursor-pointer"
          >
            + LOD
          </button>
          <button
            onClick={() => handleOpenIntake('property')}
            className="px-2.5 py-1 text-[11.5px] font-medium text-slate-700 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded transition-colors cursor-pointer"
          >
            + Property
          </button>
          <button
            onClick={() => handleOpenIntake('ip')}
            className="px-2.5 py-1 text-[11.5px] font-medium text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded transition-colors cursor-pointer"
          >
            + IP Filing
          </button>
        </div>
      </div>

      {/* 4 Category Metric Cards (Compact & Clickable) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Agreements */}
        <div
          onClick={() => setActiveTab('agreements')}
          className="p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Agreements & LDRF
            </span>
            <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {counts.agreements}
            </span>
            <span className="text-[10.5px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              Avg TAT: {avgTatDays}d
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{executedAgreements.length} Executed</span>
            <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5 text-[11px]">
              Open <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* LOD Disputes */}
        <div
          onClick={() => setActiveTab('lods')}
          className="p-3 rounded-lg bg-white border border-slate-200 hover:border-rose-300 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              LOD Dispute Exposure
            </span>
            <Scale className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {counts.lods}
            </span>
            <span className="text-[10.5px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 font-bold">
              {formatCurrency(totalLODClaimExposure)}
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>1 Escalated to Court</span>
            <span className="text-rose-600 font-semibold group-hover:underline flex items-center gap-0.5 text-[11px]">
              Tracker <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Property Matters */}
        <div
          onClick={() => setActiveTab('property')}
          className="p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Real Estate & Facilities
            </span>
            <Building2 className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {counts.properties}
            </span>
            <span className="text-[10.5px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
              8 Active Sites
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>HQ & Regional Bureaus</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-0.5 text-[11px]">
              Open <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Intellectual Property */}
        <div
          onClick={() => setActiveTab('ip')}
          className="p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Intellectual Property
            </span>
            <BookmarkCheck className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {counts.ips}
            </span>
            <span className="text-[10.5px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
              Trademarks & Patents
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>MyIPO / WIPO Portfolios</span>
            <span className="text-teal-600 font-semibold group-hover:underline flex items-center gap-0.5 text-[11px]">
              Open <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Analytics & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column: 6-Stage Agreement Lifecycle Funnel (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
              <div>
                <h3 className="text-[12.5px] font-bold text-slate-900">
                  Agreement Lifecycle Progression
                </h3>
                <p className="text-[11px] text-slate-500">
                  Turnaround Time (TAT) auto-tracked from intake
                </p>
              </div>
              <button
                onClick={() => setActiveTab('agreements')}
                className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>View All 18</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {stageCounts.map(({ stage, label, count }) => {
                const pct = Math.round((count / agreements.length) * 100);
                return (
                  <div
                    key={stage}
                    onClick={() => setActiveTab('agreements')}
                    className="p-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer group space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="text-slate-700 font-medium group-hover:text-blue-700">
                        {label}
                      </span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums text-[11px]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          label === 'Executed / Signed'
                            ? 'bg-emerald-500'
                            : label === 'Active Renewal'
                            ? 'bg-blue-600'
                            : label === 'Drafting / Intake'
                            ? 'bg-indigo-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TAT Performance Callout */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50/70 p-2 rounded">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>SLA Target: &lt;30 days</span>
            </div>
            <span className="font-mono font-bold text-emerald-700">
              Current Avg: {avgTatDays} days (On Track)
            </span>
          </div>
        </div>

        {/* Right Column: High-Stakes Action Items & SLA Breaches (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
              <div>
                <h3 className="text-[12.5px] font-bold text-slate-900">
                  Critical Counsel Action Queue
                </h3>
                <p className="text-[11px] text-slate-500">
                  Statutory reply deadlines, litigation appearances & overdue invoices
                </p>
              </div>
              <span className="text-[10px] font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Action Required
              </span>
            </div>

            <div className="space-y-2">
              {/* Item 1: High Court KL Suit */}
              <div
                onClick={() => handleInspectMatter('lod', 'LOD-2024-009')}
                className="p-2.5 rounded-md bg-rose-50/60 border border-rose-200/90 hover:border-rose-300 flex items-start justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-[12px] text-rose-950">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">High Court KL Suit WA-22NCC-482-11/2024</span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">
                    Apex Distribution (Claim: RM 340,000) · Adverse: Messrs. Halim Hong & Koh
                  </p>
                  <span className="inline-block text-[10px] text-rose-700 font-mono font-semibold">
                    Memorandum of Appearance due in 1 day · Retainer fee RM 45,000 submitted
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectMatter('lod', 'LOD-2024-009');
                  }}
                  className="px-2 py-1 text-[10.5px] font-semibold text-rose-800 bg-white border border-rose-300 rounded hover:bg-rose-100 shrink-0 cursor-pointer shadow-2xs group-hover:border-rose-400"
                >
                  Audit
                </button>
              </div>

              {/* Item 2: Oracle Software Audit Deficit */}
              <div
                onClick={() => handleInspectMatter('lod', 'LOD-2024-012')}
                className="p-2.5 rounded-md bg-amber-50/60 border border-amber-200/90 hover:border-amber-300 flex items-start justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-[12px] text-amber-950">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Oracle Software Licensing Deficit (LOD-2024-012)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">
                    Claim: RM 1,120,000 · Baker McKenzie · 5 days remaining for formal reply
                  </p>
                  <span className="inline-block text-[10px] text-amber-800 font-mono font-semibold">
                    Stage 3: Fact-Finding with CTO in progress (vCenter Core Pinning audit)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectMatter('lod', 'LOD-2024-012');
                  }}
                  className="px-2 py-1 text-[10.5px] font-semibold text-amber-800 bg-white border border-amber-300 rounded hover:bg-amber-100 shrink-0 cursor-pointer shadow-2xs group-hover:border-amber-400"
                >
                  Audit
                </button>
              </div>

              {/* Item 3: Sri Pentas Head-Lease Renewal */}
              <div
                onClick={() => handleInspectMatter('property', 'PROP-2024-001')}
                className="p-2.5 rounded-md bg-blue-50/60 border border-blue-200/90 hover:border-blue-300 flex items-start justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-[12px] text-blue-950">
                    <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Sri Pentas Bandar Utama Broadcast Complex Lease</span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">
                    Bandar Utama City Centre · Target completion 25 Nov 2024 (14 days remaining)
                  </p>
                  <span className="inline-block text-[10px] text-blue-800 font-mono font-semibold">
                    SPA-Tenancy Signed · Stamping in progress with LHDN · Legal fee RM 38,000
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectMatter('property', 'PROP-2024-001');
                  }}
                  className="px-2 py-1 text-[10.5px] font-semibold text-blue-800 bg-white border border-blue-300 rounded hover:bg-blue-100 shrink-0 cursor-pointer shadow-2xs group-hover:border-blue-400"
                >
                  Audit
                </button>
              </div>
            </div>
          </div>

          {/* Quick jump to finance */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              Finance Invoices: <span className="font-mono font-bold text-slate-800">2 Late (&gt;14 days)</span>
            </span>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-blue-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Review Invoices & Payments</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
