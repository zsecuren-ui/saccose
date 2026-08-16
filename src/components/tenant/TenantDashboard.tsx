import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MemberManagement } from './MemberManagement';
import { LoanManagement } from './LoanManagement';
import { SavingsAndShares } from './SavingsAndShares';
import { AccountingModule } from './AccountingModule';
import { TreasuryModule } from './TreasuryModule';
import { ReportsModule } from './ReportsModule';
import { BusinessIntelligence } from './BusinessIntelligence';
import { BrandingSettings } from './BrandingSettings';
import { FinesManagement } from './FinesManagement';
import { PaymentGatewaysModule } from './PaymentGatewaysModule';
import { CommunicationsHubModule } from './CommunicationsHubModule';
import { SubscriptionManagementModule } from './SubscriptionManagementModule';
import { PaymentReceiptVerificationModule } from './PaymentReceiptVerificationModule';
import { ProjectsModule } from './ProjectsModule';
import { TargetProgressWidget } from './TargetProgressWidget';
import { MemberGrowthTrendsWidget } from './MemberGrowthTrendsWidget';
import { MemberGrowthAndSavingsVisualization } from './MemberGrowthAndSavingsVisualization';
import { TenantGlobalHeader } from './TenantGlobalHeader';
import { PredictiveSavingsForecast } from '../common/PredictiveSavingsForecast';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PiggyBank,
  BookOpen,
  Wallet,
  Landmark,
  FileText,
  BarChart3,
  Palette,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  MessageSquare,
  Layers,
  FileCheck2,
  Sparkles,
  Briefcase,
  Building2
} from 'lucide-react';

