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
  signUpWithEmail,
  signInWithEmail,
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

export interface ActiveCounselUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl?: string;
  isFirebaseUser?: boolean;
}

export const DEFAULT_TEAM_COUNSELS: ActiveCounselUser[] = [
  {
    id: 'counsel-1',
    name: 'Elisa Zahari',
    email: 'elisa.zahari@mediaprima.com.my',
    role: 'Lead Legal Counsel (Admin)',
    department: 'Executive Legal Office',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    isFirebaseUser: true,
  },
  {
    id: 'counsel-2',
    name: 'Ahmad Fadzli',
    email: 'ahmad.fadzli@mediaprima.com.my',
    role: 'Senior Legal Counsel (Litigation & Dispute)',
    department: 'Dispute Resolution & Regulatory',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'counsel-3',
    name: 'Siti Aminah',
    email: 'siti.aminah@mediaprima.com.my',
    role: 'Legal Counsel (Commercial Contracts)',
    department: 'Commercial & Ad Sales',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'counsel-4',
    name: 'Tan Wei Lun',
    email: 'weilun.tan@mediaprima.com.my',
    role: 'Legal Counsel (Conveyancing & IP)',
    department: 'Real Estate & Trademark Operations',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'counsel-5',
    name: 'Nurul Huda',
    email: 'huda.nurul@mediaprima.com.my',
    role: 'Legal Operations & Compliance Executive',
    department: 'Legal Operations & Governance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
];

interface SelectedMatterPayload {
  type: 'agreement' | 'lod' | 'property' | 'ip';
  id: string;
}

interface LegalContextType {
  agreements: AgreementMatter[];
  lods: LodMatter[];
  properties: PropertyMatter[];
  ips: IpMatter[];
  allAgreements: AgreementMatter[];
  allLods: LodMatter[];
  allProperties: PropertyMatter[];
  allIps: IpMatter[];
  userScope: 'personal' | 'team';
  setUserScope: (scope: 'personal' | 'team') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeFilter: AlertFilter;
  setActiveFilter: (filter: AlertFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Firebase Auth & Multi-User Cloud Sync
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  user: User | null;
  activeUser: ActiveCounselUser;
  setActiveUser: (user: ActiveCounselUser) => void;
  teamCounsels: ActiveCounselUser[];
  signInCounsel: (email: string, name?: string, role?: string, department?: string) => void;
  seedTeammateSampleData: (email: string, name: string) => void;
  userProfiles: AppUserProfile[];
  savedLinks: any[];
  isAuthReady: boolean;
  isSyncingWithFirebase: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  switchAccount: () => Promise<void>;
  signUp: (email: string, pass: string, displayName: string, role?: string, department?: string) => Promise<void>;
  signInWithCredentials: (email: string, pass: string) => Promise<void>;
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
  const [allAgreements, setAllAgreements] = useState<AgreementMatter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_AGREEMENTS;
  });

  const [allLods, setAllLods] = useState<LodMatter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LODS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_LODS;
  });

  const [allProperties, setAllProperties] = useState<PropertyMatter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_PROPERTIES;
  });

  const [allIps, setAllIps] = useState<IpMatter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IPS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_IPS;
  });

  // Multi-user personal vs team view scope
  const [userScope, setUserScope] = useState<'personal' | 'team'>('personal');

  // Multi-user authentication session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveCounselUser>(DEFAULT_TEAM_COUNSELS[0]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [savedLinks, setSavedLinks] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<AppUserProfile[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSyncingWithFirebase, setIsSyncingWithFirebase] = useState(false);

  // Full unified matters
  const agreements = allAgreements;
  const lods = allLods;
  const properties = allProperties;
  const ips = allIps;

  // Auth observer
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        const counselUser: ActiveCounselUser = {
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Legal Counsel',
          email: (currentUser.email || '').toLowerCase(),
          role:
            currentUser.email === 'elisa.zahari@mediaprima.com.my'
              ? 'Lead Legal Counsel (Admin)'
              : 'In-House Legal Counsel',
          department: 'Media Prima Legal Operations',
          avatarUrl: currentUser.photoURL || undefined,
          isFirebaseUser: true,
        };
        setActiveUser(counselUser);
        setIsAuthenticated(true);
        localStorage.setItem('lexops_auth_session', 'true');
        localStorage.setItem('lexops_active_counsel', JSON.stringify(counselUser));
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const signInCounsel = (email: string, name?: string, role?: string, department?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = DEFAULT_TEAM_COUNSELS.find((c) => c.email.toLowerCase() === trimmedEmail);
    const counselUser: ActiveCounselUser = {
      id: existing ? existing.id : `counsel-${Date.now()}`,
      name:
        name?.trim() ||
        existing?.name ||
        trimmedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      email: trimmedEmail,
      role:
        role ||
        existing?.role ||
        (trimmedEmail === 'elisa.zahari@mediaprima.com.my'
          ? 'Lead Legal Counsel (Admin)'
          : 'In-House Legal Counsel'),
      department: department || existing?.department || 'Legal Department, Media Prima Berhad',
      avatarUrl: existing?.avatarUrl,
    };
    setActiveUser(counselUser);
    setIsAuthenticated(true);
    localStorage.setItem('lexops_auth_session', 'true');
    localStorage.setItem('lexops_active_counsel', JSON.stringify(counselUser));
  };

  const seedTeammateSampleData = (email: string, name: string) => {
    const emailLower = email.toLowerCase();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const expDate = new Date(now.getTime() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const starterAgreement: AgreementMatter = {
      id: `AGR-${Date.now().toString().slice(-4)}`,
      title: `${name} - Operational Services Master Agreement`,
      agreementType: 'Master Services Agreement',
      stakeholderName: 'Corporate Strategy Group',
      stakeholderDepartment: 'Legal Operations',
      counterpartyName: 'Premier Technology Solutions Sdn Bhd',
      requestDate: dateStr,
      expectedExpiryDate: expDate,
      renewalPromptLeadDays: 60,
      stage: 'LDRF Received / Drafting',
      tatDaysElapsed: 1,
      lastModified: `${dateStr} 09:00`,
      contractValue: 450000,
      currency: 'MYR',
      assignedCounsel: `${name} (In-House)`,
      ownerEmail: emailLower,
      notes: `Initial operational agreement assigned to ${name}.`,
    };

    const starterLod: LodMatter = {
      id: `LOD-${Date.now().toString().slice(-4)}`,
      claimRef: `MPB/LEGAL/${name.split(' ')[0].toUpperCase()}/2024/01`,
      title: `${name} - Software Licensing Compliance Claim Review`,
      claimantName: 'Enterprise Software Alliance Malaysia',
      adverseCounsel: 'Messrs. Wong & Partners',
      appointedLitigationFirm: 'Messrs. Shearn Delamore & Co',
      briefClaimSummary: 'Letter of Demand alleging software license discrepancy across secondary subsidiary workstation clusters.',
      claimAmount: 185000,
      currency: 'MYR',
      dateReceived: dateStr,
      responseDeadlineDate: new Date(now.getTime() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      responseDeadlineOption: '14 Days',
      stage: 'Fact-Finding with Stakeholders',
      currentFactFindingStep: 'Internal Audit with IT Department',
      inquiredStakeholders: ['IT Security Lead', 'Enterprise Architecture', 'Procurement'],
      responseNotes: `Case file opened by ${name}. Initial memorandum drafted.`,
      assignedCounsel: `${name} (In-House)`,
      ownerEmail: emailLower,
    };

    const starterProperty: PropertyMatter = {
      id: `PROP-${Date.now().toString().slice(-4)}`,
      propertyName: 'Media Prima Regional Hub Commercial Tenancy',
      propertyAddress: 'Unit 4-02, Menara MPB, Jalan Bukit Bintang, Kuala Lumpur',
      transactionType: 'Tenancy',
      counterparty: 'Sunway REIT Management Sdn Bhd',
      internalStakeholder: 'Regional Office Operations',
      stakeholderDepartment: 'Corporate Services',
      externalLawFirm: 'Messrs. Halim Hong & Koh',
      lawyerContact: 'partner@hhk.com.my',
      targetCompletionDate: expDate,
      stage: 'Initial Drafting',
      rentalOrValueAmount: 32000,
      currency: 'MYR',
      assignedCounsel: `${name} (In-House)`,
      ownerEmail: emailLower,
      notes: `Commercial tenancy renewal monitored by ${name}.`,
    };

    const starterIp: IpMatter = {
      id: `TM-${Date.now().toString().slice(-4)}`,
      ipType: 'Trademark',
      trademarkName: `${name.split(' ')[0]} Media Special Feature Brand`,
      registrationNumber: `MY-${Date.now().toString().slice(-6)}`,
      niceClass: 'Class 38 (Telecommunications & Broadcasting)',
      filingDate: dateStr,
      expiryRenewalDate: new Date(now.getTime() + 365 * 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Registered',
      stakeholderName: 'Content & IP Governance',
      stakeholderDepartment: 'Group Digital',
      externalLawFirm: 'Messrs. Henry Goh & Co',
      lawyerContact: 'trademark@henrygoh.com',
      jurisdiction: 'Malaysia (MyIPO)',
      assignedCounsel: `${name} (In-House)`,
      ownerEmail: emailLower,
      notes: `Registered trademark portfolio under ${name}.`,
    };

    setAllAgreements((prev) => [starterAgreement, ...prev]);
    setAllLods((prev) => [starterLod, ...prev]);
    setAllProperties((prev) => [starterProperty, ...prev]);
    setAllIps((prev) => [starterIp, ...prev]);

    setDoc(doc(db, 'agreements', starterAgreement.id), starterAgreement).catch(console.warn);
    setDoc(doc(db, 'lods', starterLod.id), starterLod).catch(console.warn);
    setDoc(doc(db, 'properties', starterProperty.id), starterProperty).catch(console.warn);
    setDoc(doc(db, 'ips', starterIp.id), starterIp).catch(console.warn);
  };

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // Handled gracefully in signInWithGoogle
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
    setIsAuthenticated(false);
    localStorage.removeItem('lexops_auth_session');
  };

  const switchAccount = async () => {
    try {
      const cred = await signInWithGoogle();
      if (cred?.user) {
        const u = cred.user;
        const counselUser: ActiveCounselUser = {
          id: u.uid,
          name: u.displayName || u.email?.split('@')[0] || 'Legal Counsel',
          email: (u.email || '').toLowerCase(),
          role:
            u.email === 'elisa.zahari@mediaprima.com.my'
              ? 'Lead Legal Counsel (Admin)'
              : 'In-House Legal Counsel',
          department: 'Legal Department, Media Prima Berhad',
          avatarUrl: u.photoURL || undefined,
          isFirebaseUser: true,
        };
        setActiveUser(counselUser);
        setIsAuthenticated(true);
        localStorage.setItem('lexops_auth_session', 'true');
        localStorage.setItem('lexops_active_counsel', JSON.stringify(counselUser));
      }
    } catch {
      // Handled gracefully in signInWithGoogle
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    displayName: string,
    role: string = 'In-House Legal Counsel',
    department: string = 'Media Prima Legal Operations'
  ) => {
    await signUpWithEmail(email, pass, displayName, role, department);
    signInCounsel(email, displayName, role, department);
  };

  const signInWithCredentials = async (email: string, pass: string) => {
    await signInWithEmail(email, pass);
    signInCounsel(email);
  };

  const saveLink = async (linkData: any) => {
    try {
      await saveLinkToFirebase(linkData);
      setSavedLinks((prev) => [linkData, ...prev.filter((l) => l.id !== linkData.id)]);
    } catch (err) {
      console.error('Failed to save link to Firebase:', err);
    }
  };

  // Real-time Firestore synchronization
  useEffect(() => {
    setIsSyncingWithFirebase(true);

    const unsubAgreements = onSnapshot(
      collection(db, 'agreements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as AgreementMatter);
          setAllAgreements(remote);
        } else {
          // Initial seed
          allAgreements.forEach((agr) => {
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
          setAllLods(remote);
        } else {
          allLods.forEach((lod) => {
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
          setAllProperties(remote);
        } else {
          allProperties.forEach((prop) => {
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
          setAllIps(remote);
        } else {
          allIps.forEach((ip) => {
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
  }, []);

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
      localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(allAgreements));
    } catch (e) {
      console.error(e);
    }
  }, [allAgreements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LODS, JSON.stringify(allLods));
    } catch (e) {
      console.error(e);
    }
  }, [allLods]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(allProperties));
    } catch (e) {
      console.error(e);
    }
  }, [allProperties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IPS, JSON.stringify(allIps));
    } catch (e) {
      console.error(e);
    }
  }, [allIps]);

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
    setAllAgreements((prev) =>
      prev.map((agr) => ({
        ...agr,
        tatDaysElapsed: calculateTAT(agr.requestDate, agr.executionDate),
      }))
    );
  }, []);

  const addAgreement = (data: Omit<AgreementMatter, 'id' | 'tatDaysElapsed' | 'lastModified'>) => {
    const nextNumber = allAgreements.length + 42;
    const newId = `AGR-2024-${String(nextNumber).padStart(3, '0')}`;
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const tat = calculateTAT(data.requestDate, data.executionDate);

    const newAgreement: AgreementMatter = {
      ...data,
      id: newId,
      ownerEmail: data.ownerEmail || activeUser.email.toLowerCase(),
      assignedCounsel: data.assignedCounsel || `${activeUser.name} (In-House)`,
      tatDaysElapsed: tat,
      lastModified: formattedNow,
    };

    setAllAgreements((prev) => [newAgreement, ...prev]);

    setDoc(doc(db, 'agreements', newId), newAgreement).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `agreements/${newId}`)
    );
  };

  const updateAgreement = (id: string, updates: Partial<AgreementMatter>) => {
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setAllAgreements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates, lastModified: formattedNow };
          if (updates.stage === 'Executed / Signed' && !merged.executionDate) {
            merged.executionDate = now.toISOString().split('T')[0];
          }
          merged.tatDaysElapsed = calculateTAT(merged.requestDate, merged.executionDate);

          setDoc(doc(db, 'agreements', id), merged).catch((err) =>
            handleFirestoreError(err, OperationType.UPDATE, `agreements/${id}`)
          );
          return merged;
        }
        return item;
      })
    );
  };

  const addLod = (data: Omit<LodMatter, 'id'>) => {
    const nextNumber = allLods.length + 17;
    const newId = `LOD-2024-${String(nextNumber).padStart(3, '0')}`;
    const newLod: LodMatter = {
      ...data,
      id: newId,
      ownerEmail: data.ownerEmail || activeUser.email.toLowerCase(),
      assignedCounsel: data.assignedCounsel || `${activeUser.name} (In-House)`,
    };
    setAllLods((prev) => [newLod, ...prev]);

    setDoc(doc(db, 'lods', newId), newLod).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `lods/${newId}`)
    );
  };

  const updateLod = (id: string, updates: Partial<LodMatter>) => {
    setAllLods((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          setDoc(doc(db, 'lods', id), merged).catch((err) =>
            handleFirestoreError(err, OperationType.UPDATE, `lods/${id}`)
          );
          return merged;
        }
        return item;
      })
    );
  };

  const addProperty = (data: Omit<PropertyMatter, 'id'>) => {
    const nextNumber = allProperties.length + 9;
    const newId = `PROP-2024-${String(nextNumber).padStart(3, '0')}`;
    const newProp: PropertyMatter = {
      ...data,
      id: newId,
      ownerEmail: data.ownerEmail || activeUser.email.toLowerCase(),
      assignedCounsel: data.assignedCounsel || `${activeUser.name} (In-House)`,
    };
    setAllProperties((prev) => [newProp, ...prev]);

    setDoc(doc(db, 'properties', newId), newProp).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `properties/${newId}`)
    );
  };

  const updateProperty = (id: string, updates: Partial<PropertyMatter>) => {
    setAllProperties((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          setDoc(doc(db, 'properties', id), merged).catch((err) =>
            handleFirestoreError(err, OperationType.UPDATE, `properties/${id}`)
          );
          return merged;
        }
        return item;
      })
    );
  };

  const addIp = (data: Omit<IpMatter, 'id'>) => {
    const isPatent = data.ipType === 'Patent';
    const prefix = isPatent ? 'PAT' : 'TM';
    const nextNumber = allIps.length + 13;
    const newId = `${prefix}-2024-${String(nextNumber).padStart(3, '0')}`;
    const newIp: IpMatter = {
      ...data,
      id: newId,
      ownerEmail: data.ownerEmail || activeUser.email.toLowerCase(),
      assignedCounsel: data.assignedCounsel || `${activeUser.name} (In-House)`,
    };
    setAllIps((prev) => [newIp, ...prev]);

    setDoc(doc(db, 'ips', newId), newIp).catch((err) =>
      handleFirestoreError(err, OperationType.CREATE, `ips/${newId}`)
    );
  };

  const updateIp = (id: string, updates: Partial<IpMatter>) => {
    setAllIps((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          setDoc(doc(db, 'ips', id), merged).catch((err) =>
            handleFirestoreError(err, OperationType.UPDATE, `ips/${id}`)
          );
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
      setAllAgreements((prev) => prev.filter((i) => i.id !== id));
    } else if (type === 'lod') {
      setAllLods((prev) => prev.filter((i) => i.id !== id));
    } else if (type === 'property') {
      setAllProperties((prev) => prev.filter((i) => i.id !== id));
    } else if (type === 'ip') {
      setAllIps((prev) => prev.filter((i) => i.id !== id));
    }

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

    if (selectedMatter && selectedMatter.id === id) {
      setSelectedMatter(null);
      setIsInspectionDrawerOpen(false);
    }
  };

  const resetToDefaultData = () => {
    setAllAgreements(INITIAL_AGREEMENTS);
    setAllLods(INITIAL_LODS);
    setAllProperties(INITIAL_PROPERTIES);
    setAllIps(INITIAL_IPS);
    setSelectedMatter({ type: 'lod', id: 'LOD-2024-012' });
    setIsInspectionDrawerOpen(true);
    localStorage.removeItem(STORAGE_KEYS.AGREEMENTS);
    localStorage.removeItem(STORAGE_KEYS.LODS);
    localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
    localStorage.removeItem(STORAGE_KEYS.IPS);
  };

  // Compute counts & SLA metrics for current scoped view
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
      ['Module', 'Matter ID', 'Title / Asset', 'Stage / Status', 'Assigned Counsel', 'Owner Email', 'Deadline / Expiry', 'Notes / Remarks'],
      ...agreements.map((a) => ['Agreements', a.id, `"${a.title.replace(/"/g, '""')}"`, a.stage, a.assignedCounsel, a.ownerEmail || '', a.expectedExpiryDate, `"${(a.notes || '').replace(/"/g, '""')}"`]),
      ...lods.map((l) => ['LODs', l.id, `"${l.title.replace(/"/g, '""')}"`, l.stage, l.appointedLitigationFirm, l.ownerEmail || '', l.responseDeadlineDate, `"${(l.responseNotes || '').replace(/"/g, '""')}"`]),
      ...properties.map((p) => ['Property', p.id, `"${p.propertyName.replace(/"/g, '""')}"`, p.stage, p.externalLawFirm, p.ownerEmail || '', p.targetCompletionDate, `"${(p.notes || '').replace(/"/g, '""')}"`]),
      ...ips.map((i) => ['IP Trademarks', i.id, `"${i.trademarkName.replace(/"/g, '""')}"`, i.status, i.externalLawFirm, i.ownerEmail || '', i.expiryRenewalDate, `"${(i.notes || '').replace(/"/g, '""')}"`]),
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
        allAgreements,
        allLods,
        allProperties,
        allIps,
        userScope,
        setUserScope,
        activeTab,
        setActiveTab,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        isAuthenticated,
        setIsAuthenticated,
        user,
        activeUser,
        setActiveUser,
        teamCounsels: DEFAULT_TEAM_COUNSELS,
        signInCounsel,
        seedTeammateSampleData,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAuthReady,
        isSyncingWithFirebase,
        signIn,
        signOut,
        switchAccount,
        signUp,
        signInWithCredentials,
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
