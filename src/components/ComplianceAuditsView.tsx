import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  FileText,
  Search,
  ExternalLink,
  Shield,
  FileCheck2,
} from 'lucide-react';

interface AuditItem {
  id: string;
  framework: string;
  regulator: string;
  scope: string;
  frequency: string;
  lastAuditedDate: string;
  nextDueDate: string;
  leadCounsel: string;
  status: 'Compliant & Verified' | 'In Review' | 'Upcoming Action';
  riskRating: 'Low' | 'Medium' | 'High';
}

export const ComplianceAuditsView: React.FC = () => {
  const { exportAuditLogCSV, agreements, lods, properties, ips } = useLegal();
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'compliant' | 'review'>('all');

  const auditItems: AuditItem[] = [
    {
      id: 'AUD-2024-001',
      framework: 'MACC Section 17A Corporate Liability & Anti-Corruption (TRUST)',
      regulator: 'Malaysian Anti-Corruption Commission (SPRM)',
      scope: 'Adequate procedures audit, vendor anti-bribery declarations, gift register',
      frequency: 'Annual',
      lastAuditedDate: '2024-08-15',
      nextDueDate: '2025-08-14',
      leadCounsel: 'Elisa Zahari (In-House Counsel)',
      status: 'Compliant & Verified',
      riskRating: 'Low',
    },
    {
      id: 'AUD-2024-002',
      framework: 'Personal Data Protection Act 2010 (PDPA) Compliance',
      regulator: 'Department of Personal Data Protection (JPDP)',
      scope: 'Data privacy notices, consent clauses in MSA/talent contracts, processor agreements',
      frequency: 'Semi-Annual',
      lastAuditedDate: '2024-06-20',
      nextDueDate: '2024-12-20',
      leadCounsel: 'Elisa Zahari & IT DPO',
      status: 'In Review',
      riskRating: 'Medium',
    },
    {
      id: 'AUD-2024-003',
      framework: 'Communications and Multimedia Act 1998 (CMA) License Stamping',
      regulator: 'MCMC (Malaysian Communications and Multimedia Commission)',
      scope: 'CASP(I) / NFP(I) broadcasting license compliance and broadcast content standards',
      frequency: 'Annual',
      lastAuditedDate: '2024-09-30',
      nextDueDate: '2025-09-29',
      leadCounsel: 'Regulatory Legal Affairs',
      status: 'Compliant & Verified',
      riskRating: 'Low',
    },
    {
      id: 'AUD-2024-004',
      framework: 'Companies Act 2016 Statutory Annual Return & Lodgement',
      regulator: 'Companies Commission of Malaysia (SSM)',
      scope: 'Section 68 Annual Return, statutory registers, audited financial statements lodgement',
      frequency: 'Annual',
      lastAuditedDate: '2024-10-10',
      nextDueDate: '2025-10-09',
      leadCounsel: 'Group Company Secretary & Legal',
      status: 'Compliant & Verified',
      riskRating: 'Low',
    },
    {
      id: 'AUD-2024-005',
      framework: 'Legal Privilege & Adverse Inquiries Audit Trail (LOD Logs)',
      regulator: 'High Court Rules & Malaysian Bar Council',
      scope: 'Pre-litigation correspondence, attorney-client privileged drafts, without-prejudice register',
      frequency: 'Quarterly',
      lastAuditedDate: '2024-11-01',
      nextDueDate: '2025-02-01',
      leadCounsel: 'In-House Litigation Practice',
      status: 'Compliant & Verified',
      riskRating: 'Low',
    },
    {
      id: 'AUD-2024-006',
      framework: 'Contract Lifecycle & Stamp Duty Adjudication (LHDN)',
      regulator: 'Lembaga Hasil Dalam Negeri (STAMPS Portal)',
      scope: 'Mandatory stamp duty payment within 30 days of execution for all commercial agreements',
      frequency: 'Continuous / Monthly',
      lastAuditedDate: '2024-11-05',
      nextDueDate: '2024-12-05',
      leadCounsel: 'Contracts Paralegal & Finance',
      status: 'In Review',
      riskRating: 'Medium',
    },
    {
      id: 'AUD-2024-007',
      framework: 'Intellectual Property & Trademark Registry Renewal Compliance',
      regulator: 'Intellectual Property Corporation of Malaysia (MyIPO)',
      scope: 'Nice Class 38 & 41 broadcast mark renewals, opposition monitoring, non-use audits',
      frequency: 'Annual',
      lastAuditedDate: '2024-07-12',
      nextDueDate: '2025-07-11',
      leadCounsel: 'Messrs. Skrine (External IP Counsel)',
      status: 'Compliant & Verified',
      riskRating: 'Low',
    },
  ];

  const filteredItems = auditItems.filter((item) => {
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      const match =
        item.framework.toLowerCase().includes(q) ||
        item.regulator.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter === 'compliant') return item.status === 'Compliant & Verified';
    if (statusFilter === 'review') return item.status === 'In Review';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Audit Readiness Score
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">98.4%</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Tier 1 Prime</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            0 unresolved regulatory notices across 7 frameworks
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Matter Audit Logs
            </span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {agreements.length + lods.length + properties.length + ips.length}
            </span>
            <span className="text-[11px] text-blue-600 font-semibold">Audited Matters</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Complete SHA-256 timestamped audit trail
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Privilege Log Status
            </span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-700">Protected</span>
            <span className="text-[11px] text-slate-500 font-medium">100% Preserved</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Legal professional privilege enforced for all dispute items
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Next Regulatory Check
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700">20 Dec 2024</span>
            <span className="text-[11px] text-amber-600 font-medium">PDPA Review</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Semi-annual personal data audit with CTO Office
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-50 text-blue-700">
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              </span>
              <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">
                Corporate Compliance &amp; Statutory Audit Register
              </h2>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Statutory lodgements, regulatory frameworks, anti-corruption compliance, and governance logs
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={exportAuditLogCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search frameworks, regulators, or scopes..."
              className="w-full h-8 pl-8 pr-3 text-[12px] rounded-md border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Frameworks ({auditItems.length})
            </button>
            <button
              onClick={() => setStatusFilter('compliant')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'compliant'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Compliant &amp; Verified
            </button>
            <button
              onClick={() => setStatusFilter('review')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === 'review'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              In Review
            </button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4 w-[120px]">AUDIT REF</th>
                <th className="py-2.5 px-4 min-w-[260px]">REGULATORY FRAMEWORK &amp; STATUTE</th>
                <th className="py-2.5 px-4 min-w-[180px]">REGULATORY BODY</th>
                <th className="py-2.5 px-4 min-w-[140px]">LEAD COUNSEL</th>
                <th className="py-2.5 px-4 min-w-[120px]">NEXT DUE DATE</th>
                <th className="py-2.5 px-4 w-[160px] text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-[11.5px] align-top">
                    {item.id}
                  </td>
                  <td className="py-3 px-4 align-top">
                    <p className="font-semibold text-slate-900 leading-snug">
                      {item.framework}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {item.scope}
                    </p>
                  </td>
                  <td className="py-3 px-4 align-top">
                    <span className="font-medium text-slate-800 block text-[12px]">
                      {item.regulator}
                    </span>
                    <span className="text-[10.5px] text-slate-400 block font-mono">
                      Cycle: {item.frequency}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-top text-slate-700 text-[12px]">
                    {item.leadCounsel}
                  </td>
                  <td className="py-3 px-4 align-top font-mono text-[11.5px] text-slate-800">
                    <div>{item.nextDueDate}</div>
                    <span className="text-[10px] text-slate-400">
                      Audited: {item.lastAuditedDate}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-top text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.status === 'Compliant & Verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
