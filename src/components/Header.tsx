import React, { useState, useRef, useEffect } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  FileText,
  Scale,
  Building2,
  BookmarkCheck,
  LayoutGrid,
  Download,
  Plus,
  Search,
  ChevronDown,
  CreditCard,
  ShieldCheck,
  Building,
  Check,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import { ActiveTab } from '../types/legal';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    counts,
    exportAuditLogCSV,
    setIsNewIntakeModalOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useLegal();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: {
    id: ActiveTab;
    label: string;
    count?: number;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: 'overview',
      label: 'Matter Overview',
      icon: <LayoutGrid className="w-4 h-4 text-slate-600" />,
      description: 'Executive dashboard & SLA command center',
    },
    {
      id: 'agreements',
      label: 'Agreements & LDRF',
      count: counts.agreements,
      icon: <FileText className="w-4 h-4 text-blue-600" />,
      description: '6-stage contract turnaround & expiry tracking',
    },
    {
      id: 'lods',
      label: 'LOD Dispute Tracker',
      count: counts.lods,
      icon: <Scale className="w-4 h-4 text-red-600" />,
      description: 'Demand letters, adverse counsel & 14d replies',
    },
    {
      id: 'property',
      label: 'Property Conveyancing',
      count: counts.properties,
      icon: <Building2 className="w-4 h-4 text-indigo-600" />,
      description: 'Tenancies, leases & perfection of title',
    },
    {
      id: 'ip',
      label: 'Intellectual Property',
      count: counts.ips,
      icon: <BookmarkCheck className="w-4 h-4 text-teal-600" />,
      description: 'Trademarks, patents, MyIPO/WIPO portfolio & renewals',
    },
    {
      id: 'payments',
      label: 'Fee & Payment Tracker',
      count: counts.lateFinanceInvoices,
      icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      description: 'External law firm tax invoices & finance dispatch',
    },
    {
      id: 'compliance',
      label: 'Compliance & Audits',
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
      description: 'MACC TRUST, PDPA & statutory lodgements',
    },
    {
      id: 'counsel',
      label: 'External Counsel Directory',
      count: counts.externalLawFirms,
      icon: <Building className="w-4 h-4 text-slate-700" />,
      description: 'Appointed panel law firms & retainers',
    },
  ];

  const currentNav = navItems.find((item) => item.id === activeTab) || navItems[0];

  const handleSelectNav = (id: ActiveTab) => {
    setActiveTab(id);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-14 border-b border-slate-300 bg-[#e5e8ed] px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs shrink-0">
      {/* Left: Sidebar Toggle, Brand Identity and Role */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Brand */}
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded bg-[#0b1c30] flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
            <Scale className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold tracking-tight text-[#0b1c30] leading-tight font-sans">
              LEXOPS
            </span>
            <span className="text-[9.5px] font-semibold text-slate-500 tracking-wider -mt-0.5">
              COUNSEL OS
            </span>
          </div>
        </div>

        {/* Version Badge */}
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
          v1.3
        </span>
      </div>

      {/* Center Search Input */}
      <div className="relative mx-3 max-w-xs xl:max-w-sm w-full hidden md:block">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search agreements, LODs, invoices, firms..."
          className="w-full h-8 pl-8 pr-12 text-[12px] rounded-md border border-slate-200 bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-all font-sans"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.2 shadow-2xs pointer-events-none">
          ⌘K
        </kbd>
      </div>

      {/* Center-Right: Module Dropdown Selector (No scrolling, solves Requirement 6) */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all shadow-2xs cursor-pointer ${
            isDropdownOpen
              ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-600'
              : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {currentNav.icon}
            <span className="font-semibold">{currentNav.label}</span>
          </div>

          {currentNav.count !== undefined && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 tabular-nums">
              {currentNav.count}
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
              isDropdownOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-fadeIn divide-y divide-slate-100">
            <div className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Select Legal Operations Module
            </div>

            <div className="py-1">
              {navItems.map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 shrink-0">{item.icon}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12.5px] truncate">{item.label}</span>
                          {item.count !== undefined && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-400 font-normal truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Actions: Export Audit Log and + New Matter */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          onClick={exportAuditLogCSV}
          title="Export CSV Audit Trail"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline text-[11.5px]">Export Audit Log</span>
        </button>

        <button
          onClick={() => setIsNewIntakeModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Matter</span>
        </button>
      </div>
    </header>
  );
};
