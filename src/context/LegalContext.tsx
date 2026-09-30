import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AgreementMatter,
  LodMatter,
  PropertyMatter,
  IpMatter,
  ActiveTab,
  AlertFilter,
  AgreementStage,
  InvoiceDetails,
} from '../types/legal';
import {
  INITIAL_AGREEMENTS,
  INITIAL_LODS,
  INITIAL_PROPERTIES,
  INITIAL_IPS,
} from '../data/initialData';
import {
  calculateTAT,
  getDaysRemaining,
  getDaysPendingWithFinance,
} from '../utils/dateUtils';

interface SelectedMatterPayload {
  type: 'agreement' | 'lod' | 'property' | 'ip';
  id: string;
}

interface LegalContextType {
  agreements: AgreementMatter[];
  lods: LodMatter[];
  properties: PropertyMatter[];
  ips: IpMatter[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeFilter: AlertFilter;
  setActiveFilter: (filter: AlertFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Modal and Drawer States
  selectedMatter: SelectedMatterPayload | null;
  setSelectedMatter: (payload: SelectedMatterPayload | null) => void;
  isInspectionDrawerOpen: boolean;
  setIsInspectionDrawerOpen: (open: boolean) => void;
  isNewIntakeModalOpen: boolean;
  setIsNewIntakeModalOpen: (open: boolean) => void;
  newIntakeDefaultType: 'agreement' | 'lod' | 'property' | 'ip';
  setNewIntakeDefaultType: (type: 'agreement' | 'lod' | 'property' | 'ip') => void;
  isQuickLdrfOpen: boolean;
  setIsQuickLdrfOpen: (open: boolean) => void;
  isDocumentationOpen: boolean;
  setIsDocumentationOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  
  // CRUD Actions
  addAgreement: (data: Omit<AgreementMatter, 'id' | 'tatDaysElapsed' | 'lastModified'>) => void;
  updateAgreement: (id: string, updates: Partial<AgreementMatter>) => void;
  addLod: (data: Omit<LodMatter, 'id'>) => void;
  updateLod: (id: string, updates: Partial<LodMatter>) => void;
  addProperty: (data: Omit<PropertyMatter, 'id'>) => void;
  updateProperty: (id: string, updates: Partial<PropertyMatter>) => void;
  addIp: (data: Omit<IpMatter, 'id'>) => void;
  updateIp: (id: string, updates: Partial<IpMatter>) => void;
  updateInvoice: (
    type: 'agreement' | 'lod' | 'property' | 'ip',
    matterId: string,
    invoice: InvoiceDetails
  ) => void;
  deleteMatter: (type: 'agreement' | 'lod' | 'property' | 'ip', id: string) => void;
  resetToDefaultData: () => void;
  exportAuditLogCSV: () => void;

  // Global Counts & SLA metrics
  counts: {
    agreements: number;
    lods: number;
    properties: number;
    ips: number;
    expiredOverdue: number;
    expiringSoon: number;
    lateFinanceInvoices: number;
    lateFinanceAmountMYR: number;
    externalLawFirms: number;
  };
}

const LegalContext = createContext<LegalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AGREEMENTS: 'lexops_agreements_v1_3',
  LODS: 'lexops_lods_v1_3',
  PROPERTIES: 'lexops_properties_v1_3',
  IPS: 'lexops_ips_v1_3',
};

export const LegalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agreements, setAgreements] = useState<AgreementMatter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_AGREEMENTS;
  });

  const [lods, setLods] = useState<LodMatter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LODS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_LODS;
  });

  const [properties, setProperties] = useState<PropertyMatter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_PROPERTIES;
  });

  const [ips, setIps] = useState<IpMatter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IPS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_IPS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeFilter, setActiveFilter] = useState<AlertFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected matter for right-side inspection drawer (closed by default)
  const [selectedMatter, setSelectedMatter] = useState<SelectedMatterPayload | null>({
    type: 'lod',
    id: 'LOD-2024-012',
  });
  const [isInspectionDrawerOpen, setIsInspectionDrawerOpen] = useState<boolean>(false);
  const [isNewIntakeModalOpen, setIsNewIntakeModalOpen] = useState<boolean>(false);
  const [newIntakeDefaultType, setNewIntakeDefaultType] = useState<'agreement' | 'lod' | 'property' | 'ip'>('agreement');
  const [isQuickLdrfOpen, setIsQuickLdrfOpen] = useState<boolean>(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(agreements));
    } catch (e) {
      console.error(e);
    }
  }, [agreements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LODS, JSON.stringify(lods));
    } catch (e) {
      console.error(e);
    }
  }, [lods]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) {
      console.error(e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IPS, JSON.stringify(ips));
    } catch (e) {
      console.error(e);
    }
  }, [ips]);

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Recalculate TAT for agreements upon load
  useEffect(() => {
    setAgreements((prev) =>
      prev.map((agr) => ({
        ...agr,
        tatDaysElapsed: calculateTAT(agr.requestDate, agr.executionDate),
      }))
    );
  }, []);

  const addAgreement = (data: Omit<AgreementMatter, 'id' | 'tatDaysElapsed' | 'lastModified'>) => {
    const nextNumber = agreements.length + 42;
    const newId = `AGR-2024-${String(nextNumber).padStart(3, '0')}`;
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const tat = calculateTAT(data.requestDate, data.executionDate);

    const newAgreement: AgreementMatter = {
      ...data,
      id: newId,
      tatDaysElapsed: tat,
      lastModified: formattedNow,
    };

    setAgreements((prev) => [newAgreement, ...prev]);
  };

  const updateAgreement = (id: string, updates: Partial<AgreementMatter>) => {
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates, lastModified: formattedNow };
          // If stage moved to Executed / Signed and no executionDate, set it today to freeze TAT!
          if (updates.stage === 'Executed / Signed' && !merged.executionDate) {
            merged.executionDate = now.toISOString().split('T')[0];
          }
          merged.tatDaysElapsed = calculateTAT(merged.requestDate, merged.executionDate);
          return merged;
        }
        return item;
      })
    );
  };

  const addLod = (data: Omit<LodMatter, 'id'>) => {
    const nextNumber = lods.length + 17;
    const newId = `LOD-2024-${String(nextNumber).padStart(3, '0')}`;
    const newLod: LodMatter = {
      ...data,
      id: newId,
    };
    setLods((prev) => [newLod, ...prev]);
  };

  const updateLod = (id: string, updates: Partial<LodMatter>) => {
    setLods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addProperty = (data: Omit<PropertyMatter, 'id'>) => {
    const nextNumber = properties.length + 9;
    const newId = `PROP-2024-${String(nextNumber).padStart(3, '0')}`;
    const newProp: PropertyMatter = {
      ...data,
      id: newId,
    };
    setProperties((prev) => [newProp, ...prev]);
  };

  const updateProperty = (id: string, updates: Partial<PropertyMatter>) => {
    setProperties((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addIp = (data: Omit<IpMatter, 'id'>) => {
    const isPatent = data.ipType === 'Patent';
    const prefix = isPatent ? 'PAT' : 'TM';
    const nextNumber = ips.length + 13;
    const newId = `${prefix}-2024-${String(nextNumber).padStart(3, '0')}`;
    const newIp: IpMatter = {
      ...data,
      id: newId,
    };
    setIps((prev) => [newIp, ...prev]);
  };

  const updateIp = (id: string, updates: Partial<IpMatter>) => {
    setIps((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const updateInvoice = (
    type: 'agreement' | 'lod' | 'property' | 'ip',
    matterId: string,
    invoice: InvoiceDetails
  ) => {
    if (type === 'agreement') {
      updateAgreement(matterId, { invoice });
    } else if (type === 'lod') {
      updateLod(matterId, { invoice });
    } else if (type === 'property') {
      updateProperty(matterId, { invoice });
    } else if (type === 'ip') {
      updateIp(matterId, { invoice });
    }
  };

  const deleteMatter = (type: 'agreement' | 'lod' | 'property' | 'ip', id: string) => {
    if (type === 'agreement') {
      setAgreements((prev) => prev.filter((i) => i.id !== id));
    } else if (type === 'lod') {
      setLods((prev) => prev.filter((i) => i.id !== id));
    } else if (type === 'property') {
      setProperties((prev) => prev.filter((i) => i.id !== id));
    } else if (type === 'ip') {
      setIps((prev) => prev.filter((i) => i.id !== id));
    }

    if (selectedMatter && selectedMatter.id === id) {
      setSelectedMatter(null);
      setIsInspectionDrawerOpen(false);
    }
  };

  const resetToDefaultData = () => {
    setAgreements(INITIAL_AGREEMENTS);
    setLods(INITIAL_LODS);
    setProperties(INITIAL_PROPERTIES);
    setIps(INITIAL_IPS);
    setSelectedMatter({ type: 'lod', id: 'LOD-2024-012' });
    setIsInspectionDrawerOpen(true);
    localStorage.removeItem(STORAGE_KEYS.AGREEMENTS);
    localStorage.removeItem(STORAGE_KEYS.LODS);
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    localStorage.removeItem(STORAGE_KEYS.IPS);
  };

  // Compute counts & SLA metrics
  const expiredOverdueCount = React.useMemo(() => {
    let count = 0;
    // Overdue LODs
    lods.forEach((l) => {
      const remaining = getDaysRemaining(l.responseDeadlineDate);
      if (remaining !== null && remaining <= 0 && l.stage !== 'Response Sent - Closed') count++;
    });
    // Expired agreements
    agreements.forEach((a) => {
      const remaining = getDaysRemaining(a.expectedExpiryDate);
      if (remaining !== null && remaining <= 0) count++;
    });
    // Overdue properties
    properties.forEach((p) => {
      const remaining = getDaysRemaining(p.targetCompletionDate);
      if (remaining !== null && remaining <= 0 && p.stage !== 'Stamped-Completed') count++;
    });
    // Expired IPs
    ips.forEach((i) => {
      const remaining = getDaysRemaining(i.expiryRenewalDate);
      if (remaining !== null && remaining <= 0) count++;
    });
    return count;
  }, [agreements, lods, properties, ips]);

  const expiringSoonCount = React.useMemo(() => {
    let count = 0;
    // Trademarks & Leases expiring in < 30 days
    properties.forEach((p) => {
      const remaining = getDaysRemaining(p.targetCompletionDate);
      if (remaining !== null && remaining > 0 && remaining <= 30) count++;
    });
    ips.forEach((i) => {
      const remaining = getDaysRemaining(i.expiryRenewalDate);
      if (remaining !== null && remaining > 0 && remaining <= 30) count++;
    });
    agreements.forEach((a) => {
      const remaining = getDaysRemaining(a.expectedExpiryDate);
      if (remaining !== null && remaining > 0 && remaining <= 30) count++;
    });
    lods.forEach((l) => {
      const remaining = getDaysRemaining(l.responseDeadlineDate);
      if (remaining !== null && remaining > 0 && remaining <= 7) count++;
    });
    return count;
  }, [agreements, lods, properties, ips]);

  // Late invoices submitted to Finance > 14 days ago and unpaid
  const lateFinanceStats = React.useMemo(() => {
    let count = 0;
    let totalMYR = 0;

    const checkInvoice = (inv?: InvoiceDetails) => {
      if (!inv) return;
      if (inv.paymentStatus === 'Submitted to Finance' && inv.dateSubmittedToFinance) {
        const days = getDaysPendingWithFinance(inv.dateSubmittedToFinance);
        if (days > 14) {
          count++;
          totalMYR += inv.amount;
        }
      }
    };

    agreements.forEach((a) => checkInvoice(a.invoice));
    lods.forEach((l) => checkInvoice(l.invoice));
    properties.forEach((p) => checkInvoice(p.invoice));
    ips.forEach((i) => checkInvoice(i.invoice));

    return { count, totalMYR };
  }, [agreements, lods, properties, ips]);

  // Set of external law firms tracked
  const externalLawFirmsCount = React.useMemo(() => {
    const firms = new Set<string>();
    lods.forEach((l) => {
      if (l.appointedLitigationFirm) firms.add(l.appointedLitigationFirm);
      if (l.adverseCounsel) firms.add(l.adverseCounsel);
    });
    properties.forEach((p) => {
      if (p.externalLawFirm) firms.add(p.externalLawFirm);
    });
    ips.forEach((i) => {
      if (i.externalLawFirm) firms.add(i.externalLawFirm);
    });
    return firms.size;
  }, [lods, properties, ips]);

  // Export Audit Log CSV
  const exportAuditLogCSV = () => {
    const rows = [
      ['Module', 'Ref ID', 'Title / Name', 'Counterparty / Adverse', 'Status / Stage', 'Deadline / Expiry', 'TAT (Days)', 'Fee / Value (MYR)', 'Invoice Status', 'Last Updated'],
    ];

    agreements.forEach((a) => {
      rows.push([
        'Agreement',
        a.id,
        `"${a.title.replace(/"/g, '""')}"`,
        `"${a.counterpartyName.replace(/"/g, '""')}"`,
        a.stage,
        a.expectedExpiryDate,
        String(a.tatDaysElapsed),
        String(a.contractValue || 0),
        a.invoice?.paymentStatus || 'No Invoice',
        a.lastModified,
      ]);
    });

    lods.forEach((l) => {
      rows.push([
        'LOD / Litigation',
        l.id,
        `"${l.title.replace(/"/g, '""')}"`,
        `"${l.claimantName.replace(/"/g, '""')}"`,
        l.stage,
        l.responseDeadlineDate,
        'N/A',
        String(l.claimAmount),
        l.invoice?.paymentStatus || 'No Invoice',
        l.dateReceived,
      ]);
    });

    properties.forEach((p) => {
      rows.push([
        'Property Matter',
        p.id,
        `"${p.propertyName.replace(/"/g, '""')}"`,
        `"${p.counterparty.replace(/"/g, '""')}"`,
        p.stage,
        p.targetCompletionDate,
        'N/A',
        String(p.rentalOrValueAmount),
        p.invoice?.paymentStatus || 'No Invoice',
        p.targetCompletionDate,
      ]);
    });

    ips.forEach((i) => {
      rows.push([
        'IP Trademark',
        i.id,
        `"${i.trademarkName.replace(/"/g, '""')}"`,
        `"${i.jurisdiction.replace(/"/g, '""')}"`,
        i.status,
        i.expiryRenewalDate,
        'N/A',
        String(i.invoice?.amount || 0),
        i.invoice?.paymentStatus || 'No Invoice',
        i.filingDate,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LEXOPS_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <LegalContext.Provider
      value={{
        agreements,
        lods,
        properties,
        ips,
        activeTab,
        setActiveTab,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        selectedMatter,
        setSelectedMatter,
        isInspectionDrawerOpen,
        setIsInspectionDrawerOpen,
        isNewIntakeModalOpen,
        setIsNewIntakeModalOpen,
        newIntakeDefaultType,
        setNewIntakeDefaultType,
        isQuickLdrfOpen,
        setIsQuickLdrfOpen,
        isDocumentationOpen,
        setIsDocumentationOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        addAgreement,
        updateAgreement,
        addLod,
        updateLod,
        addProperty,
        updateProperty,
        addIp,
        updateIp,
        updateInvoice,
        deleteMatter,
        resetToDefaultData,
        exportAuditLogCSV,
        counts: {
          agreements: agreements.length,
          lods: lods.length,
          properties: properties.length,
          ips: ips.length,
          expiredOverdue: expiredOverdueCount,
          expiringSoon: expiringSoonCount,
          lateFinanceInvoices: lateFinanceStats.count,
          lateFinanceAmountMYR: lateFinanceStats.totalMYR,
          externalLawFirms: externalLawFirmsCount,
        },
      }}
    >
      {children}
    </LegalContext.Provider>
  );
};

export const useLegal = () => {
  const context = useContext(LegalContext);
  if (!context) {
    throw new Error('useLegal must be used within a LegalProvider');
  }
  return context;
};
