import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  BookmarkCheck,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronRight,
  Plus,
  ShieldCheck,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { formatCurrency, getDaysRemaining, formatDateDisplay } from '../utils/dateUtils';
import { IpMatter } from '../types/legal';

export const IpTrademarksTable: React.FC = () => {
  const {
    ips,
    updateIp,
    searchQuery,
    activeFilter,
    selectedMatter,
    setSelectedMatter,
    setIsInspectionDrawerOpen,
    setIsNewIntakeModalOpen,
    setNewIntakeDefaultType,
  } = useLegal();

  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [remarkDraft, setRemarkDraft] = useState<string>('');
  const [ipTypeFilter, setIpTypeFilter] = useState<'all' | 'Trademark' | 'Patent'>('all');

  const handleStartEditRemark = (e: React.MouseEvent, id: string, current: string) => {
    e.stopPropagation();
    setEditingRemarkId(id);
    setRemarkDraft(current || '');
  };

  const handleSaveRemark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateIp(id, { remarks: remarkDraft, notes: remarkDraft });
    setEditingRemarkId(null);
  };

  const handleCancelRemark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRemarkId(null);
  };

  const filtered = ips.filter((ip) => {
    if (ipTypeFilter !== 'all') {
      const type = ip.ipType || (ip.id.startsWith('PAT') ? 'Patent' : 'Trademark');
      if (type !== ipTypeFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        ip.id.toLowerCase().includes(q) ||
        ip.trademarkName.toLowerCase().includes(q) ||
        ip.registrationNumber.toLowerCase().includes(q) ||
        ip.niceClass.toLowerCase().includes(q) ||
        ip.externalLawFirm.toLowerCase().includes(q) ||
        ip.jurisdiction.toLowerCase().includes(q) ||
        (ip.ipType && ip.ipType.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (activeFilter === 'expired_overdue') {
      const days = getDaysRemaining(ip.expiryRenewalDate);
      return days !== null && days <= 0;
    }

    if (activeFilter === 'expiring_soon') {
      const days = getDaysRemaining(ip.expiryRenewalDate);
      return days !== null && days > 0 && days <= 30;
    }

    if (activeFilter === 'pending_finance') {
      return ip.invoice?.paymentStatus === 'Submitted to Finance';
    }

    return true;
  });

  const handleSelect = (ip: IpMatter) => {
    setSelectedMatter({ type: 'ip', id: ip.id });
    setIsInspectionDrawerOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-teal-50 text-teal-700">
              <BookmarkCheck className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">
              Intellectual Property Portfolio (PRD F04)
            </h2>
          </div>
          <p className="text-[12px] text-slate-500">
            Trademarks &amp; Patents, MyIPO/WIPO/PCT statutory filings, 10/20-year annuities, and specialist IP counsel
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* IP Type Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-[11px] font-medium border border-slate-200">
            <button
              onClick={() => setIpTypeFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                ipTypeFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All IP ({ips.length})
            </button>
            <button
              onClick={() => setIpTypeFilter('Trademark')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                ipTypeFilter === 'Trademark'
                  ? 'bg-white text-teal-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Trademarks ({ips.filter((i) => (i.ipType || 'Trademark') === 'Trademark').length})
            </button>
            <button
              onClick={() => setIpTypeFilter('Patent')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                ipTypeFilter === 'Patent'
                  ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patents ({ips.filter((i) => i.ipType === 'Patent' || i.id.startsWith('PAT')).length})
            </button>
          </div>

          <button
            onClick={() => {
              setNewIntakeDefaultType('ip');
              setIsNewIntakeModalOpen(true);
            }}
            className="px-3 py-1.5 text-[12px] font-medium text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Add IP Matter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4 w-[125px]">IP REF ID</th>
              <th className="py-2.5 px-4 w-[110px]">IP TYPE</th>
              <th className="py-2.5 px-4 min-w-[210px]">ASSET TITLE &amp; REG/PATENT NO.</th>
              <th className="py-2.5 px-4 min-w-[190px]">CLASSIFICATION / FIELD</th>
              <th className="py-2.5 px-4 min-w-[150px]">JURISDICTION</th>
              <th className="py-2.5 px-4 min-w-[170px]">EXTERNAL IP COUNSEL</th>
              <th className="py-2.5 px-4 min-w-[170px]">STATUS / RENEWAL DATE</th>
              <th className="py-2.5 px-4 min-w-[190px]">REMARKS &amp; NOTES</th>
              <th className="py-2.5 px-4 text-right w-[80px]">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 text-[13px]">
                  No matching intellectual property assets found for this filter.
                </td>
              </tr>
            ) : (
              filtered.map((ip) => {
                const daysRemaining = getDaysRemaining(ip.expiryRenewalDate);
                const isExpired = daysRemaining !== null && daysRemaining <= 0;
                const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;
                const isSelected = selectedMatter?.id === ip.id;
                const isPatent = ip.ipType === 'Patent' || ip.id.startsWith('PAT');

                return (
                  <tr
                    key={ip.id}
                    onClick={() => handleSelect(ip)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60 font-medium' : ''
                    }`}
                  >
                    {/* TM ID Column */}
                    <td className="py-3 px-4 align-top">
                      <span className="font-bold font-mono text-[12px] text-slate-900 block">
                        {ip.id}
                      </span>
                      <span className="text-[10.5px] text-slate-400 block font-mono">
                        Filed: {formatDateDisplay(ip.filingDate)}
                      </span>
                    </td>

                    {/* IP Type Column */}
                    <td className="py-3 px-4 align-top">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          isPatent
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-teal-50 text-teal-800 border-teal-200'
                        }`}
                      >
                        {isPatent ? 'Patent' : 'Trademark'}
                      </span>
                    </td>

                    {/* Trademark Name & Reg No Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block text-[13px] tracking-tight">
                          {ip.trademarkName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          {isPatent ? 'Patent App / Grant #' : 'Reg #'}{ip.registrationNumber}
                        </span>
                      </div>
                    </td>

                    {/* Nice Classification Column */}
                    <td className="py-3 px-4 align-top">
                      <span className="text-[11.5px] text-slate-700 block leading-snug">
                        {ip.niceClass}
                      </span>
                    </td>

                    {/* Jurisdiction Column */}
                    <td className="py-3 px-4 align-top">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {ip.jurisdiction}
                      </span>
                    </td>

                    {/* External IP Counsel Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-900 block text-[11.5px] leading-tight">
                          {ip.externalLawFirm}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {ip.lawyerContact}
                        </span>
                        {ip.stakeholderName && (
                          <span className="text-[10.5px] text-slate-400 block">
                            Stakeholder: {ip.stakeholderName}
                            {ip.stakeholderDepartment ? ` (${ip.stakeholderDepartment})` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status & Renewal Date Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            ip.status === 'Registered'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : ip.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {ip.status}
                        </span>

                        {isExpired ? (
                          <div className="flex items-center gap-1 text-[10.5px] text-rose-700 font-semibold font-mono">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Expired ({formatDateDisplay(ip.expiryRenewalDate)})</span>
                          </div>
                        ) : isExpiringSoon ? (
                          <div className="flex items-center gap-1 text-[10.5px] text-amber-700 font-semibold font-mono">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{daysRemaining}d left ({formatDateDisplay(ip.expiryRenewalDate)})</span>
                          </div>
                        ) : (
                          <span className="block text-[10.5px] text-slate-500 font-mono">
                            Renewal: {formatDateDisplay(ip.expiryRenewalDate)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Remarks & Notes Column (Requirement 3) */}
                    <td
                      className="py-3 px-4 align-top"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingRemarkId === ip.id ? (
                        <div className="space-y-1.5 min-w-[180px]">
                          <textarea
                            rows={2}
                            value={remarkDraft}
                            onChange={(e) => setRemarkDraft(e.target.value)}
                            placeholder="Add or update trademark notes..."
                            className="w-full p-1.5 text-[11.5px] rounded border border-teal-400 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                            autoFocus
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleSaveRemark(e, ip.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-600 text-white text-[10.5px] font-semibold hover:bg-teal-700 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelRemark}
                              className="px-2 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-[10.5px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={(e) =>
                            handleStartEditRemark(
                              e,
                              ip.id,
                              ip.remarks || ip.notes || ''
                            )
                          }
                          className="group/rem flex items-start justify-between gap-1 p-1 rounded hover:bg-slate-100/80 cursor-pointer transition-colors"
                          title="Click to edit remarks"
                        >
                          <span className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                            {ip.remarks || ip.notes || (
                              <span className="text-slate-400 italic">No remarks &bull; Click to add</span>
                            )}
                          </span>
                          <Pencil className="w-3 h-3 text-slate-400 group-hover/rem:text-teal-600 shrink-0 mt-0.5 opacity-0 group-hover/rem:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="py-3 px-4 align-middle text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(ip);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50/70 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
                        <span>Audit</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
