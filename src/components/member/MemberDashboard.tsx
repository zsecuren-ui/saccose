import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, Member } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';
import { MemberQuickActionModal } from './MemberQuickActionModal';
import { MemberIntelligenceAnalytics } from './MemberIntelligenceAnalytics';
import { MemberSettlementReports } from './MemberSettlementReports';
import { MemberEditProfileModal } from '../common/MemberEditProfileModal';
import { MemberPhotoModal } from '../common/MemberPhotoModal';
import { MemberAvatar } from '../common/MemberAvatar';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { MemberPaymentHistoryAndPassbook } from './MemberPaymentHistoryAndPassbook';
import { MemberLoanRequestModule } from './MemberLoanRequestModule';
import { BulkRegistrationForm } from './BulkRegistrationForm';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  User,
  UserPlus,
  Wallet,
  PiggyBank,
  PieChart,
  CreditCard,
  Plus,
  Send,
  Download,
  FileText,
  Smartphone,
  CheckCircle2,
  Calendar,
  Vote,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Brain,
  Sparkles,
  Zap,
  Layers,
  Camera,
  Upload,
  Edit3,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
  TrendingUp,
  LayoutGrid,
  List,
  Eye,
  ZoomIn,
  Briefcase,
  Building2,
  Sprout,
  Truck,
  Coins,
  CheckCircle2 as CheckIcon
} from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const {
    currentMember,
    currentInstitution,
    members,
    loans,
    transactions,
    projects,
    applyLoan,
    makeSavingsDeposit,
    makeRepayment,
    purchaseShares,
    addBatchMembers,
    deleteMember,
    updateMemberProfile,
    refreshMembers,
    formatTZS
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'my_submembers' | 'institution_projects' | 'analytics' | 'history_passbook' | 'apply_loan' | 'deposit' | 'settlement' | 'voting'>('overview');
  const [subMemberSearch, setSubMemberSearch] = useState('');

  // Camera & Photo State
  const [isDashboardCameraOpen, setIsDashboardCameraOpen] = useState(false);
  const dashboardFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [photoUpdatedToast, setPhotoUpdatedToast] = useState<string | null>(null);

  const handleDashboardPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentMember) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Tafadhali chagua picha yenye ukubwa chini ya 8MB.');
        return;
      }
      (async () => {
        try {
          const data = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onloadend = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(file);
          });
          const { compressDataUrl } = await import('../../lib/imageUtils');
          const compressed = await compressDataUrl(data, 800, 800, 0.8, 'image/jpeg');
          updateMemberProfile(currentMember.id, { photoUrl: compressed });
          setPhotoUpdatedToast('Picha yako ya wasifu imesasishwa kikamilifu!');
          setTimeout(() => setPhotoUpdatedToast(null), 5000);
        } catch (err) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              updateMemberProfile(currentMember.id, { photoUrl: reader.result });
              setPhotoUpdatedToast('Picha yako ya wasifu imesasishwa kikamilifu!');
              setTimeout(() => setPhotoUpdatedToast(null), 5000);
            }
          };
          reader.readAsDataURL(file);
        }
      })();
    }
  };

  const handleCameraCaptureSuccess = (capturedDataUrl: string) => {
    if (currentMember) {
      updateMemberProfile(currentMember.id, { photoUrl: capturedDataUrl });
      setIsDashboardCameraOpen(false);
      setPhotoUpdatedToast('Picha ya kamera imepigwa na kuhifadhiwa kwenye wasifu wako!');
      setTimeout(() => setPhotoUpdatedToast(null), 5000);
    }
  };

  // Sync Now State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await refreshMembers();
      setSyncToast('Taarifa za wanachama zimesawazishwa na database ya Supabase (Data Synced!)');
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [photoModalMember, setPhotoModalMember] = useState<Member | null>(null);
  const [subMemberViewMode, setSubMemberViewMode] = useState<'table' | 'grid'>('grid');

  // Sub-member action states (Edit & Delete)
  const [subMemberToEdit, setSubMemberToEdit] = useState<Member | null>(null);
  const [subMemberToDelete, setSubMemberToDelete] = useState<Member | null>(null);

  // Sub-members registration modal state
  const [isSubMemberModalOpen, setIsSubMemberModalOpen] = useState(false);
  const [subMemberCount, setSubMemberCount] = useState<number>(5);
  const [subMemberPrefix, setSubMemberPrefix] = useState(
    currentMember?.fullName ? `Mwanachama wa ${currentMember.fullName.split(' ')[0]}` : 'Mwanachama'
  );

  // Quick Action Modal State
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [quickModalInitialTab, setQuickModalInitialTab] = useState<'deposit' | 'loan' | 'repayment' | 'statement' | 'proof'>('deposit');
  
  // Deposit Form state
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [depositChannel, setDepositChannel] = useState<Transaction['paymentChannel']>('M-Pesa');
  const [depositType, setDepositType] = useState<'Mandatory' | 'Voluntary'>('Voluntary');

  // Loan Application state
  const [loanAmount, setLoanAmount] = useState<number>(3000000);
  const [loanDuration, setLoanDuration] = useState<number>(12);
  const [loanType, setLoanType] = useState<'Dharura' | 'Biashara' | 'Elimu' | 'Kilimo'>('Biashara');
  const [loanPurpose, setLoanPurpose] = useState('');

  // Selected Transaction for receipt modal
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  // Voting state
  const [voted, setVoted] = useState(false);

  // Filter members registered by or belonging to current member's batch/branch
  const currentFirstName = (currentMember?.fullName || '').split(' ')[0] || '';
  const mySubMembers = React.useMemo(() => {
    if (!currentMember || !currentInstitution) return [];
    return (members || []).filter(m => 
      m && m.tenantId === currentInstitution.id && (
        m.registeredById === currentMember.id ||
        (m.branch && currentFirstName && m.branch.includes(currentFirstName)) ||
        (m.fullName && currentFirstName && m.fullName.toLowerCase().includes(currentFirstName.toLowerCase()) && m.id !== currentMember.id)
      )
    );
  }, [members, currentMember, currentInstitution, currentFirstName]);

  const filteredSubMembers = React.useMemo(() => {
    if (!subMemberSearch.trim()) return mySubMembers;
    const q = subMemberSearch.toLowerCase();
    return mySubMembers.filter(m => 
      (m.fullName || '').toLowerCase().includes(q) ||
      (m.memberNumber || '').toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q) ||
      (m.branch || '').toLowerCase().includes(q)
    );
  }, [mySubMembers, subMemberSearch]);

  // 30-Day Registration Trend Data for Recharts
  const registrationTrendData = React.useMemo(() => {
    const datesMap: Record<string, { date: string; displayDate: string; daily: number; total: number }> = {};
    const today = new Date();
    
    // Create 30 days history timeline
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const monthShort = d.toLocaleDateString('sw-TZ', { month: 'short', day: 'numeric' });
      datesMap[dateStr] = { date: dateStr, displayDate: monthShort, daily: 0, total: 0 };
    }

    mySubMembers.forEach(m => {
      const jDate = m.joinedDate ? m.joinedDate.split('T')[0] : '';
      if (jDate && datesMap[jDate]) {
        datesMap[jDate].daily += 1;
      }
    });

    let cum = 0;
    return Object.values(datesMap).map(item => {
      cum += item.daily;
      return { ...item, total: cum };
    });
  }, [mySubMembers]);

  if (!currentMember || !currentInstitution) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Inapakia taarifa za mwanachama... (Loading member session...)
      </div>
    );
  }

  const memberLoans = (loans || []).filter(l => l && l.memberId === currentMember.id);
  const activeLoan = memberLoans.find(l => l && l.status === 'Active');
  const memberTxs = (transactions || []).filter(t => t && t.memberId === currentMember.id);

  const openQuickAction = (tab: 'deposit' | 'loan' | 'repayment' | 'statement' | 'proof') => {
    setQuickModalInitialTab(tab);
    setQuickModalOpen(true);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;

    makeSavingsDeposit(currentMember.id, depositAmount, depositChannel, depositType);
    alert(`Amana ya TZS ${depositAmount.toLocaleString()} kupitia ${depositChannel} imekamilika!`);
  };

  const handleApplyLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loanAmount <= 0) return;

    applyLoan({
      amountRequested: loanAmount,
      durationMonths: loanDuration,
      loanType,
      purpose: loanPurpose || 'Mkopo wa maendeleo ya kibiashara'
    });

    alert('Maombi yako ya mkopo yametumwa kikamilifu! Yapo kwenye hatua ya udhibiti (Under Review).');
    setActiveTab('overview');
  };

  return (
    <div id="member-portal-view" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-xs relative">
      
      {/* Photo Update Success Toast */}
      {photoUpdatedToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="p-1 bg-white/20 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-bold">{photoUpdatedToast}</span>
          <button
            onClick={() => setPhotoUpdatedToast(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden file input for dashboard photo upload */}
      <input
        type="file"
        ref={dashboardFileInputRef}
        accept="image/*"
        onChange={handleDashboardPhotoUpload}
        className="hidden"
      />

      {/* Member Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-center gap-4">
          <MemberAvatar
            name={currentMember.fullName}
            photoUrl={currentMember.photoUrl}
            size="xl"
            shape="2xl"
            showZoomIcon
            showCameraIcon
            onClick={() => setPhotoModalMember(currentMember)}
            onCameraClick={() => setIsDashboardCameraOpen(true)}
            className="ring-4 ring-emerald-500/40 shadow-lg shrink-0"
          />

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{currentMember.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-[10px] border border-emerald-400/30">
                {currentMember.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <button
                type="button"
                onClick={() => setIsDashboardCameraOpen(true)}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 text-[11px] shadow-sm transition-transform active:scale-95 cursor-pointer"
                title="Piga picha kwa kamera ya simu au kompyuta"
              >
                <Camera className="w-3.5 h-3.5 text-slate-950" />
                <span>Piga Picha</span>
              </button>
              <button
                type="button"
                onClick={() => dashboardFileInputRef.current?.click()}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-emerald-200 font-medium rounded-xl border border-white/10 flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer"
                title="Pakia picha kutoka kwenye kifaa chako"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-300" />
                <span>Pakia Picha</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-emerald-200 font-medium rounded-xl border border-white/10 flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Hariri Wasifu</span>
              </button>
            </div>

            <p className="text-emerald-200 font-mono text-xs pt-1">
              Namba: <strong className="text-white font-bold">{currentMember.memberNumber}</strong> • {currentInstitution.name}
            </p>
            <p className="text-slate-300 text-[11px]">
              Tawi: {currentMember.branch} • NIDA: {currentMember.idNumber}
            </p>
          </div>
        </div>

        {/* Right Info & Quick Action Summary */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">Taasisi Yangu</span>
            <span className="text-xs font-bold text-white block truncate max-w-[240px]">{currentInstitution.name}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-200 font-bold rounded-xl border border-white/10 text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Inasawazisha...' : 'Sync Database'}</span>
            </button>
            <button
              onClick={() => openQuickAction('proof')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-[11px] flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Resiti</span>
            </button>
          </div>
        </div>
      </div>

      {/* Member Action Center / Quick Action Bento Grid - Fully Contained Inside Dashboard */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
              Vipengele vya Haraka vya Mwanachama (Quick Action Center)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Bofya kitufe kufungua moja kwa moja</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Action 1: Weka Akiba */}
          <button
            type="button"
            onClick={() => openQuickAction('deposit')}
            className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100/90 dark:hover:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-left flex flex-col justify-between gap-2 group transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200 block">Weka Akiba</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 line-clamp-1">M-Pesa / Tigo / Bank</span>
            </div>
          </button>

          {/* Action 2: Omba Mkopo */}
          <button
            type="button"
            onClick={() => setActiveTab('apply_loan')}
            className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 hover:bg-blue-100/90 dark:hover:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 text-left flex flex-col justify-between gap-2 group transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-blue-950 dark:text-blue-200 block">Omba Mkopo</span>
              <span className="text-[10px] text-blue-700 dark:text-blue-400 line-clamp-1">Fomu & Calculator</span>
            </div>
          </button>

          {/* Action 3: Tuma Resiti / Scan */}
          <button
            type="button"
            onClick={() => openQuickAction('proof')}
            className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/90 dark:hover:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-left flex flex-col justify-between gap-2 group transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200 block">Tuma Resiti</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 line-clamp-1">Piga picha & Uthibitisho</span>
            </div>
          </button>

          {/* Action 4: Settlement Report */}
          <button
            type="button"
            onClick={() => setActiveTab('settlement')}
            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2 group transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
              activeTab === 'settlement'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/40'
                : 'bg-indigo-50/80 dark:bg-indigo-950/30 hover:bg-indigo-100/90 dark:hover:bg-indigo-950/50 border-indigo-200/80 dark:border-indigo-800/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform ${
              activeTab === 'settlement' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
            }`}>
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className={`font-extrabold text-xs block ${activeTab === 'settlement' ? 'text-white' : 'text-indigo-950 dark:text-indigo-200'}`}>
                Settlement & Ripoti
              </span>
              <span className={`text-[10px] line-clamp-1 ${activeTab === 'settlement' ? 'text-indigo-100' : 'text-indigo-700 dark:text-indigo-400'}`}>
                Pakua Taarifa Rasmi
              </span>
            </div>
          </button>

          {/* Action 5: Sajili Wanachama Wapya */}
          <button
            type="button"
            id="register-members-btn"
            onClick={() => setIsSubMemberModalOpen(true)}
            className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/30 hover:bg-teal-100/90 dark:hover:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/60 text-left flex flex-col justify-between gap-2 group transition-all cursor-pointer shadow-2xs hover:shadow-xs col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-teal-950 dark:text-teal-200 block">Sajili Wanachama</span>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 line-clamp-1">Wapya 1 - 50 kwa Mkupuo</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Akiba Zangu</span>
            <PiggyBank className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatTZS(currentMember.totalSavings)}
          </span>
          <span className="text-[10px] text-slate-400 block">Salio la Akiba za Lazima & Hiari</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Hisa Zangu</span>
            <PieChart className="w-5 h-5 text-blue-600" />
          </div>
          <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatTZS(currentMember.totalShares)}
          </span>
          <span className="text-[10px] text-slate-400 block">Mtaji wa Hisa katika SACCOS</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Mkopo Unaoendelea</span>
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <span className="block text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatTZS(currentMember.totalLoansOutstanding)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {activeLoan ? `Rejesho la Mwezi: ${formatTZS(activeLoan.monthlyInstallment)}` : 'Huna mkopo unaoendelea'}
          </span>
        </div>

      </div>

      {/* Navigation Subtabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 text-xs font-semibold overflow-x-auto scroll-smooth">
        {[
          { id: 'overview', label: 'Muhtasari', icon: <Wallet className="w-4 h-4" /> },
          { id: 'settlement', label: 'Settlement & Ripoti', icon: <FileText className="w-4 h-4 text-indigo-500" /> },
          { id: 'history_passbook', label: 'Historia ya Malipo & Passbook', icon: <FileText className="w-4 h-4 text-amber-500" /> },
          { id: 'apply_loan', label: 'Omba Mkopo Mpya', icon: <CreditCard className="w-4 h-4 text-blue-500" /> },
          { id: 'deposit', label: 'Weka Akiba / LIPA', icon: <Send className="w-4 h-4 text-emerald-500" /> },
          { id: 'institution_projects', label: 'Miradi ya Taasisi & Uwekezaji', icon: <Briefcase className="w-4 h-4 text-emerald-500" /> },
          { id: 'my_submembers', label: `Wanachama Wangu (${mySubMembers.length})`, icon: <UserPlus className="w-4 h-4 text-teal-500" /> },
          { id: 'analytics', label: 'Uchambuzi wa Kiumbuji (Charts)', icon: <Brain className="w-4 h-4 text-purple-500" /> },
          { id: 'voting', label: 'AGM Voting & Polls', icon: <Vote className="w-4 h-4 text-rose-500" /> }
        ].map((tItem) => (
          <button
            key={tItem.id}
            onClick={() => setActiveTab(tItem.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tItem.id
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {tItem.icon}
            <span>{tItem.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Embedded Intelligence Summary */}
          <MemberIntelligenceAnalytics />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active Loan Details */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between border-b pb-2">
                <span>Hali ya Mkopo Wako</span>
                {activeLoan && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">ACTIVE</span>}
              </h3>

              {activeLoan ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aina ya Mkopo:</span>
                    <span className="font-bold">{activeLoan.loanType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kiasi Kilichoidhinishwa:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatTZS(activeLoan.amountApproved)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Kiasi Kilichorejeshwa:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {formatTZS(activeLoan.totalPaid || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Baki la Deni:</span>
                    <span className="font-bold text-amber-600">{formatTZS(activeLoan.remainingBalance)}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((activeLoan.totalPaid || 0) / (activeLoan.totalRepayable || activeLoan.amountApproved || 1)) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Rejesho Linalofuata:</span>
                    <span className="font-bold text-emerald-600">{activeLoan.nextPaymentDueDate}</span>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => openQuickAction('repayment')}
                      className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-center hover:bg-emerald-700 transition-colors"
                    >
                      Lipa Rejesho Sasa via M-Pesa / Bank
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Huna mkopo unaoendelea kwa sasa.</p>
                  <button
                    onClick={() => openQuickAction('loan')}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs inline-block"
                  >
                    Omba Mkopo Mpya
                  </button>
                </div>
              )}
            </div>

            {/* Sub-Members Overview Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Wanachama Uliowasajili ({mySubMembers.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Synchronisha data na Database"
                  >
                    <RefreshCw className={`w-3 h-3 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('my_submembers')}
                    className="text-amber-600 dark:text-amber-400 font-extrabold hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>Tazama Yote ({mySubMembers.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {mySubMembers.length === 0 ? (
                <div className="p-4 text-center space-y-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-dashed border-amber-200 dark:border-amber-900/40">
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Bado hujasajili mwanachama yeyote. Unaweza kusajili au kuwaalika wanachama 1 mpaka 50 kwa mkupuo.
                  </p>
                  <button
                    onClick={() => setIsSubMemberModalOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sajili Wanachama Wapya (1 - 50)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {mySubMembers.slice(0, 4).map((subMem) => (
                    <div key={subMem.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar
                          name={subMem.fullName}
                          photoUrl={subMem.photoUrl}
                          size="sm"
                          shape="full"
                        />
                        <div>
                          <span className="font-bold block text-slate-900 dark:text-white text-xs">{subMem.fullName}</span>
                          <span className="text-[10px] text-slate-400">{subMem.memberNumber} • {subMem.branch}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block text-xs">{formatTZS(subMem.totalSavings)}</span>
                        <span className="text-[10px] text-slate-400">Akiba</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 flex justify-between items-center">
                <span>Miamala Yako ya Hivi Karibuni</span>
                <button
                  onClick={() => setActiveTab('settlement')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-[11px]"
                >
                  Tazama Yote →
                </button>
              </h3>
              <div className="space-y-2">
                {memberTxs.map((tx) => (
                  <div key={tx.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-white">{tx.description}</span>
                      <span className="text-[10px] text-slate-400">{tx.date} • {tx.paymentChannel}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 block">{formatTZS(tx.amount)}</span>
                      <button
                        onClick={() => setReceiptTx(tx)}
                        className="text-[10px] text-indigo-500 hover:underline font-semibold"
                      >
                        Risiti →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Dedicated Institution Projects View for Members */}
      {activeTab === 'institution_projects' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-emerald-400" />
                <h2 className="text-lg font-black text-white">Miradi na Uwekezaji ya {currentInstitution.name}</h2>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                Tazama miradi inayojiendesha, mtaji uliowekezwa, mapato (mother income), na faida inayopatikana kwa wanachama.
              </p>
            </div>
            <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 font-extrabold rounded-xl text-xs border border-emerald-500/30">
              {projects.filter(p => p.tenantId === currentInstitution.id).length} Miradi Hai
            </div>
          </div>

          {/* Member View Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.filter(p => p.tenantId === currentInstitution.id).map(p => {
              let gross = 0;
              let expenses = 0;
              p.financialLogs?.forEach(l => {
                if (l.type === 'Income') gross += l.amount || 0;
                if (l.type === 'Expense') expenses += l.amount || 0;
              });
              const netProfit = gross - expenses;

              return (
                <div key={p.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {p.category}
                      </span>
                      <h3 className="font-black text-slate-900 dark:text-white text-base mt-1">{p.name}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{p.location || 'Haikuwekwa'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {p.status}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {p.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Mtaji wa Mwanzo</span>
                      <span className="font-bold text-slate-800 dark:text-white text-xs">{formatTZS(p.initialCapital)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Mapato Kamili</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400 text-xs">{formatTZS(gross)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Gharama za Mradi</span>
                      <span className="font-bold text-rose-500 text-xs">
                        {formatTZS(expenses)}
                      </span>
                    </div>
                  </div>

                  {p.financialLogs && p.financialLogs.length > 0 && (
                    <div className="border-t pt-3 border-slate-100 dark:border-slate-700 space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Miamala ya Hivi Karibuni</span>
                      {p.financialLogs.slice(0, 2).map(l => (
                        <div key={l.id} className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-300">
                          <span>{l.category} ({l.date})</span>
                          <span className={`font-bold ${l.type === 'Income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {l.type === 'Income' ? '+' : '-'}{formatTZS(l.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dedicated My Sub-Members Tab View */}
      {activeTab === 'my_submembers' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Banner & Action */}
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <span>Wanachama Uliowasajili Chini Yako (My Registered Sub-Members)</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Orodha rasmi ya wanachama 1 mpaka 50 uliowasajili au kuwaalika katika {currentInstitution.name}.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center gap-2 text-xs transition-colors cursor-pointer"
                title="Synchronisha orodha ya wanachama kutoka Supabase Database"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Inasawazisha (Syncing...)' : 'Sync Now'}</span>
              </button>
              <button
                onClick={() => setIsSubMemberModalOpen(true)}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-lg flex items-center gap-2 text-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Sajili Wanachama Wapya (1 - 50)</span>
              </button>
            </div>
          </div>

          {/* Sync Toast Notification */}
          {syncToast && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{syncToast}</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-extrabold">SUPABASE DB LIVE</span>
            </div>
          )}

          {/* Stats Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Idadi ya Wanachama</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">{mySubMembers.length} Wanachama</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Uliyowasajili</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Jumla ya Akiba Zao</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatTZS(mySubMembers.reduce((sum, m) => sum + (m.totalSavings || 0), 0))}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Akiba zilizohifadhiwa</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Jumla ya Hisa Zao</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {formatTZS(mySubMembers.reduce((sum, m) => sum + (m.totalShares || 0), 0))}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Mtaji wa Hisa</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Hali ya Uanachama</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {mySubMembers.filter(m => m.status === 'Active').length} Active
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Wanachama HAI</span>
            </div>
          </div>

          {/* 30-Day Registration Trends Visual Summary (Recharts) */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Mwenendo wa Usajili wa Wanachama (Siku 30 Zilizopita)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Visual chart showing member onboarding & registration velocity over the last month.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  +{registrationTrendData[registrationTrendData.length - 1]?.total || 0} Total Registered
                </span>
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="subMemberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} Wanachama`, 'Usajili (Total)']}
                    labelFormatter={(label: any) => `Tarehe: ${label}`}
                  />
                  <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#subMemberGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Enhanced Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tafuta mwanachama kwa jina, namba (MEM-XXXX), au simu..."
                value={subMemberSearch}
                onChange={(e) => setSubMemberSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-amber-500/30 outline-none"
              />
              {subMemberSearch && (
                <button
                  onClick={() => setSubMemberSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {subMemberSearch && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/40 self-start sm:self-auto">
                Waliopatikana: {filteredSubMembers.length}
              </span>
            )}
          </div>

          {/* Members List Table / Cards */}
          {filteredSubMembers.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <UserPlus className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Hakuna Wanachama Waliopatikana</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {subMemberSearch ? 'Hakuna mwanachama anayefanana na utafutaji wako.' : 'Bado hujasajili mwanachama yeyote chini ya akaunti yako. Tumia kitufe cha kusajili hapa chini kuanza.'}
              </p>
              <button
                onClick={() => setIsSubMemberModalOpen(true)}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs inline-flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sajili Wanachama Wapya (1 - 50)</span>
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Orodha ya Wanachama Uliowasajili ({filteredSubMembers.length})
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Bonyeza picha ya mwanachama yeyote kuikuza au kuibadilisha</p>
                </div>

                {/* View Switcher: Grid vs Table */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 self-end sm:self-auto">
                  <button
                    onClick={() => setSubMemberViewMode('grid')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      subMemberViewMode === 'grid'
                        ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kadi za Picha</span>
                  </button>
                  <button
                    onClick={() => setSubMemberViewMode('table')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      subMemberViewMode === 'table'
                        ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Jedwali (Table)</span>
                  </button>
                </div>
              </div>

              {subMemberViewMode === 'grid' ? (
                /* Grid Photo Cards View */
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSubMembers.map((subM) => {
                    return (
                      <div
                        key={subM.id}
                        className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 space-y-3 hover:border-emerald-500/50 hover:shadow-lg transition-all relative group"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Member Large Photo Card Avatar */}
                          <MemberAvatar
                            name={subM.fullName}
                            photoUrl={subM.photoUrl}
                            size="xl"
                            shape="2xl"
                            showZoomIcon
                            onClick={() => setPhotoModalMember(subM)}
                            className="ring-4 ring-emerald-500/30 group-hover:ring-emerald-500/60 shadow-md"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-extrabold text-slate-900 dark:text-white text-sm truncate block" title={subM.fullName}>
                                {subM.fullName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                                {subM.status}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 block mt-0.5">
                              {subM.memberNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                              {subM.occupation || 'Mwanachama'} • {subM.branch}
                            </span>
                          </div>
                        </div>

                        {/* Financial highlights */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">Akiba</span>
                            <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{formatTZS(subM.totalSavings)}</span>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-200 dark:border-blue-900/40">
                            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold block">Hisa</span>
                            <span className="font-extrabold text-blue-700 dark:text-blue-300">{formatTZS(subM.totalShares)}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => setPhotoModalMember(subM)}
                            className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Picha</span>
                          </button>
                          <button
                            onClick={() => setSubMemberToEdit(subM)}
                            className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold rounded-xl border border-amber-300 dark:border-amber-800/60 flex items-center justify-center gap-1 text-[11px] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Hariri</span>
                          </button>
                          <button
                            onClick={() => setSubMemberToDelete(subM)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold rounded-xl border border-rose-300 dark:border-rose-800/60 transition-colors cursor-pointer"
                            title="Futa Mwanachama"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View */
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="p-3">#</th>
                        <th className="p-3">Mwanachama</th>
                        <th className="p-3">Namba ya Uanachama</th>
                        <th className="p-3">Tawi / Eneo</th>
                        <th className="p-3">Simu & NIDA</th>
                        <th className="p-3 text-right">Akiba</th>
                        <th className="p-3 text-right">Hisa</th>
                        <th className="p-3 text-center">Hali</th>
                        <th className="p-3 text-center">Hatua (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredSubMembers.map((subM, idx) => (
                        <tr key={subM.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-bold text-slate-400 text-[10px]">{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <MemberAvatar
                                name={subM.fullName}
                                photoUrl={subM.photoUrl}
                                size="sm"
                                shape="xl"
                                showZoomIcon
                                onClick={() => setPhotoModalMember(subM)}
                              />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">{subM.fullName}</span>
                                <span className="text-[10px] text-slate-400">{subM.occupation || 'Mwanachama'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {subM.memberNumber}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                            {subM.branch}
                          </td>
                          <td className="p-3 text-slate-500 text-[11px]">
                            <div>{subM.phone}</div>
                            <div className="text-[9px] text-slate-400">NIDA: {subM.idNumber}</div>
                          </td>
                          <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatTZS(subM.totalSavings)}
                          </td>
                          <td className="p-3 text-right font-extrabold text-blue-600 dark:text-blue-400">
                            {formatTZS(subM.totalShares)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              {subM.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setPhotoModalMember(subM)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl border border-emerald-300 dark:border-emerald-800/60 inline-flex items-center gap-1 text-[11px] transition-colors"
                                title="Angalia Picha za Mwanachama"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Picha</span>
                              </button>
                              <button
                                onClick={() => setSubMemberToEdit(subM)}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold rounded-xl border border-amber-300 dark:border-amber-800/60 inline-flex items-center gap-1 text-[11px] transition-colors shadow-2xs"
                                title="Badilisha Taarifa za Mwanachama huyu"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Badilisha</span>
                              </button>
                              <button
                                onClick={() => setSubMemberToDelete(subM)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold rounded-xl border border-rose-300 dark:border-rose-800/60 inline-flex items-center gap-1 text-[11px] transition-colors shadow-2xs"
                                title="Futa Mwanachama huyu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Futa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <MemberIntelligenceAnalytics />
      )}

      {/* Settlement Reports Tab */}
      {activeTab === 'settlement' && (
        <MemberSettlementReports />
      )}

      {/* Loan Application Wizard */}
      {activeTab === 'apply_loan' && (
        <MemberLoanRequestModule />
      )}

      {/* Deposit & Repay Simulator Tab */}
      {activeTab === 'deposit' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border max-w-xl mx-auto space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Weka Akiba au Lipa Mkopo via Mobile Money / GePG
          </h3>

          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <label className="font-semibold block mb-1">Kituo cha Malipo (Payment Channel)</label>
              <select
                value={depositChannel}
                onChange={(e) => setDepositChannel(e.target.value as any)}
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600"
              >
                <option value="M-Pesa">Vodacom M-Pesa</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Mixx by Yas">Mixx by Yas (Tigo Pesa)</option>
                <option value="HaloPesa">HaloPesa</option>
                <option value="Bank Transfer">Benki (CRDB, PBZ, NMB, NBC)</option>
                <option value="GePG">GePG Control Number</option>
                <option value="Visa">Visa Card</option>
                <option value="Mastercard">Mastercard</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Kiasi (TZS)</label>
              <input
                type="number"
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600 text-base"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md"
            >
              Lipa Sasa (Simulate Payment)
            </button>
          </form>
        </div>
      )}

      {/* Member History & Passbook Tab */}
      {activeTab === 'history_passbook' && (
        <MemberPaymentHistoryAndPassbook />
      )}

      {/* AGM Voting Tab */}
      {activeTab === 'voting' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Vote className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Kura kwenye Mkutano Mkuu (AGM Voting)</h3>
              <p className="text-slate-500 text-xs">Pigia kura viongozi na maazimio ya SACCOS.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-3">
            <span className="font-bold block text-sm">Azimio #1: Kuongeza gawio la mwaka hadi 15%</span>
            <div className="flex gap-3">
              <button
                onClick={() => setVoted(true)}
                disabled={voted}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl"
              >
                {voted ? 'Umeshapiga Kura (Ndio)' : 'Ndio (Ndiyo)'}
              </button>
              <button
                onClick={() => setVoted(true)}
                disabled={voted}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl"
              >
                {voted ? 'Umeshapiga Kura' : 'Hapana'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Action Button */}
      <button
        onClick={() => openQuickAction('deposit')}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400/40 transition-transform hover:scale-110 active:scale-95"
      >
        <Sparkles className="w-5 h-5 animate-bounce" />
        <span className="font-bold text-xs pr-1">Quick Action</span>
      </button>

      {/* Quick Action Modal Component */}
      <MemberQuickActionModal
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        initialTab={quickModalInitialTab}
      />

      {/* Digital Receipt Modal */}
      <ReceiptModal transaction={receiptTx} onClose={() => setReceiptTx(null)} />

      {/* Edit Profile Modal for Current Member */}
      <MemberEditProfileModal
        member={currentMember}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Badilisha Picha na Jina Lako (Edit Profile)"
      />

      {/* Edit Profile Modal for Selected Sub-Member */}
      {subMemberToEdit && (
        <MemberEditProfileModal
          member={subMemberToEdit}
          isOpen={!!subMemberToEdit}
          onClose={() => setSubMemberToEdit(null)}
          title={`Badilisha Taarifa za ${subMemberToEdit.fullName}`}
        />
      )}

      {/* Delete Confirmation Modal for Sub-Member */}
      {subMemberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Futa Mwanachama?</h3>
                <p className="text-xs text-slate-500">Hatua hii hairejesheki.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Je, una uhakika unataka kumfuta mwanachama <strong className="text-slate-900 dark:text-white font-bold">{subMemberToDelete.fullName}</strong> ({subMemberToDelete.memberNumber})? Taarifa zote za akaunti na usajili zitaondolewa.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubMemberToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Ghairi (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMember(subMemberToDelete.id);
                  alert(`Mwanachama ${subMemberToDelete.fullName} amefutwa kikamilifu.`);
                  setSubMemberToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
              >
                Ndio, Futa Mwanachama
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Member / Dependent Bulk Registration Modal */}
      {isSubMemberModalOpen && (
        <div id="submember-registration-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <BulkRegistrationForm
            onClose={() => setIsSubMemberModalOpen(false)}
            onSuccess={() => setIsSubMemberModalOpen(false)}
          />
        </div>
      )}

      {/* Member HD Photo Viewer / Lightbox Modal */}
      {photoModalMember && (
        <MemberPhotoModal
          member={photoModalMember}
          isOpen={!!photoModalMember}
          onClose={() => setPhotoModalMember(null)}
          onOpenEditModal={(m) => setSubMemberToEdit(m)}
        />
      )}

      {/* Live Camera Capture Modal for Member Dashboard */}
      {currentMember && (
        <CameraCaptureModal
          isOpen={isDashboardCameraOpen}
          onClose={() => setIsDashboardCameraOpen(false)}
          onCapture={handleCameraCaptureSuccess}
          title={`Piga Picha ya Wasifu: ${currentMember.fullName.split(' ')[0]}`}
          subtitle="Picha itahifadhiwa mara moja kwenye dashibodi na kitambulisho chako cha uanachama."
        />
      )}

    </div>
  );
};
