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
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  saveLinkToFirebase,
  AppUserProfile,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

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
  
  // Firebase Auth & Cloud Sync
  user: User | null;
  userProfiles: AppUserProfile[];
  savedLinks: any[];
  isAuthReady: boolean;
  isSyncingWithFirebase: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  switchAccount: () => Promise<void>;
  saveLink: (link: any) => Promise<void>;

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
  isGoogleDriveOpen: boolean;
  setIsGoogleDriveOpen: (open: boolean) => void;
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

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [savedLinks, setSavedLinks] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<AppUserProfile[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSyncingWithFirebase, setIsSyncingWithFirebase] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Failed to sign in with Google:', err);
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const switchAccount = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Failed to switch account:', err);
    }
  };

  const saveLink = async (linkData: any) => {
    try {
      await saveLinkToFirebase(linkData);
      setSavedLinks((prev) => [linkData, ...prev.filter((l) => l.id !== linkData.id)]);
    } catch (err) {
      console.error('Failed to save link to Firebase:', err);
    }
  };

  // Real-time Firestore synchronization when authenticated
  useEffect(() => {
    if (!user) {
      setIsSyncingWithFirebase(false);
      return;
    }

    setIsSyncingWithFirebase(true);

    const unsubAgreements = onSnapshot(
      collection(db, 'agreements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as AgreementMatter);
          setAgreements(remote);
        } else {
          // Initial seed
          agreements.forEach((agr) => {
            setDoc(doc(db, 'agreements', agr.id), agr).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, `agreements/${agr.id}`)
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'agreements');
      }
    );

    const unsubLods = onSnapshot(
      collection(db, 'lods'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as LodMatter);
          setLods(remote);
        } else {
          lods.forEach((lod) => {
            setDoc(doc(db, 'lods', lod.id), lod).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, `lods/${lod.id}`)
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'lods');
      }
    );

    const unsubProperties = onSnapshot(
      collection(db, 'properties'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as PropertyMatter);
          setProperties(remote);
        } else {
          properties.forEach((prop) => {
            setDoc(doc(db, 'properties', prop.id), prop).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, `properties/${prop.id}`)
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'properties');
      }
    );

    const unsubIps = onSnapshot(
      collection(db, 'ips'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as IpMatter);
          setIps(remote);
        } else {
          ips.forEach((ip) => {
            setDoc(doc(db, 'ips', ip.id), ip).catch((err) =>
              handleFirestoreError(err, OperationType.WRITE, `ips/${ip.id}`)
            );
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'ips');
      }
    );

    const unsubLinks = onSnapshot(
      collection(db, 'links'),
      (snapshot) => {
        if (!snapshot.empty) {
          setSavedLinks(snapshot.docs.map((d) => d.data()));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'links');
      }
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          setUserProfiles(snapshot.docs.map((d) => d.data() as AppUserProfile));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );

    return () => {
      unsubAgreements();
      unsubLods();
      unsubProperties();
      unsubIps();
      unsubLinks();
      unsubUsers();
      setIsSyncingWithFirebase(false);
    };
  }, [user]);

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
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState<boolean>(false);
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

    if (user) {
      setDoc(doc(db, 'agreements', newId), newAgreement).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `agreements/${newId}`)
      );
    }
  };

  const updateAgreement = (id: string, updates: Partial<AgreementMatter>) => {
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates, lastModified: formattedNow };
          if (updates.stage === 'Executed / Signed' && !merged.executionDate) {
            merged.executionDate = now.toISOString().split('T')[0];
          }
          merged.tatDaysElapsed = calculateTAT(merged.requestDate, merged.executionDate);

          if (user) {
            setDoc(doc(db, 'agreements', id), merged).catch((err) =>
              handleFirestoreError(err, OperationType.UPDATE, `agreements/${id}`)
            );
          }
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

    if (user) {
      setDoc(doc(db, 'lods', newId), newLod).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `lods/${newId}`)
      );
    }
  };

  const updateLod = (id: string, updates: Partial<LodMatter>) => {
    setLods((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          if (user) {
            setDoc(doc(db, 'lods', id), merged).catch((err) =>
              handleFirestoreError(err, OperationType.UPDATE, `lods/${id}`)
            );
          }
          return merged;
        }
        return item;
      })
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

    if (user) {
      setDoc(doc(db, 'properties', newId), newProp).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `properties/${newId}`)
      );
    }
  };

  const updateProperty = (id: string, updates: Partial<PropertyMatter>) => {
    setProperties((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          if (user) {
            setDoc(doc(db, 'properties', id), merged).catch((err) =>
              handleFirestoreError(err, OperationType.UPDATE, `properties/${id}`)
            );
          }
          return merged;
        }
        return item;
      })
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

    if (user) {
      setDoc(doc(db, 'ips', newId), newIp).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `ips/${newId}`)
      );
    }
  };

  const updateIp = (id: string, updates: Partial<IpMatter>) => {
    setIps((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          if (user) {
            setDoc(doc(db, 'ips', id), merged).catch((err) =>
              handleFirestoreError(err, OperationType.UPDATE, `ips/${id}`)
            );
          }
          return merged;
        }
        return item;
      })
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

    if (user) {
      const collectionName =
        type === 'agreement'
          ? 'agreements'
          : type === 'lod'
          ? 'lods'
          : type === 'property'
          ? 'properties'
          : 'ips';
      deleteDoc(doc(db, collectionName, id)).catch((err) =>
        handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`)
      );
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
    return count;
  }, [agreements, properties, ips]);

  const lateFinanceStats = React.useMemo(() => {
    let count = 0;
    let totalMYR = 0;
    const checkInv = (inv?: any) => {
      if (!inv) return;
      if (inv.paymentStatus === 'Submitted to Finance' && inv.dateSubmittedToFinance) {
        const days = getDaysPendingWithFinance(inv.dateSubmittedToFinance);
        if (days > 14) {
          count++;
          totalMYR += inv.amount || 0;
        }
      }
    };
    agreements.forEach((a) => checkInv(a.invoice));
    lods.forEach((l) => checkInv(l.invoice));
    properties.forEach((p) => checkInv(p.invoice));
    ips.forEach((i) => checkInv(i.invoice));
    return { count, totalMYR };
  }, [agreements, lods, properties, ips]);

  const externalLawFirmsCount = React.useMemo(() => {
    const firms = new Set<string>();
    lods.forEach((l) => {
      if (l.appointedLitigationFirm && !l.appointedLitigationFirm.toLowerCase().includes('in-house')) {
        firms.add(l.appointedLitigationFirm);
      }
    });
    properties.forEach((p) => {
      if (p.externalLawFirm) firms.add(p.externalLawFirm);
    });
    ips.forEach((i) => {
      if (i.externalLawFirm) firms.add(i.externalLawFirm);
    });
    return firms.size;
  }, [lods, properties, ips]);

  // Export audit log to CSV
  const exportAuditLogCSV = () => {
    const rows = [
      ['Module', 'Matter ID', 'Title / Asset', 'Stage / Status', 'Assigned Counsel', 'Deadline / Expiry', 'Notes / Remarks'],
      ...agreements.map((a) => ['Agreements', a.id, `"${a.title.replace(/"/g, '""')}"`, a.stage, a.assignedCounsel, a.expectedExpiryDate, `"${(a.notes || '').replace(/"/g, '""')}"`]),
      ...lods.map((l) => ['LODs', l.id, `"${l.title.replace(/"/g, '""')}"`, l.stage, l.appointedLitigationFirm, l.responseDeadlineDate, `"${(l.responseNotes || '').replace(/"/g, '""')}"`]),
      ...properties.map((p) => ['Property', p.id, `"${p.propertyName.replace(/"/g, '""')}"`, p.stage, p.externalLawFirm, p.targetCompletionDate, `"${(p.notes || '').replace(/"/g, '""')}"`]),
      ...ips.map((i) => ['IP Trademarks', i.id, `"${i.trademarkName.replace(/"/g, '""')}"`, i.status, i.externalLawFirm, i.expiryRenewalDate, `"${(i.notes || '').replace(/"/g, '""')}"`]),
    ];

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
        user,
        isAuthReady,
        isSyncingWithFirebase,
        signIn,
        signOut,
        switchAccount,
        saveLink,
        savedLinks,
        userProfiles,
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
        isGoogleDriveOpen,
        setIsGoogleDriveOpen,
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
