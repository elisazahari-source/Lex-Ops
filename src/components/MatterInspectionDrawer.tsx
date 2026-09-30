import React, { useState, useEffect, useRef } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  X,
  Hourglass,
  Send,
  Building,
  Calendar,
  AlertTriangle,
  Receipt,
  FileCheck,
  CheckCircle2,
  Paperclip,
  Download,
  FileText,
  Loader2,
  Check,
  Upload,
  Plus,
  Edit2,
  Clock,
} from 'lucide-react';
import { formatCurrency, getDaysRemaining, formatDateDisplay } from '../utils/dateUtils';
import {
  LodStage,
  AgreementStage,
  PropertyStage,
  IpStatus,
  PaymentStatus,
  SupportingDocument,
  InvoiceDetails,
} from '../types/legal';

const LAW_FIRM_OPTIONS = [
  'In-House Legal (Handled Internally, No External Firm Required)',
  'Pending External Firm Appointment',
  'Messrs. Skrine',
  'Messrs. Baker McKenzie',
  'Messrs. Shearn Delamore & Co',
  'Messrs. Wong & Partners',
  'Messrs. Halim Hong & Koh',
  'Messrs. Shook Lin & Bok',
  'Messrs. Zul Rafique & Partners',
  'Messrs. Christopher & Lee Ong',
  'Others',
];

