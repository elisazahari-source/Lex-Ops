import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  Building,
  Phone,
  Mail,
  Scale,
  Award,
  CreditCard,
  ExternalLink,
  Search,
  Plus,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

interface PanelLawFirm {
  id: string;
  name: string;
  specialization: string;
  partnerInCharge: string;
  email: string;
  phone: string;
  location: string;
  activeMattersCount: number;
  totalFeesPaidMYR: number;
  openInvoiceAmountMYR: number;
  retainerTier: string;
  rating: number;
}

export const ExternalCounselView: React.FC = () => {
  const { setActiveTab, setSelectedMatter, setIsInspectionDrawerOpen, agreements, lods, properties, ips } = useLegal();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpec, setFilterSpec] = useState<string>('all');

  const panelFirms: PanelLawFirm[] = [
    {
      id: 'FIRM-001',
      name: 'Messrs. Shearn Delamore & Co',
      specialization: 'Conveyancing, Real Estate, Corporate M&A',
      partnerInCharge: 'Mr. Rodney Gomez / Ms. Sarita Nair',
      email: 'rgomez@shearndelamore.com',
      phone: '+603 2027 2727',
      location: 'Kuala Lumpur (Wisma Hamzah-Kwong Hing)',
      activeMattersCount: properties.filter((p) => p.externalLawFirm.includes('Shearn Delamore')).length || 2,
      totalFeesPaidMYR: 195000,
      openInvoiceAmountMYR: 0,
      retainerTier: 'Tier 1 Panel Firm',
      rating: 4.9,
    },
    {
      id: 'FIRM-002',
      name: 'Messrs. Skrine',
      specialization: 'Intellectual Property, Patents, Dispute Resolution',
      partnerInCharge: 'Ms. Charmayne Ong / Mr. Khoo Guan Huat',
      email: 'ip.practice@skrine.com',
      phone: '+603 2081 3999',
      location: 'Damansara Heights, Kuala Lumpur',
      activeMattersCount: ips.filter((i) => i.externalLawFirm.includes('Skrine')).length || 4,
      totalFeesPaidMYR: 142000,
      openInvoiceAmountMYR: 28000,
      retainerTier: 'Tier 1 Panel Firm',
      rating: 5.0,
    },
    {
      id: 'FIRM-003',
      name: 'Messrs. Halim Hong & Koh',
      specialization: 'Litigation, Commercial Disputes, Technology Law',
      partnerInCharge: 'Mr. Leon Gan / Mr. Anson Mok',
      email: 'disputes@hhq.com.my',
      phone: '+603 2710 3818',
      location: 'Mid Valley City, Kuala Lumpur',
      activeMattersCount: lods.filter((l) => l.appointedLitigationFirm.includes('Halim Hong')).length || 1,
      totalFeesPaidMYR: 85000,
      openInvoiceAmountMYR: 28000,
      retainerTier: 'Litigation Retainer',
      rating: 4.8,
    },
    {
      id: 'FIRM-004',
      name: 'Messrs. Baker McKenzie',
      specialization: 'Cross-Border Licensing, Complex Tech Litigation',
      partnerInCharge: 'Mr. Brian Chia / Ms. Adeline Wong',
      email: 'kl.litigation@bakermckenzie.com',
      phone: '+603 2298 7888',
      location: 'KL Sentral, Kuala Lumpur',
      activeMattersCount: 1,
      totalFeesPaidMYR: 210000,
      openInvoiceAmountMYR: 35000,
      retainerTier: 'International Advisory',
      rating: 4.9,
    },
    {
      id: 'FIRM-005',
      name: 'Messrs. Raja, Darryl & Loh',
      specialization: 'Defamation, Media Law, Public Interest Defense',
      partnerInCharge: 'Dato K. Shanmuga / Ms. Vijey Mohana',
      email: 'media.litigation@rdl.com.my',
      phone: '+603 2694 9999',
      location: 'Changkat Raja Chulan, Kuala Lumpur',
      activeMattersCount: lods.filter((l) => l.appointedLitigationFirm.includes('Raja')).length || 1,
      totalFeesPaidMYR: 95000,
      openInvoiceAmountMYR: 35000,
      retainerTier: 'Media Defense Specialist',
      rating: 4.9,
    },
    {
      id: 'FIRM-006',
      name: 'Messrs. Zul Rafique & partners',
      specialization: 'Commercial Real Estate, Sub-tenancies, Banking',
      partnerInCharge: 'Dato Zulkifly Rafique / Ms. Fadzilah Arshad',
      email: 'realestate@zulrafique.com.my',
      phone: '+603 6209 8228',
      location: 'Solaris Dutamas, Kuala Lumpur',
      activeMattersCount: properties.filter((p) => p.externalLawFirm.includes('Zul Rafique')).length || 2,
      totalFeesPaidMYR: 62000,
      openInvoiceAmountMYR: 0,
      retainerTier: 'Panel Conveyancer',
      rating: 4.7,
    },
    {
      id: 'FIRM-007',
      name: 'Messrs. Mah-Kamariyah & Philip Koh',
      specialization: 'Corporate Governance, Master Head-Lease Renewals',
      partnerInCharge: 'Dato Philip Koh / Ms. Cindy Tan',
      email: 'pkoh@mkpk.com.my',
      phone: '+603 7956 8688',
      location: 'Petaling Jaya, Selangor',
      activeMattersCount: 1,
      totalFeesPaidMYR: 78000,
      openInvoiceAmountMYR: 38000,
      retainerTier: 'Strategic Advisory',
      rating: 4.8,
    },
    {
      id: 'FIRM-008',
      name: 'Messrs. Reddi & Co',
      specialization: 'East Malaysia Conveyancing & Land Administration',
      partnerInCharge: 'Mr. Jonathan Chai',
      email: 'kuching@reddi.com.my',
      phone: '+6082 412 888',
      location: 'Kuching, Sarawak',
      activeMattersCount: 1,
      totalFeesPaidMYR: 34000,
      openInvoiceAmountMYR: 0,
      retainerTier: 'Regional Panel',
      rating: 4.7,
    },
  ];

  const filteredFirms = panelFirms.filter((firm) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        firm.name.toLowerCase().includes(q) ||
        firm.specialization.toLowerCase().includes(q) ||
        firm.partnerInCharge.toLowerCase().includes(q) ||
        firm.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterSpec === 'litigation') {
      return firm.specialization.toLowerCase().includes('litigation') || firm.specialization.toLowerCase().includes('dispute');
    }
    if (filterSpec === 'property') {
      return firm.specialization.toLowerCase().includes('conveyancing') || firm.specialization.toLowerCase().includes('real estate');
    }
    if (filterSpec === 'ip') {
      return firm.specialization.toLowerCase().includes('intellectual property');
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Panel Law Firms
            </span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{panelFirms.length}</span>
            <span className="text-[11px] text-blue-600 font-semibold">Empaneled Firms</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Peninsular &amp; East Malaysia legal coverage
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Retainer &amp; Fees (YTD)
            </span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">RM 906,000</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Budgeted</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Across 18 active agreements, LODs, &amp; conveyance files
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Finance Invoices
            </span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700">RM 129,000</span>
            <span className="text-[11px] text-amber-600 font-medium">4 Invoices</span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Submitted to Group Finance for payment dispatch
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Panel SLA Turnaround Rating
            </span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">4.85 / 5.0</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 font-semibold">
              <Star className="w-3 h-3 fill-purple-600 text-purple-600 shrink-0" />
              <span>Top Tier</span>
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1">
            Average 48hr TAT on draft contract turnaround
          </p>
        </div>
      </div>

      {/* Directory Section */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
        {/* Header Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-50 text-blue-700">
                <Building className="w-4 h-4 stroke-[2.2]" />
              </span>
              <h2 className="text-[14px] font-bold text-slate-900 tracking-tight">
                External Counsel &amp; Panel Law Firms Directory
              </h2>
            </div>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Empaneled solicitors, litigation counsel, IP patent agents, and fee tracking
            </p>
          </div>

          <button
            onClick={() => setActiveTab('payments')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-[#0b1c30] hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Open Fee &amp; Payment Tracker</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search law firm, partner, practice area, location..."
              className="w-full h-8 pl-8 pr-3 text-[12px] rounded-md border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterSpec('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filterSpec === 'all'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Firms ({panelFirms.length})
            </button>
            <button
              onClick={() => setFilterSpec('litigation')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filterSpec === 'litigation'
                  ? 'bg-red-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Litigation &amp; Disputes
            </button>
            <button
              onClick={() => setFilterSpec('property')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filterSpec === 'property'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Conveyancing
            </button>
            <button
              onClick={() => setFilterSpec('ip')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                filterSpec === 'ip'
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              IP &amp; Patents
            </button>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
          {filteredFirms.map((firm) => (
            <div
              key={firm.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                      {firm.name}
                    </h3>
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {firm.retainerTier}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-700 font-bold text-[11px] shrink-0">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                  <span>{firm.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="text-[12px] space-y-1 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{firm.specialization}</span>
                </div>
                <div className="text-[11.5px] text-slate-500 pl-5">
                  Key Partner: <span className="text-slate-800 font-medium">{firm.partnerInCharge}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {firm.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> {firm.email}
                  </span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
                <div>
                  <span className="text-slate-400 text-[10.5px] block">Total Remitted (YTD)</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatCurrency(firm.totalFeesPaidMYR, 'MYR')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10.5px] block">Pending Invoice</span>
                  <span
                    className={`font-mono font-bold ${
                      firm.openInvoiceAmountMYR > 0 ? 'text-amber-600' : 'text-slate-500'
                    }`}
                  >
                    {firm.openInvoiceAmountMYR > 0
                      ? formatCurrency(firm.openInvoiceAmountMYR, 'MYR')
                      : 'None Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
