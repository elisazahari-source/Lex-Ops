import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import { X, PlusCircle, AlertCircle, FileCheck2 } from 'lucide-react';

export const QuickLdrfModal: React.FC = () => {
  const { isQuickLdrfOpen, setIsQuickLdrfOpen, addAgreement, setActiveTab } = useLegal();

  const [title, setTitle] = useState('');
  const [agreementType, setAgreementType] = useState('Master Services Agreement');
  const [customAgreementType, setCustomAgreementType] = useState('');
  const [stakeholderName, setStakeholderName] = useState('');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [expectedExpiryDate, setExpectedExpiryDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isQuickLdrfOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!stakeholderName.trim()) newErrors.stakeholderName = 'Stakeholder is required';
    if (!counterpartyName.trim()) newErrors.counterpartyName = 'Counterparty is required';
    if (!expectedExpiryDate.trim()) newErrors.expectedExpiryDate = 'Expiry date is required';
    if (agreementType === 'Others' && !customAgreementType.trim()) {
      newErrors.customAgreementType = 'Please specify the agreement type';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedType = agreementType === 'Others' ? customAgreementType.trim() : agreementType;

    addAgreement({
      title,
      agreementType: resolvedType,
      stakeholderName,
      stakeholderDepartment: 'Internal Stakeholder',
      counterpartyName,
      requestDate: new Date().toISOString().split('T')[0],
      expectedExpiryDate,
      renewalPromptLeadDays: 60,
      stage: 'LDRF Received / Drafting',
      assignedCounsel: 'Elisa Zahari (In-House)',
      notes: 'Logged via Quick LDRF Submit.',
    });

    setIsQuickLdrfOpen(false);
    setActiveTab('agreements');
    setTitle('');
    setStakeholderName('');
    setCounterpartyName('');
    setExpectedExpiryDate('');
    setCustomAgreementType('');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-fadeIn">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/70">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-700" />
            <h2 className="text-[14px] font-bold text-slate-900">
              Quick LDRF Intake Form (v4.2)
            </h2>
          </div>
          <button
            onClick={() => setIsQuickLdrfOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Agreement Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Talent Booking & Synchronization Deed"
              className="w-full text-[12.5px] p-2 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600"
            />
            {errors.title && (
              <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3" /> {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Agreement Type
              </label>
              <select
                value={agreementType}
                onChange={(e) => setAgreementType(e.target.value)}
                className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value="Master Services Agreement">Master Services Agreement</option>
                <option value="Broadcasting Rights">Broadcasting Rights</option>
                <option value="Software License">Software License</option>
                <option value="NDA">Non-Disclosure Agreement</option>
                <option value="Supply Contract">Supply Contract</option>
                <option value="Others">Others (Please Specify)</option>
              </select>
              {agreementType === 'Others' && (
                <div className="mt-1.5 space-y-1 animate-fadeIn">
                  <label className="text-[10px] font-semibold text-blue-700 block">
                    Specify Agreement Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customAgreementType}
                    onChange={(e) => setCustomAgreementType(e.target.value)}
                    placeholder="e.g. Talent Deed, Co-production..."
                    className="w-full text-[12px] p-1.5 rounded border border-blue-300 bg-blue-50/50 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  {errors.customAgreementType && (
                    <p className="text-[10.5px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.customAgreementType}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Counterparty Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={counterpartyName}
                onChange={(e) => setCounterpartyName(e.target.value)}
                placeholder="e.g. Media Corp Asia"
                className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 focus:bg-white"
              />
              {errors.counterpartyName && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.counterpartyName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Internal Requestor / Stakeholder <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={stakeholderName}
                onChange={(e) => setStakeholderName(e.target.value)}
                placeholder="e.g. Nadia Sulaiman"
                className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 focus:bg-white"
              />
              {errors.stakeholderName && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.stakeholderName}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Expected Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expectedExpiryDate}
                onChange={(e) => setExpectedExpiryDate(e.target.value)}
                className="w-full text-[12px] p-2 rounded border border-slate-200 bg-slate-50 font-mono"
              />
              {errors.expectedExpiryDate && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" /> {errors.expectedExpiryDate}
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsQuickLdrfOpen(false)}
              className="px-4 py-2 rounded text-[12px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded text-[12px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              Submit LDRF Intake
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
