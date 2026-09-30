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
  const executedWithTat = executedAgreements.filter((a) => a.tatDaysElapsed > 0);
  const avgTatDays =
    executedWithTat.length > 0
      ? Math.round(
          executedWithTat.reduce((acc, curr) => acc + curr.tatDaysElapsed, 0) /
            executedWithTat.length
        )
      : 0;

  // Stages count for agreements
  const stageCounts: { stage: AgreementStage; label: string; count: number }[] = [
    { stage: 'LDRF Received / Drafting', label: 'Drafting / Intake', count: agreements.filter((a) => a.stage === 'LDRF Received / Drafting').length },
    { stage: 'Internal Stakeholder Review', label: 'Internal Review', count: agreements.filter((a) => a.stage === 'Internal Stakeholder Review').length },
    { stage: 'Sent to Counterparty (External Review)', label: 'External Counterparty', count: agreements.filter((a) => a.stage === 'Sent to Counterparty (External Review)').length },
    { stage: 'Reverted to Legal for Finalisation', label: 'Finalisation', count: agreements.filter((a) => a.stage === 'Reverted to Legal for Finalisation').length },
    { stage: 'Executed / Signed', label: 'Executed / Signed', count: executedAgreements.length },
    { stage: 'Active / Pending Renewal', label: 'Active Renewal', count: agreements.filter((a) => a.stage === 'Active / Pending Renewal').length },
  ];

  // Dynamically assemble urgent action queue from real database matters
  const actionQueueItems = React.useMemo(() => {
    interface ActionItem {
      type: 'lod' | 'agreement' | 'property' | 'ip';
      id: string;
      title: string;
      subtitle: string;
      tag: string;
      urgency: 'overdue' | 'warning' | 'normal';
      daysRemaining: number | null;
    }

    const items: ActionItem[] = [];

    // LODs needing urgent action
    lods.forEach((l) => {
      if (l.stage === 'Response Sent - Closed') return;
      const days = getDaysRemaining(l.responseDeadlineDate);
      if (days !== null && days <= 14) {
        items.push({
          type: 'lod',
          id: l.id,
          title: `${l.title} (${l.id})`,
          subtitle: `${l.claimantName} · Claim: ${formatCurrency(l.claimAmount)} · Adverse: ${l.adverseCounsel}`,
          tag:
            days <= 0
              ? `LOD Reply OVERDUE by ${Math.abs(days)} days`
              : `LOD Reply due in ${days} days · ${l.stage}`,
          urgency: days <= 0 ? 'overdue' : 'warning',
          daysRemaining: days,
        });
      }
    });

    // Agreements needing urgent renewal/execution
    agreements.forEach((a) => {
      const days = getDaysRemaining(a.expectedExpiryDate);
      if (days !== null && days <= 30) {
        items.push({
          type: 'agreement',
          id: a.id,
          title: `${a.title} (${a.id})`,
          subtitle: `${a.counterpartyName} · ${a.agreementType} · ${formatCurrency(a.contractValue || 0)}`,
          tag:
            days <= 0
              ? `Contract EXPIRED · Pending Renewal`
              : `Contract Expiring in ${days} days · ${a.stage}`,
          urgency: days <= 0 ? 'overdue' : 'warning',
          daysRemaining: days,
        });
      }
    });

    // Property matters needing action
    properties.forEach((p) => {
      if (p.stage === 'Stamped-Completed') return;
      const days = getDaysRemaining(p.targetCompletionDate);
      if (days !== null && days <= 30) {
        items.push({
          type: 'property',
          id: p.id,
          title: `${p.propertyName} (${p.id})`,
          subtitle: `${p.counterparty} · ${p.transactionType} · Target: ${formatDateDisplay(p.targetCompletionDate)}`,
          tag:
            days <= 0
              ? `Target Date OVERDUE · ${p.stage}`
              : `Target in ${days} days · ${p.stage}`,
          urgency: days <= 0 ? 'overdue' : 'warning',
          daysRemaining: days,
        });
      }
    });

    // IP Trademarks needing renewal
    ips.forEach((i) => {
      const days = getDaysRemaining(i.expiryRenewalDate);
      if (days !== null && days <= 60) {
        items.push({
          type: 'ip',
          id: i.id,
          title: `${i.trademarkName} (${i.id})`,
          subtitle: `${i.jurisdiction} · Reg #${i.registrationNumber} · Class ${i.niceClass}`,
          tag:
            days <= 0
              ? `MyIPO Protection EXPIRED · Renewal Required`
              : `Renewal window in ${days} days · ${i.status}`,
          urgency: days <= 0 ? 'overdue' : 'warning',
          daysRemaining: days,
        });
      }
    });

    // Sort by daysRemaining ascending (most urgent first)
    items.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));

    return items;
  }, [agreements, lods, properties, ips]);

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
              {agreements.length + lods.length + properties.length + ips.length} total active matters under governance across contract lifecycles, disputes, real estate &amp; IP
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
            <span>{lods.filter((l) => l.stage === 'Escalated to Litigation').length} Escalated to Court</span>
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
              {properties.length} Active Sites
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
                <span>View All {agreements.length}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {stageCounts.map(({ stage, label, count }) => {
                const pct = agreements.length > 0 ? Math.round((count / agreements.length) * 100) : 0;
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
              {actionQueueItems.length === 0 ? (
                <div className="p-6 text-center rounded-md bg-emerald-50/60 border border-emerald-200/80">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
                  <p className="text-[12.5px] font-bold text-emerald-950">
                    All Critical Deadlines On-Track
                  </p>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    No overdue matters or urgent statutory reply windows pending immediate action.
                  </p>
                </div>
              ) : (
                actionQueueItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleInspectMatter(item.type, item.id)}
                    className={`p-2.5 rounded-md border flex items-start justify-between gap-3 transition-colors cursor-pointer group ${
                      item.urgency === 'overdue'
                        ? 'bg-rose-50/70 border-rose-200/90 hover:border-rose-300'
                        : 'bg-amber-50/70 border-amber-200/90 hover:border-amber-300'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-[12px] text-slate-900">
                        {item.urgency === 'overdue' ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{item.subtitle}</p>
                      <span
                        className={`inline-block text-[10px] font-mono font-semibold ${
                          item.urgency === 'overdue' ? 'text-rose-700' : 'text-amber-800'
                        }`}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspectMatter(item.type, item.id);
                      }}
                      className={`px-2 py-1 text-[10.5px] font-semibold bg-white border rounded shrink-0 cursor-pointer shadow-2xs ${
                        item.urgency === 'overdue'
                          ? 'text-rose-800 border-rose-300 hover:bg-rose-100 group-hover:border-rose-400'
                          : 'text-amber-800 border-amber-300 hover:bg-amber-100 group-hover:border-amber-400'
                      }`}
                    >
                      Audit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick jump to finance */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              Finance Invoices:{' '}
              <span className="font-mono font-bold text-slate-800">
                {counts.lateFinanceInvoices} Late (&gt;14 days)
              </span>
            </span>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-blue-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Review Invoices &amp; Payments</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
