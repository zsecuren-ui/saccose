import React, { createContext, useContext, useState, useEffect } from 'react';
import { idbGet, idbSet, idbEnqueue, idbGetQueue, idbClearQueue } from '../lib/idbStorage';
import { AnnouncementsService, Announcement } from '../lib/announcements';
import {
  Language,
  UserRole,
  ThemeColor,
  Institution,
  SubscriptionPlan,
  Member,
  Loan,
  SavingsAccount,
  SharesAccount,
  Transaction,
  AccountCOA,
  AuditLog,
  SystemNotification,
  FinePenalty,
  PublicAdvertisement,
  PaymentProof,
  StoredDailyAuditReport,
  UserAuthSession,
  InstitutionProject,
  ProjectFinancialLog
} from '../types';

import {
  getInitialStoredAuditReports,
  create24HourAuditReportObject
} from '../lib/auditCronStorageEngine';
import {
  initialSubscriptionPlans,
  initialInstitutions,
  initialMembers,
  initialLoans,
  initialSavingsAccounts,
  initialSharesAccounts,
  initialTransactions,
  initialCOA,
  initialAuditLogs,
  initialNotifications,
  initialFines,
  initialPublicAds,
  initialPaymentProofs,
  initialProjects
} from '../data/initialData';
import { translations } from '../translations';
import { supabase, getSupabaseClient, SupabaseService } from '../lib/supabase';
interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  // Loading & Initialization State
  isInitializing: boolean;
  globalLoading: { isLoading: boolean; message?: string } | null;
  setGlobalLoading: (loading: boolean | { isLoading: boolean; message?: string } | null) => void;
  
  // Data State
  institutions: Institution[];
  subscriptionPlans: SubscriptionPlan[];
  members: Member[];
  loans: Loan[];
  savingsAccounts: SavingsAccount[];
  sharesAccounts: SharesAccount[];
  transactions: Transaction[];
  coa: AccountCOA[];
  auditLogs: AuditLog[];
  notifications: SystemNotification[];
  fines: FinePenalty[];
  publicAds: PublicAdvertisement[];
  paymentProofs: PaymentProof[];
  projects: InstitutionProject[];
  storedAuditReports: StoredDailyAuditReport[];
  lastCronRunTimestamp: number;

  // Auth State
  userAuth: UserAuthSession | null;
  loginSuperAdmin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerSuperAdmin: (fullName: string, username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>;
  loginTenantAdmin: (institutionId: string, username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginMember: (institutionId: string, usernameOrMemberNo: string, password: string) => Promise<{ success: boolean; message: string }>;
  updateInstitutionCredentials: (institutionId: string, username: string, password: string) => void;
  updateMemberCredentials: (memberId: string, email: string, password: string, fullName: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;

  // Selected State
  currentInstitution: Institution;
  setCurrentInstitutionId: (id: string) => void;
  currentMember: Member;
  setCurrentMemberId: (id: string) => void;

  // Actions
  t: (key: keyof typeof translations['sw']) => string;
  formatTZS: (amount: number) => string;
  generateDailyAuditReportNow: () => StoredDailyAuditReport;
  deleteStoredAuditReport: (reportId: string) => void;
  addInstitution: (newInst: Omit<Institution, 'id' | 'joinedDate' | 'status'>) => Promise<void>;
  deleteInstitution: (id: string) => void;
  updateInstitution: (id: string, updates: Partial<Institution>) => void;
  updateInstitutionPlan: (institutionId: string, planId: string, planName: string, maxMembers?: number) => void;
  toggleInstitutionStatus: (id: string) => void;
  addMember: (newMember: Omit<Member, 'id' | 'joinedDate' | 'memberNumber' | 'totalSavings' | 'totalShares' | 'totalLoansOutstanding'>) => void;
  addBatchMembers: (count: number, prefixName?: string, branch?: string) => void;
  deleteMember: (memberId: string) => void;
  addFine: (fineData: Omit<FinePenalty, 'id' | 'issuedDate' | 'status'>) => void;
  payFine: (fineId: string) => void;
  waiveFine: (fineId: string) => void;
  applyLoan: (loanData: {
    amountRequested: number;
    durationMonths: number;
    loanType: string;
    customLoanTypeName?: string;
    interestRateAnnual?: number;
    purpose: string;
  }) => void;
  issueDirectLoan: (loanData: {
    memberId: string;
    amount: number;
    durationMonths: number;
    interestRateAnnual: number;
    loanType: string;
    customLoanTypeName?: string;
    purpose: string;
    disburseImmediately?: boolean;
  }) => void;
  updateLoanTerms: (loanId: string, updates: {
    amountApproved?: number;
    interestRateAnnual?: number;
    durationMonths?: number;
  }) => void;
  updateInstitutionLoanRates: (rates: Record<string, number>, defaultRate?: number) => void;
  approveLoanStep: (loanId: string, stepNumber: number, approverName: string, comment: string) => void;
  rejectLoan: (loanId: string, comment: string) => void;
  makeRepayment: (loanId: string, amount: number, channel: Transaction['paymentChannel']) => void;
  makeSavingsDeposit: (memberId: string, amount: number, channel: Transaction['paymentChannel'], type: 'Mandatory' | 'Voluntary' | 'FixedDeposit') => void;
  purchaseShares: (memberId: string, units: number, channel: Transaction['paymentChannel']) => void;
  addTransaction: (tx: Transaction) => void;
  updateBranding: (instId: string, branding: {
    logo?: string;
    primaryColor?: string;
    name?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
  }) => void;
  updateMemberProfile: (memberId: string, updates: Partial<Member>) => void;
  addPublicAd: (newAd: Omit<PublicAdvertisement, 'id' | 'date'>) => void;
  updatePublicAd: (id: string, updates: Partial<PublicAdvertisement>) => void;
  deletePublicAd: (id: string) => void;
  togglePublicAdStatus: (id: string) => void;
  submitPaymentProof: (proof: Omit<PaymentProof, 'id' | 'submittedDate' | 'status'>) => void;
  verifyPaymentProof: (proofId: string, status: 'Approved' | 'Rejected', verifiedBy: string, rejectionReason?: string) => void;
  addProject: (newProject: Omit<InstitutionProject, 'id' | 'createdDate' | 'financialLogs'>) => void;
  updateProject: (id: string, updates: Partial<InstitutionProject>) => void;
  deleteProject: (id: string) => void;
  addProjectFinancialLog: (projectId: string, log: Omit<ProjectFinancialLog, 'id'>) => void;
  deleteProjectFinancialLog: (projectId: string, logId: string) => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'date' | 'read'> & { date?: string; read?: boolean }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (tenantId?: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: (tenantId?: string) => void;
  announcements: Announcement[];
  addAnnouncement: (content: string) => Promise<{ success: boolean; message?: string }>;
  refreshMembers: () => Promise<void>;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('saccos_lang') as Language) || 'sw';
  });

  // Safe LocalStorage helpers to prevent QuotaExceededError and invalid JSON crashes
  const safeSetLocalStorage = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[LocalStorage] Storage quota exceeded while saving ${key}. Executing fallback storage compression.`, e);
      try {
        if (key === 'saccos_insts') {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((inst: any) => {
              // Avoid saving very large data-urls for logo/banner which blow localStorage quota
              if (inst.logo && typeof inst.logo === 'string' && inst.logo.length > 20000 && inst.logo.startsWith('data:image')) {
                return { ...inst, logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name || 'Taasisi')}&background=0d9488&color=fff&size=200` };
              }
              if (inst.bannerUrl && typeof inst.bannerUrl === 'string' && inst.bannerUrl.length > 40000 && inst.bannerUrl.startsWith('data:image')) {
                return { ...inst, bannerUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200' };
              }
              return inst;
            });
            localStorage.setItem(key, JSON.stringify(sanitized));
            return;
          }
        }
        if (key === 'saccos_members') {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((m: any) => {
              if (m.photoUrl && m.photoUrl.length > 20000 && m.photoUrl.startsWith('data:image')) {
                return { ...m, photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' };
              }
              return m;
            });
            localStorage.setItem(key, JSON.stringify(sanitized));
            return;
          }
        }
        if (key === 'saccos_payment_proofs') {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.map((p: any) => {
              if (p.proofImageData && p.proofImageData.length > 20000) {
                return { ...p, proofImageData: undefined };
              }
              return p;
            });
            localStorage.setItem(key, JSON.stringify(sanitized));
            return;
          }
        }
        if (key === 'saccos_daily_audit_reports') {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const sanitized = parsed.slice(-10);
            localStorage.setItem(key, JSON.stringify(sanitized));
            return;
          }
        }
      } catch (fallbackErr) {
        console.warn(`[LocalStorage] Fallback cleanup failed for ${key}`, fallbackErr);
      }
    }
  };

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    return (localStorage.getItem('saccos_theme_color') as ThemeColor) || 'emerald';
  });

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    safeSetLocalStorage('saccos_theme_color', color);
  };

  const [activeRole, setActiveRole] = useState<UserRole>('public');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [globalLoading, setGlobalLoadingState] = useState<{ isLoading: boolean; message?: string } | null>(null);

  const setGlobalLoading = (loading: boolean | { isLoading: boolean; message?: string } | null) => {
    if (!loading) {
      setGlobalLoadingState(null);
    } else if (typeof loading === 'boolean') {
      setGlobalLoadingState(loading ? { isLoading: true } : null);
    } else {
      setGlobalLoadingState(loading.isLoading ? loading : null);
    }
  };

  const emptyInstitution: Institution = {
    id: '',
    name: '',
    type: 'SACCOS',
    registrationNumber: '',
    logo: '',
    primaryColor: '#0f766e',
    domain: '',
    status: 'Active',
    planId: '',
    planName: '',
    memberCount: 0,
    maxMembers: 0,
    userCount: 0,
    joinedDate: '',
    phone: '',
    email: '',
    region: '',
    currency: 'TZS'
  };

  const emptyMember: Member = {
    id: '',
    tenantId: '',
    memberNumber: '',
    fullName: '',
    phone: '',
    email: '',
    idType: 'NIDA',
    idNumber: '',
    photoUrl: '',
    occupation: '',
    joinedDate: '',
    status: 'Active',
    totalSavings: 0,
    totalShares: 0,
    totalLoansOutstanding: 0,
    branch: '',
    nextOfKin: {
      fullName: '',
      relationship: '',
      phone: '',
      percentageShare: 100
    }
  };

  const isDemoInstitution = (inst?: Partial<Institution>) => {
    if (!inst) return false;
    const id = String(inst.id || '');
    const name = String(inst.name || '');
    return ['tenant_mlimani', 'tenant_umoja', 'tenant_kilimo'].includes(id) ||
      name.toLowerCase().includes('isaccos') ||
      name.toLowerCase().includes('umoja') ||
      name.toLowerCase().includes('kilimo');
  };

  const isDemoMember = (member?: Partial<Member>) => {
    if (!member) return false;
    const id = String(member.id || '');
    const tenantId = String(member.tenantId || '');
    const name = String(member.fullName || '');
    return ['mb_001', 'mb_002', 'mb_003'].includes(id) ||
      ['tenant_mlimani', 'tenant_umoja', 'tenant_kilimo'].includes(tenantId) ||
      name.toLowerCase().includes('juma') ||
      name.toLowerCase().includes('amina') ||
      name.toLowerCase().includes('emanuel');
  };

  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_insts');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter(inst => !isDemoInstitution(inst)) : [];
    } catch {
      return [];
    }
  });

  const [subscriptionPlans] = useState<SubscriptionPlan[]>(initialSubscriptionPlans);

  const [currentInstitutionId, setCurrentInstitutionId] = useState<string>('');

  const [members, setMembers] = useState<Member[]>(() => {
    return [];
  });

  const [currentMemberId, setCurrentMemberId] = useState<string>('');

  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_loans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_savings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sharesAccounts, setSharesAccounts] = useState<SharesAccount[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_shares');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_txs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coa, setCoa] = useState<AccountCOA[]>(initialCOA);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeSetLocalStorage('saccos_notifications', JSON.stringify(notifications));
  }, [notifications]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_announcements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeSetLocalStorage('saccos_announcements', JSON.stringify(announcements));
    idbSet('saccos_announcements', announcements);
  }, [announcements]);
  const [fines, setFines] = useState<FinePenalty[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_fines');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [publicAds, setPublicAds] = useState<PublicAdvertisement[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_public_ads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_payment_proofs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState<InstitutionProject[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    safeSetLocalStorage('saccos_projects', JSON.stringify(projects));
  }, [projects]);

  const [superAdminAccounts, setSuperAdminAccounts] = useState<Array<{ fullName: string; username: string; password: string; email?: string }>>(() => {
    try {
      const saved = localStorage.getItem('saccos_superadmins');
      return saved ? JSON.parse(saved) : [
        { fullName: 'SuperAdmin Zanzibar', username: 'superadmin', password: 'Password123!', email: 'admin@isaccos.tz' }
      ];
    } catch {
      return [
        { fullName: 'SuperAdmin Zanzibar', username: 'superadmin', password: 'Password123!', email: 'admin@isaccos.tz' }
      ];
    }
  });

  const [userAuth, setUserAuth] = useState<UserAuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('saccos_user_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    safeSetLocalStorage('saccos_superadmins', JSON.stringify(superAdminAccounts));
  }, [superAdminAccounts]);

  useEffect(() => {
    if (userAuth) {
      safeSetLocalStorage('saccos_user_auth', JSON.stringify(userAuth));
    } else {
      try {
        localStorage.removeItem('saccos_user_auth');
      } catch (e) {
        console.warn(e);
      }
    }
  }, [userAuth]);

  const [storedAuditReports, setStoredAuditReports] = useState<StoredDailyAuditReport[]>(() => {
    try {
      const saved = localStorage.getItem('saccos_daily_audit_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastCronRunTimestamp, setLastCronRunTimestamp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('saccos_last_audit_cron');
      return saved ? parseInt(saved, 10) : Date.now();
    } catch {
      return Date.now();
    }
  });

  // Hydrate heavy state datasets asynchronously from IndexedDB if present
  useEffect(() => {
    let isMounted = true;
    async function hydrateIDBData() {
      try {
        const idbTxs = await idbGet<Transaction[]>('saccos_txs');
        if (idbTxs && Array.isArray(idbTxs) && idbTxs.length > 0 && isMounted) {
          setTransactions(idbTxs);
        }

        const idbLoans = await idbGet<Loan[]>('saccos_loans');
        if (idbLoans && Array.isArray(idbLoans) && idbLoans.length > 0 && isMounted) {
          setLoans(idbLoans);
        }

        const idbSavings = await idbGet<SavingsAccount[]>('saccos_savings');
        if (idbSavings && Array.isArray(idbSavings) && idbSavings.length > 0 && isMounted) {
          setSavingsAccounts(idbSavings);
        }

        const idbShares = await idbGet<SharesAccount[]>('saccos_shares');
        if (idbShares && Array.isArray(idbShares) && idbShares.length > 0 && isMounted) {
          setSharesAccounts(idbShares);
        }

        const idbProofs = await idbGet<PaymentProof[]>('saccos_payment_proofs');
        if (idbProofs && Array.isArray(idbProofs) && idbProofs.length > 0 && isMounted) {
          setPaymentProofs(idbProofs);
        }

        const idbInsts = await idbGet<Institution[]>('saccos_insts');
        if (idbInsts && Array.isArray(idbInsts) && idbInsts.length > 0 && isMounted) {
          setInstitutions(idbInsts);
        }

        const idbReports = await idbGet<StoredDailyAuditReport[]>('saccos_daily_audit_reports');
        if (idbReports && Array.isArray(idbReports) && idbReports.length > 0 && isMounted) {
          setStoredAuditReports(idbReports);
        }
      } catch (err) {
        console.warn('[IndexedDB Hydration] Error loading stored datasets:', err);
      } finally {
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) setIsInitializing(false);
          }, 350);
        }
      }
    }
    hydrateIDBData();
    return () => { isMounted = false; };
  }, []);

  // Sync state to IndexedDB (for high-capacity zero-quota storage) and LocalStorage (cached fallback)
  useEffect(() => {
    safeSetLocalStorage('saccos_lang', lang);
  }, [lang]);

  useEffect(() => {
    idbSet('saccos_daily_audit_reports', storedAuditReports);
    safeSetLocalStorage('saccos_daily_audit_reports', JSON.stringify(storedAuditReports));
  }, [storedAuditReports]);

  useEffect(() => {
    safeSetLocalStorage('saccos_last_audit_cron', lastCronRunTimestamp.toString());
  }, [lastCronRunTimestamp]);

  useEffect(() => {
    idbSet('saccos_public_ads', publicAds);
    safeSetLocalStorage('saccos_public_ads', JSON.stringify(publicAds));
  }, [publicAds]);

  useEffect(() => {
    idbSet('saccos_payment_proofs', paymentProofs);
    safeSetLocalStorage('saccos_payment_proofs', JSON.stringify(paymentProofs));
  }, [paymentProofs]);

  useEffect(() => {
    idbSet('saccos_fines', fines);
    safeSetLocalStorage('saccos_fines', JSON.stringify(fines));
  }, [fines]);

  useEffect(() => {
    idbSet('saccos_insts', institutions);
    safeSetLocalStorage('saccos_insts', JSON.stringify(institutions));
  }, [institutions]);

  useEffect(() => {
    idbSet('saccos_loans', loans);
    safeSetLocalStorage('saccos_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    idbSet('saccos_savings', savingsAccounts);
    safeSetLocalStorage('saccos_savings', JSON.stringify(savingsAccounts));
  }, [savingsAccounts]);

  useEffect(() => {
    idbSet('saccos_shares', sharesAccounts);
    safeSetLocalStorage('saccos_shares', JSON.stringify(sharesAccounts));
  }, [sharesAccounts]);

  useEffect(() => {
    idbSet('saccos_txs', transactions);
    safeSetLocalStorage('saccos_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const loadSharedData = async () => {
      const [remoteInstitutions, remoteMembers] = await Promise.all([
        SupabaseService.fetchInstitutions(),
        SupabaseService.fetchMembers()
      ]);
      if (!isMounted) return;
      if (remoteInstitutions.length) setInstitutions(remoteInstitutions);
      setMembers(remoteMembers);
    };

    loadSharedData().catch(error => console.warn('[Shared Sync] initial load failed:', error));

    const client: any = getSupabaseClient() || supabase;
    if (client?.channel) {
      channel = client.channel('saccos-shared-data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'institutions' }, (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setInstitutions(prev => prev.filter(item => item.id !== payload.old?.id));
            return;
          }
          const institution = SupabaseService.normalizeInstitution(payload.new);
          if (!institution) return;
          setInstitutions(prev => {
            const index = prev.findIndex(item => item.id === institution.id);
            if (index === -1) return [institution, ...prev];
            const next = [...prev];
            next[index] = { ...next[index], ...institution };
            return next;
          });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setMembers(prev => prev.filter(item => item.id !== payload.old?.id));
            return;
          }
          const member = SupabaseService.normalizeMember(payload.new);
          if (!member) return;
          setMembers(prev => {
            const index = prev.findIndex(item => item.id === member.id);
            if (index === -1) return [member, ...prev];
            const next = [...prev];
            next[index] = { ...next[index], ...member };
            return next;
          });
        })
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel) channel.unsubscribe();
    };
  }, []);

  // Announcements: load list, subscribe to realtime updates, and flush offline queue when online
  useEffect(() => {
    let isMounted = true;
    let unsubscribeFn: (() => void) | null = null;

    async function initAnnouncements() {
      try {
        const list = await AnnouncementsService.list();
        if (!isMounted) return;
        setAnnouncements(list);
      } catch (err) {
        console.warn('[Announcements] initial load failed', err);
      }

      // Setup realtime subscription if Supabase client supports it
      try {
        const mod = await import('../lib/supabase');
        const client: any = mod.supabase || mod.getSupabaseClient && (await mod.getSupabaseClient());
        if (client) {
          if (client.channel) {
            const channel = client.channel('public:announcements')
              .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, (payload: any) => {
                const newRow = payload.new || payload.record || payload;
                if (!newRow) return;
                setAnnouncements(prev => {
                  const exists = prev.find(a => a.id === newRow.id);
                  if ((payload.eventType || payload.type || payload.event) === 'INSERT' || payload.event === 'INSERT') {
                    if (exists) return prev;
                    return [{ id: newRow.id, author_id: newRow.author_id, content: newRow.content, status: newRow.status || 'published', created_at: newRow.created_at, updated_at: newRow.updated_at }, ...prev];
                  }
                  if ((payload.eventType || payload.type || payload.event) === 'UPDATE') {
                    return prev.map(a => a.id === newRow.id ? { ...a, ...newRow } : a);
                  }
                  if ((payload.eventType || payload.type || payload.event) === 'DELETE') {
                    return prev.filter(a => a.id !== newRow.id);
                  }
                  return prev;
                });
              });
            await channel.subscribe();
            unsubscribeFn = () => { try { channel.unsubscribe(); } catch {} };
          } else if (client.from) {
            const sub: any = client.from('announcements').on('*', (payload: any) => {
              const newRow = payload.new || payload.record || payload;
              if (!newRow) return;
              setAnnouncements(prev => [{ id: newRow.id, author_id: newRow.author_id, content: newRow.content, status: newRow.status || 'published', created_at: newRow.created_at, updated_at: newRow.updated_at }, ...prev]);
            }).subscribe();
            unsubscribeFn = () => { try { sub.unsubscribe(); } catch {} };
          }
        }
      } catch (subErr) {
        console.warn('[Announcements] realtime subscription setup failed', subErr);
      }

      const flushQueue = async () => {
        try {
          const queued = await idbGetQueue<any>('saccos_announcements_queue');
          if (Array.isArray(queued) && queued.length > 0) {
            for (const q of queued) {
              try {
                const created = await AnnouncementsService.create(q.content);
                setAnnouncements(prev => [{ ...created }, ...prev]);
              } catch (e) {
                console.warn('[Announcements Queue] replay failed for item', e);
              }
            }
            await idbClearQueue('saccos_announcements_queue');
          }
        } catch (e) {
          console.warn('[Announcements] flushQueue error', e);
        }
      };

      window.addEventListener('online', flushQueue);
      if (navigator.onLine) flushQueue();

      return () => {
        isMounted = false;
        window.removeEventListener('online', flushQueue);
        if (unsubscribeFn) unsubscribeFn();
      };
    }

    const cleanupPromise = initAnnouncements();
    return () => { isMounted = false; };
  }, []);

  const currentInstitution = institutions.find(i => i.id === currentInstitutionId) || institutions[0] || emptyInstitution;
  const currentMember = members.find(m => m.id === currentMemberId) || members[0] || emptyMember;

  const t = (key: keyof typeof translations['sw']): string => {
    const dict = translations[lang] || translations.sw;
    return dict[key] || translations.sw[key] || String(key);
  };

  const formatTZS = (amount: number): string => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addInstitution = async (newInst: Omit<Institution, 'id' | 'joinedDate' | 'status'>) => {
    const id = `tenant_${Date.now()}`;
    const inst: Institution = {
      ...newInst,
      id,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    try {
      // Try server-admin endpoint first (requires server ADMIN_API_KEY configured on backend)
      const resp = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inst)
      });

      if (resp.ok) {
        const json = await resp.json().catch(() => null);
        const created = json && (Array.isArray(json.data) ? json.data[0] : json.data);
        if (created) {
          // Prefer server-provided id and timestamps
          const serverInst = {
            id: created.id || inst.id,
            name: created.name || inst.name,
            type: created.type || inst.type,
            registrationNumber: created.registration_number || inst.registrationNumber,
            logo: created.logo || inst.logo,
            primaryColor: created.primary_color || inst.primaryColor,
            domain: created.domain || inst.domain,
            planId: created.plan_id || inst.planId,
            planName: created.plan_name || inst.planName,
            memberCount: Number(created.member_count ?? inst.memberCount ?? 0),
            maxMembers: Number(created.max_members ?? inst.maxMembers ?? 0),
            userCount: Number(created.user_count ?? inst.userCount ?? 0),
            joinedDate: created.joined_date || inst.joinedDate || new Date().toISOString(),
            phone: created.phone || inst.phone || '',
            email: created.email || inst.email || '',
            region: created.region || inst.region || '',
            currency: created.currency || inst.currency || 'TZS',
            bannerUrl: created.banner_url || inst.bannerUrl,
            description: created.description || inst.description,
            address: created.address || inst.address,
            motto: created.motto || inst.motto,
            website: created.website || inst.website,
            foundedYear: created.founded_year || inst.foundedYear,
            bankName: created.bank_name || inst.bankName,
            bankAccountNumber: created.bank_account_number || inst.bankAccountNumber,
            bankAccountName: created.bank_account_name || inst.bankAccountName,
            adminUsername: created.admin_username || inst.adminUsername,
            adminPassword: created.admin_password || inst.adminPassword,
            customPriceMonthly: created.custom_price_monthly ?? inst.customPriceMonthly,
            monthlyCapitalTarget: created.monthly_capital_target ?? inst.monthlyCapitalTarget,
            loanInterestRates: created.loan_interest_rates ?? inst.loanInterestRates,
            defaultInterestRateAnnual: created.default_interest_rate_annual ?? inst.defaultInterestRateAnnual,
            status: created.status || inst.status || 'Active'
          } as Institution;
          setInstitutions(prev => [serverInst, ...prev]);
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin API] create institution failed, falling back to local:', err);
    }

    // Fallback (offline or no admin key) — create locally
    setInstitutions(prev => [inst, ...prev]);

    // Add audit log
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Super Admin',
      role: 'superadmin',
      tenantName: inst.name,
      action: 'Institution Registered',
      details: `New institution ${inst.name} registered under ${inst.planName}.`,
      ipAddress: '197.250.12.80'
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const deleteInstitution = (id: string) => {
    const instToDelete = institutions.find(i => i.id === id);
    setInstitutions(prev => prev.filter(inst => inst.id !== id));
    // Log audit
    if (instToDelete) {
      const log: AuditLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'Super Admin',
        role: 'superadmin',
        tenantName: instToDelete.name,
        action: 'Institution Deleted/Kufuta Taasisi',
        details: `Taasisi ya ${instToDelete.name} imefutwa kwenye mfumo kwa ukiukaji wa sheria.`,
        ipAddress: '197.250.12.80'
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  const updateInstitution = (id: string, updates: Partial<Institution>) => {
    setInstitutions(prev => {
      const updated = prev.find(inst => inst.id === id);
      if (updated) void SupabaseService.saveInstitution({ ...updated, ...updates });
      return prev.map(inst => inst.id === id ? { ...inst, ...updates } : inst);
    });
  };

  const updateInstitutionPlan = (institutionId: string, planId: string, planName: string, maxMembers?: number) => {
    let resolvedMaxMembers = maxMembers;
    if (!resolvedMaxMembers) {
      if (planId === 'plan_starter') resolvedMaxMembers = 500;
      else if (planId === 'plan_standard') resolvedMaxMembers = 2500;
      else if (planId === 'plan_professional') resolvedMaxMembers = 5000;
      else if (planId === 'plan_enterprise') resolvedMaxMembers = 10000;
      else resolvedMaxMembers = 5000;
    }
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === institutionId) {
        const updated = { ...inst, planId, planName, maxMembers: resolvedMaxMembers };
        void SupabaseService.saveInstitution(updated);
        return updated;
      }
      return inst;
    }));
    addNotification({
      title: 'Kifurushi Kimeboreshwa (Plan Upgraded)',
      message: `Taasisi imeboreshwa kuwa ${planName} yenye uwezo wa kusajili wanachama hadi ${resolvedMaxMembers}.`,
      type: 'success',
      targetRole: 'tenantadmin',
      tenantId: institutionId,
      category: 'member',
      linkTab: 'overview'
    });
  };

  const toggleInstitutionStatus = (id: string) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === id) {
        const nextStatus = inst.status === 'Active' ? 'Suspended' : 'Active';
        return { ...inst, status: nextStatus };
      }
      return inst;
    }));
  };

  const deleteMember = (memberId: string) => {
    const mem = members.find(m => m.id === memberId);
    if (!mem) return;
    setMembers(prev => prev.filter(m => m.id !== memberId));

    // Update institution member count
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === mem.tenantId) {
        return { ...inst, memberCount: Math.max(0, inst.memberCount - 1) };
      }
      return inst;
    }));
  };

  const addNotification = (notifData: Omit<SystemNotification, 'id' | 'date' | 'read'> & { date?: string; read?: boolean }) => {
    const newNotif: SystemNotification = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: notifData.date || new Date().toLocaleString(),
      read: notifData.read ?? false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addAnnouncement = async (content: string) => {
    try {
      const created = await AnnouncementsService.create(content);
      setAnnouncements(prev => [{ ...created }, ...prev]);
      return { success: true };
    } catch (err: any) {
      if (err?.message === 'User must be authenticated to create announcements') {
        return { success: false, message: 'Kwanza ingia kwenye akaunti ili uweke tangazo la kweli kwenye Supabase.' };
      }

      try {
        if (navigator.onLine) {
          return { success: false, message: err?.message || 'Failed to create announcement' };
        }

        await idbEnqueue('saccos_announcements_queue', { content, queuedAt: Date.now() });
        const temp: Announcement = {
          id: `local_${Date.now()}`,
          author_id: null,
          content,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setAnnouncements(prev => [temp, ...prev]);
        return { success: true, message: 'Queued for upload when online and authenticated' };
      } catch (qErr) {
        return { success: false, message: (qErr as any)?.message || 'Failed to create announcement' };
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = (tenantId?: string) => {
    setNotifications(prev => prev.map(n => (!tenantId || n.tenantId === tenantId) ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = (tenantId?: string) => {
    if (tenantId) {
      setNotifications(prev => prev.filter(n => n.tenantId !== tenantId));
    } else {
      setNotifications([]);
    }
  };

  const addFine = (fineData: Omit<FinePenalty, 'id' | 'issuedDate' | 'status'>) => {
    const newFine: FinePenalty = {
      ...fineData,
      id: `fine_${Date.now()}`,
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setFines(prev => [newFine, ...prev]);

    addNotification({
      title: 'Fainali / Penalti Mpya',
      message: `Penalti ya TZS ${fineData.amount.toLocaleString()} imetolewa kwa ${fineData.memberName}: ${fineData.reason}.`,
      type: 'alert',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'fine',
      linkTab: 'fines',
      amount: fineData.amount
    });
  };

  const payFine = (fineId: string) => {
    const targetFine = fines.find(f => f.id === fineId);
    setFines(prev => prev.map(f => {
      if (f.id === fineId) {
        return {
          ...f,
          status: 'Paid',
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
      return f;
    }));

    if (targetFine) {
      addNotification({
        title: 'Malipo ya Fainali Yamepokelewa',
        message: `Faini ya TZS ${targetFine.amount.toLocaleString()} ya ${targetFine.memberName} imelipwa kikamilifu.`,
        type: 'success',
        targetRole: 'tenantadmin',
        tenantId: targetFine.tenantId || currentInstitutionId,
        category: 'fine',
        linkTab: 'fines',
        amount: targetFine.amount
      });
    }
  };

  const waiveFine = (fineId: string) => {
    setFines(prev => prev.map(f => {
      if (f.id === fineId) {
        return {
          ...f,
          status: 'Waived'
        };
      }
      return f;
    }));
  };

  const addMember = (newMemData: Omit<Member, 'id' | 'joinedDate' | 'memberNumber' | 'totalSavings' | 'totalShares' | 'totalLoansOutstanding'>) => {
    const newId = `mb_${Date.now()}`;
    const year = new Date().getFullYear();
    const count = members.filter(m => m.tenantId === currentInstitutionId).length + 1;
    const memberNumber = `MB-${year}-${String(count).padStart(4, '0')}`;

    const member: Member = {
      ...newMemData,
      id: newId,
      memberNumber,
      tenantId: currentInstitutionId,
      joinedDate: new Date().toISOString().split('T')[0],
      totalSavings: 0,
      totalShares: 0,
      totalLoansOutstanding: 0,
      registeredById: currentMember?.id,
      registeredByName: currentMember?.fullName
    };

    setMembers(prev => [member, ...prev]);
    void SupabaseService.saveMember(member);

    // Update institution member count
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === currentInstitutionId) {
        const updated = { ...inst, memberCount: inst.memberCount + 1 };
        void SupabaseService.saveInstitution(updated);
        return updated;
      }
      return inst;
    }));

    addNotification({
      title: 'Usajili Mpya wa Mwanachama',
      message: `Mwanachama mpya ${member.fullName} (${member.memberNumber}) amesajiliwa kikamilifu katika ${member.branch}.`,
      type: 'success',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'member',
      linkTab: 'members'
    });
  };

  const addBatchMembers = (count: number, prefixName: string = 'Mwanachama', branchName: string = 'Makao Makuu') => {
    const year = new Date().getFullYear();
    const currentCount = members.filter(m => m.tenantId === currentInstitutionId).length;
    const newMembersList: Member[] = [];
    const timestamp = Date.now();

    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    ];

    for (let i = 1; i <= count; i++) {
      const idx = currentCount + i;
      const mNum = `MB-${year}-${String(idx).padStart(4, '0')}`;
      const mId = `mb_${timestamp}_${i}`;
      const randPhone = `+255 7${Math.floor(10000000 + Math.random() * 90000000)}`;

      newMembersList.push({
        id: mId,
        tenantId: currentInstitutionId,
        memberNumber: mNum,
        fullName: `${prefixName} #${idx}`,
        phone: randPhone,
        email: `mwanachama${idx}@saccos.tz`,
        photoUrl: avatars[i % avatars.length],
        idType: 'NIDA',
        idNumber: `19900101-${idx}1111-00001-00`,
        occupation: 'Mjasiriamali / Mfanyakazi',
        branch: branchName,
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        totalSavings: 50000,
        totalShares: 10000,
        totalLoansOutstanding: 0,
        registeredById: currentMember?.id,
        registeredByName: currentMember?.fullName,
        nextOfKin: {
          fullName: `Msimamizi wa #${idx}`,
          relationship: 'Ndugu',
          phone: randPhone,
          percentageShare: 100
        }
      });
    }

    setMembers(prev => [...newMembersList, ...prev]);
    void SupabaseService.saveMembers(newMembersList);

    // Update institution member count
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === currentInstitutionId) {
        const updated = { ...inst, memberCount: inst.memberCount + count };
        void SupabaseService.saveInstitution(updated);
        return updated;
      }
      return inst;
    }));

    addNotification({
      title: 'Usajili wa Wanachama kwa Pamoja',
      message: `Wanachama wapya ${count} wameongezwa kwa pamoja kwenye mfumo (${branchName}).`,
      type: 'info',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'member',
      linkTab: 'members'
    });
  };

  const updateInstitutionLoanRates = (rates: Record<string, number>, defaultRate?: number) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === currentInstitutionId) {
        return {
          ...inst,
          loanInterestRates: { ...(inst.loanInterestRates || {}), ...rates },
          defaultInterestRateAnnual: defaultRate !== undefined ? defaultRate : (inst.defaultInterestRateAnnual || 10)
        };
      }
      return inst;
    }));
  };

  const applyLoan = (loanData: {
    amountRequested: number;
    durationMonths: number;
    loanType: string;
    customLoanTypeName?: string;
    interestRateAnnual?: number;
    purpose: string;
  }) => {
    const newId = `ln_${Date.now()}`;
    
    // Resolve Interest Rate: explicitly requested by tenant/member or from institution settings or default
    let annualInterestRate = loanData.interestRateAnnual;
    if (annualInterestRate === undefined || annualInterestRate === null) {
      if (currentInstitution.loanInterestRates && currentInstitution.loanInterestRates[loanData.loanType]) {
        annualInterestRate = currentInstitution.loanInterestRates[loanData.loanType];
      } else if (loanData.loanType === 'Dharura') {
        annualInterestRate = 8;
      } else if (loanData.loanType === 'Mkopo wa Mkono') {
        annualInterestRate = 10;
      } else if (loanData.loanType === 'Elimu') {
        annualInterestRate = 10;
      } else if (loanData.loanType === 'Kilimo') {
        annualInterestRate = 9;
      } else {
        annualInterestRate = currentInstitution.defaultInterestRateAnnual || 12;
      }
    }

    const monthlyRate = annualInterestRate / 100 / 12;
    
    // Monthly installment formula: PMT = P * r * (1+r)^n / ((1+r)^n - 1)
    const n = Math.max(1, loanData.durationMonths);
    const p = Math.max(1000, loanData.amountRequested);
    let monthlyInstallment = 0;
    if (monthlyRate === 0) {
      monthlyInstallment = Math.round(p / n);
    } else {
      monthlyInstallment = Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
    }
    const totalRepayable = monthlyInstallment * n;
    const totalInterest = Math.max(0, totalRepayable - p);

    // Generate schedule
    const schedule = [];
    const today = new Date();
    for (let i = 1; i <= n; i++) {
      const dueDate = new Date(today.getFullYear(), today.getMonth() + i, 5).toISOString().split('T')[0];
      const interestPart = monthlyRate === 0 ? 0 : Math.round(p * monthlyRate);
      const principalPart = Math.max(0, monthlyInstallment - interestPart);
      schedule.push({
        installmentNumber: i,
        dueDate,
        principal: principalPart,
        interest: interestPart,
        totalInstallment: monthlyInstallment,
        paidAmount: 0,
        status: 'Pending' as const
      });
    }

    const effectiveLoanTypeName = loanData.customLoanTypeName && loanData.customLoanTypeName.trim()
      ? loanData.customLoanTypeName.trim()
      : loanData.loanType;

    const newLoan: Loan = {
      id: newId,
      tenantId: currentInstitutionId,
      memberId: currentMember.id,
      memberName: currentMember.fullName,
      memberNumber: currentMember.memberNumber,
      loanType: effectiveLoanTypeName,
      customLoanTypeName: loanData.customLoanTypeName,
      amountRequested: p,
      amountApproved: p,
      interestRateAnnual: annualInterestRate,
      durationMonths: n,
      repaymentFrequency: 'Monthly',
      status: 'Under Review',
      appliedDate: new Date().toISOString().split('T')[0],
      monthlyInstallment,
      totalInterest,
      totalRepayable,
      totalPaid: 0,
      remainingBalance: totalRepayable,
      purpose: loanData.purpose,
      approvalSteps: [
        { step: 1, roleName: 'Afisa Mikopo (Loan Officer)', status: 'Pending' },
        { step: 2, roleName: 'Kamati ya Mikopo (Credit Committee)', status: 'Pending' },
        { step: 3, roleName: 'Meneja Mkuu (Board / GM)', status: 'Pending' }
      ],
      repaymentSchedule: schedule,
      guarantors: currentMember.guarantors || []
    };

    setLoans(prev => [newLoan, ...prev]);

    // Send Notification
    addNotification({
      title: 'Maombi Mapya ya Mkopo',
      message: `${currentMember.fullName} ameomba mkopo wa TZS ${p.toLocaleString()} (${effectiveLoanTypeName}) wenye riba ya ${annualInterestRate}% unaosubiri idhini.`,
      type: 'info',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'loan',
      linkTab: 'loans',
      amount: p
    });
  };

  const issueDirectLoan = (loanData: {
    memberId: string;
    amount: number;
    durationMonths: number;
    interestRateAnnual: number;
    loanType: string;
    customLoanTypeName?: string;
    purpose: string;
    disburseImmediately?: boolean;
  }) => {
    const targetMember = members.find(m => m.id === loanData.memberId) || currentMember;
    const newId = `ln_${Date.now()}`;
    const annualRate = loanData.interestRateAnnual || 10;
    const monthlyRate = annualRate / 100 / 12;
    const n = Math.max(1, loanData.durationMonths);
    const p = Math.max(1000, loanData.amount);

    let monthlyInstallment = 0;
    if (monthlyRate === 0) {
      monthlyInstallment = Math.round(p / n);
    } else {
      monthlyInstallment = Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
    }
    const totalRepayable = monthlyInstallment * n;
    const totalInterest = Math.max(0, totalRepayable - p);

    const schedule = [];
    const today = new Date();
    for (let i = 1; i <= n; i++) {
      const dueDate = new Date(today.getFullYear(), today.getMonth() + i, 5).toISOString().split('T')[0];
      const interestPart = monthlyRate === 0 ? 0 : Math.round(p * monthlyRate);
      const principalPart = Math.max(0, monthlyInstallment - interestPart);
      schedule.push({
        installmentNumber: i,
        dueDate,
        principal: principalPart,
        interest: interestPart,
        totalInstallment: monthlyInstallment,
        paidAmount: 0,
        status: 'Pending' as const
      });
    }

    const effectiveLoanTypeName = loanData.customLoanTypeName && loanData.customLoanTypeName.trim()
      ? loanData.customLoanTypeName.trim()
      : loanData.loanType;

    const isDisbursed = loanData.disburseImmediately !== false;

    const newLoan: Loan = {
      id: newId,
      tenantId: currentInstitutionId,
      memberId: targetMember.id,
      memberName: targetMember.fullName,
      memberNumber: targetMember.memberNumber,
      loanType: effectiveLoanTypeName,
      customLoanTypeName: loanData.customLoanTypeName,
      amountRequested: p,
      amountApproved: p,
      interestRateAnnual: annualRate,
      durationMonths: n,
      repaymentFrequency: 'Monthly',
      status: isDisbursed ? 'Active' : 'Under Review',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedDate: isDisbursed ? new Date().toISOString().split('T')[0] : undefined,
      disbursedDate: isDisbursed ? new Date().toISOString().split('T')[0] : undefined,
      monthlyInstallment,
      totalInterest,
      totalRepayable,
      totalPaid: 0,
      remainingBalance: totalRepayable,
      purpose: loanData.purpose || `Mkopo wa ${effectiveLoanTypeName}`,
      approvalSteps: [
        { step: 1, roleName: 'Afisa Mikopo (Loan Officer)', status: isDisbursed ? 'Approved' : 'Pending', approverName: 'Afisa Mkuu', date: new Date().toISOString().split('T')[0] },
        { step: 2, roleName: 'Kamati ya Mikopo (Credit Committee)', status: isDisbursed ? 'Approved' : 'Pending', approverName: 'Kamati ya Mikopo', date: new Date().toISOString().split('T')[0] },
        { step: 3, roleName: 'Meneja Mkuu (Board / GM)', status: isDisbursed ? 'Approved' : 'Pending', approverName: 'Meneja wa Taasisi', date: new Date().toISOString().split('T')[0] }
      ],
      repaymentSchedule: schedule,
      guarantors: targetMember.guarantors || []
    };

    setLoans(prev => [newLoan, ...prev]);

    if (isDisbursed) {
      setMembers(mList => mList.map(m => {
        if (m.id === targetMember.id) {
          return { ...m, totalLoansOutstanding: (m.totalLoansOutstanding || 0) + p };
        }
        return m;
      }));

      const tx: Transaction = {
        id: `tx_${Date.now()}`,
        referenceNumber: `DISB-${Date.now().toString().slice(-6)}`,
        tenantId: currentInstitutionId,
        tenantName: currentInstitution.name,
        memberId: targetMember.id,
        memberName: targetMember.fullName,
        type: 'LoanDisbursement',
        amount: p,
        paymentChannel: 'Cash',
        status: 'Completed',
        date: new Date().toLocaleString(),
        description: `Kutoa ${effectiveLoanTypeName} kwa ${targetMember.fullName} (Riba: ${annualRate}%)`
      };
      setTransactions(tList => [tx, ...tList]);
    }

    addNotification({
      title: isDisbursed ? 'Mkopo Umetolewa Kikamilifu' : 'Mkopo Mpya Umesajiliwa',
      message: `${targetMember.fullName} amepewa mkopo wa TZS ${p.toLocaleString()} (${effectiveLoanTypeName}) wenye riba ya ${annualRate}%.`,
      type: 'success',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'loan',
      linkTab: 'loans',
      amount: p
    });
  };

  const updateLoanTerms = (loanId: string, updates: {
    amountApproved?: number;
    interestRateAnnual?: number;
    durationMonths?: number;
  }) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const p = updates.amountApproved !== undefined ? updates.amountApproved : (loan.amountApproved || loan.amountRequested);
        const annualRate = updates.interestRateAnnual !== undefined ? updates.interestRateAnnual : loan.interestRateAnnual;
        const n = updates.durationMonths !== undefined ? updates.durationMonths : loan.durationMonths;

        const monthlyRate = annualRate / 100 / 12;
        let monthlyInstallment = 0;
        if (monthlyRate === 0) {
          monthlyInstallment = Math.round(p / n);
        } else {
          monthlyInstallment = Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
        }
        const totalRepayable = monthlyInstallment * n;
        const totalInterest = Math.max(0, totalRepayable - p);
        const remainingBalance = Math.max(0, totalRepayable - (loan.totalPaid || 0));

        // Rebuild schedule
        const schedule = [];
        const today = new Date();
        for (let i = 1; i <= n; i++) {
          const dueDate = new Date(today.getFullYear(), today.getMonth() + i, 5).toISOString().split('T')[0];
          const interestPart = monthlyRate === 0 ? 0 : Math.round(p * monthlyRate);
          const principalPart = Math.max(0, monthlyInstallment - interestPart);
          schedule.push({
            installmentNumber: i,
            dueDate,
            principal: principalPart,
            interest: interestPart,
            totalInstallment: monthlyInstallment,
            paidAmount: i === 1 && (loan.totalPaid || 0) > 0 ? Math.min(monthlyInstallment, loan.totalPaid) : 0,
            status: i === 1 && (loan.totalPaid || 0) >= monthlyInstallment ? ('Paid' as const) : ('Pending' as const)
          });
        }

        return {
          ...loan,
          amountApproved: p,
          interestRateAnnual: annualRate,
          durationMonths: n,
          monthlyInstallment,
          totalInterest,
          totalRepayable,
          remainingBalance,
          repaymentSchedule: schedule
        };
      }
      return loan;
    }));
  };

  const approveLoanStep = (loanId: string, stepNumber: number, approverName: string, comment: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const updatedSteps = loan.approvalSteps.map(step => {
          if (step.step === stepNumber) {
            return {
              ...step,
              approverName,
              status: 'Approved' as const,
              comment,
              date: new Date().toISOString().split('T')[0]
            };
          }
          return step;
        });

        const allApproved = updatedSteps.every(s => s.status === 'Approved');
        const nextStatus = allApproved ? 'Active' : 'Under Review';

        let updatedMemberLoans = loan.remainingBalance;

        if (allApproved) {
          // Update member outstanding loan balance
          setMembers(mList => mList.map(m => {
            if (m.id === loan.memberId) {
              return { ...m, totalLoansOutstanding: m.totalLoansOutstanding + loan.amountApproved };
            }
            return m;
          }));

          // Add disbursement transaction
          const tx: Transaction = {
            id: `tx_${Date.now()}`,
            referenceNumber: `DISB-${Date.now().toString().slice(-6)}`,
            tenantId: loan.tenantId,
            tenantName: currentInstitution.name,
            memberId: loan.memberId,
            memberName: loan.memberName,
            type: 'LoanDisbursement',
            amount: loan.amountApproved,
            paymentChannel: 'Bank Transfer',
            status: 'Completed',
            date: new Date().toLocaleString(),
            description: `Kutoa mkopo wa ${loan.loanType} kwa ${loan.memberName}`
          };
          setTransactions(tList => [tx, ...tList]);
        }

        return {
          ...loan,
          approvalSteps: updatedSteps,
          status: nextStatus,
          approvedDate: allApproved ? new Date().toISOString().split('T')[0] : loan.approvedDate,
          disbursedDate: allApproved ? new Date().toISOString().split('T')[0] : loan.disbursedDate
        };
      }
      return loan;
    }));

    if (targetLoan) {
      addNotification({
        title: 'Hatua ya Mkopo Imeidhinishwa',
        message: `Hatua ya ${stepNumber} ya mkopo #${loanId} (${targetLoan.memberName}) imeidhinishwa na ${approverName}.`,
        type: 'success',
        targetRole: 'tenantadmin',
        tenantId: targetLoan.tenantId || currentInstitutionId,
        category: 'loan',
        linkTab: 'loans',
        amount: targetLoan.amountApproved
      });
    }
  };

  const rejectLoan = (loanId: string, comment: string) => {
    const targetLoan = loans.find(l => l.id === loanId);
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        return {
          ...loan,
          status: 'Rejected',
          approvalSteps: loan.approvalSteps.map(step => ({
            ...step,
            status: step.status === 'Pending' ? 'Rejected' : step.status,
            comment: step.comment || comment
          }))
        };
      }
      return loan;
    }));

    if (targetLoan) {
      addNotification({
        title: 'Mkopo Umekataliwa',
        message: `Maombi ya mkopo #${loanId} ya ${targetLoan.memberName} yamekataliwa: ${comment}`,
        type: 'alert',
        targetRole: 'tenantadmin',
        tenantId: targetLoan.tenantId || currentInstitutionId,
        category: 'loan',
        linkTab: 'loans',
        amount: targetLoan.amountRequested
      });
    }
  };

  const makeRepayment = (loanId: string, amount: number, channel: Transaction['paymentChannel']) => {
    const ref = `${channel.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-8)}`;

    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const newPaid = loan.totalPaid + amount;
        const newRemaining = Math.max(0, loan.remainingBalance - amount);
        const isCompleted = newRemaining === 0;

        // Update schedule items
        let remainingRepaymentToAllocate = amount;
        const newSchedule = loan.repaymentSchedule.map(item => {
          if (remainingRepaymentToAllocate <= 0) return item;
          const due = item.totalInstallment - item.paidAmount;
          if (due > 0) {
            const pay = Math.min(due, remainingRepaymentToAllocate);
            remainingRepaymentToAllocate -= pay;
            const updatedPaid = item.paidAmount + pay;
            return {
              ...item,
              paidAmount: updatedPaid,
              status: updatedPaid >= item.totalInstallment ? ('Paid' as const) : ('Pending' as const)
            };
          }
          return item;
        });

        // Update member outstanding loan
        setMembers(mList => mList.map(m => {
          if (m.id === loan.memberId) {
            return {
              ...m,
              totalLoansOutstanding: Math.max(0, m.totalLoansOutstanding - amount)
            };
          }
          return m;
        }));

        return {
          ...loan,
          totalPaid: newPaid,
          remainingBalance: newRemaining,
          status: isCompleted ? 'Completed' : loan.status,
          repaymentSchedule: newSchedule
        };
      }
      return loan;
    }));

    // Record Transaction
    const loanObj = loans.find(l => l.id === loanId);
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceNumber: ref,
      tenantId: currentInstitutionId,
      tenantName: currentInstitution.name,
      memberId: loanObj?.memberId || currentMember.id,
      memberName: loanObj?.memberName || currentMember.fullName,
      type: 'LoanRepayment',
      amount,
      paymentChannel: channel,
      status: 'Completed',
      date: new Date().toLocaleString(),
      description: `Marejesho ya mkopo #${loanId} via ${channel}`
    };
    setTransactions(prev => [tx, ...prev]);

    addNotification({
      title: 'Marejesho ya Mkopo Yamepokelewa',
      message: `Marejesho ya TZS ${amount.toLocaleString()} ya mkopo #${loanId} (${loanObj?.memberName || 'Mwanachama'}) yamepokelewa kupitia ${channel}.`,
      type: 'success',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'loan',
      linkTab: 'loans',
      amount
    });
  };

  const makeSavingsDeposit = (
    memberId: string,
    amount: number,
    channel: Transaction['paymentChannel'],
    type: 'Mandatory' | 'Voluntary' | 'FixedDeposit'
  ) => {
    const ref = `${channel.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`;

    // Update savings record
    setSavingsAccounts(prev => {
      const exists = prev.find(s => s.memberId === memberId && s.tenantId === currentInstitutionId);
      if (exists) {
        return prev.map(s => {
          if (s.memberId === memberId) {
            const man = type === 'Mandatory' ? s.mandatorySavings + amount : s.mandatorySavings;
            const vol = type === 'Voluntary' ? s.voluntarySavings + amount : s.voluntarySavings;
            const fix = type === 'FixedDeposit' ? s.fixedDeposit + amount : s.fixedDeposit;
            return {
              ...s,
              mandatorySavings: man,
              voluntarySavings: vol,
              fixedDeposit: fix,
              totalSavings: man + vol + fix,
              lastDepositDate: new Date().toISOString().split('T')[0]
            };
          }
          return s;
        });
      } else {
        const memObj = members.find(m => m.id === memberId);
        const newAcc: SavingsAccount = {
          id: `sav_${Date.now()}`,
          tenantId: currentInstitutionId,
          memberId,
          memberName: memObj?.fullName || 'Mwanachama',
          mandatorySavings: type === 'Mandatory' ? amount : 0,
          voluntarySavings: type === 'Voluntary' ? amount : 0,
          fixedDeposit: type === 'FixedDeposit' ? amount : 0,
          totalSavings: amount,
          lastDepositDate: new Date().toISOString().split('T')[0]
        };
        return [newAcc, ...prev];
      }
    });

    // Update Member total savings
    setMembers(mList => mList.map(m => {
      if (m.id === memberId) {
        return { ...m, totalSavings: m.totalSavings + amount };
      }
      return m;
    }));

    // Record Transaction
    const memObj = members.find(m => m.id === memberId);
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceNumber: ref,
      tenantId: currentInstitutionId,
      tenantName: currentInstitution.name,
      memberId,
      memberName: memObj?.fullName,
      type: 'SavingsDeposit',
      amount,
      paymentChannel: channel,
      status: 'Completed',
      date: new Date().toLocaleString(),
      description: `Weka akiba (${type}) via ${channel}`
    };
    setTransactions(prev => [tx, ...prev]);

    addNotification({
      title: 'Amana ya Akiba Imepokelewa',
      message: `Akiba ya TZS ${amount.toLocaleString()} (${type}) ya ${memObj?.fullName || 'Mwanachama'} imepokelewa kupitia ${channel}.`,
      type: 'success',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'payment',
      linkTab: 'savings',
      amount
    });
  };

  const purchaseShares = (memberId: string, units: number, channel: Transaction['paymentChannel']) => {
    const pricePerShare = 10000;
    const totalCost = units * pricePerShare;
    const ref = `SHR-${Date.now().toString().slice(-8)}`;

    setSharesAccounts(prev => {
      const exists = prev.find(s => s.memberId === memberId && s.tenantId === currentInstitutionId);
      if (exists) {
        return prev.map(s => {
          if (s.memberId === memberId) {
            const newUnits = s.shareUnits + units;
            return {
              ...s,
              shareUnits: newUnits,
              totalSharesValue: newUnits * pricePerShare,
              lastPurchaseDate: new Date().toISOString().split('T')[0]
            };
          }
          return s;
        });
      } else {
        const memObj = members.find(m => m.id === memberId);
        return [
          {
            id: `shr_${Date.now()}`,
            tenantId: currentInstitutionId,
            memberId,
            memberName: memObj?.fullName || 'Mwanachama',
            shareUnits: units,
            pricePerShare,
            totalSharesValue: totalCost,
            lastPurchaseDate: new Date().toISOString().split('T')[0]
          },
          ...prev
        ];
      }
    });

    const memObj = members.find(m => m.id === memberId);
    addNotification({
      title: 'Ununuzi wa Hisa',
      message: `Hisa ${units} zenye thamani ya TZS ${totalCost.toLocaleString()} zimenunuliwa na ${memObj?.fullName || 'Mwanachama'} via ${channel}.`,
      type: 'success',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'payment',
      linkTab: 'shares',
      amount: totalCost
    });

    // Update Member shares
    setMembers(mList => mList.map(m => {
      if (m.id === memberId) {
        return { ...m, totalShares: m.totalShares + totalCost };
      }
      return m;
    }));

    // Record Transaction
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      referenceNumber: ref,
      tenantId: currentInstitutionId,
      tenantName: currentInstitution.name,
      memberId,
      memberName: memObj?.fullName,
      type: 'SharePurchase',
      amount: totalCost,
      paymentChannel: channel,
      status: 'Completed',
      date: new Date().toLocaleString(),
      description: `Nunuzi wa Hisa ${units} (@ TZS ${pricePerShare.toLocaleString()})`
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const addTransaction = async (tx: Transaction) => {
    try {
      const resp = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx)
      });

      if (resp.ok) {
        const json = await resp.json().catch(() => null);
        const created = json && (Array.isArray(json.data) ? json.data[0] : json.data);
        if (created) {
          const normalized: Transaction = {
            id: created.id || tx.id,
            referenceNumber: created.reference || tx.referenceNumber,
            tenantId: created.tenant_id || tx.tenantId || '',
            tenantName: tx.tenantName,
            memberId: created.member_id || tx.memberId,
            memberName: tx.memberName,
            type: created.type || tx.type,
            amount: Number(created.amount ?? tx.amount),
            paymentChannel: tx.paymentChannel,
            status: created.status || tx.status,
            date: created.created_at || tx.date || new Date().toLocaleString(),
            description: created.description || tx.description,
            receiptUrl: created.receipt_url || tx.receiptUrl
          } as Transaction;
          setTransactions(prev => [normalized, ...prev]);
          return;
        }
      }
    } catch (err) {
      console.warn('[Admin API] create transaction failed, falling back to local queue:', err);
    }

    // Fallback to local behavior
    setTransactions(prev => [tx, ...prev]);
  };

  const updateMemberProfile = (memberId: string, updates: Partial<Member>) => {
    const existingMember = members.find(member => member.id === memberId);
    if (existingMember) void SupabaseService.saveMember({ ...existingMember, ...updates });
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          ...updates
        };
      }
      return m;
    }));

    // If loans exist with this member name, update memberName in loans as well
    if (updates.fullName) {
      setLoans(prev => prev.map(l => l.memberId === memberId ? { ...l, memberName: updates.fullName! } : l));
      setTransactions(prev => prev.map(t => t.memberId === memberId ? { ...t, memberName: updates.fullName! } : t));
    }
  };

  const updateBranding = (
    instId: string,
    branding: {
      logo?: string;
      primaryColor?: string;
      name?: string;
      bankName?: string;
      bankAccountNumber?: string;
      bankAccountName?: string;
    }
  ) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === instId) {
        const updated = {
          ...inst,
          logo: branding.logo || inst.logo,
          primaryColor: branding.primaryColor || inst.primaryColor,
          name: branding.name || inst.name,
          bankName: branding.bankName !== undefined ? branding.bankName : inst.bankName,
          bankAccountNumber: branding.bankAccountNumber !== undefined ? branding.bankAccountNumber : inst.bankAccountNumber,
          bankAccountName: branding.bankAccountName !== undefined ? branding.bankAccountName : inst.bankAccountName
        };
        void SupabaseService.saveInstitution(updated);
        return updated;
      }
      return inst;
    }));
  };

  const addPublicAd = (newAd: Omit<PublicAdvertisement, 'id' | 'date'>) => {
    const ad: PublicAdvertisement = {
      ...newAd,
      id: `ad-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10)
    };
    setPublicAds(prev => [ad, ...prev]);
  };

  const updatePublicAd = (id: string, updates: Partial<PublicAdvertisement>) => {
    setPublicAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updates } : ad));
  };

  const deletePublicAd = (id: string) => {
    setPublicAds(prev => prev.filter(ad => ad.id !== id));
  };

  const togglePublicAdStatus = (id: string) => {
    setPublicAds(prev => prev.map(ad => ad.id === id ? { ...ad, active: !ad.active } : ad));
  };

  const submitPaymentProof = (proof: Omit<PaymentProof, 'id' | 'submittedDate' | 'status'>) => {
    const newProof: PaymentProof = {
      ...proof,
      id: `proof_${Date.now()}`,
      submittedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'Pending'
    };
    setPaymentProofs(prev => [newProof, ...prev]);

    addNotification({
      title: 'Kithibitisho Kipya cha Malipo',
      message: `Risiti #${proof.receiptNumber} ya TZS ${proof.amount.toLocaleString()} (${proof.paymentType}) kutoka ${proof.memberName} inasubiri ukaguzi.`,
      type: 'warning',
      targetRole: 'tenantadmin',
      tenantId: proof.tenantId || currentInstitutionId,
      category: 'payment',
      linkTab: 'receipts',
      amount: proof.amount
    });
  };

  const verifyPaymentProof = (
    proofId: string,
    status: 'Approved' | 'Rejected',
    verifiedBy: string,
    rejectionReason?: string
  ) => {
    const targetProof = paymentProofs.find(p => p.id === proofId);
    if (!targetProof) return;

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setPaymentProofs(prev => prev.map(p => {
      if (p.id === proofId) {
        return {
          ...p,
          status,
          verifiedBy,
          verifiedDate: nowStr,
          rejectionReason
        };
      }
      return p;
    }));

    addNotification({
      title: status === 'Approved' ? 'Risiti ya Malipo Imethibitishwa' : 'Risiti ya Malipo Imekataliwa',
      message: `Kithibitisho #${targetProof.receiptNumber} cha TZS ${targetProof.amount.toLocaleString()} (${targetProof.memberName}) kimefanyiwa uhakiki: ${status === 'Approved' ? 'KIMEKUBALIWA' : 'KIMEKATALIWA - ' + (rejectionReason || '')}.`,
      type: status === 'Approved' ? 'success' : 'alert',
      targetRole: 'tenantadmin',
      tenantId: targetProof.tenantId || currentInstitutionId,
      category: 'payment',
      linkTab: 'receipts',
      amount: targetProof.amount
    });

    if (status === 'Approved') {
      const tx: Transaction = {
        id: `tx_proof_${Date.now()}`,
        referenceNumber: targetProof.receiptNumber || `PROOF-${Date.now().toString().slice(-6)}`,
        tenantId: targetProof.tenantId,
        tenantName: targetProof.tenantName,
        memberId: targetProof.memberId,
        memberName: targetProof.memberName,
        type: targetProof.paymentType === 'FinePayment' ? 'SavingsDeposit' : targetProof.paymentType,
        amount: targetProof.amount,
        paymentChannel: (targetProof.paymentChannel as any) || 'Bank Transfer',
        status: 'Completed',
        date: nowStr,
        description: `Kithibitisho cha malipo kimeidhinishwa na ${verifiedBy}. Resiti #: ${targetProof.receiptNumber}`
      };

      setTransactions(prev => [tx, ...prev]);

      if (targetProof.paymentType === 'SavingsDeposit') {
        makeSavingsDeposit(targetProof.memberId, targetProof.amount, tx.paymentChannel, 'Mandatory');
      } else if (targetProof.paymentType === 'SharePurchase') {
        const sharePrice = 10000;
        const units = Math.max(1, Math.floor(targetProof.amount / sharePrice));
        purchaseShares(targetProof.memberId, units, tx.paymentChannel);
      } else if (targetProof.paymentType === 'LoanRepayment') {
        const activeLoan = loans.find(l => l.memberId === targetProof.memberId && (l.status === 'Disbursed' || l.status === 'Active'));
        if (activeLoan) {
          makeRepayment(activeLoan.id, targetProof.amount, tx.paymentChannel);
        }
      }
    }
  };

  const loginSuperAdmin = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    const userInput = username.trim();
    const localAccount = superAdminAccounts.find(
      acc => acc.username.toLowerCase() === userInput.toLowerCase() && acc.password === password
    );

    const client = supabase;
    if (client && userInput.includes('@')) {
      const { data, error } = await client.auth.signInWithPassword({
        email: userInput,
        password
      });

      if (!error && data.user) {
        const session: UserAuthSession = {
          role: 'superadmin',
          username: userInput,
          fullName: data.user.user_metadata?.full_name || data.user.email || 'SuperAdmin',
          isAuthenticated: true
        };
        setUserAuth(session);
        setActiveRole('superadmin');
        return { success: true, message: `Karibu SuperAdmin, ${session.fullName}` };
      }
    }

    if (localAccount) {
      const session: UserAuthSession = {
        role: 'superadmin',
        username: localAccount.username,
        fullName: localAccount.fullName,
        isAuthenticated: true
      };
      setUserAuth(session);
      setActiveRole('superadmin');
      return { success: true, message: `Karibu SuperAdmin, ${localAccount.fullName}` };
    }

    return { success: false, message: 'Jina la mtumiaji / barua pepe au neno la siri la SuperAdmin si sahihi!' };
  };

  const registerSuperAdmin = async (fullName: string, username: string, password: string, email: string): Promise<{ success: boolean; message: string }> => {
    const cleanName = fullName.trim();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (superAdminAccounts.length >= 1) {
      return {
        success: false,
        message: 'Kizuizi cha Usalama: Mfumo unaruhusu SuperAdmin MMOJA TU. Tayari Mfumo una SuperAdmin aliyesajiliwa! Ingia ukitumia akaunti hiyo.'
      };
    }

    if (!cleanUsername || !password || !cleanName || !cleanEmail) {
      return { success: false, message: 'Tafadhali jaza jina, username, barua pepe na password zote!' };
    }

    const exists = superAdminAccounts.some(acc => acc.username.toLowerCase() === cleanUsername.toLowerCase());
    if (exists) {
      return { success: false, message: 'Jina hili la mtumiaji (username) tayari linatumiwa!' };
    }

    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            username: cleanUsername
          }
        }
      });

      if (!error && data.user) {
        const session: UserAuthSession = {
          role: 'superadmin',
          username: cleanUsername,
          fullName: cleanName,
          isAuthenticated: true
        };
        setUserAuth(session);
        setActiveRole('superadmin');
        return { success: true, message: `Akaunti ya SuperAdmin ${cleanName} imeanzishwa kwenye Supabase. Tafadhali thibitisha barua pepe ukikubali email confirmation.` };
      }

      if (error && error.message && !error.message.toLowerCase().includes('email')) {
        console.warn('[Supabase Auth] signUp failed, falling back to local registration:', error.message);
      }
    }

    const newAccount = { fullName: cleanName, username: cleanUsername, password, email: cleanEmail };
    setSuperAdminAccounts(prev => [...prev, newAccount]);
    const session: UserAuthSession = {
      role: 'superadmin',
      username: newAccount.username,
      fullName: newAccount.fullName,
      isAuthenticated: true
    };
    setUserAuth(session);
    setActiveRole('superadmin');
    return { success: true, message: `Akaunti ya SuperAdmin ${cleanName} imetengenezwa kikamilifu!` };
  };

  const loginTenantAdmin = async (institutionId: string, username: string, password: string): Promise<{ success: boolean; message: string }> => {
    const inst = institutions.find(i => i.id === institutionId);
    if (!inst) {
      return { success: false, message: 'Taasisi haijapatikana!' };
    }

    const client = getSupabaseClient() || supabase;
    if (client && username.includes('@')) {
      const { data, error } = await client.auth.signInWithPassword({ email: username.trim().toLowerCase(), password });
      if (!error && data.user) {
        const { data: profile } = await client.from('profiles').select('tenant_id, role').eq('id', data.user.id).maybeSingle();
        if (profile?.role === 'tenantadmin' && profile.tenant_id === institutionId) {
          const remoteMembers = await SupabaseService.fetchMembers(institutionId);
          setMembers(remoteMembers);
          setCurrentInstitutionId(inst.id);
          setUserAuth({ role: 'tenantadmin', username: username.trim().toLowerCase(), fullName: `Admin ${inst.name}`, institutionId: inst.id, isAuthenticated: true });
          setActiveRole('tenantadmin');
          return { success: true, message: `Umefanikiwa kuingia katika Mfumo wa ${inst.name}` };
        }
        await client.auth.signOut();
      }
    }

    const validUser = (inst.adminUsername || `admin_${inst.domain.split('.')[0]}`).toLowerCase();
    const validPass = inst.adminPassword || 'Password123!';

    if (username.trim().toLowerCase() === validUser && password === validPass) {
      setCurrentInstitutionId(inst.id);
      const session: UserAuthSession = {
        role: 'tenantadmin',
        username: username.trim(),
        fullName: `Admin ${inst.name}`,
        institutionId: inst.id,
        isAuthenticated: true
      };
      setUserAuth(session);
      setActiveRole('tenantadmin');
      return { success: true, message: `Umefanikiwa kuingia katika Mfumo wa ${inst.name}` };
    }
    return { success: false, message: `Taarifa za kuingia kwa Admin wa ${inst.name} si sahihi!` };
  };

  const loginMember = async (institutionId: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const safeEmail = String(email ?? '').trim().toLowerCase();
    const safePassword = String(password ?? '');
    if (!safeEmail || !safePassword || !safeEmail.includes('@')) {
      return { success: false, message: 'Weka email halali ya mwanachama na password.' };
    }

    const client = getSupabaseClient() || supabase;
    if (!client) {
      return { success: false, message: 'Supabase haijaunganishwa. Member hawezi kuingia bila Supabase Auth.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({ email: safeEmail, password: safePassword });
      if (error || !data.user) {
        return { success: false, message: 'Email au password ya mwanachama si sahihi.' };
      }

      const { data: memberRow, error: memberError } = await client
        .from('members')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('tenant_id', institutionId)
        .maybeSingle();

      if (memberError || !memberRow) {
        await client.auth.signOut();
        return { success: false, message: 'Akaunti hii haijaunganishwa na mwanachama wa taasisi hii.' };
      }

      const member = SupabaseService.normalizeMember(memberRow);
      if (!member) {
        await client.auth.signOut();
        return { success: false, message: 'Taarifa za mwanachama hazijakamilika Supabase.' };
      }

      setMembers(prev => [member, ...prev.filter(item => item.id !== member.id)]);
      setCurrentInstitutionId(institutionId);
      setCurrentMemberId(member.id);
      setUserAuth({
        role: 'member',
        username: member.email,
        fullName: member.fullName,
        institutionId: member.tenantId,
        memberId: member.id,
        isAuthenticated: true
      });
      setActiveRole('member');
      return { success: true, message: `Karibu ${member.fullName} katika Portal ya Wanachama!` };
    } catch (err) {
      console.warn('[Member Auth] Supabase sign-in failed:', err);
      return { success: false, message: 'Imeshindikana kuwasiliana na Supabase Auth.' };
    }
  };

  const updateInstitutionCredentials = (institutionId: string, username: string, password: string) => {
    setInstitutions(prev => prev.map(inst => {
      if (inst.id === institutionId) {
        return {
          ...inst,
          adminUsername: username.trim(),
          adminPassword: password
        };
      }
      return inst;
    }));
  };

  const updateMemberCredentials = async (memberId: string, email: string, password: string, fullName: string) => {
    const member = members.find(item => item.id === memberId);
    const safeEmail = email.trim().toLowerCase();
    if (!member) return { success: false, message: 'Mwanachama huyo hakupatikana.' };
    if (!safeEmail.includes('@') || password.length < 6) {
      return { success: false, message: 'Weka email halali na password yenye angalau herufi 6.' };
    }

    const client = getSupabaseClient() || supabase;
    const session = await client?.auth.getSession();
    const token = session?.data.session?.access_token;
    if (!token) return { success: false, message: 'Session ya admin wa taasisi haipo Supabase.' };

    try {
      const response = await fetch('/api/admin/members/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          member_id: memberId,
          tenant_id: member.tenantId,
          email: safeEmail,
          password,
          full_name: fullName.trim(),
          phone: member.phone
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        return { success: false, message: result?.message || 'Credentials hazijahifadhiwa Supabase.' };
      }

      setMembers(prev => prev.map(item => item.id === memberId ? {
        ...item,
        email: safeEmail,
        username: safeEmail,
        fullName: fullName.trim(),
        userId: result.data?.user_id || item.userId
      } : item));
      return { success: true };
    } catch (err) {
      console.warn('[Member Credentials] Supabase update failed:', err);
      return { success: false, message: 'Imeshindikana ku-update credentials Supabase.' };
    }
  };

  const logoutUser = () => {
    setUserAuth(null);
    setActiveRole('public');
  };

  const generateDailyAuditReportNow = (): StoredDailyAuditReport => {
    const report = create24HourAuditReportObject(
      institutions,
      members,
      loans,
      transactions,
      paymentProofs,
      auditLogs
    );
    setStoredAuditReports(prev => [report, ...prev]);
    setLastCronRunTimestamp(Date.now());

    addNotification({
      title: 'Ripoti ya Ukaguzi wa Saa 24 (24H Audit)',
      message: `Ripoti mpya ya ukaguzi ya kiotomatiki (${report.reportCode}) ya tarehe ${report.periodEndDate} imezalishwa na kuhifadhiwa kikamilifu.`,
      type: 'info',
      targetRole: 'tenantadmin',
      tenantId: currentInstitutionId,
      category: 'audit',
      linkTab: 'accounting'
    });

    return report;
  };

  const deleteStoredAuditReport = (reportId: string) => {
    setStoredAuditReports(prev => prev.filter(r => r.id !== reportId));
  };

  // Check 24-hour interval on mount and every 1 minute
  useEffect(() => {
    const checkAndRunCron = () => {
      const now = Date.now();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      if (now - lastCronRunTimestamp >= TWENTY_FOUR_HOURS) {
        generateDailyAuditReportNow();
      }
    };

    checkAndRunCron();
    const interval = setInterval(checkAndRunCron, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastCronRunTimestamp, institutions, members, loans, transactions, paymentProofs, auditLogs]);

  const resetAllData = () => {
    localStorage.removeItem('saccos_insts');
    localStorage.removeItem('saccos_members');
    localStorage.removeItem('saccos_loans');
    localStorage.removeItem('saccos_savings');
    localStorage.removeItem('saccos_shares');
    localStorage.removeItem('saccos_txs');
    localStorage.removeItem('saccos_public_ads');
    localStorage.removeItem('saccos_payment_proofs');
    localStorage.removeItem('saccos_projects');
    localStorage.removeItem('saccos_daily_audit_reports');
    localStorage.removeItem('saccos_last_audit_cron');
    localStorage.removeItem('saccos_notifications');
    localStorage.removeItem('saccos_fines');
    setInstitutions([]);
    setMembers([]);
    setLoans([]);
    setSavingsAccounts([]);
    setSharesAccounts([]);
    setTransactions([]);
    setPublicAds([]);
    setPaymentProofs([]);
    setProjects([]);
    setNotifications([]);
    setFines([]);
    setStoredAuditReports([]);
    setCurrentInstitutionId('');
    setCurrentMemberId('');
    setLastCronRunTimestamp(Date.now());
  };

  // Insert institution returned by server into local state without a full page reload
  const prependInstitutionFromServer = (inst: Institution) => {
    setInstitutions(prev => {
      // Avoid duplicates by id
      if (!inst || !inst.id) return prev;
      if (prev.some(p => p.id === inst.id)) return prev;
      const next = [inst as Institution, ...prev];
      try {
        safeSetLocalStorage('saccos_insts', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const addProject = (newProjectData: Omit<InstitutionProject, 'id' | 'createdDate' | 'financialLogs'>) => {
    const id = `proj_${Date.now()}`;
    const newProject: InstitutionProject = {
      ...newProjectData,
      id,
      createdDate: new Date().toISOString().split('T')[0],
      financialLogs: []
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<InstitutionProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addProjectFinancialLog = (projectId: string, logData: Omit<ProjectFinancialLog, 'id'>) => {
    const logId = `plog_${Date.now()}`;
    const newLog: ProjectFinancialLog = {
      ...logData,
      id: logId
    };
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          financialLogs: [newLog, ...p.financialLogs]
        };
      }
      return p;
    }));
  };

  const deleteProjectFinancialLog = (projectId: string, logId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          financialLogs: p.financialLogs.filter(l => l.id !== logId)
        };
      }
      return p;
    }));
  };

  const refreshMembers = async (): Promise<void> => {
    const tenantId = userAuth?.institutionId || currentInstitutionId;
    const remoteMembers = await SupabaseService.fetchMembers(tenantId);
    setMembers(userAuth?.role === 'member' && userAuth.memberId
      ? remoteMembers.filter(member => member.id === userAuth.memberId)
      : remoteMembers);
  };

  // Make the prepend helper available globally so lightweight components can call it without prop drilling
  // The AppContext also provides stateful methods — use these for more complex flows.
  // Assign global helper
  (window as any).__APP_CONTEXT_PREPEND_INSTITUTION__ = prependInstitutionFromServer;

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        themeColor,
        setThemeColor,
        activeRole,
        setActiveRole,
        isInitializing,
        globalLoading,
        setGlobalLoading,
        institutions,
        subscriptionPlans,
        members,
        loans,
        savingsAccounts,
        sharesAccounts,
        transactions,
        coa,
        auditLogs,
        notifications,
        fines,
        publicAds,
        paymentProofs,
        projects,
        storedAuditReports,
        lastCronRunTimestamp,
        userAuth,
        loginSuperAdmin,
        registerSuperAdmin,
        loginTenantAdmin,
        loginMember,
        updateInstitutionCredentials,
        updateMemberCredentials,
        logoutUser,
        currentInstitution,
        setCurrentInstitutionId,
        currentMember,
        setCurrentMemberId,
        t,
        formatTZS,
        generateDailyAuditReportNow,
        deleteStoredAuditReport,
        addInstitution,
        deleteInstitution,
        updateInstitution,
        updateInstitutionPlan,
        toggleInstitutionStatus,
        addMember,
        addBatchMembers,
        deleteMember,
        addFine,
        payFine,
        waiveFine,
        applyLoan,
        issueDirectLoan,
        updateLoanTerms,
        updateInstitutionLoanRates,
        approveLoanStep,
        rejectLoan,
        makeRepayment,
        makeSavingsDeposit,
        purchaseShares,
        addTransaction,
        updateBranding,
        updateMemberProfile,
        addPublicAd,
        updatePublicAd,
        deletePublicAd,
        togglePublicAdStatus,
        submitPaymentProof,
        verifyPaymentProof,
        addProject,
        updateProject,
        deleteProject,
        addProjectFinancialLog,
        deleteProjectFinancialLog,
        addNotification,
        announcements,
        addAnnouncement,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        refreshMembers,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
