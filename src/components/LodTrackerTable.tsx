import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  Scale,
  Calendar,
  Building,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { formatCurrency, getDaysRemaining, formatDateDisplay } from '../utils/dateUtils';
import { LodMatter } from '../types/legal';

export const LodTrackerTable: React.FC = () => {
  const {
    lods,
    updateLod,
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

  const handleStartEditRemark = (e: React.MouseEvent, id: string, current: string) => {
    e.stopPropagation();
    setEditingRemarkId(id);
    setRemarkDraft(current || '');
  };

  const handleSaveRemark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateLod(id, { remarks: remarkDraft, responseNotes: remarkDraft });
    setEditingRemarkId(null);
  };

  const handleCancelRemark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRemarkId(null);
  };

  // Filter based on search and active alert filter
  const filteredLods = lods.filter((lod) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        lod.id.toLowerCase().includes(q) ||
        lod.title.toLowerCase().includes(q) ||
        lod.claimantName.toLowerCase().includes(q) ||
        lod.adverseCounsel.toLowerCase().includes(q) ||
        lod.briefClaimSummary.toLowerCase().includes(q) ||
        (lod.appointedLitigationFirm && lod.appointedLitigationFirm.toLowerCase().includes(q));
      if (!matchText) return false;
    }

    // Alert filter
    if (activeFilter === 'expired_overdue') {
      const days = getDaysRemaining(lod.responseDeadlineDate);
      return days !== null && days <= 0 && lod.stage !== 'Response Sent - Closed';
    }

    if (activeFilter === 'expiring_soon') {
      const days = getDaysRemaining(lod.responseDeadlineDate);
      return days !== null && days > 0 && days <= 7;
    }

    if (activeFilter === 'pending_finance') {
      return lod.invoice?.paymentStatus === 'Submitted to Finance';
    }

    return true;
  });

  const handleSelectLod = (lod: LodMatter) => {
    setSelectedMatter({ type: 'lod', id: lod.id });
    setIsInspectionDrawerOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
      {/* Table Section Header matching Image 1.jpeg */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-50 text-rose-700">
              <Scale className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">
              Letter of Demand (LOD) & Litigation Tracker
            </h2>
          </div>
          <p className="text-[12px] text-slate-500">
            Statutory 14-day reply deadlines, internal stakeholder inquiry fact-finding, and external panel lawyer coordination
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewIntakeDefaultType('lod');
              setIsNewIntakeModalOpen(true);
            }}
            className="px-3 py-1.5 text-[12px] font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
          >
            + Add Received LOD
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4 w-[160px]">LOD REF ID</th>
              <th className="py-2.5 px-4 min-w-[190px]">CLAIMANT & ADVERSE FIRM</th>
              <th className="py-2.5 px-4 min-w-[210px]">DISPUTE SUBJECT & CLAIM</th>
              <th className="py-2.5 px-4 min-w-[190px]">COUNTDOWN / DEADLINE</th>
              <th className="py-2.5 px-4 min-w-[170px]">INQUIRY STATUS & STAKEHOLDERS</th>
              <th className="py-2.5 px-4 min-w-[160px]">EXTERNAL COUNSEL & INVOICE</th>
              <th className="py-2.5 px-4 min-w-[190px]">REMARKS & NOTES</th>
              <th className="py-2.5 px-4 text-right w-[90px]">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {filteredLods.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-[13px]">
                  No matching Letters of Demand found for this view or search filter.
                </td>
              </tr>
            ) : (
              filteredLods.map((lod) => {
                const daysRemaining = getDaysRemaining(lod.responseDeadlineDate);
                const isSelected = selectedMatter?.id === lod.id;
                const isOverdue =
                  daysRemaining !== null && daysRemaining <= 0 && lod.stage !== 'Response Sent - Closed';

                return (
                  <tr
                    key={lod.id}
                    onClick={() => handleSelectLod(lod)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60 font-medium' : ''
                    }`}
                  >
                    {/* LOD Ref ID Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-[12.5px] text-slate-900">
                          {lod.stage === 'Escalated to Litigation' ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : (
                            <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className={lod.stage === 'Escalated to Litigation' ? 'text-rose-700' : ''}>
                            {lod.id}
                          </span>
                        </div>
                        {lod.courtSuitNumber && (
                          <span className="block text-[11px] text-slate-500 font-mono leading-tight">
                            {lod.courtSuitNumber}
                          </span>
                        )}
                        <span className="block text-[10.5px] text-slate-400">
                          Recv: {formatDateDisplay(lod.dateReceived)}
                        </span>
                      </div>
                    </td>

                    {/* Claimant & Adverse Firm Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-900 block leading-tight">
                          {lod.claimantName}
                        </span>
                        <span className="text-[11.5px] text-slate-500 block leading-tight">
                          Adverse Counsel: {lod.adverseCounsel}
                        </span>
                        {lod.stakeholderName && (
                          <span className="text-[10.5px] text-slate-400 block">
                            Stakeholder: {lod.stakeholderName}
                            {lod.stakeholderDepartment ? ` (${lod.stakeholderDepartment})` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dispute Subject & Claim Amount Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 block leading-snug">
                          {lod.title}
                        </span>
                        <div className="text-[11.5px] text-slate-600 font-sans">
                          Claim: <span className="font-bold text-slate-900 font-mono">{formatCurrency(lod.claimAmount, lod.currency)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Countdown / Deadline Column */}
                    <td className="py-3 px-4 align-top">
                      {lod.stage === 'Escalated to Litigation' ? (
                        <div className="inline-flex flex-col gap-0.5 px-2 py-1 rounded bg-rose-600 text-white shadow-2xs text-[11px] font-medium leading-tight">
                          <div className="flex items-center gap-1 font-bold">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Escalated to Litigation Team</span>
                          </div>
                          <span className="text-[10px] text-rose-100 font-mono">
                            Memorandum of Appearance due in 1 day
                          </span>
                        </div>
                      ) : lod.stage === 'Response Sent - Closed' ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Response Sent - Closed</span>
                        </div>
                      ) : lod.responseDeadlineOption === 'None' || lod.responseDeadlineDate.toLowerCase().includes('none') ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                          <span>Advisory / No Deadline</span>
                        </div>
                      ) : isOverdue ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold font-mono">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>{Math.abs(daysRemaining || 0)} Days Overdue</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold font-mono">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>
                            {daysRemaining} Days Left ({formatDateDisplay(lod.responseDeadlineDate)})
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Inquiry Status & Stakeholder Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {lod.stage}
                        </span>
                        <div className="text-[11px] text-slate-500 flex flex-wrap gap-1">
                          {lod.inquiredStakeholders.slice(0, 2).map((sh, idx) => (
                            <span key={idx} className="bg-slate-50 px-1 py-0.2 rounded border border-slate-200">
                              {sh}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* External Counsel & Invoice Column */}
                    <td className="py-3 px-4 align-top">
                      {lod.appointedLitigationFirm?.toLowerCase().includes('in-house') ||
                      lod.appointedLitigationFirm?.toLowerCase().includes('internal') ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>In-House Legal</span>
                          </span>
                          <span className="block text-[10.5px] text-slate-500 font-medium">
                            No invoice required (In-House)
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-800 block text-[11.5px] leading-tight">
                            {lod.appointedLitigationFirm || 'Pending Appointment'}
                          </span>
                          {lod.invoice ? (
                            <div className="text-[11px]">
                              <span className="font-mono font-semibold text-slate-900">
                                {formatCurrency(lod.invoice.amount)}
                              </span>
                              <span
                                className={`ml-1 text-[10px] font-medium px-1 rounded ${
                                  lod.invoice.paymentStatus === 'Paid by Finance'
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : lod.invoice.paymentStatus === 'Submitted to Finance'
                                    ? 'text-amber-700 bg-amber-50'
                                    : 'text-slate-500 bg-slate-100'
                                }`}
                              >
                                ({lod.invoice.paymentStatus === 'Submitted to Finance' ? 'Submitted' : lod.invoice.paymentStatus === 'Paid by Finance' ? 'Paid' : 'Quoted'})
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10.5px] text-slate-400">No invoice logged</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Remarks & Notes Column (Requirement 3) */}
                    <td
                      className="py-3 px-4 align-top"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingRemarkId === lod.id ? (
                        <div className="space-y-1.5 min-w-[180px]">
                          <textarea
                            rows={2}
                            value={remarkDraft}
                            onChange={(e) => setRemarkDraft(e.target.value)}
                            placeholder="Add or update dispute notes..."
                            className="w-full p-1.5 text-[11.5px] rounded border border-rose-400 bg-white focus:outline-none focus:ring-1 focus:ring-rose-600"
                            autoFocus
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleSaveRemark(e, lod.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white text-[10.5px] font-semibold hover:bg-rose-700 cursor-pointer"
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
                              lod.id,
                              lod.remarks || lod.responseNotes || ''
                            )
                          }
                          className="group/rem flex items-start justify-between gap-1 p-1 rounded hover:bg-slate-100/80 cursor-pointer transition-colors"
                          title="Click to edit remarks"
                        >
                          <span className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                            {lod.remarks || lod.responseNotes || (
                              <span className="text-slate-400 italic">No remarks &bull; Click to add</span>
                            )}
                          </span>
                          <Pencil className="w-3 h-3 text-slate-400 group-hover/rem:text-rose-600 shrink-0 mt-0.5 opacity-0 group-hover/rem:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-4 align-middle text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectLod(lod);
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