export const TenantDashboard: React.FC = () => {
  const { currentInstitution, members, loans, savingsAccounts, projects, formatTZS, setActiveRole, setCurrentMemberId } = useApp();

  const [activeTab, setActiveTab] = useState<string>('overview');

  const tenantMembers = members.filter(m => m.tenantId === currentInstitution.id);
  const tenantLoans = loans.filter(l => l.tenantId === currentInstitution.id);
  const tenantSavings = savingsAccounts.filter(s => s.tenantId === currentInstitution.id);

  const totalOutstandingLoan = tenantLoans
    .filter(l => l.status === 'Active')
    .reduce((a, b) => a + b.remainingBalance, 0);

  const totalRepaidLoan = tenantLoans
    .reduce((a, b) => a + (b.totalPaid || 0), 0);

  const totalSavings = tenantSavings.reduce((a, b) => a + b.totalSavings, 0);

  return (
    <div id="tenant-dashboard-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-xs">
      
      {/* Global Header with Search Bar, Notifications, and Branding */}
      <TenantGlobalHeader onNavigateTab={(tabId) => setActiveTab(tabId)} />

      {/* Navigation Sub-Menu Bar */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-1 overflow-x-auto text-xs font-semibold shadow-xs">
        {[
          { id: 'overview', label: 'Muhtasari', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'visualizations', label: 'Grafu & Uchambuzi (5,000)', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
          { id: 'projects', label: 'Miradi & Uwekezaji', icon: <Briefcase className="w-4 h-4 text-emerald-500" /> },
          { id: 'members', label: 'Wanachama', icon: <Users className="w-4 h-4" /> },
          { id: 'loans', label: 'Mikopo', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'savings', label: 'Akiba na Hisa', icon: <PiggyBank className="w-4 h-4" /> },
          { id: 'receipts', label: 'Uhakiki wa Risiti', icon: <FileCheck2 className="w-4 h-4" /> },
          { id: 'payments', label: 'Mfumo wa Malipo', icon: <Zap className="w-4 h-4" /> },
          { id: 'communications', label: 'Mawasiliano', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'fines', label: 'Faini & Nidhamu', icon: <ShieldAlert className="w-4 h-4" /> },
          { id: 'accounting', label: 'Uhasibu', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'treasury', label: 'Bank', icon: <Landmark className="w-4 h-4" /> },
          { id: 'reports', label: 'Ripoti (100+)', icon: <FileText className="w-4 h-4" /> },
          { id: 'bi', label: 'Uchambuzi (BI)', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'forecast', label: 'Utabiri wa Akiba (AI Forecast)', icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
          { id: 'subscriptions', label: 'Vifurushi vya Mfumo', icon: <Layers className="w-4 h-4" /> },
          { id: 'branding', label: 'Wasifu & Picha ya Taasisi', icon: <Building2 className="w-4 h-4 text-emerald-400" /> }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Wanachama Hai</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{tenantMembers.length}</span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">+12% mwezi huu</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => setActiveTab('projects')}>
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold">Miradi & Uwekezaji wa Taasisi</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {projects.filter(p => p.tenantId === currentInstitution.id).length} Miradi
                </span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Bonyeza kutazama na kusajili
                </span>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 rounded-2xl shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Akiba Zote za Wanachama</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{formatTZS(totalSavings)}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Akiba za Lazima & Hiari</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Deni la Mikopo Unaoendelea</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{formatTZS(totalOutstandingLoan)}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Portfolio Aging OK</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Riba ya Mwaka (Earnings)</span>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{formatTZS(58000000)}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Interest Income</span>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Data Visualization Section: Member Growth Trends & Savings Distribution across 5,000 Capacity */}
          <MemberGrowthAndSavingsVisualization />

          {/* Member Growth & Activity Trends Widget */}
          <MemberGrowthTrendsWidget />

          {/* Target Progress Widget */}
          <TargetProgressWidget compact={false} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Members */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Wanachama Waliyosajiliwa Hivi Karibuni</h3>
                <button onClick={() => setActiveTab('members')} className="text-emerald-600 font-semibold text-[11px]">
                  Tazama Wote →
                </button>
              </div>
              <div className="space-y-2">
                {tenantMembers.slice(0, 3).map(m => (
                  <div key={m.id} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div className="flex items-center gap-2">
                      <img
                        src={m.photoUrl}
                        alt={m.fullName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}&background=0d9488&color=fff`;
                        }}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">{m.fullName}</span>
                        <span className="text-[10px] text-slate-400">{m.memberNumber}</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">{formatTZS(m.totalSavings)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Loans */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mikopo Inayoendelea (Active Loans)</h3>
                <button onClick={() => setActiveTab('loans')} className="text-emerald-600 font-semibold text-[11px]">
                  Tazama Yote →
                </button>
              </div>
              <div className="space-y-2.5">
                {tenantLoans.slice(0, 3).map(l => (
                  <div key={l.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-white">{l.memberName}</span>
                        <span className="text-[10px] text-indigo-500 font-semibold">{l.loanType} ({l.durationMonths} Miezi)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block text-amber-600 dark:text-amber-400 text-xs">Baki: {formatTZS(l.remainingBalance)}</span>
                        <span className="text-[10px] text-slate-400">Mkopo: {formatTZS(l.amountApproved || l.amountRequested)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500 font-medium">Kiasi Kilichorejeshwa:</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatTZS(l.totalPaid || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visualizations' && (
        <div className="space-y-6">
          <MemberGrowthAndSavingsVisualization />
          <MemberGrowthTrendsWidget />
        </div>
      )}
      {activeTab === 'projects' && <ProjectsModule />}
      {activeTab === 'members' && <MemberManagement />}
      {activeTab === 'loans' && <LoanManagement />}
      {activeTab === 'savings' && <SavingsAndShares />}
      {activeTab === 'receipts' && <PaymentReceiptVerificationModule />}
      {activeTab === 'payments' && <PaymentGatewaysModule />}
      {activeTab === 'communications' && <CommunicationsHubModule />}
      {activeTab === 'fines' && <FinesManagement />}
      {activeTab === 'accounting' && <AccountingModule />}
      {activeTab === 'treasury' && <TreasuryModule />}
      {activeTab === 'reports' && <ReportsModule />}
      {activeTab === 'bi' && <BusinessIntelligence />}
      {activeTab === 'forecast' && <PredictiveSavingsForecast scope="institution" />}
      {activeTab === 'subscriptions' && <SubscriptionManagementModule />}
      {activeTab === 'branding' && <BrandingSettings />}

    </div>
  );
};
