import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronRight,
  Plus,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { formatCurrency, getDaysRemaining, formatDateDisplay } from '../utils/dateUtils';
import { PropertyMatter } from '../types/legal';

export const PropertyMattersTable: React.FC = () => {
  const {
    properties,
    updateProperty,
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
    updateProperty(id, { remarks: remarkDraft, notes: remarkDraft });
    setEditingRemarkId(null);
  };

  const handleCancelRemark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRemarkId(null);
  };

  const filtered = properties.filter((prop) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        prop.id.toLowerCase().includes(q) ||
        prop.propertyName.toLowerCase().includes(q) ||
        prop.propertyAddress.toLowerCase().includes(q) ||
        prop.counterparty.toLowerCase().includes(q) ||
        prop.externalLawFirm.toLowerCase().includes(q) ||
        prop.transactionType.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (activeFilter === 'expired_overdue') {
      const days = getDaysRemaining(prop.targetCompletionDate);
      return days !== null && days <= 0 && prop.stage !== 'Stamped-Completed';
    }

    if (activeFilter === 'expiring_soon') {
      const days = getDaysRemaining(prop.targetCompletionDate);
      return days !== null && days > 0 && days <= 30 && prop.stage !== 'Stamped-Completed';
    }

    if (activeFilter === 'pending_finance') {
      return (
        prop.invoice?.paymentStatus === 'Submitted to Finance' ||
        prop.invoice?.paymentStatus === 'Invoice Received'
      );
    }

    return true;
  });

  const handleSelect = (prop: PropertyMatter) => {
    setSelectedMatter({ type: 'property', id: prop.id });
    setIsInspectionDrawerOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-700">
              <Building2 className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">
              Property Conveyancing & Real Estate Matters
            </h2>
          </div>
          <p className="text-[12px] text-slate-500">
            Tenancy agreements, commercial leases, land acquisitions/disposals liaised with panel conveyancing lawyers
          </p>
        </div>

        <button
          onClick={() => {
            setNewIntakeDefaultType('property');
            setIsNewIntakeModalOpen(true);
          }}
          className="px-3 py-1.5 text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Property Matter</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4 w-[140px]">PROP ID</th>
              <th className="py-2.5 px-4 min-w-[220px]">PROPERTY NAME & ADDRESS</th>
              <th className="py-2.5 px-4 min-w-[130px]">TRANSACTION</th>
              <th className="py-2.5 px-4 min-w-[170px]">COUNTERPARTY</th>
              <th className="py-2.5 px-4 min-w-[180px]">CONVEYANCING FIRM</th>
              <th className="py-2.5 px-4 min-w-[170px]">STATUS / TARGET DATE</th>
              <th className="py-2.5 px-4 min-w-[190px]">REMARKS & NOTES</th>
              <th className="py-2.5 px-4 text-right w-[80px]">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 text-[13px]">
                  No matching property transactions found for this view.
                </td>
              </tr>
            ) : (
              filtered.map((prop) => {
                const daysRemaining = getDaysRemaining(prop.targetCompletionDate);
                const isOverdue =
                  daysRemaining !== null && daysRemaining <= 0 && prop.stage !== 'Stamped-Completed';
                const isExpiringSoon =
                  daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30;
                const isSelected = selectedMatter?.id === prop.id;

                return (
                  <tr
                    key={prop.id}
                    onClick={() => handleSelect(prop)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/60 font-medium' : ''
                    }`}
                  >
                    {/* ID Column */}
                    <td className="py-3 px-4 align-top">
                      <span className="font-bold font-mono text-[12px] text-slate-900 block">
                        {prop.id}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {prop.transactionType}
                      </span>
                    </td>

                    {/* Property Name & Address Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-900 block leading-snug">
                          {prop.propertyName}
                        </span>
                        <span className="text-[11px] text-slate-500 block line-clamp-1">
                          {prop.propertyAddress}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 block">
                          Value: {formatCurrency(prop.rentalOrValueAmount, prop.currency)}
                        </span>
                      </div>
                    </td>

                    {/* Transaction Type Column */}
                    <td className="py-3 px-4 align-top">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          prop.transactionType === 'Perfection of Title'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : prop.transactionType === 'Acquisition'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : prop.transactionType === 'Disposal'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {prop.transactionType}
                      </span>
                    </td>

                    {/* Counterparty Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 block text-[12px]">
                          {prop.counterparty}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Stakeholder: {prop.internalStakeholder}
                          {prop.stakeholderDepartment ? ` (${prop.stakeholderDepartment})` : ''}
                        </span>
                      </div>
                    </td>

                    {/* External Law Firm Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-900 block text-[11.5px] leading-tight">
                          {prop.externalLawFirm}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {prop.lawyerContact}
                        </span>
                      </div>
                    </td>

                    {/* Status & Target Completion Column */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            prop.stage === 'Stamped-Completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : prop.stage === 'SPA-Tenancy Signed'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : prop.stage === 'Pending Consent-State Approval'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {prop.stage}
                        </span>

                        {isOverdue ? (
                          <div className="flex items-center gap-1 text-[10.5px] text-rose-700 font-semibold font-mono">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>{Math.abs(daysRemaining || 0)}d Overdue ({formatDateDisplay(prop.targetCompletionDate)})</span>
                          </div>
                        ) : isExpiringSoon ? (
                          <div className="flex items-center gap-1 text-[10.5px] text-amber-700 font-semibold font-mono">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{daysRemaining}d left ({formatDateDisplay(prop.targetCompletionDate)})</span>
                          </div>
                        ) : (
                          <span className="block text-[10.5px] text-slate-500 font-mono">
                            Target: {formatDateDisplay(prop.targetCompletionDate)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Remarks & Notes Column (Requirement 3) */}
                    <td
                      className="py-3 px-4 align-top"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingRemarkId === prop.id ? (
                        <div className="space-y-1.5 min-w-[180px]">
                          <textarea
                            rows={2}
                            value={remarkDraft}
                            onChange={(e) => setRemarkDraft(e.target.value)}
                            placeholder="Add or update property notes..."
                            className="w-full p-1.5 text-[11.5px] rounded border border-indigo-400 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            autoFocus
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleSaveRemark(e, prop.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 text-white text-[10.5px] font-semibold hover:bg-indigo-700 cursor-pointer"
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
                              prop.id,
                              prop.remarks || prop.notes || ''
                            )
                          }
                          className="group/rem flex items-start justify-between gap-1 p-1 rounded hover:bg-slate-100/80 cursor-pointer transition-colors"
                          title="Click to edit remarks"
                        >
                          <span className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                            {prop.remarks || prop.notes || (
                              <span className="text-slate-400 italic">No remarks &bull; Click to add</span>
                            )}
                          </span>
                          <Pencil className="w-3 h-3 text-slate-400 group-hover/rem:text-indigo-600 shrink-0 mt-0.5 opacity-0 group-hover/rem:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="py-3 px-4 align-middle text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(prop);
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
