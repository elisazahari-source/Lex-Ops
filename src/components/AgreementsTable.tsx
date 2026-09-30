import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Plus,
  Pencil,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, getDaysRemaining, formatDateDisplay, calculateTAT } from '../utils/dateUtils';
import { AgreementMatter, AgreementStage } from '../types/legal';

const STAGES: AgreementStage[] = [
  'LDRF Received / Drafting',
  'Internal Stakeholder Review',
  'Sent to Counterparty (External Review)',
  'Reverted to Legal for Finalisation',
  'Executed / Signed',
  'Active / Pending Renewal',
];

export const AgreementsTable: React.FC = () => {
  const {
    agreements,
    updateAgreement,
    searchQuery,
    activeFilter,
    selectedMatter,
    setSelectedMatter,
    setIsInspectionDrawerOpen,
    setIsNewIntakeModalOpen,
    setNewIntakeDefaultType,
    seedStarterTemplate,
  } = useLegal();

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    const newStage = e.target.value as AgreementStage;
    updateAgreement(id, { stage: newStage });
  };

  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [remarkDraft, setRemarkDraft] = useState<string>('');

  const handleStartEditRemark = (e: React.MouseEvent, id: string, current: string) => {
    e.stopPropagation();
    setEditingRemarkId(id);
    setRemarkDraft(current || '');
  };

  const handleSaveRemark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateAgreement(id, { remarks: remarkDraft, notes: remarkDraft });
    setEditingRemarkId(null);
  };

  const handleCancelRemark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRemarkId(null);
  };

  const filteredAgreements = agreements.filter((agr) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        agr.id.toLowerCase().includes(q) ||
        agr.title.toLowerCase().includes(q) ||
        agr.counterpartyName.toLowerCase().includes(q) ||
        agr.stakeholderName.toLowerCase().includes(q) ||
        agr.agreementType.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (activeFilter === 'expired_overdue') {
      const days = getDaysRemaining(agr.expectedExpiryDate);
      return days !== null && days <= 0;
    }

    if (activeFilter === 'expiring_soon') {
      const days = getDaysRemaining(agr.expectedExpiryDate);
      return days !== null && days > 0 && days <= 30;
    }

    if (activeFilter === 'pending_finance') {
      return (
        agr.invoice?.paymentStatus === 'Submitted to Finance' ||
        agr.invoice?.paymentStatus === 'Invoice Received'
      );
    }

    return true;
  });

  const handleSelect = (agr: AgreementMatter) => {
    setSelectedMatter({ type: 'agreement', id: agr.id });
    setIsInspectionDrawerOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-50 text-blue-700">
              <FileText className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">
              Agreement Lifecycle & LDRF Intake Tracker
            </h2>
          </div>
          <p className="text-[12px] text-slate-500">
            6-stage workflow progression, automatic Turnaround Time (TAT) day freeze on execution, and expiry prompts
          </p>
        </div>

        <button
          onClick={() => {
            setNewIntakeDefaultType('agreement');
            setIsNewIntakeModalOpen(true);
          }}
          className="px-3 py-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Agreement Request</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4 w-[140px]">AGR REF ID</th>
              <th className="py-2.5 px-4 min-w-[220px]">AGREEMENT TITLE & TYPE</th>
              <th className="py-2.5 px-4 min-w-[170px]">COUNTERPARTY</th>
              <th className="py-2.5 px-4 min-w-[190px]">6-STAGE WORKFLOW STATUS</th>
              <th className="py-2.5 px-4 min-w-[120px]">TAT ELAPSED</th>
              <th className="py-2.5 px-4 min-w-[160px]">EXPIRY & RENEWAL</th>
              <th className="py-2.5 px-4 min-w-[200px]">REMARKS & NOTES</th>
              <th className="py-2.5 px-4 text-right w-[80px]">AUDIT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {filteredAgreements.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-[13px]">
                  No matching agreements found for this view.
                </td>
              </tr>
            ) : (
              filteredAgreements.map((agr) => {
                const daysRemaining = getDaysRemaining(agr.expectedExpiryDate);
                const isExpired = daysRemaining !== null && daysRemaining <= 0;
                const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;
                const isSelected = selectedMatter?.id === agr.id;

                return (
                  <tr
                    key={agr.id}
                    onClick={() => handleSelect(agr)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60 font-medium' : ''
                    }`}
                  >
                    {/* Ref ID Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <span className="font-bold font-mono text-[12px] text-slate-900 block">
                          {agr.id}
                        </span>
                        <span className="text-[10.5px] text-slate-400 block">
                          Req: {formatDateDisplay(agr.requestDate)}
                        </span>
                      </div>
                    </td>

                    {/* Title & Type Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-900 block leading-snug">
                          {agr.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {agr.agreementType} · Inquired: {agr.stakeholderName} ({agr.stakeholderDepartment})
                        </span>
                      </div>
                    </td>

                    {/* Counterparty Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 block leading-tight">
                          {agr.counterpartyName}
                        </span>
                        {agr.contractValue && (
                          <span className="text-[11px] font-mono text-slate-600 block">
                            Val: {formatCurrency(agr.contractValue, agr.currency)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6-Stage Workflow Dropdown */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <select
                          value={agr.stage}
                          onChange={(e) => handleStageChange(e, agr.id)}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-[11px] font-medium py-1 px-2 rounded border focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                            agr.stage === 'Executed / Signed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                              : agr.stage === 'Active / Pending Renewal'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : agr.stage === 'Reverted to Legal for Finalisation'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        {agr.executionDate && (
                          <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Executed on {formatDateDisplay(agr.executionDate)}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* TAT Elapsed Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1 font-mono text-[12px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{agr.tatDaysElapsed} Days</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {agr.stage === 'Executed / Signed' ? 'TAT Frozen' : 'In Progress'}
                        </span>
                      </div>
                    </td>

                    {/* Expiry & Renewal Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Expired ({formatDateDisplay(agr.expectedExpiryDate)})</span>
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{daysRemaining}d left ({formatDateDisplay(agr.expectedExpiryDate)})</span>
                          </span>
                        ) : (
                          <span className="text-[11.5px] text-slate-700 font-mono block">
                            {formatDateDisplay(agr.expectedExpiryDate)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          Lead Notice: {agr.renewalPromptLeadDays}d
                        </span>
                      </div>
                    </td>

                    {/* Remarks & Notes Column (Requirement 3) */}
                    <td
                      className="py-3 px-4 align-top"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingRemarkId === agr.id ? (
                        <div className="space-y-1.5 min-w-[190px]">
                          <textarea
                            rows={2}
                            value={remarkDraft}
                            onChange={(e) => setRemarkDraft(e.target.value)}
                            placeholder="Add or update remarks..."
                            className="w-full p-1.5 text-[11.5px] rounded border border-blue-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                            autoFocus
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleSaveRemark(e, agr.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 text-white text-[10.5px] font-semibold hover:bg-blue-700 cursor-pointer"
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
                            handleStartEditRemark(e, agr.id, agr.remarks || agr.notes || '')
                          }
                          className="group/rem flex items-start justify-between gap-1 p-1 rounded hover:bg-slate-100/80 cursor-pointer transition-colors"
                          title="Click to edit remarks"
                        >
                          <span className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                            {agr.remarks || agr.notes || (
                              <span className="text-slate-400 italic">No remarks &bull; Click to add</span>
                            )}
                          </span>
                          <Pencil className="w-3 h-3 text-slate-400 group-hover/rem:text-blue-600 shrink-0 mt-0.5 opacity-0 group-hover/rem:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="py-3 px-4 align-middle text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(agr);
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
