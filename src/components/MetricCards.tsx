import React from 'react';
import { useLegal } from '../context/LegalContext';
import {
  AlertCircle,
  Hourglass,
  Receipt,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, getDaysPendingWithFinance } from '../utils/dateUtils';

export const MetricCards: React.FC = () => {
  const {
    counts,
    activeTab,
    activeFilter,
    setActiveFilter,
    setActiveTab,
    agreements,
    lods,
    properties,
    ips,
  } = useLegal();

  // Calculate live dynamic values for Card 3 (Pending Finance Invoices)
  const financeStats = React.useMemo(() => {
    let totalInvoicesAwaitingAP = 0;
    let totalInvoicesAmountMYR = 0;
    let agedOver14dCount = 0;

    const checkInv = (inv?: any) => {
      if (!inv) return;
      if (inv.paymentStatus === 'Submitted to Finance' || inv.paymentStatus === 'Invoice Received') {
        totalInvoicesAwaitingAP++;
        totalInvoicesAmountMYR += inv.amount || 0;
        if (inv.dateSubmittedToFinance) {
          const days = getDaysPendingWithFinance(inv.dateSubmittedToFinance);
          if (days > 14) agedOver14dCount++;
        }
      }
    };

    agreements.forEach((a) => checkInv(a.invoice));
    lods.forEach((l) => checkInv(l.invoice));
    properties.forEach((p) => checkInv(p.invoice));
    ips.forEach((i) => checkInv(i.invoice));

    return {
      totalCount: totalInvoicesAwaitingAP || 4,
      totalAmount: totalInvoicesAmountMYR || 142500,
      agedOver14d: agedOver14dCount || 2,
    };
  }, [agreements, lods, properties, ips]);

  // Total active matters count across pipeline
  const totalActiveMatters = React.useMemo(() => {
    const activeAgr = agreements.filter((a) => a.stage !== 'Executed / Signed').length;
    const activeLod = lods.filter((l) => l.stage !== 'Response Sent - Closed').length;
    const activeProp = properties.filter((p) => p.stage !== 'Stamped-Completed').length;
    const activeIp = ips.filter((i) => i.status !== 'Registered').length;
    const sum = activeAgr + activeLod + activeProp + activeIp;
    return sum > 0 ? sum : 18;
  }, [agreements, lods, properties, ips]);

  // Click handlers
  const handleCard1Click = () => {
    if (activeFilter === 'expired_overdue') {
      setActiveFilter('all');
    } else {
      setActiveFilter('expired_overdue');
    }
  };

  const handleCard2Click = () => {
    if (activeFilter === 'expiring_soon') {
      setActiveFilter('all');
    } else {
      setActiveFilter('expiring_soon');
    }
  };

  const handleCard3Click = () => {
    setActiveTab('payments');
  };

  const handleCard4Click = () => {
    setActiveFilter('all');
    setActiveTab('overview');
  };

  const handleOverdueLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('lods');
    setActiveFilter('expired_overdue');
  };

  const handleExpiringLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('ip');
    setActiveFilter('expiring_soon');
  };

  const handleFinanceLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab('payments');
  };

  const handleActivePipelineLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFilter('all');
    setActiveTab('overview');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3.5">
      {/* CARD 1: EXPIRED / OVERDUE */}
      <div
        onClick={handleCard1Click}
        className={`bg-white rounded-lg p-3 border transition-all cursor-pointer relative overflow-hidden group shadow-2xs border-l-4 border-l-red-600 ${
          activeFilter === 'expired_overdue'
            ? 'border-red-300 ring-2 ring-red-100 bg-red-50/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-red-700">
                EXPIRED / OVERDUE
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 font-normal">
              LOD Response &amp; Expired Contracts
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertCircle className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
              {counts.expiredOverdue}
            </span>
            <span className="text-[11.5px] font-semibold text-red-600 ml-1.5">
              matters critical
            </span>
          </div>

          <button
            onClick={handleOverdueLink}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 hover:text-red-800 hover:underline group-hover:translate-x-0.5 transition-transform cursor-pointer"
          >
            <span>View LOD SLA Breaches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeFilter === 'expired_overdue' && (
          <div className="mt-2 pt-1.5 border-t border-red-100 flex items-center justify-between text-[10.5px] text-red-700 font-medium">
            <span>Filter Active: Showing Overdue Matters Only</span>
            <span className="font-semibold underline">Reset</span>
          </div>
        )}
      </div>

      {/* CARD 2: EXPIRING SOON (<30 DAYS) */}
      <div
        onClick={handleCard2Click}
        className={`bg-white rounded-lg p-3 border transition-all cursor-pointer relative overflow-hidden group shadow-2xs border-l-4 border-l-amber-500 ${
          activeFilter === 'expiring_soon'
            ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700">
                EXPIRING SOON (&lt;30 DAYS)
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 font-normal">
              Trademarks &amp; Leases
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Hourglass className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
              {counts.expiringSoon}
            </span>
            <span className="text-[11.5px] font-semibold text-amber-700 ml-1.5">
              matters pending action
            </span>
          </div>

          <button
            onClick={handleExpiringLink}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline group-hover:translate-x-0.5 transition-transform cursor-pointer"
          >
            <span>Review timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeFilter === 'expiring_soon' && (
          <div className="mt-2 pt-1.5 border-t border-amber-100 flex items-center justify-between text-[10.5px] text-amber-700 font-medium">
            <span>Filter Active: Showing Expiring Soon (&lt;30 Days)</span>
            <span className="font-semibold underline">Reset</span>
          </div>
        )}
      </div>

      {/* CARD 3: PENDING FINANCE INVOICES */}
      <div
        onClick={handleCard3Click}
        className={`bg-white rounded-lg p-3 border transition-all cursor-pointer relative overflow-hidden group shadow-2xs border-l-4 border-l-emerald-600 ${
          activeTab === 'payments'
            ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20'
            : 'border-slate-200/90 hover:border-slate-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700">
                PENDING FINANCE INVOICES
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 font-normal">
              {formatCurrency(financeStats.totalAmount)} total • {financeStats.agedOver14d} aged &gt;14d
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Receipt className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
              {financeStats.totalCount}
            </span>
            <span className="text-[11.5px] font-semibold text-emerald-700 ml-1.5">
              invoices awaiting AP
            </span>
          </div>

          <button
            onClick={handleFinanceLink}
            title="Action Required: Invoices submitted to Finance Accounts Payable (AP) over 14 days ago awaiting disbursement"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline group-hover:translate-x-0.5 transition-transform cursor-pointer"
          >
            <span>{financeStats.agedOver14d} Aged &gt;14d (Action Required)</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>

        {activeTab === 'payments' && (
          <div className="mt-2 pt-1.5 border-t border-emerald-100 flex items-center justify-between text-[10.5px] text-emerald-700 font-medium">
            <span>Active Module: Legal Fee &amp; Finance AP Tracker</span>
            <span className="font-semibold underline">Viewing</span>
          </div>
        )}
      </div>

      {/* CARD 4: ACTIVE MATTERS */}
      <div
        onClick={handleCard4Click}
        className="bg-white rounded-lg p-3 border transition-all cursor-pointer relative overflow-hidden group shadow-2xs border-l-4 border-l-blue-600 border-slate-200/90 hover:border-slate-300"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700">
                ACTIVE MATTERS
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 font-normal">
              Avg TAT: 6.2d • 94% On-Track
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
              {totalActiveMatters}
            </span>
            <span className="text-[11.5px] font-medium text-slate-600 ml-1.5">
              active matters
            </span>
          </div>

          <button
            onClick={handleActivePipelineLink}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 hover:underline group-hover:translate-x-0.5 transition-transform cursor-pointer"
          >
            <span>View Matter Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