export const MatterInspectionDrawer: React.FC = () => {
  const {
    selectedMatter,
    isInspectionDrawerOpen,
    setIsInspectionDrawerOpen,
    agreements,
    lods,
    properties,
    ips,
    updateLod,
    updateAgreement,
    updateProperty,
    updateIp,
  } = useLegal();

  // Find active item
  const currentItem = React.useMemo(() => {
    if (!selectedMatter) return null;
    if (selectedMatter.type === 'lod') {
      const data = lods.find((l) => l.id === selectedMatter.id);
      return data ? { type: 'lod' as const, data } : null;
    }
    if (selectedMatter.type === 'agreement') {
      const data = agreements.find((a) => a.id === selectedMatter.id);
      return data ? { type: 'agreement' as const, data } : null;
    }
    if (selectedMatter.type === 'property') {
      const data = properties.find((p) => p.id === selectedMatter.id);
      return data ? { type: 'property' as const, data } : null;
    }
    if (selectedMatter.type === 'ip') {
      const data = ips.find((i) => i.id === selectedMatter.id);
      return data ? { type: 'ip' as const, data } : null;
    }
    return null;
  }, [selectedMatter, lods, agreements, properties, ips]);

  // Local draft states for drawer editing
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState<string>('');
  const [targetDateDraft, setTargetDateDraft] = useState('');
  const [appointedFirm, setAppointedFirm] = useState('');
  const [customFirm, setCustomFirm] = useState('');
  const [isEditingFirm, setIsEditingFirm] = useState(false);
  const [assignedCounselDraft, setAssignedCounselDraft] = useState('');
  const [documentsDraft, setDocumentsDraft] = useState<SupportingDocument[]>([]);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending Invoice');
  const [dateSubmittedToFinance, setDateSubmittedToFinance] = useState('');
  
  // Save status states for immediate visual feedback
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Track active matter ID to re-initialize draft state only when switching matters
  const currentMatterId = currentItem?.data?.id;

  useEffect(() => {
    if (!currentItem) return;
    const { type, data } = currentItem;

    if (type === 'lod') {
      setNotes(data.remarks || data.responseNotes || '');
      setStage(data.stage);
      setTargetDateDraft(data.responseDeadlineDate || '');
      const firm = data.appointedLitigationFirm || 'In-House Legal (Handled Internally, No External Firm Required)';
      if (LAW_FIRM_OPTIONS.includes(firm)) {
        setAppointedFirm(firm);
        setCustomFirm('');
      } else {
        setAppointedFirm('Others');
        setCustomFirm(firm);
      }
      setAssignedCounselDraft(data.assignedCounsel || 'Elisa Zahari (In-House)');
    } else if (type === 'agreement') {
      setNotes(data.remarks || data.notes || '');
      setStage(data.stage);
      setTargetDateDraft(data.expectedExpiryDate || '');
      setAppointedFirm('In-House Legal (Handled Internally, No External Firm Required)');
      setCustomFirm('');
      setAssignedCounselDraft(data.assignedCounsel || 'Elisa Zahari (In-House)');
    } else if (type === 'property') {
      setNotes(data.remarks || data.notes || '');
      setStage(data.stage);
      setTargetDateDraft(data.targetCompletionDate || '');
      const firm = data.externalLawFirm || 'Pending External Firm Appointment';
      if (LAW_FIRM_OPTIONS.includes(firm)) {
        setAppointedFirm(firm);
        setCustomFirm('');
      } else {
        setAppointedFirm('Others');
        setCustomFirm(firm);
      }
      setAssignedCounselDraft(data.assignedCounsel || 'Elisa Zahari (In-House)');
    } else if (type === 'ip') {
      setNotes(data.remarks || data.notes || '');
      setStage(data.status);
      setTargetDateDraft(data.expiryRenewalDate || '');
      const firm = data.externalLawFirm || 'Pending External Firm Appointment';
      if (LAW_FIRM_OPTIONS.includes(firm)) {
        setAppointedFirm(firm);
        setCustomFirm('');
      } else {
        setAppointedFirm('Others');
        setCustomFirm(firm);
      }
      setAssignedCounselDraft(data.assignedCounsel || 'Elisa Zahari (In-House)');
    }

    setDocumentsDraft(data.documents || []);
    setIsEditingFirm(false);

    const inv = data.invoice;
    if (inv) {
      setInvoiceAmount(inv.amount || 0);
      setInvoiceNumber(inv.invoiceNumber || '');
      setPaymentStatus(inv.paymentStatus || 'Pending Invoice');
      setDateSubmittedToFinance(inv.dateSubmittedToFinance || '');
    } else {
      setInvoiceAmount(0);
      setInvoiceNumber('');
      setPaymentStatus('Pending Invoice');
      setDateSubmittedToFinance('');
    }
  }, [currentMatterId]);

  if (!isInspectionDrawerOpen || !currentItem || !currentItem.data) {
    return null;
  }

  const { type, data } = currentItem;

  // Resolve law firm name
  const getResolvedFirm = () => {
    if (appointedFirm === 'Others') {
      return customFirm.trim() || 'Messrs. Shearn Delamore & Co';
    }
    return appointedFirm || 'In-House Legal (Handled Internally, No External Firm Required)';
  };

  const handleSaveChanges = (overrideInvoice?: InvoiceDetails) => {
    setIsSaving(true);
    const resolvedFirm = getResolvedFirm();

    const updatedInvoice =
      overrideInvoice ||
      (invoiceNumber.trim() || invoiceAmount > 0
        ? {
            invoiceNumber: invoiceNumber.trim() || `INV-${data.id}`,
            amount: invoiceAmount,
            currency: 'MYR' as const,
            lawFirm:
              resolvedFirm ||
              (type === 'lod'
                ? data.appointedLitigationFirm
                : type === 'property' || type === 'ip'
                ? data.externalLawFirm
                : 'External Legal Advisory'),
            dateSubmittedToFinance:
              paymentStatus === 'Submitted to Finance' && !dateSubmittedToFinance
                ? new Date().toISOString().split('T')[0]
                : dateSubmittedToFinance,
            paymentStatus,
            notes: 'Updated from matter inspection drawer.',
          }
        : undefined);

    if (type === 'lod') {
      updateLod(data.id, {
        responseNotes: notes,
        remarks: notes,
        stage: stage as LodStage,
        appointedLitigationFirm: resolvedFirm,
        responseDeadlineDate: targetDateDraft || data.responseDeadlineDate,
        assignedCounsel: assignedCounselDraft,
        documents: documentsDraft,
        invoice: updatedInvoice,
      });
    } else if (type === 'agreement') {
      updateAgreement(data.id, {
        notes,
        remarks: notes,
        stage: stage as AgreementStage,
        expectedExpiryDate: targetDateDraft || data.expectedExpiryDate,
        assignedCounsel: assignedCounselDraft,
        documents: documentsDraft,
        invoice: updatedInvoice,
      });
    } else if (type === 'property') {
      updateProperty(data.id, {
        notes,
        remarks: notes,
        stage: stage as PropertyStage,
        externalLawFirm: resolvedFirm,
        targetCompletionDate: targetDateDraft || data.targetCompletionDate,
        assignedCounsel: assignedCounselDraft,
        documents: documentsDraft,
        invoice: updatedInvoice,
      });
    } else if (type === 'ip') {
      updateIp(data.id, {
        notes,
        remarks: notes,
        status: stage as IpStatus,
        externalLawFirm: resolvedFirm,
        expiryRenewalDate: targetDateDraft || data.expiryRenewalDate,
        assignedCounsel: assignedCounselDraft,
        documents: documentsDraft,
        invoice: updatedInvoice,
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setToastMessage(`Matter ${data.id} successfully updated and saved!`);
      setShowSavedToast(true);

      setTimeout(() => {
        setIsSaved(false);
      }, 2500);

      setTimeout(() => {
        setShowSavedToast(false);
      }, 4000);
    }, 200);
  };

  const handleSendRemittance = () => {
    const today = new Date().toISOString().split('T')[0];
    const invNumber = invoiceNumber.trim() || `INV-${data.id}`;
    const invAmount = invoiceAmount > 0 ? invoiceAmount : 28000;
    const firmName = getResolvedFirm();

    setPaymentStatus('Submitted to Finance');
    setDateSubmittedToFinance(today);
    setInvoiceNumber(invNumber);
    setInvoiceAmount(invAmount);

    const remittanceInvoice: InvoiceDetails = {
      invoiceNumber: invNumber,
      amount: invAmount,
      currency: 'MYR',
      lawFirm: firmName,
      dateSubmittedToFinance: today,
      paymentStatus: 'Submitted to Finance',
      notes: `Litigation retainer / fee remittance sent to Finance on ${today}.`,
    };

    handleSaveChanges(remittanceInvoice);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: SupportingDocument = {
        id: `DOC-${Date.now()}`,
        name: file.name,
        size: file.size,
        sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/octet-stream',
        category: 'Uploaded Attachment',
        uploadedAt: new Date().toISOString(),
        dataUrl: reader.result as string,
      };
      setDocumentsDraft((prev) => [...prev, newDoc]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remaining days calculation
  const targetDate = targetDateDraft || (
    type === 'lod'
      ? data.responseDeadlineDate
      : type === 'agreement'
      ? data.expectedExpiryDate
      : type === 'property'
      ? data.targetCompletionDate
      : data.expiryRenewalDate
  );

  const daysRemaining = getDaysRemaining(targetDate);

  return (
    <div className="w-[390px] xl:w-[420px] border-l border-slate-200 bg-white flex flex-col shrink-0 h-full overflow-hidden shadow-lg z-20 font-sans">
      {/* Top Header matching mockup */}
      <div className="p-4 border-b border-slate-200 flex items-start justify-between bg-white shrink-0">
        <div className="space-y-1 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Matter Inspection & Audit
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              {data.id}
            </span>
          </div>
          <h2 className="text-[14px] font-bold text-slate-900 leading-snug">
            {type === 'lod'
              ? data.title
              : type === 'agreement'
              ? data.title
              : type === 'property'
              ? data.propertyName
              : data.trademarkName}
          </h2>
        </div>
        <button
          onClick={() => setIsInspectionDrawerOpen(false)}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close Drawer"
          aria-label="Close Inspection Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Persistent Saved Toast Alert directly beneath Header */}
      {showSavedToast && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-medium flex items-center justify-between shadow-xs animate-in fade-in duration-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{toastMessage || 'Changes saved successfully!'}</span>
          </div>
          <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
            Committed
          </span>
        </div>
      )}

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Amber Stage & Days Remaining Progress Banner */}
        <div className="p-3.5 rounded-md bg-[#fff9ed] border border-[#fde68a] text-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-[13px]">
              <Hourglass className="w-4 h-4 text-amber-600 animate-spin-slow shrink-0" />
              <span>
                {type === 'lod'
                  ? 'Active Inquiry & Fact-Finding'
                  : type === 'agreement'
                  ? 'Agreement Processing Cycle'
                  : type === 'property'
                  ? 'Property Conveyancing Milestone'
                  : 'IP Trademark Protection Cycle'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-amber-900 font-bold bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
              {daysRemaining !== null
                ? daysRemaining < 0
                  ? `${Math.abs(daysRemaining)}d Overdue`
                  : daysRemaining === 0
                  ? 'Due Today'
                  : `${daysRemaining}d Remaining`
                : 'No Deadline'}
            </span>
          </div>

          <div className="text-[12px] font-medium text-slate-700 flex items-center justify-between pt-0.5 border-t border-amber-200/60 mt-1">
            <span>
              {type === 'lod'
                ? data.currentFactFindingStep || `Stage: ${stage}`
                : type === 'agreement'
                ? `Stage: ${stage}`
                : type === 'property'
                ? `Stage: ${stage}`
                : `Status: ${stage}`}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>Target:</span>
              <input
                type="date"
                value={targetDateDraft}
                onChange={(e) => setTargetDateDraft(e.target.value)}
                className="px-1.5 py-0.5 text-[11px] font-mono bg-white border border-amber-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                title="Edit statutory / target deadline date"
              />
            </div>
          </div>
        </div>

        {/* Section: External Counsel & Matter Handover Status */}
        <div className="p-3 rounded-md bg-slate-50/70 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>External Counsel & Matter Handover</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingFirm((prev) => !prev)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingFirm ? 'Done Editing' : 'Change Firm'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <span className="text-[11px] text-slate-500 block">Claimant & Adverse Firm:</span>
              <span className="font-semibold text-slate-900 block leading-tight">
                {type === 'lod'
                  ? data.claimantName
                  : type === 'agreement'
                  ? data.counterpartyName
                  : type === 'property'
                  ? data.counterparty
                  : data.jurisdiction}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {type === 'lod' ? `(${data.adverseCounsel})` : ''}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Appointed Litigation / Advisory Firm:</span>
              {!isEditingFirm ? (
                <span className="font-semibold text-slate-900 block leading-tight">
                  {getResolvedFirm()}
                </span>
              ) : (
                <div className="space-y-1.5 mt-1">
                  <select
                    value={appointedFirm}
                    onChange={(e) => setAppointedFirm(e.target.value)}
                    className="w-full text-[11px] p-1.5 rounded border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-blue-600"
                  >
                    {LAW_FIRM_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f === 'Others' ? 'Others (Specify External Firm...)' : f}
                      </option>
                    ))}
                  </select>

                  {appointedFirm === 'Others' && (
                    <input
                      type="text"
                      value={customFirm}
                      onChange={(e) => setCustomFirm(e.target.value)}
                      placeholder="Specify law firm's name..."
                      className="w-full text-[11px] p-1.5 rounded border border-blue-400 bg-blue-50/40 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white"
                      autoFocus
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Fee / Retainer Invoice:</span>
              <span className="font-bold text-slate-900 font-mono text-[13px]">
                {type === 'lod' &&
                (getResolvedFirm().toLowerCase().includes('in-house') ||
                  getResolvedFirm().toLowerCase().includes('internal'))
                  ? 'RM 0.00 (In-House Handled)'
                  : invoiceAmount > 0
                  ? formatCurrency(invoiceAmount)
                  : data.invoice?.amount
                  ? formatCurrency(data.invoice.amount)
                  : 'RM 28,000 (Fee Quoted)'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Payment Status:</span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                  type === 'lod' &&
                  (getResolvedFirm().toLowerCase().includes('in-house') ||
                    getResolvedFirm().toLowerCase().includes('internal'))
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : paymentStatus === 'Paid by Finance'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : paymentStatus === 'Submitted to Finance'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {type === 'lod' &&
                (getResolvedFirm().toLowerCase().includes('in-house') ||
                  getResolvedFirm().toLowerCase().includes('internal'))
                  ? 'No Invoice Required (In-House)'
                  : paymentStatus}
              </span>
            </div>
          </div>

          {/* Litigation Fee Remittance Action Button */}
          <div className="pt-1">
            <button
              onClick={handleSendRemittance}
              className="w-full py-1.5 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Remittance Receipt to Finance</span>
            </button>
          </div>
        </div>

        {/* Section: Stage Progression Selector */}
        <div className="p-3 rounded-md bg-white border border-slate-200 space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
            Update Workflow Stage
          </label>
          {type === 'lod' && (
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 font-medium focus:ring-1 focus:ring-blue-600 focus:bg-white"
            >
              <option value="LOD Received">LOD Received</option>
              <option value="Fact-Finding with Stakeholders">Fact-Finding with Stakeholders</option>
              <option value="Response Drafting">Response Drafting</option>
              <option value="Response Sent - Closed">Response Sent - Closed</option>
              <option value="Escalated to Litigation">Escalated to Litigation</option>
            </select>
          )}

          {type === 'agreement' && (
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 font-medium focus:ring-1 focus:ring-blue-600 focus:bg-white"
            >
              <option value="LDRF Received / Drafting">a. LDRF Received / Drafting</option>
              <option value="Internal Stakeholder Review">b. Internal Stakeholder Review</option>
              <option value="Sent to Counterparty (External Review)">c. Sent to Counterparty (External Review)</option>
              <option value="Reverted to Legal for Finalisation">d. Reverted to Legal for Finalisation</option>
              <option value="Executed / Signed">e. Executed / Signed</option>
              <option value="Active / Pending Renewal">f. Active / Pending Renewal</option>
            </select>
          )}

          {type === 'property' && (
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 font-medium focus:ring-1 focus:ring-blue-600 focus:bg-white"
            >
              <option value="Initial Drafting">Initial Drafting</option>
              <option value="SPA-Tenancy Signed">SPA-Tenancy Signed</option>
              <option value="Pending Consent-State Approval">Pending Consent-State Approval</option>
              <option value="Stamped-Completed">Stamped-Completed</option>
            </select>
          )}

          {type === 'ip' && (
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 font-medium focus:ring-1 focus:ring-blue-600 focus:bg-white"
            >
              <option value="Pending">Pending Examination</option>
              <option value="Registered">Registered Mark</option>
              <option value="Refused">Refused / Opposed</option>
            </select>
          )}
        </div>

        {/* Section: Assigned In-House Counsel */}
        <div className="p-3 rounded-md bg-white border border-slate-200 space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
            Assigned In-House Legal Counsel
          </label>
          <select
            value={assignedCounselDraft}
            onChange={(e) => setAssignedCounselDraft(e.target.value)}
            className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 font-medium focus:ring-1 focus:ring-blue-600 focus:bg-white"
          >
            <option value="Elisa Zahari (In-House)">Elisa Zahari (Lead Counsel - Media Prima)</option>
            <option value="Ahmad Fadzli (In-House)">Ahmad Fadzli (Senior Legal Counsel)</option>
            <option value="Siti Aminah (In-House)">Siti Aminah (Legal Counsel - Commercial)</option>
            <option value="Tan Wei Lun (In-House)">Tan Wei Lun (Conveyancing & IP Counsel)</option>
          </select>
        </div>

        {/* Section: Case History & Handover Notes */}
        <div className="p-3 rounded-md bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Case History & Handover Notes
            </label>
            <span className="text-[10px] text-slate-400">Live Saved</span>
          </div>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log attorney notes, fact-finding interview takeaways, counterparty positions..."
            className="w-full p-2.5 text-[12px] rounded border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none text-slate-800 font-sans leading-relaxed"
          />
        </div>

        {/* Section: Supporting Documents & Annexures */}
        <div className="p-3 rounded-md bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <Paperclip className="w-3.5 h-3.5 text-blue-600" />
              <span>Supporting Documents ({documentsDraft.length})</span>
            </div>
            <label className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
              <Plus className="w-3 h-3" />
              <span>Attach File</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
              />
            </label>
          </div>

          {documentsDraft.length > 0 ? (
            <div className="space-y-1.5">
              {documentsDraft.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-semibold text-slate-800 truncate">
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {doc.sizeFormatted} &bull; {doc.category || 'Attached Document'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {doc.dataUrl && (
                      <a
                        href={doc.dataUrl}
                        download={doc.name}
                        className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setDocumentsDraft((prev) => prev.filter((d) => d.id !== doc.id))}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center border border-dashed border-slate-200 rounded-md bg-slate-50/50">
              <p className="text-[11px] text-slate-400">No documents attached yet.</p>
              <label className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Upload Annexure / Statement</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                />
              </label>
            </div>
          )}
        </div>

        {/* Inquired Stakeholders (for LODs) */}
        {type === 'lod' && data.inquiredStakeholders && (
          <div className="p-3 rounded-md bg-slate-50/50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Internal Stakeholders Inquired
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.inquiredStakeholders.map((sh: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs"
                >
                  {sh}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Finance Tax Invoice Management */}
        <div className="p-3 rounded-md bg-white border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>External Invoice & Finance Status</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2024-..."
                className="w-full px-2 py-1 text-[11px] font-mono rounded border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                Invoice Amount (MYR)
              </label>
              <input
                type="number"
                value={invoiceAmount || ''}
                onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                placeholder="28000"
                className="w-full px-2 py-1 text-[11px] font-mono rounded border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                Finance Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-2 py-1 text-[11px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600"
              >
                <option value="Pending Invoice">Pending Invoice</option>
                <option value="Invoice Received">Invoice Received</option>
                <option value="Submitted to Finance">Submitted to Finance</option>
                <option value="Paid by Finance">Paid by Finance</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                Date Submitted to Finance
              </label>
              <input
                type="date"
                value={dateSubmittedToFinance}
                onChange={(e) => setDateSubmittedToFinance(e.target.value)}
                className="w-full px-2 py-1 text-[11px] font-mono rounded border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions matching mockup and preserving selector */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={() => setIsInspectionDrawerOpen(false)}
          className="px-4 py-2 rounded text-[12px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
        >
          Close
        </button>
        <button
          onClick={() => handleSaveChanges()}
          disabled={isSaving}
          className={`px-5 py-2 rounded text-[12px] font-semibold transition-all shadow-xs cursor-pointer font-sans flex items-center gap-1.5 ${
            isSaved
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-200 scale-102'
              : isSaving
              ? 'bg-slate-700 text-white cursor-wait opacity-80'
              : 'bg-[#0b1c30] text-white hover:bg-slate-800 active:scale-98'
          }`}
          title="Save all matter updates to legal operations portfolio"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Saving...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5] text-white" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
