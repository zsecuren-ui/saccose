import React, { useState } from 'react';
import JSZip from 'jszip';
import { useApp } from '../../context/AppContext';
import { AggregatedGrowthWidget } from './AggregatedGrowthWidget';
import { ReportsModule } from '../tenant/ReportsModule';
import { PaymentGatewaysModule } from '../tenant/PaymentGatewaysModule';
import { CommunicationsHubModule } from '../tenant/CommunicationsHubModule';
import { SuperAdminAdManager } from './SuperAdminAdManager';
import { SuperAdminDailyAuditReports } from './SuperAdminDailyAuditReports';
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  Search,
  Plus,
  Power,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  BarChart3,
  Trash2,
  Edit3,
  Zap,
  MessageSquare,
  Megaphone,
  HardDrive,
  KeyRound,
  Download,
  Database,
  Sparkles
} from 'lucide-react';
import { Institution } from '../../types';
import { AdminInstitutionCreator } from './AdminInstitutionCreator';

export const SuperAdminDashboard: React.FC = () => {
  const {
    t,
    institutions,
    members,
    transactions,
    subscriptionPlans,
    toggleInstitutionStatus,
    addInstitution,
    deleteInstitution,
    updateInstitution,
    updateInstitutionCredentials,
    auditLogs,
    formatTZS,
    setCurrentInstitutionId,
    setActiveRole
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tenants' | 'plans' | 'billing' | 'audit' | 'cronAudit' | 'reports' | 'payments' | 'communications' | 'ads'>('tenants');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminCreateModal, setShowAdminCreateModal] = useState(false);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [deletingInst, setDeletingInst] = useState<Institution | null>(null);
  const [credInst, setCredInst] = useState<Institution | null>(null);
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);

  // One-click manual database zip backup export
  const handleExportDatabaseZip = async () => {
    setIsExportingBackup(true);
    try {
      const zip = new JSZip();
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');

      const systemInfo = {
        platform: "ISACCOS Financial Management Platform",
        exportDate: new Date().toISOString(),
        version: "v2.5.0-production",
        totalInstitutions: institutions.length,
        totalMembers: members.length,
        totalTransactions: transactions.length,
        totalAuditLogs: auditLogs.length,
        exportedBy: "SuperAdmin"
      };

      zip.file('system_info.json', JSON.stringify(systemInfo, null, 2));
      zip.file('institutions.json', JSON.stringify(institutions, null, 2));
      zip.file('members_and_users.json', JSON.stringify(members, null, 2));
      zip.file('financial_transactions.json', JSON.stringify(transactions, null, 2));
      zip.file('system_audit_logs.json', JSON.stringify(auditLogs, null, 2));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ISACCOS_Full_Database_Backup_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setBackupSuccess(`Faili la Backup ya Zip limepakuliwa kikamilifu! (ISACCOS_Full_Database_Backup_${dateStr}.zip)`);
      setTimeout(() => setBackupSuccess(null), 6000);
    } catch (err) {
      console.error('Backup export failed:', err);
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Edit Tenant Form State
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<Institution['type']>('SACCOS');
  const [editStatus, setEditStatus] = useState<Institution['status']>('Active');
  const [editRegion, setEditRegion] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCustomPriceMonthly, setEditCustomPriceMonthly] = useState<number>(50000);

  // New Tenant State
  const [name, setName] = useState('');
  const [type, setType] = useState<'SACCOS' | 'VICOBA' | 'AMCOS'>('SACCOS');
  const [regNo, setRegNo] = useState('');
  const [planId, setPlanId] = useState('plan_standard');
  const [customPriceMonthly, setCustomPriceMonthly] = useState<number>(50000);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('Dar es Salaam');

  // Calculated Stats
  const activeCount = institutions.filter(i => i.status === 'Active').length;
  const suspendedCount = institutions.filter(i => i.status === 'Suspended').length;
  const totalMembers = institutions.reduce((acc, curr) => acc + curr.memberCount, 0);

  // Estimate SaaS monthly revenue (includes custom agreed monthly prices)
  const totalMonthlyRevenue = institutions.reduce((acc, inst) => {
    if (inst.customPriceMonthly !== undefined && inst.customPriceMonthly > 0) {
      return acc + inst.customPriceMonthly;
    }
    const plan = subscriptionPlans.find(p => p.id === inst.planId);
    return acc + (plan?.priceMonthly || 0);
  }, 0);

  const filteredInstitutions = institutions.filter(
    i =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlanSelectChange = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
    if (selectedPlan) {
      // Auto pre-fill customPriceMonthly with selected plan price if valid
      const defaultFee = selectedPlan.priceMonthly || 50000;
      setCustomPriceMonthly(Math.min(1000000, Math.max(20000, defaultFee)));
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const agreedAmount = Number(customPriceMonthly);
    if (agreedAmount < 20000 || agreedAmount > 1000000) {
      alert('Tafadhali ingiza kiasi cha ada iliyokubaliwa kuanzia TZS 20,000 hadi TZS 1,000,000 (1 Million TZS).');
      return;
    }

    const plan = subscriptionPlans.find(p => p.id === planId);

    addInstitution({
      name,
      type,
      registrationNumber: regNo || `REG/${Date.now().toString().slice(-6)}`,
      logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&auto=format&fit=crop&q=80',
      primaryColor: '#0d9488',
      domain: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.saccos.tz`,
      planId,
      planName: plan?.name || 'Custom Plan',
      customPriceMonthly: agreedAmount,
      memberCount: 0,
      maxMembers: plan?.maxMembers || 1000,
      userCount: 1,
      phone: phone || '+255 700 000 000',
      email: email || 'info@taasisi.co.tz',
      region,
      currency: 'TZS'
    });

    setName('');
    setCustomPriceMonthly(50000);
    setShowAddModal(false);
  };

  return (
    <div id="superadmin-dashboard" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-xs">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t('saOverview')}</h1>
          </div>
          <p className="text-slate-300 text-xs">
            Usimamizi mkuu wa Mfumo wa Multi-Tenant SaaS (Super Administrator Control Panel)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleExportDatabaseZip}
            disabled={isExportingBackup}
            className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs transition-colors shrink-0 cursor-pointer"
            title="Pakua Nakala Kamili ya Database katika Faili la ZIP (One-Click Backup)"
          >
            <Database className="w-4 h-4 text-emerald-200" />
            <span>{isExportingBackup ? 'Inatengeneza Zip...' : 'Pakua Database Backup (.ZIP)'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('registerTenant')}</span>
          </button>
          <button
            onClick={() => setShowAdminCreateModal(true)}
            title="Create Institution via Admin API (invite admin)"
            className="w-full sm:w-auto px-4 py-3 bg-indigo-700 hover:bg-indigo-600 text-white font-medium rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs transition-colors shrink-0 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Create (Admin)</span>
          </button>
        </div>
      </div>

      {/* Backup Notification Alert */}
      {backupSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-200 font-bold flex items-center justify-between gap-3 text-xs shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{backupSuccess}</span>
          </div>
          <button
            onClick={() => setBackupSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t('totalTenants')}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{institutions.length}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              {activeCount} Hai • {suspendedCount} Zilizositishwa
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t('totalPlatformMembers')}</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{totalMembers.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Wanachama kwenye Taasisi zote</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t('saRevenue')}</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatTZS(totalMonthlyRevenue)}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Ada za Mwezi za SaaS</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t('systemStatus')}</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 100% Operational
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Cloud Run & Database OK</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Aggregated Platform Savings and Loan Growth Analytics */}
      <AggregatedGrowthWidget />

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 flex gap-4 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tenants'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Taasisi Zilizosajiliwa ({institutions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'plans'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Vifurushi vya SaaS ({subscriptionPlans.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Kumbukumbu za Audit Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('cronAudit')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'cronAudit'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4 text-indigo-500" />
          <span>24H Audit Reports & AI Data Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-500" />
          <span>Ripoti za Mfumo (100+ Reports Hub)</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Mfumo wa Malipo (Gateways)</span>
        </button>
        <button
          onClick={() => setActiveTab('communications')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'communications'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span>Mawasiliano (SMS/WSP)</span>
        </button>
        <button
          onClick={() => setActiveTab('ads')}
          className={`pb-3 border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ads'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>Matangazo ya Umma (Ads Manager)</span>
        </button>
      </div>

      {/* Tab 1: Tenants List */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tafuta taasisi kwa jina au mkoa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            {/* Desktop / Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="p-4">Jina la Taasisi</th>
                    <th className="p-4">Aina & Reg No</th>
                    <th className="p-4">Mkoa</th>
                    <th className="p-4">Kifurushi (Plan)</th>
                    <th className="p-4">Wanachama</th>
                    <th className="p-4">Hali</th>
                    <th className="p-4 text-right">Vitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredInstitutions.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <img
                          src={inst.logo}
                          alt={inst.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name)}&background=0d9488&color=fff`;
                          }}
                          className="w-8 h-8 rounded-lg object-cover border"
                        />
                        <div>
                          <span>{inst.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{inst.domain}</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-semibold text-[10px]">
                          {inst.type}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{inst.registrationNumber}</span>
                      </td>
                      <td className="p-4">{inst.region}</td>
                      <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        <div>{inst.planName}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatTZS(inst.customPriceMonthly || subscriptionPlans.find(p => p.id === inst.planId)?.priceMonthly || 0)}/mwezi
                        </div>
                      </td>
                      <td className="p-4 font-bold">
                        {inst.memberCount} / {inst.maxMembers}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            inst.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                          }`}
                        >
                          {inst.status === 'Active' ? 'Hai' : 'Isiyo Hai'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5 flex items-center justify-end">
                        <button
                          onClick={() => {
                            setCurrentInstitutionId(inst.id);
                            setActiveRole('tenantadmin');
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg transition-colors text-[11px]"
                        >
                          Ingia Portal
                        </button>
                        <button
                          onClick={() => {
                            setCredInst(inst);
                            setCredUsername(inst.adminUsername || `admin_${inst.domain.split('.')[0]}`);
                            setCredPassword(inst.adminPassword || 'Password123!');
                          }}
                          className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300"
                          title="Weka / Badilisha Username na Password ya Admin wa Taasisi"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingInst(inst);
                            setEditName(inst.name);
                            setEditType(inst.type);
                            setEditStatus(inst.status);
                            setEditRegion(inst.region);
                            setEditPhone(inst.phone);
                            setEditCustomPriceMonthly(inst.customPriceMonthly || subscriptionPlans.find(p => p.id === inst.planId)?.priceMonthly || 50000);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                          title="Badilisha Taarifa / Adhibu Taasisi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleInstitutionStatus(inst.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            inst.status === 'Active'
                              ? 'text-amber-600 hover:bg-amber-50 border-amber-200 dark:border-amber-900/50'
                              : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-900/50'
                          }`}
                          title={inst.status === 'Active' ? 'Simamisha Taasisi (Suspend)' : 'Fungulia Taasisi (Activate)'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingInst(inst)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400"
                          title="Futa Taasisi Hii (Ukiukaji wa Sheria)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< sm) */}
            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredInstitutions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs font-semibold">
                  Hakuna taasisi iliyopatikana.
                </div>
              ) : (
                filteredInstitutions.map((inst) => (
                  <div key={inst.id} className="p-4 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={inst.logo}
                          alt={inst.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name)}&background=0d9488&color=fff`;
                          }}
                          className="w-9 h-9 rounded-xl object-cover border"
                        />
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{inst.name}</h4>
                          <span className="text-[10px] text-slate-400 block">{inst.domain}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inst.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                      }`}>
                        {inst.status === 'Active' ? 'Hai' : 'Isiyo Hai'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Aina & Reg:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{inst.type} ({inst.registrationNumber})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Mkoa:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{inst.region}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Kifurushi (Plan):</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{inst.planName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Wanachama:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{inst.memberCount} / {inst.maxMembers}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1">
                      <button
                        onClick={() => {
                          setCurrentInstitutionId(inst.id);
                          setActiveRole('tenantadmin');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[11px] transition-colors"
                      >
                        Ingia Portal
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setCredInst(inst);
                            setCredUsername(inst.adminUsername || `admin_${inst.domain.split('.')[0]}`);
                            setCredPassword(inst.adminPassword || 'Password123!');
                          }}
                          className="p-1.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                          title="Credentials"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingInst(inst);
                            setEditName(inst.name);
                            setEditType(inst.type);
                            setEditStatus(inst.status);
                            setEditRegion(inst.region);
                            setEditPhone(inst.phone);
                          }}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                          title="Badilisha Taarifa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleInstitutionStatus(inst.id)}
                          className={`p-1.5 rounded-xl border ${
                            inst.status === 'Active'
                              ? 'text-amber-600 bg-amber-50 border-amber-200'
                              : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                          }`}
                          title="Badilisha Hali"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingInst(inst)}
                          className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                          title="Futa Taasisi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscription Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {subscriptionPlans.map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{plan.name}</h3>
              <p className="text-slate-500 text-xs">{plan.description}</p>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatTZS(plan.priceMonthly)} / mwezi
              </div>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Kumbukumbu za Usalama (Global Audit Logs)</h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                  <span className="text-slate-500 block text-[11px]">{log.details}</span>
                  <span className="text-[10px] text-indigo-500">Taasisi: {log.tenantName} • IP: {log.ipAddress}</span>
                </div>
                <span className="text-[10px] text-slate-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3.5: 24H Cron Audit Reports & AI Analytics */}
      {activeTab === 'cronAudit' && (
        <SuperAdminDailyAuditReports />
      )}

      {/* Tab 4: 100+ Reports Hub */}
      {activeTab === 'reports' && (
        <ReportsModule />
      )}

      {/* Tab 5: Payment Gateways */}
      {activeTab === 'payments' && (
        <PaymentGatewaysModule />
      )}

      {/* Tab 6: Communications Hub */}
      {activeTab === 'communications' && (
        <CommunicationsHubModule />
      )}

      {/* Tab 7: Global Ad Manager */}
      {activeTab === 'ads' && (
        <SuperAdminAdManager />
      )}

      {/* Register New Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Sajili Taasisi Mpya (New Tenant)</h3>
            
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Jina la Taasisi</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Mbagala SACCOS Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Aina</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="SACCOS">SACCOS</option>
                    <option value="VICOBA">VICOBA</option>
                    <option value="AMCOS">AMCOS</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Mkoa</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Chagua Kifurushi (Subscription Plan)</label>
                <select
                  value={planId}
                  onChange={(e) => handlePlanSelectChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-indigo-600"
                >
                  {subscriptionPlans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatTZS(p.priceMonthly)}/mwezi)
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Agreed Price Field (20,000 Tsh - 1,000,000 Tsh) */}
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                    Ada ya Mwezi Iliyokubaliwa na SuperAdmin (TZS)
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                    20,000 - 1,000,000 TZS
                  </span>
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">TZS</span>
                  <input
                    type="number"
                    min={20000}
                    max={1000000}
                    step={5000}
                    required
                    value={customPriceMonthly}
                    onChange={(e) => setCustomPriceMonthly(Number(e.target.value))}
                    className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 font-black text-indigo-700 dark:text-indigo-300 text-sm"
                  />
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  SuperAdmin anaweza kuingiza kiasi walichokubaliana na taasisi iliyosajiliwa (kuanzia TZS 20,000 mpaka 1,000,000/mwezi).
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[20000, 50000, 100000, 250000, 500000, 1000000].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setCustomPriceMonthly(amt)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        customPriceMonthly === amt
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {formatTZS(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
                  Hifadhi Taasisi
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="py-2.5 px-4 bg-slate-200 dark:bg-slate-700 rounded-xl">
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Sanction Institution Modal */}
      {editingInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Badilisha Taarifa au Adhibu Taasisi</h3>
                <p className="text-[11px] text-slate-500">{editingInst.name} ({editingInst.registrationNumber})</p>
              </div>
              <button onClick={() => setEditingInst(null)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500">✕</button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const priceNum = Number(editCustomPriceMonthly);
              if (priceNum < 20000 || priceNum > 1000000) {
                alert('Tafadhali ingiza kiasi cha ada iliyokubaliwa kuanzia TZS 20,000 hadi TZS 1,000,000.');
                return;
              }
              updateInstitution(editingInst.id, {
                name: editName,
                type: editType,
                status: editStatus,
                region: editRegion,
                phone: editPhone,
                customPriceMonthly: priceNum
              });
              alert(`Taarifa za taasisi ya ${editName} zimebadilishwa kikamilifu!`);
              setEditingInst(null);
            }} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-xs">Jina la Taasisi</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-xs">Aina ya Taasisi</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="SACCOS">SACCOS</option>
                    <option value="VICOBA">VICOBA</option>
                    <option value="AMCOS">AMCOS</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-xs">Hali ya Taasisi (Status)</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-indigo-600"
                  >
                    <option value="Active">Hai (Active)</option>
                    <option value="Suspended">Imesimamishwa (Suspended - Ukiukaji)</option>
                    <option value="Pending">Inasubiri Uhakiki (Pending)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-xs">Mkoa / Eneo</label>
                  <input
                    type="text"
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-xs">Namba ya Simu</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-xs">Ada ya Mwezi Iliyokubaliwa (20,000 - 1,000,000 TZS)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">TZS</span>
                  <input
                    type="number"
                    min={20000}
                    max={1000000}
                    step={5000}
                    required
                    value={editCustomPriceMonthly}
                    onChange={(e) => setEditCustomPriceMonthly(Number(e.target.value))}
                    className="w-full pl-12 pr-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
                <strong>Kumbuka:</strong> Kubadilisha status kuwa "Suspended" kunazuia ufikiaji wa watumiaji na wanachama wa taasisi hii mara moja.
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs">
                  Hifadhi Mabadiliko
                </button>
                <button type="button" onClick={() => setEditingInst(null)} className="py-2.5 px-4 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl text-xs">
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Institution Modal */}
      {deletingInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/80 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Thibitisha Kufuta Taasisi</h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">ONYO LA SUPER ADMIN</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Je, una uhakika unataka KUFUTA KABISA taasisi ya <strong className="text-slate-900 dark:text-white">{deletingInst.name}</strong> (Reg No: {deletingInst.registrationNumber})?
            </p>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-bold">⚠️ Taarifa zitakazofutwa:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>Akaunti yote ya taasisi na viongozi wake</li>
                <li>Wanachama wote, amana na mikopo ya taasisi hii</li>
                <li>Miamala yote na ripoti za kifedha</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  deleteInstitution(deletingInst.id);
                  setNotification(`Taasisi ya ${deletingInst.name} imefutwa kikamilifu kwenye mfumo.`);
                  setDeletingInst(null);
                  setTimeout(() => setNotification(null), 4000);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-transform"
              >
                Ndio, Futa Kabisa
              </button>
              <button
                type="button"
                onClick={() => setDeletingInst(null)}
                className="py-3 px-5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
              >
                Ghairi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create Institution Modal (server-side flow) */}
      {showAdminCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-2xl w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Create Institution (Admin API)</h3>
              <button onClick={() => setShowAdminCreateModal(false)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500">✕</button>
            </div>
            <AdminInstitutionCreator onClose={() => setShowAdminCreateModal(false)} />
          </div>
        </div>
      )}

      {/* Credential Management Modal */}
      {credInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Credentials za Admin wa Taasisi</h3>
                  <p className="text-[11px] text-slate-500">{credInst.name}</p>
                </div>
              </div>
              <button onClick={() => setCredInst(null)} className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500">✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateInstitutionCredentials(credInst.id, credUsername, credPassword);
              setNotification(`Username na Password ya Admin wa ${credInst.name} zimesasishwa!`);
              setCredInst(null);
              setTimeout(() => setNotification(null), 4000);
            }} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                  Username ya Admin wa Taasisi:
                </label>
                <input
                  type="text"
                  required
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-xs text-slate-700 dark:text-slate-300">
                  Neno la Siri (Password):
                </label>
                <input
                  type="text"
                  required
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
                SuperAdmin ana uwezo wa kuweka credentials za kuingia kwa ajili ya uongozi wa SACCOS au VICOBA hii.
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs">
                  Hifadhi Credentials
                </button>
                <button type="button" onClick={() => setCredInst(null)} className="py-2.5 px-4 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl text-xs">
                  Ghairi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-emerald-600 dark:text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-white shrink-0" />
          <span>{notification}</span>
        </div>
      )}

    </div>
  );
};
