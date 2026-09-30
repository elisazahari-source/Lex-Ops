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
  signInAsNewUserDemo: () => void;
  signInAsExistingUserDemo: () => void;
  seedStarterTemplate: () => void;
  clearAllPersonalMatters: () => void;
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
    overdueBreakdown: {
      agreements: number;
      lods: number;
      properties: number;
      ips: number;
    };
    expiringBreakdown: {
      agreements: number;
      lods: number;
      properties: number;
      ips: number;
    };
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
  // Multi-user authentication session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lexops_auth_session') === 'true';
  });

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [activeUser, setActiveUser] = useState<ActiveCounselUser>(() => {
    try {
      const saved = localStorage.getItem('lexops_active_counsel');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TEAM_COUNSELS[0];
  });

  const currentUserId = user?.uid || (activeUser?.id ? activeUser.id : null);

  // Per-user matters: When creating a new account, matters are [] (blank tracker)
  const [agreements, setAgreements] = useState<AgreementMatter[]>(() => {
    try {
      const savedUser = localStorage.getItem('lexops_active_counsel');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const stored = localStorage.getItem(`${STORAGE_KEYS.AGREEMENTS}_${u.id}`);
        if (stored) return JSON.parse(stored);
        if (u.email?.toLowerCase() === 'elisa.zahari@mediaprima.com.my') {
          return INITIAL_AGREEMENTS;
        }
      }
    } catch {}
    return [];
  });

  const [lods, setLods] = useState<LodMatter[]>(() => {
    try {
      const savedUser = localStorage.getItem('lexops_active_counsel');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const stored = localStorage.getItem(`${STORAGE_KEYS.LODS}_${u.id}`);
        if (stored) return JSON.parse(stored);
        if (u.email?.toLowerCase() === 'elisa.zahari@mediaprima.com.my') {
          return INITIAL_LODS;
        }
      }
    } catch {}
    return [];
  });

  const [properties, setProperties] = useState<PropertyMatter[]>(() => {
    try {
      const savedUser = localStorage.getItem('lexops_active_counsel');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const stored = localStorage.getItem(`${STORAGE_KEYS.PROPERTIES}_${u.id}`);
        if (stored) return JSON.parse(stored);
        if (u.email?.toLowerCase() === 'elisa.zahari@mediaprima.com.my') {
          return INITIAL_PROPERTIES;
        }
      }
    } catch {}
    return [];
  });

  const [ips, setIps] = useState<IpMatter[]>(() => {
    try {
      const savedUser = localStorage.getItem('lexops_active_counsel');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const stored = localStorage.getItem(`${STORAGE_KEYS.IPS}_${u.id}`);
        if (stored) return JSON.parse(stored);
        if (u.email?.toLowerCase() === 'elisa.zahari@mediaprima.com.my') {
          return INITIAL_IPS;
        }
      }
    } catch {}
    return [];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [savedLinks, setSavedLinks] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<AppUserProfile[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSyncingWithFirebase, setIsSyncingWithFirebase] = useState(false);

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

  const signInAsNewUserDemo = () => {
    const counselUser: ActiveCounselUser = {
      id: 'demo-new-user-clean',
      name: 'Nurul Aisyah',
      email: 'nurul.aisyah@company.com',
      role: 'Junior Legal Counsel',
      department: 'Corporate Legal Operations',
    };
    setActiveUser(counselUser);
    setAgreements([]);
    setLods([]);
    setProperties([]);
    setIps([]);
    setSelectedMatter(null);
    setIsAuthenticated(true);
    localStorage.setItem('lexops_auth_session', 'true');
    localStorage.setItem('lexops_active_counsel', JSON.stringify(counselUser));
  };

  const signInAsExistingUserDemo = () => {
    const counselUser: ActiveCounselUser = {
      id: 'counsel-elisa',
      name: 'Elisa Zahari',
      email: 'elisa.zahari@mediaprima.com.my',
      role: 'Lead Legal Counsel (Admin)',
      department: 'Corporate Legal Operations',
    };
    setActiveUser(counselUser);
    setAgreements(INITIAL_AGREEMENTS);
    setLods(INITIAL_LODS);
    setProperties(INITIAL_PROPERTIES);
    setIps(INITIAL_IPS);
    setSelectedMatter(null);
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

    setAgreements((prev) => [starterAgreement, ...prev]);
    setLods((prev) => [starterLod, ...prev]);
    setProperties((prev) => [starterProperty, ...prev]);
    setIps((prev) => [starterIp, ...prev]);

    if (currentUserId) {
      setDoc(doc(db, 'users', currentUserId, 'agreements', starterAgreement.id), starterAgreement).catch(console.warn);
      setDoc(doc(db, 'users', currentUserId, 'lods', starterLod.id), starterLod).catch(console.warn);
      setDoc(doc(db, 'users', currentUserId, 'properties', starterProperty.id), starterProperty).catch(console.warn);
      setDoc(doc(db, 'users', currentUserId, 'ips', starterIp.id), starterIp).catch(console.warn);
    }
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

  // Real-time Firestore synchronization per isolated user
  useEffect(() => {
    if (!currentUserId || !isAuthenticated) {
      setIsSyncingWithFirebase(false);
      return;
    }

    setIsSyncingWithFirebase(true);

    const isElisa = (activeUser?.email || '').toLowerCase() === 'elisa.zahari@mediaprima.com.my';

    const unsubAgreements = onSnapshot(
      collection(db, 'users', currentUserId, 'agreements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as AgreementMatter);
          setAgreements(remote);
        } else {
          // If Lead Counsel Elisa and her collection is completely empty, initialize with default templates
          if (isElisa) {
            INITIAL_AGREEMENTS.forEach((agr) => {
              setDoc(doc(db, 'users', currentUserId, 'agreements', agr.id), agr).catch((err) =>
                handleFirestoreError(err, OperationType.WRITE, `users/${currentUserId}/agreements/${agr.id}`)
              );
            });
            setAgreements(INITIAL_AGREEMENTS);
          } else {
            // For any other new user: stay clean and blank!
            setAgreements([]);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUserId}/agreements`);
      }
    );

    const unsubLods = onSnapshot(
      collection(db, 'users', currentUserId, 'lods'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as LodMatter);
          setLods(remote);
        } else {
          if (isElisa) {
            INITIAL_LODS.forEach((lod) => {
              setDoc(doc(db, 'users', currentUserId, 'lods', lod.id), lod).catch((err) =>
                handleFirestoreError(err, OperationType.WRITE, `users/${currentUserId}/lods/${lod.id}`)
              );
            });
            setLods(INITIAL_LODS);
          } else {
            setLods([]);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUserId}/lods`);
      }
    );

    const unsubProperties = onSnapshot(
      collection(db, 'users', currentUserId, 'properties'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as PropertyMatter);
          setProperties(remote);
        } else {
          if (isElisa) {
            INITIAL_PROPERTIES.forEach((prop) => {
              setDoc(doc(db, 'users', currentUserId, 'properties', prop.id), prop).catch((err) =>
                handleFirestoreError(err, OperationType.WRITE, `users/${currentUserId}/properties/${prop.id}`)
              );
            });
            setProperties(INITIAL_PROPERTIES);
          } else {
            setProperties([]);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUserId}/properties`);
      }
    );

    const unsubIps = onSnapshot(
      collection(db, 'users', currentUserId, 'ips'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remote = snapshot.docs.map((d) => d.data() as IpMatter);
          setIps(remote);
        } else {
          if (isElisa) {
            INITIAL_IPS.forEach((ip) => {
              setDoc(doc(db, 'users', currentUserId, 'ips', ip.id), ip).catch((err) =>
                handleFirestoreError(err, OperationType.WRITE, `users/${currentUserId}/ips/${ip.id}`)
              );
            });
            setIps(INITIAL_IPS);
          } else {
            setIps([]);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${currentUserId}/ips`);
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
  }, [currentUserId, isAuthenticated, activeUser?.email]);

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

  // Sync to local storage per user
  useEffect(() => {
    if (!currentUserId) return;
    try {
      localStorage.setItem(`${STORAGE_KEYS.AGREEMENTS}_${currentUserId}`, JSON.stringify(agreements));
    } catch (e) {
      console.error(e);
    }
  }, [agreements, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    try {
      localStorage.setItem(`${STORAGE_KEYS.LODS}_${currentUserId}`, JSON.stringify(lods));
    } catch (e) {
      console.error(e);
    }
  }, [lods, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    try {
      localStorage.setItem(`${STORAGE_KEYS.PROPERTIES}_${currentUserId}`, JSON.stringify(properties));
    } catch (e) {
      console.error(e);
    }
  }, [properties, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    try {
      localStorage.setItem(`${STORAGE_KEYS.IPS}_${currentUserId}`, JSON.stringify(ips));
    } catch (e) {
      console.error(e);
    }
  }, [ips, currentUserId]);

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

  const seedStarterTemplate = () => {
    if (!currentUserId) return;
    setAgreements(INITIAL_AGREEMENTS);
    setLods(INITIAL_LODS);
    setProperties(INITIAL_PROPERTIES);
    setIps(INITIAL_IPS);

    INITIAL_AGREEMENTS.forEach((agr) => {
      setDoc(doc(db, 'users', currentUserId, 'agreements', agr.id), agr).catch(console.warn);
    });
    INITIAL_LODS.forEach((lod) => {
      setDoc(doc(db, 'users', currentUserId, 'lods', lod.id), lod).catch(console.warn);
    });
    INITIAL_PROPERTIES.forEach((prop) => {
      setDoc(doc(db, 'users', currentUserId, 'properties', prop.id), prop).catch(console.warn);
    });
    INITIAL_IPS.forEach((ip) => {
      setDoc(doc(db, 'users', currentUserId, 'ips', ip.id), ip).catch(console.warn);
    });
  };

  const clearAllPersonalMatters = () => {
    if (!currentUserId) return;
    setAgreements([]);
    setLods([]);
    setProperties([]);
    setIps([]);
    setSelectedMatter(null);

    // Clean up in Firestore
    agreements.forEach((agr) => {
      deleteDoc(doc(db, 'users', currentUserId, 'agreements', agr.id)).catch(console.warn);
    });
    lods.forEach((lod) => {
      deleteDoc(doc(db, 'users', currentUserId, 'lods', lod.id)).catch(console.warn);
    });
    properties.forEach((prop) => {
      deleteDoc(doc(db, 'users', currentUserId, 'properties', prop.id)).catch(console.warn);
    });
    ips.forEach((ip) => {
      deleteDoc(doc(db, 'users', currentUserId, 'ips', ip.id)).catch(console.warn);
    });

    try {
      localStorage.removeItem(`${STORAGE_KEYS.AGREEMENTS}_${currentUserId}`);
      localStorage.removeItem(`${STORAGE_KEYS.LODS}_${currentUserId}`);
      localStorage.removeItem(`${STORAGE_KEYS.PROPERTIES}_${currentUserId}`);
      localStorage.removeItem(`${STORAGE_KEYS.IPS}_${currentUserId}`);
    } catch {}
  };

  const addAgreement = (data: Omit<AgreementMatter, 'id' | 'tatDaysElapsed' | 'lastModified'>) => {
    const nextNumber = agreements.length + 1;
    const newId = `AGR-2024-${String(nextNumber).padStart(3, '0')}`;
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const tat = calculateTAT(data.requestDate, data.executionDate);

    const newAgreement: AgreementMatter = {
      ...data,
      id: newId,
      ownerEmail: data.ownerEmail || activeUser?.email?.toLowerCase(),
      assignedCounsel: data.assignedCounsel || `${activeUser?.name || 'In-House'} (In-House)`,
      tatDaysElapsed: tat,
      lastModified: formattedNow,
    };

    setAgreements((prev) => [newAgreement, ...prev]);

    if (currentUserId) {
      setDoc(doc(db, 'users', currentUserId, 'agreements', newId), newAgreement).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUserId}/agreements/${newId}`)
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

          if (currentUserId) {
            setDoc(doc(db, 'users', currentUserId, 'agreements', id), merged).catch((err) =>
              handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserId}/agreements/${id}`)
            );
          }
          return merged;
        }
        return item;
      })
    );
  };

  const addLod = (data: Omit<LodMatter, 'id'>) => {
    const nextNumber = lods.length + 1;
    const newId = `LOD-2024-${String(nextNumber).padStart(3, '0')}`;
    const newLod: LodMatter = {
      ...data,
      id: newId,
      ownerEmail: data.ownerEmail || activeUser?.email?.toLowerCase(),
      assignedCounsel: data.assignedCounsel || `${activeUser?.name || 'In-House'} (In-House)`,
    };
    setLods((prev) => [newLod, ...prev]);

    if (currentUserId) {
      setDoc(doc(db, 'users', currentUserId, 'lods', newId), newLod).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUserId}/lods/${newId}`)
      );
    }
  };

  const updateLod = (id: string, updates: Partial<LodMatter>) => {
    setLods((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          if (currentUserId) {
            setDoc(doc(db, 'users', currentUserId, 'lods', id), merged).catch((err) =>
              handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserId}/lods/${id}`)
            );
          }
          return merged;
        }
        return item;
      })
    );
  };

  const addProperty = (data: Omit<PropertyMatter, 'id'>) => {
    const nextNumber = properties.length + 1;
    const newId = `PROP-2024-${String(nextNumber).padStart(3, '0')}`;
    const newProp: PropertyMatter = {
      ...data,
      id: newId,
      ownerEmail: data.ownerEmail || activeUser?.email?.toLowerCase(),
      assignedCounsel: data.assignedCounsel || `${activeUser?.name || 'In-House'} (In-House)`,
    };
    setProperties((prev) => [newProp, ...prev]);

    if (currentUserId) {
      setDoc(doc(db, 'users', currentUserId, 'properties', newId), newProp).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUserId}/properties/${newId}`)
      );
    }
  };

  const updateProperty = (id: string, updates: Partial<PropertyMatter>) => {
    setProperties((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          if (currentUserId) {
            setDoc(doc(db, 'users', currentUserId, 'properties', id), merged).catch((err) =>
              handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserId}/properties/${id}`)
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
    const nextNumber = ips.length + 1;
    const newId = `${prefix}-2024-${String(nextNumber).padStart(3, '0')}`;
    const newIp: IpMatter = {
      ...data,
      id: newId,
      ownerEmail: data.ownerEmail || activeUser?.email?.toLowerCase(),
      assignedCounsel: data.assignedCounsel || `${activeUser?.name || 'In-House'} (In-House)`,
    };
    setIps((prev) => [newIp, ...prev]);

    if (currentUserId) {
      setDoc(doc(db, 'users', currentUserId, 'ips', newId), newIp).catch((err) =>
        handleFirestoreError(err, OperationType.CREATE, `users/${currentUserId}/ips/${newId}`)
      );
    }
  };

  const updateIp = (id: string, updates: Partial<IpMatter>) => {
    setIps((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          if (currentUserId) {
            setDoc(doc(db, 'users', currentUserId, 'ips', id), merged).catch((err) =>
              handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserId}/ips/${id}`)
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

    if (currentUserId) {
      const collectionName =
        type === 'agreement'
          ? 'agreements'
          : type === 'lod'
          ? 'lods'
          : type === 'property'
          ? 'properties'
          : 'ips';
      deleteDoc(doc(db, 'users', currentUserId, collectionName, id)).catch((err) =>
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUserId}/${collectionName}/${id}`)
      );
    }

    if (selectedMatter && selectedMatter.id === id) {
      setSelectedMatter(null);
      setIsInspectionDrawerOpen(false);
    }
  };

  const resetToDefaultData = () => {
    seedStarterTemplate();
    setSelectedMatter({ type: 'lod', id: 'LOD-2024-012' });
    setIsInspectionDrawerOpen(true);
  };

  // Compute counts & SLA metrics for current scoped view
  const overdueBreakdown = React.useMemo(() => {
    const overdueLods = lods.filter((l) => {
      const remaining = getDaysRemaining(l.responseDeadlineDate);
      return remaining !== null && remaining <= 0 && l.stage !== 'Response Sent - Closed';
    }).length;

    const overdueAgreements = agreements.filter((a) => {
      const remaining = getDaysRemaining(a.expectedExpiryDate);
      return remaining !== null && remaining <= 0;
    }).length;

    const overdueProperties = properties.filter((p) => {
      const remaining = getDaysRemaining(p.targetCompletionDate);
      return remaining !== null && remaining <= 0 && p.stage !== 'Stamped-Completed';
    }).length;

    const overdueIps = ips.filter((i) => {
      const remaining = getDaysRemaining(i.expiryRenewalDate);
      return remaining !== null && remaining <= 0;
    }).length;

    return {
      lods: overdueLods,
      agreements: overdueAgreements,
      properties: overdueProperties,
      ips: overdueIps,
    };
  }, [agreements, lods, properties, ips]);

  const expiredOverdueCount = React.useMemo(() => {
    return (
      overdueBreakdown.lods +
      overdueBreakdown.agreements +
      overdueBreakdown.properties +
      overdueBreakdown.ips
    );
  }, [overdueBreakdown]);

  const expiringBreakdown = React.useMemo(() => {
    const expiringProperties = properties.filter((p) => {
      const remaining = getDaysRemaining(p.targetCompletionDate);
      return remaining !== null && remaining > 0 && remaining <= 30 && p.stage !== 'Stamped-Completed';
    }).length;

    const expiringIps = ips.filter((i) => {
      const remaining = getDaysRemaining(i.expiryRenewalDate);
      return remaining !== null && remaining > 0 && remaining <= 30;
    }).length;

    const expiringAgreements = agreements.filter((a) => {
      const remaining = getDaysRemaining(a.expectedExpiryDate);
      return remaining !== null && remaining > 0 && remaining <= 30;
    }).length;

    const expiringLods = lods.filter((l) => {
      const remaining = getDaysRemaining(l.responseDeadlineDate);
      return remaining !== null && remaining > 0 && remaining <= 30 && l.stage !== 'Response Sent - Closed';
    }).length;

    return {
      properties: expiringProperties,
      ips: expiringIps,
      agreements: expiringAgreements,
      lods: expiringLods,
    };
  }, [agreements, lods, properties, ips]);

  const expiringSoonCount = React.useMemo(() => {
    return (
      expiringBreakdown.properties +
      expiringBreakdown.ips +
      expiringBreakdown.agreements +
      expiringBreakdown.lods
    );
  }, [expiringBreakdown]);

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
        allAgreements: agreements,
        allLods: lods,
        allProperties: properties,
        allIps: ips,
        userScope: 'personal',
        setUserScope: () => {},
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
        signInAsNewUserDemo,
        signInAsExistingUserDemo,
        seedStarterTemplate,
        clearAllPersonalMatters,
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
          overdueBreakdown,
          expiringBreakdown,
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
