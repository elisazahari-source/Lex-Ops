export type AgreementStage =
  | 'LDRF Received / Drafting'
  | 'Internal Stakeholder Review'
  | 'Sent to Counterparty (External Review)'
  | 'Reverted to Legal for Finalisation'
  | 'Executed / Signed'
  | 'Active / Pending Renewal';

export type LodStage =
  | 'LOD Received'
  | 'Fact-Finding with Stakeholders'
  | 'Response Drafting'
  | 'Response Sent - Closed'
  | 'Escalated to Litigation';

export type PropertyStage =
  | 'Initial Drafting'
  | 'SPA-Tenancy Signed'
  | 'Pending Consent-State Approval'
  | 'Stamped-Completed';

export type IpStatus = 'Pending' | 'Registered' | 'Refused';

export type PaymentStatus =
  | 'Pending Invoice'
  | 'Invoice Received'
  | 'Submitted to Finance'
  | 'Paid by Finance';

export type Currency = 'MYR' | 'USD' | 'SGD';

export interface SupportingDocument {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  category?: string; // e.g. "Optional", "Redline", "Scanned & Authenticated", "LDRF Requisition"
  uploadedAt: string;
  dataUrl?: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate?: string;
  amount: number;
  currency: Currency;
  lawFirm: string;
  dateSubmittedToFinance?: string;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  notes?: string;
}

export interface AgreementMatter {
  id: string; // e.g. AGR-2024-038
  title: string;
  agreementType: string; // Master Services Agreement, Lease, NDA, Software License, Supply Agreement, etc.
  stakeholderName: string;
  stakeholderDepartment: string;
  counterpartyName: string;
  requestDate: string; // YYYY-MM-DD
  executionDate?: string; // YYYY-MM-DD (freezes TAT)
  expectedExpiryDate: string; // YYYY-MM-DD
  renewalPromptLeadDays: number; // e.g. 60 or 90 days
  stage: AgreementStage;
  tatDaysElapsed: number;
  lastModified: string;
  contractValue?: number;
  currency?: Currency;
  assignedCounsel: string;
  ownerEmail?: string;
  notes?: string;
  remarks?: string;
  invoice?: InvoiceDetails;
  documents?: SupportingDocument[];
}

export interface LodMatter {
  id: string; // e.g. LOD-2024-012
  claimRef: string; // e.g. High Court KL Suit No. WA-22NCC-482-11/2024
  title: string; // e.g. Software Licensing Compliance Deficit
  claimantName: string; // e.g. Apex Distribution Sdn Bhd / Oracle Corporation Malaysia
  adverseCounsel: string; // e.g. Messrs. Halim Hong & Koh
  appointedLitigationFirm: string; // e.g. Baker McKenzie / Skrine
  briefClaimSummary: string;
  claimAmount: number;
  currency: Currency;
  dateReceived: string; // YYYY-MM-DD
  responseDeadlineDate: string; // YYYY-MM-DD (statutory 14-day or custom)
  responseDeadlineOption?: 'None' | '7 Days' | '14 Days' | 'Others';
  customResponseDeadline?: string;
  stakeholderName?: string;
  stakeholderDepartment?: string;
  stage: LodStage;
  currentFactFindingStep?: string; // e.g. Stage 3: Fact-Finding with CTO
  inquiredStakeholders: string[]; // e.g. ['CTO', 'Head of Infrastructure', 'Procurement']
  responseNotes: string;
  remarks?: string;
  courtSuitNumber?: string;
  memorandumDueDate?: string;
  invoice?: InvoiceDetails;
  documents?: SupportingDocument[];
  assignedCounsel?: string;
  ownerEmail?: string;
}

export interface PropertyMatter {
  id: string; // e.g. PROP-2024-007
  propertyName: string; // e.g. Balai Berita Bangsar Office Level 5
  propertyAddress: string;
  transactionType:
    | 'Tenancy'
    | 'Lease'
    | 'Acquisition'
    | 'Disposal'
    | 'Perfection of Title'
    | 'Others'
    | (string & {});
  counterparty: string; // Landlord / Purchaser / Tenant
  internalStakeholder: string;
  stakeholderDepartment?: string;
  externalLawFirm: string;
  lawyerContact: string;
  targetCompletionDate: string; // YYYY-MM-DD
  expiryDate?: string;
  stage: PropertyStage;
  rentalOrValueAmount: number;
  currency: Currency;
  notes?: string;
  remarks?: string;
  invoice?: InvoiceDetails;
  documents?: SupportingDocument[];
  assignedCounsel?: string;
  ownerEmail?: string;
}

export type IpType = 'Trademark' | 'Patent';

export interface IpMatter {
  id: string; // e.g. TM-2024-023 or PAT-2024-001
  ipType?: IpType; // 'Trademark' | 'Patent'
  trademarkName: string; // Asset title: Trademark brand or Patent invention title
  registrationNumber: string; // e.g. TM2022039481 or MY-198421-A
  niceClass: string; // Nice Class (e.g. Class 38) or IPC Classification (e.g. H04N 21/81)
  filingDate: string; // YYYY-MM-DD
  expiryRenewalDate: string; // YYYY-MM-DD
  status: IpStatus;
  stakeholderName?: string;
  stakeholderDepartment?: string;
  externalLawFirm: string;
  lawyerContact: string;
  jurisdiction: string; // Malaysia (MyIPO), WIPO PCT, Singapore (IPOS), ASEAN
  notes?: string;
  remarks?: string;
  invoice?: InvoiceDetails;
  documents?: SupportingDocument[];
  assignedCounsel?: string;
  ownerEmail?: string;
}

export type ActiveTab =
  | 'overview'
  | 'agreements'
  | 'lods'
  | 'property'
  | 'ip'
  | 'payments'
  | 'compliance'
  | 'counsel';

export type AlertFilter = 'all' | 'expired_overdue' | 'expiring_soon' | 'pending_finance';
