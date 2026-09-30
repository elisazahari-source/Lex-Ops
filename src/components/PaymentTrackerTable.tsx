import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  CreditCard,
  Building,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileCheck,
  Send,
  DollarSign,
  Pencil,
  Check,
} from 'lucide-react';
import { formatCurrency, formatDateDisplay, getDaysPendingWithFinance } from '../utils/dateUtils';
import { PaymentStatus, InvoiceDetails } from '../types/legal';

interface UnifiedInvoiceItem {
  id: string;
  sourceType: 'agreement' | 'lod' | 'property' | 'ip';
  matterId: string;
  matterTitle: string;
  invoice: InvoiceDetails;
}

export const PaymentTrackerTable: React.FC = () => {
  const {
    agreements,
    lods,
    properties,
    ips,
    updateInvoice,
    searchQuery,
    setSelectedMatter,
    setIsInspectionDrawerOpen,
  } = useLegal();

  // Gather all invoices across all matter categories
  const allInvoices: UnifiedInvoiceItem[] = [];

  agreements.forEach((a) => {
    if (a.invoice) {
      allInvoices.push({
        id: `INV-AGR-${a.id}`,
        sourceType: 'agreement',
        matterId: a.id,
        matterTitle: a.title,
        invoice: a.invoice,
      });
    }
  });

  lods.forEach((l) => {
    if (l.invoice) {
      allInvoices.push({
        id: `INV-LOD-${l.id}`,
        sourceType: 'lod',
        matterId: l.id,
        matterTitle: l.title,
        invoice: l.invoice,
      });
    }
  });

  properties.forEach((p) => {
    if (p.invoice) {
      allInvoices.push({
        id: `INV-PROP-${p.id}`,
        sourceType: 'property',
        matterId: p.id,
        matterTitle: p.propertyName,
        invoice: p.invoice,
      });
    }
  });

  ips.forEach((i) => {
    if (i.invoice) {
      allInvoices.push({
        id: `INV-IP-${i.id}`,
        sourceType: 'ip',
        matterId: i.id,
        matterTitle: i.trademarkName,
        invoice: i.invoice,
      });
    }
  });

  // Filter based on search query
  const filtered = allInvoices.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.matterId.toLowerCase().includes(q) ||
      item.matterTitle.toLowerCase().includes(q) ||
      item.invoice.invoiceNumber.toLowerCase().includes(q) ||
      item.invoice.lawFirm.toLowerCase().includes(q) ||
      item.invoice.paymentStatus.toLowerCase().includes(q)
    );
  });

  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [remarkDraft, setRemarkDraft] = useState<string>('');

  const handleStartEditRemark = (e: React.MouseEvent, id: string, current: string) => {
    e.stopPropagation();
    setEditingRemarkId(id);
    setRemarkDraft(current || '');
  };

  const handleSaveRemark = (e: React.MouseEvent, item: UnifiedInvoiceItem) => {
    e.stopPropagation();
    const updated: InvoiceDetails = {
      ...item.invoice,
      notes: remarkDraft,
    };
    updateInvoice(item.sourceType, item.matterId, updated);
    setEditingRemarkId(null);
  };

  const handleCancelRemark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRemarkId(null);
  };

  const handleMarkAsPaid = (item: UnifiedInvoiceItem) => {
    const today = new Date().toISOString().split('T')[0];
    const ref = `FPX-${today.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated: InvoiceDetails = {
      ...item.invoice,
      paymentStatus: 'Paid by Finance',
      paymentReference: ref,
    };
    updateInvoice(item.sourceType, item.matterId, updated);
  };

  const handleSubmitToFinance = (item: UnifiedInvoiceItem) => {
    const today = new Date().toISOString().split('T')[0];
    const updated: InvoiceDetails = {
      ...item.invoice,
      paymentStatus: 'Submitted to Finance',
      dateSubmittedToFinance: today,
    };
    updateInvoice(item.sourceType, item.matterId, updated);
  };

  const handleOpenMatter = (item: UnifiedInvoiceItem) => {
    setSelectedMatter({ type: item.sourceType, id: item.matterId });
    setIsInspectionDrawerOpen(true);
  };

  // Summaries
  const totalSubmittedUnpaid = allInvoices
    .filter((i) => i.invoice.paymentStatus === 'Submitted to Finance')
    .reduce((acc, curr) => acc + curr.invoice.amount, 0);

  const lateInvoicesCount = allInvoices.filter(
    (i) =>
      i.invoice.paymentStatus === 'Submitted to Finance' &&
      getDaysPendingWithFinance(i.invoice.dateSubmittedToFinance) > 14
  ).length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs space-y-4">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-50 text-emerald-700">
              <CreditCard className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">
              External Counsel Fee & Finance Payment Tracker
            </h2>
          </div>
          <p className="text-[12px] text-slate-500">
            Law firm invoices submitted to Finance, payment SLA aging (&gt;14 days overdue alert), and remittance tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono">
            <span className="text-slate-500">Pending Finance: </span>
            <span className="font-bold text-slate-900">{formatCurrency(totalSubmittedUnpaid)}</span>
          </div>
          {lateInvoicesCount > 0 && (
            <div className="px-2.5 py-1.5 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] font-mono font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>{lateInvoicesCount} Aging &gt;14d</span>
            </div>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4 w-[150px]">INVOICE # &amp; DATE</th>
              <th className="py-2.5 px-4 min-w-[190px]">LAW FIRM &amp; MATTER</th>
              <th className="py-2.5 px-4 min-w-[120px]">AMOUNT</th>
              <th className="py-2.5 px-4 min-w-[160px]">SUBMISSION &amp; AGING</th>
              <th className="py-2.5 px-4 min-w-[150px]">PAYMENT STATUS</th>
              <th className="py-2.5 px-4 min-w-[180px]">REMARKS &amp; NOTES</th>
              <th className="py-2.5 px-4 text-right w-[150px]">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-[13px]">
                  No external invoices logged matching the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const daysPending = getDaysPendingWithFinance(item.invoice.dateSubmittedToFinance);
                const isOverdue =
                  item.invoice.paymentStatus === 'Submitted to Finance' && daysPending > 14;

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenMatter(item)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    {/* Invoice # & Date */}
                    <td className="py-3 px-4 align-top">
                      <span className="font-bold font-mono text-[12px] text-slate-900 block">
                        {item.invoice.invoiceNumber}
                      </span>
                      <span className="text-[10.5px] text-slate-400 block font-mono">
                        Date: {formatDateDisplay(item.invoice.invoiceDate)}
                      </span>
                    </td>

                    {/* Law Firm & Matter */}
                    <td className="py-3 px-4 align-top">
                      <span className="font-semibold text-slate-900 block leading-snug">
                        {item.invoice.lawFirm}
                      </span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono uppercase font-semibold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                          {item.matterId}
                        </span>
                        <span className="truncate max-w-[240px]">{item.matterTitle}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 align-top">
                      <span className="font-bold font-mono text-[13px] text-slate-900 block">
                        {formatCurrency(item.invoice.amount, item.invoice.currency)}
                      </span>
                    </td>

                    {/* Submission Date & Aging */}
                    <td className="py-3 px-4 align-top">
                      {item.invoice.dateSubmittedToFinance ? (
                        <div className="space-y-0.5">
                          <span className="text-[11.5px] text-slate-700 block font-mono">
                            Sub: {formatDateDisplay(item.invoice.dateSubmittedToFinance)}
                          </span>
                          {item.invoice.paymentStatus === 'Submitted to Finance' && (
                            <div>
                              {isOverdue ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                                  <AlertCircle className="w-3 h-3 text-amber-700" />
                                  <span>{daysPending}d Pending (&gt;14d Alert)</span>
                                </span>
                              ) : (
                                <span className="text-[10.5px] text-slate-500 font-mono">
                                  {daysPending} days with Finance
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not submitted to Finance</span>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.invoice.paymentStatus === 'Paid by Finance'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : item.invoice.paymentStatus === 'Submitted to Finance'
                              ? isOverdue
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.invoice.paymentStatus}
                        </span>

                        {item.invoice.paymentReference && (
                          <span className="block text-[10px] text-emerald-700 font-mono">
                            Ref: {item.invoice.paymentReference}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Remarks & Notes Column (Editable over time) */}
                    <td
                      className="py-3 px-4 align-top"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editingRemarkId === item.id ? (
                        <div className="space-y-1.5 min-w-[170px]">
                          <textarea
                            rows={2}
                            value={remarkDraft}
                            onChange={(e) => setRemarkDraft(e.target.value)}
                            placeholder="Add or update invoice remarks..."
                            className="w-full p-1.5 text-[11.5px] rounded border border-emerald-400 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                            autoFocus
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleSaveRemark(e, item)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-700 text-white text-[10.5px] font-semibold hover:bg-emerald-800 cursor-pointer"
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
                              item.id,
                              item.invoice.notes || ''
                            )
                          }
                          className="group/rem flex items-start justify-between gap-1 p-1 rounded hover:bg-slate-100/80 cursor-pointer transition-colors"
                          title="Click to edit remarks"
                        >
                          <span className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                            {item.invoice.notes || (
                              <span className="text-slate-400 italic">No notes &bull; Click to add</span>
                            )}
                          </span>
                          <Pencil className="w-3 h-3 text-slate-400 group-hover/rem:text-emerald-600 shrink-0 mt-0.5 opacity-0 group-hover/rem:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {item.invoice.paymentStatus !== 'Paid by Finance' && (
                          <button
                            onClick={() => handleMarkAsPaid(item)}
                            title="Mark invoice as paid by Finance"
                            className="px-2 py-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        {item.invoice.paymentStatus === 'Invoice Received' && (
                          <button
                            onClick={() => handleSubmitToFinance(item)}
                            title="Submit to Finance today"
                            className="px-2 py-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                          >
                            Submit
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenMatter(item)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
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
