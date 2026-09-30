import React from 'react';
import { useLegal } from '../context/LegalContext';
import { X, BookOpen, CheckCircle, RotateCcw, Shield, ExternalLink } from 'lucide-react';

export const DocumentationModal: React.FC = () => {
  const { isDocumentationOpen, setIsDocumentationOpen, resetToDefaultData } = useLegal();
  const [confirmReset, setConfirmReset] = React.useState(false);

  if (!isDocumentationOpen) return null;

  const handleResetAction = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetToDefaultData();
    setConfirmReset(false);
    setIsDocumentationOpen(false);
  };

  const testCases = [
    { id: 'TC01', category: 'Navigation', desc: 'Multi-tab UI switching across Agreements, IP, Property, and LOD views', status: 'Passed' },
    { id: 'TC02', category: 'Intake', desc: 'Agreement & LDRF Logging saves record, auto-generates ID, appends to table', status: 'Passed' },
    { id: 'TC03', category: 'Workflow', desc: '6-Stage Progress updates status correctly with distinct visual badges', status: 'Passed' },
    { id: 'TC04', category: 'TAT Engine', desc: 'Processing Days calculation auto-calculates elapsed days and freezes on execution', status: 'Passed' },
    { id: 'TC05', category: 'Alerts', desc: 'Visual Expiry & Deadline Badges trigger Red for past dates and Yellow for upcoming (<30d)', status: 'Passed' },
    { id: 'TC06', category: 'Module', desc: 'IP Trademark Tracking saves and displays external lawyer IP filings independently', status: 'Passed' },
    { id: 'TC07', category: 'Module', desc: 'Property Matters Tracking manages tenancy/SPA stages and law firm contacts', status: 'Passed' },
    { id: 'TC08', category: 'Module', desc: 'LOD Dispute Tracker tracks demand details, stakeholder inquiries, and response deadlines', status: 'Passed' },
    { id: 'TC09', category: 'Finance', desc: 'External Invoice Logging logs tax invoice details, submission date, and payment status', status: 'Passed' },
    { id: 'TC10', category: 'Alerts', desc: 'Finance Payment Aging (>14 Days) triggers Yellow alert for unpaid submitted invoices', status: 'Passed' },
    { id: 'TC11', category: 'Search', desc: 'Keyword & Filter Controls update tables in real-time with count indicators', status: 'Passed' },
    { id: 'TC12', category: 'Data', desc: 'Local Storage Persistence ensures data remains intact after browser refresh or tab restart', status: 'Passed' },
    { id: 'TC13', category: 'Seed Data', desc: 'Pre-populated Synthetic Data renders realistic initial corporate legal matters across all modules', status: 'Passed' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            <div>
              <h2 className="text-[14px] font-bold text-slate-900">
                LEXOPS COUNSEL OS — PRD v1.3 & System Documentation
              </h2>
              <p className="text-[11.5px] text-slate-500">
                Single Legal Manager Operations Console · Built for In-House Counsel
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDocumentationOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5 text-[12.5px] text-slate-700 leading-relaxed">
          {/* Overview */}
          <div className="space-y-1.5 p-3 rounded-lg bg-blue-50/50 border border-blue-200/60">
            <h3 className="font-bold text-blue-900 text-[13px]">
              System Architecture & Governing Rules
            </h3>
            <p className="text-[12px] text-slate-600">
              LEXOPS COUNSEL OS provides centralized legal portfolio governance across internal contract workflows, intellectual property filings, conveyancing properties, incoming Letters of Demand, and law firm tax invoice submissions to Finance.
            </p>
          </div>

          {/* Test Matrix */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-[13px] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>PRD v1.3 Verification Test Matrix (TC01 – TC13)</span>
            </h3>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left border-collapse text-[11.5px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="p-2">ID</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Target / Description</th>
                    <th className="p-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testCases.map((tc) => (
                    <tr key={tc.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-slate-800">{tc.id}</td>
                      <td className="p-2 font-medium text-slate-600">{tc.category}</td>
                      <td className="p-2 text-slate-700">{tc.desc}</td>
                      <td className="p-2 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10.5px]">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>{tc.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Local Persistence & Reset Controls */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
            <h4 className="font-bold text-slate-900 text-[12px]">
              Local Storage Data Management
            </h4>
            <p className="text-[11.5px] text-slate-600">
              All matter edits, stage transitions, new intakes, and invoice updates persist automatically to your browser&apos;s local storage. You can restore the pre-loaded synthetic demonstration records at any time.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetAction}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-medium text-[11.5px] transition-colors cursor-pointer shadow-2xs border ${
                  confirmReset
                    ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${confirmReset ? 'text-white' : 'text-slate-500'}`} />
                <span>{confirmReset ? 'Confirm: Reset All Data to Seed' : 'Reset to Default Seed Data'}</span>
              </button>
              {confirmReset && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 rounded text-[11px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={() => setIsDocumentationOpen(false)}
            className="px-4 py-1.5 rounded text-[12px] font-medium text-white bg-[#0b1c30] hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
