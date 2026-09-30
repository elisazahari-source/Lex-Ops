import React, { useState, useEffect, useRef } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  X,
  FileText,
  Scale,
  Building2,
  BookmarkCheck,
  AlertCircle,
  UploadCloud,
  FileCheck,
  Trash2,
  Send,
  MessageSquare,
  CheckCircle,
  Check,
} from 'lucide-react';
import { SupportingDocument, IpStatus, PropertyStage, IpType } from '../types/legal';

export const NewIntakeModal: React.FC = () => {
  const {
    isNewIntakeModalOpen,
    setIsNewIntakeModalOpen,
    newIntakeDefaultType,
    addAgreement,
    addLod,
    addProperty,
    addIp,
    setActiveTab,
  } = useLegal();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTabLocal, setActiveTabLocal] = useState<'agreement' | 'lod' | 'property' | 'ip'>('agreement');

  useEffect(() => {
    if (newIntakeDefaultType) {
      setActiveTabLocal(newIntakeDefaultType);
    }
  }, [newIntakeDefaultType, isNewIntakeModalOpen]);

  // Enterprise Department options + Others
  const standardDepartments = [
    'Commercial & Sales',
    'IT & Engineering',
    'Group Finance',
    'Human Resources',
    'Content Production & Editorial',
    'Broadcast Operations',
    'Facilities & Property',
    'Procurement & Supply Chain',
    'Corporate Communications',
    'Executive Office',
    'Others',
  ];

  // 1. Agreement Form States
  const [isLdrfMode, setIsLdrfMode] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [agreementType, setAgreementType] = useState('Master Services Agreement');
  const [customAgreementType, setCustomAgreementType] = useState('');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [stakeholderName, setStakeholderName] = useState('');
  const [stakeholderDepartment, setStakeholderDepartment] = useState('Commercial & Sales');
  const [customDepartment, setCustomDepartment] = useState('');
  const [requestDate, setRequestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedExpiryDate, setExpectedExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [renewalPromptLeadDays, setRenewalPromptLeadDays] = useState(60);
  const [contractValue, setContractValue] = useState<number>(0);
  const [agreementRemarks, setAgreementRemarks] = useState('');

  // 2. LOD Form States
  const [lodClaimRef, setLodClaimRef] = useState('');
  const [lodTitle, setLodTitle] = useState('');
  const [lodClaimant, setLodClaimant] = useState('');
  const [lodAdverseCounsel, setLodAdverseCounsel] = useState('');
  const [lodStakeholderName, setLodStakeholderName] = useState('');
  const [lodStakeholderDepartment, setLodStakeholderDepartment] = useState('IT & Engineering');
  const [lodCustomDepartment, setLodCustomDepartment] = useState('');
  const [lodDateReceived, setLodDateReceived] = useState(() => new Date().toISOString().split('T')[0]);
  const [lodDeadlineOption, setLodDeadlineOption] = useState<'None' | '7 Days' | '14 Days' | 'Others'>('14 Days');
  const [lodCustomDeadline, setLodCustomDeadline] = useState('');
  const [lodResponseDeadline, setLodResponseDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [lodClaimAmount, setLodClaimAmount] = useState<number>(0);
  const [lodAppointedFirm, setLodAppointedFirm] = useState(
    'In-House Legal (Handled Internally, No External Firm Required)'
  );
  const [lodCustomFirm, setLodCustomFirm] = useState('');
  const [lodRemarks, setLodRemarks] = useState('');

  const handleDeadlineOptionChange = (option: 'None' | '7 Days' | '14 Days' | 'Others') => {
    setLodDeadlineOption(option);
    const baseDate = new Date(lodDateReceived || new Date());
    if (option === '7 Days') {
      baseDate.setDate(baseDate.getDate() + 7);
      setLodResponseDeadline(baseDate.toISOString().split('T')[0]);
    } else if (option === '14 Days') {
      baseDate.setDate(baseDate.getDate() + 14);
      setLodResponseDeadline(baseDate.toISOString().split('T')[0]);
    } else if (option === 'None') {
      setLodResponseDeadline('');
    }
  };

  // 3. Property Form States
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propType, setPropType] = useState<
    'Tenancy' | 'Lease' | 'Acquisition' | 'Disposal' | 'Perfection of Title' | 'Others'
  >('Tenancy');
  const [propCustomType, setPropCustomType] = useState('');
  const [propCounterparty, setPropCounterparty] = useState('');
  const [propStakeholder, setPropStakeholder] = useState('');
  const [propDepartment, setPropDepartment] = useState('Facilities & Property');
  const [propCustomDepartment, setPropCustomDepartment] = useState('');
  const [propFirm, setPropFirm] = useState('Messrs. Shearn Delamore & Co');
  const [propContact, setPropContact] = useState('');
  const [propTargetDate, setPropTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [propValue, setPropValue] = useState<number>(0);
  const [propRemarks, setPropRemarks] = useState('');

  // 4. IP Form States
  const [ipType, setIpType] = useState<'Trademark' | 'Patent'>('Trademark');
  const [tmName, setTmName] = useState('');
  const [tmRegNo, setTmRegNo] = useState('');
  const [tmClass, setTmClass] = useState('Class 38 (Broadcasting) & Class 41');
  const [tmStakeholder, setTmStakeholder] = useState('');
  const [tmDepartment, setTmDepartment] = useState('Commercial & Sales');
  const [tmCustomDepartment, setTmCustomDepartment] = useState('');
  const [tmFilingDate, setTmFilingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tmExpiryDate, setTmExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 10);
    return d.toISOString().split('T')[0];
  });
  const [tmStatus, setTmStatus] = useState<IpStatus>('Pending');
  const [tmFirm, setTmFirm] = useState('Messrs. Skrine (IP Practice)');
  const [tmContact, setTmContact] = useState('');
  const [tmJurisdiction, setTmJurisdiction] = useState('Malaysia (MyIPO)');
  const [tmRemarks, setTmRemarks] = useState('');

  // Supporting Documents ONLY for LDRFs (Requirement 1)
  const [documents, setDocuments] = useState<SupportingDocument[]>([
    {
      id: 'doc-seed-1',
      name: 'Signed_LDRF_Requisition_Form.pdf',
      size: 1.8 * 1024 * 1024,
      sizeFormatted: '1.8 MB',
      type: 'application/pdf',
      category: 'Optional',
      uploadedAt: '2024-11-28 10:14',
    },
    {
      id: 'doc-seed-2',
      name: 'Vendor_Master_Agreement_Draft_v1.2.docx',
      size: 1.4 * 1024 * 1024,
      sizeFormatted: '1.4 MB',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      category: 'Redline',
      uploadedAt: '2024-11-28 10:18',
    },
  ]);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isNewIntakeModalOpen) return null;

  // File Upload Logic with 2MB strict limit (Only for LDRFs)
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    const maxSizeBytes = 2 * 1024 * 1024; // 2MB limit
    const rejectedFiles: string[] = [];

    Array.from(fileList).forEach((file) => {
      if (file.size > maxSizeBytes) {
        rejectedFiles.push(
          `"${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB exceeds 2MB limit)`
        );
        return;
      }

      const formattedSize =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(0)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const reader = new FileReader();
      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date();
      const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      reader.onload = () => {
        const docObj: SupportingDocument = {
          id: docId,
          name: file.name,
          size: file.size,
          sizeFormatted: formattedSize,
          type: file.type || 'application/octet-stream',
          category: file.type.includes('pdf')
            ? 'Scanned & Authenticated'
            : file.type.startsWith('image/')
            ? 'Image Proof'
            : 'Supporting Annexure',
          uploadedAt: timeStr,
          dataUrl: reader.result as string,
        };

        setDocuments((prev) => [...prev, docObj]);
      };

      reader.readAsDataURL(file);
    });

    if (rejectedFiles.length > 0) {
      setUploadError(
        `Upload blocked: ${rejectedFiles.join(', ')}. Each file must be under 2MB.`
      );
    }
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Submit Handler 1: Agreement
  const handleSubmitAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Agreement Title is required.';
    if (!counterpartyName.trim()) newErrors.counterpartyName = 'Counterparty Name is required.';
    if (!stakeholderName.trim()) newErrors.stakeholderName = 'Requesting Stakeholder is required.';
    if (stakeholderDepartment === 'Others' && !customDepartment.trim()) {
      newErrors.customDepartment = 'Please specify the internal department under Others.';
    }
    if (!requestDate.trim()) newErrors.requestDate = 'Request Date is required.';
    if (!expectedExpiryDate.trim()) newErrors.expectedExpiryDate = 'Expected Expiry Date is required.';
    if (agreementType === 'Others' && !customAgreementType.trim()) {
      newErrors.customAgreementType = 'Please specify the agreement type under Others.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedAgreementType = agreementType === 'Others' ? customAgreementType.trim() : agreementType;
    const resolvedDept = stakeholderDepartment === 'Others' ? customDepartment.trim() : stakeholderDepartment;

    addAgreement({
      title: title.trim(),
      agreementType: resolvedAgreementType,
      stakeholderName: stakeholderName.trim(),
      stakeholderDepartment: resolvedDept,
      counterpartyName: counterpartyName.trim(),
      requestDate,
      expectedExpiryDate,
      renewalPromptLeadDays: Number(renewalPromptLeadDays) || 60,
      stage: 'LDRF Received / Drafting',
      contractValue: Number(contractValue) || 0,
      currency: 'MYR',
      assignedCounsel: 'Elisa Zahari (In-House)',
      notes: agreementRemarks.trim() || 'New LDRF intake logged via modal.',
      remarks: agreementRemarks.trim() || 'New LDRF intake logged.',
      documents: documents.length > 0 ? documents : undefined,
    });

    setIsNewIntakeModalOpen(false);
    setActiveTab('agreements');
    resetForms();
  };

  // Submit Handler 2: LOD
  const handleSubmitLod = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!lodClaimRef.trim()) newErrors.lodClaimRef = 'Claim Ref is required.';
    if (!lodClaimant.trim()) newErrors.lodClaimant = 'Claimant Name is required.';
    if (!lodStakeholderName.trim()) newErrors.lodStakeholderName = 'Requesting Stakeholder is required.';
    if (lodStakeholderDepartment === 'Others' && !lodCustomDepartment.trim()) {
      newErrors.lodCustomDepartment = 'Please specify the internal department under Others.';
    }
    if (!lodDateReceived.trim()) newErrors.lodDateReceived = 'Date Received is required.';
    if (lodDeadlineOption === 'Others' && !lodCustomDeadline.trim()) {
      newErrors.lodCustomDeadline = 'Please specify the custom response deadline.';
    }
    if (lodAppointedFirm === 'Others' && !lodCustomFirm.trim()) {
      newErrors.lodCustomFirm = "Please specify the law firm's name.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalDeadline =
      lodDeadlineOption === 'None'
        ? 'None (Advisory)'
        : lodDeadlineOption === 'Others'
        ? lodCustomDeadline.trim()
        : lodResponseDeadline || `${lodDeadlineOption} from receipt`;

    const resolvedDept =
      lodStakeholderDepartment === 'Others' ? lodCustomDepartment.trim() : lodStakeholderDepartment;

    const resolvedAppointedFirm =
      lodAppointedFirm === 'Others'
        ? (lodCustomFirm.trim().toLowerCase().startsWith('messrs')
            ? lodCustomFirm.trim()
            : `Messrs. ${lodCustomFirm.trim()}`)
        : lodAppointedFirm.trim() || 'Pending Litigation Appointment';

    addLod({
      claimRef: lodClaimRef.trim(),
      title: lodTitle.trim() || `${lodClaimant.trim()} Demand Notice`,
      claimantName: lodClaimant.trim(),
      adverseCounsel: lodAdverseCounsel.trim() || 'Messrs. Halim Hong & Koh',
      appointedLitigationFirm: resolvedAppointedFirm,
      briefClaimSummary: lodRemarks.trim() || 'Demand notice logged via Matter Intake.',
      claimAmount: Number(lodClaimAmount) || 0,
      currency: 'MYR',
      dateReceived: lodDateReceived,
      responseDeadlineDate: finalDeadline,
      responseDeadlineOption: lodDeadlineOption,
      customResponseDeadline: lodDeadlineOption === 'Others' ? lodCustomDeadline.trim() : undefined,
      stakeholderName: lodStakeholderName.trim(),
      stakeholderDepartment: resolvedDept,
      stage: 'LOD Received',
      currentFactFindingStep: 'Stage 1: Internal Intake & Department Identification',
      inquiredStakeholders: [lodStakeholderName.trim()],
      responseNotes: lodRemarks.trim() || `Dispute logged. Stakeholder ${lodStakeholderName.trim()} (${resolvedDept}) identified.`,
      remarks: lodRemarks.trim() || 'Dispute logged.',
    });

    setIsNewIntakeModalOpen(false);
    setActiveTab('lods');
    resetForms();
  };

  // Submit Handler 3: Property
  const handleSubmitProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!propName.trim()) newErrors.propName = 'Property Name is required.';
    if (!propFirm.trim()) newErrors.propFirm = 'External Law Firm is required.';
    if (!propStakeholder.trim()) newErrors.propStakeholder = 'Requesting Stakeholder is required.';
    if (propType === 'Others' && !propCustomType.trim()) {
      newErrors.propCustomType = 'Please specify the transaction type under Others.';
    }
    if (propDepartment === 'Others' && !propCustomDepartment.trim()) {
      newErrors.propCustomDepartment = 'Please specify the internal department under Others.';
    }
    if (!propTargetDate.trim()) newErrors.propTargetDate = 'Target Completion Date is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedDept = propDepartment === 'Others' ? propCustomDepartment.trim() : propDepartment;
    const resolvedPropType = propType === 'Others' ? propCustomType.trim() : propType;

    addProperty({
      propertyName: propName.trim(),
      propertyAddress: propAddress.trim() || 'Wilayah Persekutuan Kuala Lumpur',
      transactionType: resolvedPropType,
      counterparty: propCounterparty.trim() || 'Counterparty',
      internalStakeholder: propStakeholder.trim(),
      stakeholderDepartment: resolvedDept,
      externalLawFirm: propFirm.trim(),
      lawyerContact: propContact.trim() || 'Conveyancing Partner',
      targetCompletionDate: propTargetDate,
      stage: 'Initial Drafting',
      rentalOrValueAmount: Number(propValue) || 0,
      currency: 'MYR',
      notes: propRemarks.trim() || `Property matter (${resolvedPropType}) logged.`,
      remarks: propRemarks.trim() || `Property matter (${resolvedPropType}) logged.`,
    });

    setIsNewIntakeModalOpen(false);
    setActiveTab('property');
    resetForms();
  };

  // Submit Handler 4: Intellectual Property (Trademark or Patent)
  const handleSubmitIp = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!tmName.trim()) {
      newErrors.tmName =
        ipType === 'Patent' ? 'Patent / Invention Title is required.' : 'Trademark Name is required.';
    }
    if (!tmFirm.trim()) newErrors.tmFirm = 'External Law Firm is required.';
    if (!tmStakeholder.trim()) newErrors.tmStakeholder = 'Requesting Stakeholder is required.';
    if (tmDepartment === 'Others' && !tmCustomDepartment.trim()) {
      newErrors.tmCustomDepartment = 'Please specify the internal department under Others.';
    }
    if (!tmExpiryDate.trim()) {
      newErrors.tmExpiryDate =
        ipType === 'Patent' ? 'Grant / Renewal Date is required.' : 'Renewal / Expiry Date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const resolvedDept = tmDepartment === 'Others' ? tmCustomDepartment.trim() : tmDepartment;

    addIp({
      ipType: ipType,
      trademarkName: tmName.trim(),
      registrationNumber:
        tmRegNo.trim() ||
        (ipType === 'Patent'
          ? `MY-PI${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
          : `TM${new Date().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}`),
      niceClass:
        tmClass.trim() ||
        (ipType === 'Patent'
          ? 'H04N 21/43 (Video Distribution Architecture)'
          : 'Class 38 (Broadcasting) & Class 41'),
      filingDate: tmFilingDate,
      expiryRenewalDate: tmExpiryDate,
      status: tmStatus,
      stakeholderName: tmStakeholder.trim(),
      stakeholderDepartment: resolvedDept,
      externalLawFirm: tmFirm.trim(),
      lawyerContact: tmContact.trim() || (ipType === 'Patent' ? 'Patent Attorney' : 'IP Specialist Partner'),
      jurisdiction: tmJurisdiction,
      notes: tmRemarks.trim() || `New ${ipType.toLowerCase()} asset logged.`,
      remarks: tmRemarks.trim() || `New ${ipType.toLowerCase()} asset logged.`,
    });

    setIsNewIntakeModalOpen(false);
    setActiveTab('ip');
    resetForms();
  };

  const resetForms = () => {
    setErrors({});
    setTitle('');
    setStakeholderName('');
    setCounterpartyName('');
    setCustomAgreementType('');
    setCustomDepartment('');
    setLodCustomDepartment('');
    setPropCustomDepartment('');
    setTmCustomDepartment('');
    setLodClaimRef('');
    setLodClaimant('');
    setLodCustomDeadline('');
    setLodAppointedFirm('In-House Legal (Handled Internally, No External Firm Required)');
    setLodCustomFirm('');
    setPropName('');
    setPropType('Tenancy');
    setPropCustomType('');
    setTmName('');
    setAgreementRemarks('');
    setLodRemarks('');
    setPropRemarks('');
    setTmRemarks('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-auto animate-fadeIn flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0b1c30] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              L
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">
                New Legal Matter Intake &amp; LDRF Submission
              </h2>
              <p className="text-[12px] text-slate-500 leading-tight mt-0.5">
                Select matter category to open specialized intake form
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNewIntakeModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Specialized Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTabLocal('agreement')}
            className={`flex-1 py-1.5 px-2.5 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTabLocal === 'agreement'
                ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Agreement &amp; LDRF</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabLocal('lod')}
            className={`flex-1 py-1.5 px-2.5 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTabLocal === 'lod'
                ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-red-600" />
            <span>2. LOD Dispute</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabLocal('property')}
            className={`flex-1 py-1.5 px-2.5 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTabLocal === 'property'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>3. Property Matter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabLocal('ip')}
            className={`flex-1 py-1.5 px-2.5 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTabLocal === 'ip'
                ? 'bg-white text-teal-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>4. Intellectual Property</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-800">
          {/* TAB 1: Agreement & LDRF */}
          {activeTabLocal === 'agreement' && (
            <form onSubmit={handleSubmitAgreement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Agreement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Services Agreement for Content Licensing"
                  className="w-full text-[12.5px] p-2 rounded-md border border-slate-300 bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                {errors.title && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {errors.title}
                  </p>
                )}
              </div>

              {/* Agreement Type with Others option & fill-in */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Agreement Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={agreementType}
                    onChange={(e) => setAgreementType(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  >
                    <option value="Master Services Agreement">Master Services Agreement</option>
                    <option value="Non-Disclosure Agreement (NDA)">Non-Disclosure Agreement (NDA)</option>
                    <option value="Software License Agreement">Software License Agreement</option>
                    <option value="Technology Partnership Agreement">Technology Partnership Agreement</option>
                    <option value="Broadcasting Rights Agreement">Broadcasting Rights Agreement</option>
                    <option value="Supply & Service Agreement">Supply & Service Agreement</option>
                    <option value="Telecommunications Lease">Telecommunications Lease</option>
                    <option value="Talent Representation Deed">Talent Representation Deed</option>
                    <option value="Procurement Agreement">Procurement Agreement</option>
                    <option value="Service Level Agreement (SLA)">Service Level Agreement (SLA)</option>
                    <option value="Others">Others (Please Specify)</option>
                  </select>

                  {agreementType === 'Others' && (
                    <div className="mt-1.5 space-y-1 animate-fadeIn">
                      <label className="text-[10.5px] font-semibold text-blue-700 block">
                        Specify Agreement Type under Others <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customAgreementType}
                        onChange={(e) => setCustomAgreementType(e.target.value)}
                        placeholder="e.g. Settlement Deed, Escrow Agreement, Co-production..."
                        className="w-full text-[12px] p-2 rounded-md border border-blue-400 bg-blue-50/40 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                      {errors.customAgreementType && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
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
                    placeholder="e.g. Microsoft Malaysia, Astro..."
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.counterpartyName && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.counterpartyName}
                    </p>
                  )}
                </div>
              </div>

              {/* Requesting Stakeholder and Internal Department with Others option (Requirement 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Requesting Stakeholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={stakeholderName}
                    onChange={(e) => setStakeholderName(e.target.value)}
                    placeholder="e.g. David Zhao"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.stakeholderName && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.stakeholderName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Internal Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stakeholderDepartment}
                    onChange={(e) => setStakeholderDepartment(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  >
                    {standardDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  {stakeholderDepartment === 'Others' && (
                    <div className="mt-1.5 space-y-1 animate-fadeIn">
                      <label className="text-[10.5px] font-semibold text-blue-700 block">
                        Specify Department under Others <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customDepartment}
                        onChange={(e) => setCustomDepartment(e.target.value)}
                        placeholder="e.g. Digital Media, Special Projects, Strategy..."
                        className="w-full text-[12px] p-2 rounded-md border border-blue-400 bg-blue-50/40 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                      {errors.customDepartment && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> {errors.customDepartment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Request Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white font-mono"
                  />
                  {errors.requestDate && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.requestDate}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Target / Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={expectedExpiryDate}
                    onChange={(e) => setExpectedExpiryDate(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white font-mono"
                  />
                  {errors.expectedExpiryDate && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.expectedExpiryDate}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Renewal Notice Lead
                  </label>
                  <select
                    value={renewalPromptLeadDays}
                    onChange={(e) => setRenewalPromptLeadDays(Number(e.target.value))}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  >
                    <option value={30}>30 Days Prior</option>
                    <option value={60}>60 Days Prior</option>
                    <option value={90}>90 Days Prior</option>
                    <option value={120}>120 Days Prior</option>
                  </select>
                </div>
              </div>

              {/* Initial Remarks Field (Requirement 3) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Remarks / Notes (Editable over time)
                </label>
                <textarea
                  rows={2}
                  value={agreementRemarks}
                  onChange={(e) => setAgreementRemarks(e.target.value)}
                  placeholder="Enter initial remarks or notes (e.g. priority commercial review, key deliverables)..."
                  className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Supporting Documents Component - ONLY for LDRFs (Requirement 1) */}
              {renderSupportingDocuments()}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Agreement &amp; Initiate TAT</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Letter of Demand (LOD) - No upload, has department 'Others' & Remarks */}
          {activeTabLocal === 'lod' && (
            <form onSubmit={handleSubmitLod} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Claim Ref / Matter ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lodClaimRef}
                    onChange={(e) => setLodClaimRef(e.target.value)}
                    placeholder="e.g. High Court KL Suit No. WA-22NCC-..."
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.lodClaimRef && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.lodClaimRef}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Dispute Title / Subject
                  </label>
                  <input
                    type="text"
                    value={lodTitle}
                    onChange={(e) => setLodTitle(e.target.value)}
                    placeholder="e.g. Software Licensing Compliance Deficit Claim"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Claimant / Adverse Party <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lodClaimant}
                    onChange={(e) => setLodClaimant(e.target.value)}
                    placeholder="e.g. Oracle Corporation Malaysia / Landlord"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.lodClaimant && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.lodClaimant}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Adverse Law Firm
                  </label>
                  <input
                    type="text"
                    value={lodAdverseCounsel}
                    onChange={(e) => setLodAdverseCounsel(e.target.value)}
                    placeholder="e.g. Messrs. Halim Hong & Koh"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Requesting Stakeholder and Internal Department with Others (Requirement 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Requesting Stakeholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lodStakeholderName}
                    onChange={(e) => setLodStakeholderName(e.target.value)}
                    placeholder="e.g. Head of Infrastructure (CTO Office)"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.lodStakeholderName && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.lodStakeholderName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Internal Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={lodStakeholderDepartment}
                    onChange={(e) => setLodStakeholderDepartment(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  >
                    {standardDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  {lodStakeholderDepartment === 'Others' && (
                    <div className="mt-1.5 space-y-1 animate-fadeIn">
                      <label className="text-[10.5px] font-semibold text-rose-700 block">
                        Specify Department under Others <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={lodCustomDepartment}
                        onChange={(e) => setLodCustomDepartment(e.target.value)}
                        placeholder="e.g. IT Security, Data Center, Network..."
                        className="w-full text-[12px] p-2 rounded-md border border-rose-300 bg-rose-50/40 text-slate-900 focus:bg-white focus:ring-1 focus:ring-rose-600 focus:outline-none"
                      />
                      {errors.lodCustomDepartment && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> {errors.lodCustomDepartment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Response deadline none / 7 days / 14 days / others with custom fill */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Date Received <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={lodDateReceived}
                    onChange={(e) => {
                      setLodDateReceived(e.target.value);
                      const base = new Date(e.target.value || new Date());
                      if (lodDeadlineOption === '7 Days') {
                        base.setDate(base.getDate() + 7);
                        setLodResponseDeadline(base.toISOString().split('T')[0]);
                      } else if (lodDeadlineOption === '14 Days') {
                        base.setDate(base.getDate() + 14);
                        setLodResponseDeadline(base.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white font-mono"
                  />
                  {errors.lodDateReceived && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.lodDateReceived}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Response Deadline Term <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={lodDeadlineOption}
                    onChange={(e) =>
                      handleDeadlineOptionChange(
                        e.target.value as 'None' | '7 Days' | '14 Days' | 'Others'
                      )
                    }
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  >
                    <option value="None">None (Advisory / Non-Statutory)</option>
                    <option value="7 Days">7 Days (Statutory Urgent)</option>
                    <option value="14 Days">14 Days (Standard Statutory)</option>
                    <option value="Others">Others (Custom Deadline)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Calculated Deadline Date
                  </label>
                  {lodDeadlineOption === 'Others' ? (
                    <div>
                      <input
                        type="text"
                        value={lodCustomDeadline}
                        onChange={(e) => setLodCustomDeadline(e.target.value)}
                        placeholder="e.g. 21 days, 2024-12-31, or specific date"
                        className="w-full text-[12px] p-2 rounded-md border border-blue-400 bg-blue-50/30 text-slate-900 focus:bg-white"
                      />
                      {errors.lodCustomDeadline && (
                        <p className="text-[10.5px] text-red-600 mt-0.5">
                          {errors.lodCustomDeadline}
                        </p>
                      )}
                    </div>
                  ) : lodDeadlineOption === 'None' ? (
                    <div className="w-full text-[12px] p-2 rounded-md border border-slate-200 bg-slate-100 text-slate-500 italic">
                      No statutory response deadline
                    </div>
                  ) : (
                    <input
                      type="date"
                      value={lodResponseDeadline}
                      onChange={(e) => setLodResponseDeadline(e.target.value)}
                      className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white font-mono"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Appointed Litigation Firm
                  </label>
                  <select
                    value={lodAppointedFirm}
                    onChange={(e) => {
                      setLodAppointedFirm(e.target.value);
                      if (errors.lodCustomFirm) {
                        setErrors((prev) => ({ ...prev, lodCustomFirm: '' }));
                      }
                    }}
                    className={`w-full text-[12px] p-2 rounded-md border bg-white ${
                      errors.lodCustomFirm ? 'border-red-400' : 'border-slate-300'
                    }`}
                  >
                    <option value="In-House Legal (Handled Internally, No External Firm Required)">
                      In-House Legal (Handled Internally, No External Firm Required)
                    </option>
                    <option value="Pending Litigation Appointment">Pending External Firm Appointment</option>
                    <option value="Messrs. Skrine">Messrs. Skrine</option>
                    <option value="Messrs. Baker McKenzie">Messrs. Baker McKenzie</option>
                    <option value="Messrs. Halim Hong & Koh">Messrs. Halim Hong & Koh</option>
                    <option value="Messrs. Shearn Delamore & Co">Messrs. Shearn Delamore & Co</option>
                    <option value="Messrs. Wong & Partners">Messrs. Wong & Partners</option>
                    <option value="Messrs. Shook Lin & Bok">Messrs. Shook Lin & Bok</option>
                    <option value="Messrs. Zul Rafique & Partners">Messrs. Zul Rafique & Partners</option>
                    <option value="Others">Others (Specify External Firm...)</option>
                  </select>

                  {/* Input field to specify firm's name when Others is selected */}
                  {lodAppointedFirm === 'Others' && (
                    <div className="mt-1.5 space-y-1 animate-fadeIn">
                      <label className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-800 block">
                        Specify Law Firm's Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={lodCustomFirm}
                        onChange={(e) => {
                          setLodCustomFirm(e.target.value);
                          if (errors.lodCustomFirm) {
                            setErrors((prev) => ({ ...prev, lodCustomFirm: '' }));
                          }
                        }}
                        placeholder="e.g. Messrs. Christopher & Lee Ong"
                        className={`w-full text-[12px] p-2 rounded-md border bg-white transition-all ${
                          errors.lodCustomFirm
                            ? 'border-red-400 bg-red-50/20 text-red-900 focus:bg-white'
                            : 'border-blue-400 bg-blue-50/20 text-slate-900 focus:bg-white'
                        }`}
                        autoFocus
                      />
                      {errors.lodCustomFirm && (
                        <p className="text-[10.5px] text-red-600 mt-0.5">
                          {errors.lodCustomFirm}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Informational Callout when In-House is selected */}
                  {lodAppointedFirm.includes('In-House') && (
                    <div className="mt-1.5 p-2 rounded-md bg-emerald-50 border border-emerald-200 flex items-start gap-1.5 text-[11px] text-emerald-900 animate-fadeIn">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-800">In-House Legal Handling:</span>
                        <p className="text-emerald-700 text-[10.5px] mt-0.5 leading-snug">
                          Most LODs are managed in-house by internal legal counsel. No external legal invoices or finance AP payment workflows are required for this matter.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Dispute Claim Exposure (MYR)
                  </label>
                  <input
                    type="number"
                    value={lodClaimAmount || ''}
                    onChange={(e) => setLodClaimAmount(Number(e.target.value))}
                    placeholder="e.g. 840000"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white font-mono"
                  />
                  {lodAppointedFirm.includes('In-House') && (
                    <p className="text-[10.5px] text-slate-400 italic">
                      External legal fee: RM 0.00 (In-House). Disputed exposure is logged for risk monitoring.
                    </p>
                  )}
                </div>
              </div>

              {/* Remarks Field (Requirement 3) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Remarks / Case Notes (Editable over time)
                </label>
                <textarea
                  rows={3}
                  value={lodRemarks}
                  onChange={(e) => setLodRemarks(e.target.value)}
                  placeholder="Enter remarks or dispute takeaways (e.g. preliminary defense grounds, fact-finding schedule)..."
                  className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white focus:ring-1 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Letter of Demand Record</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Property Matter - No upload, has department 'Others' & Remarks */}
          {activeTabLocal === 'property' && (
            <form onSubmit={handleSubmitProperty} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Property Name / Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={propName}
                    onChange={(e) => setPropName(e.target.value)}
                    placeholder="e.g. Balai Berita Bangsar Level 5"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.propName && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.propName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Transaction Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={propType}
                    onChange={(e) => {
                      setPropType(
                        e.target.value as
                          | 'Tenancy'
                          | 'Lease'
                          | 'Acquisition'
                          | 'Disposal'
                          | 'Perfection of Title'
                          | 'Others'
                      );
                      if (errors.propCustomType) {
                        setErrors((prev) => ({ ...prev, propCustomType: '' }));
                      }
                    }}
                    className={`w-full text-[12px] p-2 rounded-md border bg-white font-medium ${
                      errors.propCustomType ? 'border-red-400' : 'border-slate-300'
                    }`}
                  >
                    <option value="Tenancy">Tenancy</option>
                    <option value="Lease">Lease</option>
                    <option value="Acquisition">Acquisition (SPA)</option>
                    <option value="Disposal">Disposal</option>
                    <option value="Perfection of Title">Perfection of Title (Transfer &amp; Charge / Land Office)</option>
                    <option value="Others">Others (Please Specify)</option>
                  </select>

                  {/* Input field to specify custom transaction type when Others is selected */}
                  {propType === 'Others' && (
                    <div className="mt-1.5 space-y-1 animate-fadeIn">
                      <label className="text-[10.5px] font-semibold text-indigo-700 block">
                        Specify Transaction Type under Others <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={propCustomType}
                        onChange={(e) => {
                          setPropCustomType(e.target.value);
                          if (errors.propCustomType) {
                            setErrors((prev) => ({ ...prev, propCustomType: '' }));
                          }
                        }}
                        placeholder="e.g. Easement, Joint Development, Sub-Lease..."
                        className={`w-full text-[12px] p-2 rounded-md border bg-white transition-all ${
                          errors.propCustomType
                            ? 'border-red-400 bg-red-50/20 text-red-900 focus:bg-white'
                            : 'border-indigo-400 bg-indigo-50/20 text-slate-900 focus:bg-white'
                        }`}
                        autoFocus
                      />
                      {errors.propCustomType && (
                        <p className="text-[10.5px] text-red-600 mt-0.5">
                          {errors.propCustomType}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Property Address
                </label>
                <input
                  type="text"
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  placeholder="e.g. No. 31, Jalan Riong, Bangsar, 59100 Kuala Lumpur"
                  className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Counterparty (Landlord / Purchaser / Developer)
                </label>
                <input
                  type="text"
                  value={propCounterparty}
                  onChange={(e) => setPropCounterparty(e.target.value)}
                  placeholder="e.g. Sime Darby Property Bhd"
                  className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                />
              </div>

              {/* Requesting Stakeholder and Internal Department with Others (Requirement 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Requesting Stakeholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={propStakeholder}
                    onChange={(e) => setPropStakeholder(e.target.value)}
                    placeholder="e.g. Facilities & Estate Director"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.propStakeholder && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.propStakeholder}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Internal Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={propDepartment}
                    onChange={(e) => setPropDepartment(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  >
                    {standardDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  {propDepartment === 'Others' && (
                    <div className="mt-1.5 space-y-1 animate-fadeIn">
                      <label className="text-[10.5px] font-semibold text-indigo-700 block">
                        Specify Department under Others <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={propCustomDepartment}
                        onChange={(e) => setPropCustomDepartment(e.target.value)}
                        placeholder="e.g. Asset Management, Land Administration..."
                        className="w-full text-[12px] p-2 rounded-md border border-indigo-300 bg-indigo-50/40 text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                      {errors.propCustomDepartment && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> {errors.propCustomDepartment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    External Conveyancing Firm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={propFirm}
                    onChange={(e) => setPropFirm(e.target.value)}
                    placeholder="e.g. Messrs. Shearn Delamore & Co"
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.propFirm && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.propFirm}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Target Completion Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={propTargetDate}
                    onChange={(e) => setPropTargetDate(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white font-mono"
                  />
                  {errors.propTargetDate && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.propTargetDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Remarks Field (Requirement 3) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Remarks / Notes (Editable over time)
                </label>
                <textarea
                  rows={3}
                  value={propRemarks}
                  onChange={(e) => setPropRemarks(e.target.value)}
                  placeholder="Enter property notes or remarks (e.g. title perfection tracking, state approval status)..."
                  className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-bold text-white bg-indigo-700 hover:bg-indigo-800 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Property Matter</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Intellectual Property - Trademark or Patent */}
          {activeTabLocal === 'ip' && (
            <form onSubmit={handleSubmitIp} className="space-y-4">
              {/* IP Type Selector: Trademark or Patent */}
              <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11.5px] font-bold uppercase tracking-wider text-teal-900">
                      Intellectual Property Type <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-teal-700">
                      Select IP asset classification (Brand Trademark or Technical Invention Patent)
                    </p>
                  </div>
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    PRD F04
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIpType('Trademark');
                      if (tmClass.includes('H04N') || !tmClass) {
                        setTmClass('Class 38 (Broadcasting) & Class 41');
                      }
                      if (tmFirm.includes('Patent')) {
                        setTmFirm('Messrs. Skrine (IP Practice)');
                      }
                    }}
                    className={`py-2 px-3 rounded-md text-[12px] font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                      ipType === 'Trademark'
                        ? 'bg-white border-teal-600 text-teal-900 ring-2 ring-teal-100 font-semibold shadow-xs'
                        : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Trademark</span>
                      <span className="block text-[10.5px] text-slate-500">Brand, Logo, Station Marks</span>
                    </div>
                    {ipType === 'Trademark' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIpType('Patent');
                      if (tmClass.includes('Class 38') || !tmClass) {
                        setTmClass('H04N 21/43 (Broadcasting & Video Distribution)');
                      }
                      if (!tmFirm.includes('Patent')) {
                        setTmFirm('Messrs. Skrine (Patent Practice)');
                      }
                    }}
                    className={`py-2 px-3 rounded-md text-[12px] font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                      ipType === 'Patent'
                        ? 'bg-white border-teal-600 text-teal-900 ring-2 ring-teal-100 font-semibold shadow-xs'
                        : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Patent</span>
                      <span className="block text-[10.5px] text-slate-500">Technical Invention, Systems, Utility</span>
                    </div>
                    {ipType === 'Patent' && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                </div>
              </div>

              {/* Dynamic Asset Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    {ipType === 'Patent' ? 'Patent / Invention Title' : 'Trademark / Brand Name'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tmName}
                    onChange={(e) => setTmName(e.target.value)}
                    placeholder={
                      ipType === 'Patent'
                        ? 'e.g. Low-Latency OTT Adaptive Video Streaming Distribution'
                        : 'e.g. BULETIN UTAMA'
                    }
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.tmName && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.tmName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    {ipType === 'Patent'
                      ? 'Patent Application / Grant No.'
                      : 'Registration / Application No.'}
                  </label>
                  <input
                    type="text"
                    value={tmRegNo}
                    onChange={(e) => setTmRegNo(e.target.value)}
                    placeholder={ipType === 'Patent' ? 'e.g. MY-PI2024001928' : 'e.g. TM2024018249'}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Requesting Stakeholder and Internal Department with Others */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Requesting Stakeholder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tmStakeholder}
                    onChange={(e) => setTmStakeholder(e.target.value)}
                    placeholder={
                      ipType === 'Patent'
                        ? 'e.g. Lead Broadcast Architect (R&D)'
                        : 'e.g. Head of Brand & Marketing'
                    }
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.tmStakeholder && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.tmStakeholder}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Internal Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tmDepartment}
                    onChange={(e) => setTmDepartment(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  >
                    {standardDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  {tmDepartment === 'Others' && (
                    <div className="mt-1.5 space-y-1 animate-fadeIn">
                      <label className="text-[10.5px] font-semibold text-teal-700 block">
                        Specify Department under Others <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tmCustomDepartment}
                        onChange={(e) => setTmCustomDepartment(e.target.value)}
                        placeholder="e.g. R&D Engineering, Innovation Lab, Licensing..."
                        className="w-full text-[12px] p-2 rounded-md border border-teal-300 bg-teal-50/40 text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                      />
                      {errors.tmCustomDepartment && (
                        <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3" /> {errors.tmCustomDepartment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    {ipType === 'Patent'
                      ? 'IPC Classification / Technology Field'
                      : 'Nice Classification'}
                  </label>
                  <input
                    type="text"
                    value={tmClass}
                    onChange={(e) => setTmClass(e.target.value)}
                    placeholder={
                      ipType === 'Patent'
                        ? 'e.g. H04N 21/43 (Video Distribution) & G06F 16/00'
                        : 'Class 38 (Broadcasting) & Class 41'
                    }
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Jurisdiction / Patent Office
                  </label>
                  <select
                    value={tmJurisdiction}
                    onChange={(e) => setTmJurisdiction(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  >
                    <option value="Malaysia (MyIPO)">Malaysia (MyIPO Patent / TM)</option>
                    <option value="Singapore (IPOS)">Singapore (IPOS)</option>
                    <option value="WIPO / Madrid Protocol">WIPO / Madrid Protocol</option>
                    <option value="WIPO PCT (Patent Cooperation Treaty)">
                      WIPO PCT (Patent Cooperation Treaty)
                    </option>
                    <option value="United States (USPTO)">United States (USPTO)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    External IP / Patent Firm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tmFirm}
                    onChange={(e) => setTmFirm(e.target.value)}
                    placeholder={
                      ipType === 'Patent'
                        ? 'e.g. Messrs. Skrine (Patent Practice)'
                        : 'e.g. Messrs. Skrine (IP Practice)'
                    }
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white"
                  />
                  {errors.tmFirm && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.tmFirm}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    {ipType === 'Patent' ? 'Grant / 20-Yr Renewal Date' : 'Renewal / Expiry Date'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={tmExpiryDate}
                    onChange={(e) => setTmExpiryDate(e.target.value)}
                    className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white font-mono"
                  />
                  {errors.tmExpiryDate && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> {errors.tmExpiryDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Remarks Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Remarks / Notes (Editable over time)
                </label>
                <textarea
                  rows={3}
                  value={tmRemarks}
                  onChange={(e) => setTmRemarks(e.target.value)}
                  placeholder={
                    ipType === 'Patent'
                      ? 'Enter patent filing notes (e.g. prior art search report, claims drafted, priority date)...'
                      : 'Enter IP filing remarks or notes (e.g. examination report deadlines, priority claims)...'
                  }
                  className="w-full text-[12px] p-2 rounded-md border border-slate-300 bg-white focus:ring-1 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewIntakeModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {ipType === 'Patent' ? 'Register Patent Record' : 'Register Trademark Record'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer for supporting documents - ONLY rendered in LDRF tab!
  function renderSupportingDocuments() {
    return (
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-[11.5px] font-bold uppercase tracking-wider text-slate-700">
            Supporting Documents &amp; Annexures (LDRF Required / Optional Drafts)
          </label>
          <span className="text-[10.5px] text-slate-400 font-medium">
            Max 2MB per file &bull; PDF, PNG, JPG, DOCX
          </span>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-300'
              : 'border-blue-200 bg-[#f8faff] hover:bg-blue-50/30 hover:border-blue-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf,image/png,image/jpeg,image/webp,.docx,.doc"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mb-1.5 text-blue-600 shadow-2xs">
              <UploadCloud className="w-4 h-4" />
            </div>
            <p className="text-[12px] text-slate-700 font-medium">
              <span className="text-blue-600 font-semibold underline">Click to browse</span> or drag &amp; drop. Attach executed LDRF requisition or drafts up to 2MB.
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Automatic SHA-256 integrity hash &amp; privilege timestamp applied
            </p>
          </div>
        </div>

        {uploadError && (
          <div className="p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>{uploadError}</span>
          </div>
        )}

        {documents.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {documents.map((doc) => {
              const isPdf = doc.name.toLowerCase().endsWith('.pdf') || doc.type.includes('pdf');
              const isImage = doc.type.startsWith('image/');

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {doc.category === 'Optional' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        Optional
                      </span>
                    ) : isPdf ? (
                      <div className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                        <FileText className="w-3 h-3" />
                      </div>
                    ) : isImage ? (
                      <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <FileCheck className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <FileText className="w-3 h-3" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-[11.5px] font-semibold text-slate-800 truncate">
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {doc.sizeFormatted} &bull;{' '}
                        {doc.category === 'Optional'
                          ? 'Scanned & Authenticated'
                          : doc.category === 'Redline'
                          ? 'Counterparty Redline'
                          : isPdf
                          ? 'PDF Document'
                          : isImage
                          ? 'Image Proof'
                          : 'Attached Document'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.category === 'Redline' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Redline
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
};
