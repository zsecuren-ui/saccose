import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { InstitutionProject, ProjectCategory, ProjectStatus, FinancialLogType } from '../../types';
import { TargetProgressWidget } from './TargetProgressWidget';
import { MemberAvatar } from '../common/MemberAvatar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart as RechartsPie,
  Pie,
  Cell
} from 'recharts';
import {
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  Building2,
  Sprout,
  Truck,
  Search,
  Calendar,
  MapPin,
  UserCheck,
  Trash2,
  X,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Clock,
  Coins,
  Download,
  BarChart3,
  Award,
  Sparkles,
  Activity,
  Percent
} from 'lucide-react';

export const ProjectsModule: React.FC = () => {
  const { currentInstitution, projects, addProject, deleteProject, addProjectFinancialLog, deleteProjectFinancialLog, formatTZS } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Zote');
  const [selectedStatus, setSelectedStatus] = useState<string>('Zote');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'analytics'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProjectForView, setSelectedProjectForView] = useState<InstitutionProject | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalProjectId, setLogModalProjectId] = useState<string | null>(null);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    name: '',
    category: 'Kilimo' as ProjectCategory,
    status: 'Inayojiendesha' as ProjectStatus,
    startDate: new Date().toISOString().split('T')[0],
    initialCapital: 10000000,
    currentValuation: 10000000,
    location: '',
    managerName: '',
    description: ''
  });

  // New Financial Log Form State
  const [newLog, setNewLog] = useState({
    type: 'Income' as FinancialLogType,
    category: 'Mauzo / Mapato',
    amount: 1000000,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Filter projects for current institution
  const tenantProjects = useMemo(() => {
    return projects.filter(p => p.tenantId === currentInstitution.id);
  }, [projects, currentInstitution.id]);

  const filteredProjects = useMemo(() => {
    return tenantProjects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.managerName && p.managerName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'Zote' || p.category === selectedCategory;
      const matchesStatus = selectedStatus === 'Zote' || p.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tenantProjects, searchTerm, selectedCategory, selectedStatus]);

  // Overall Financial Calculations
  const summaryMetrics = useMemo(() => {
    let totalInitialCapital = 0;
    let totalCurrentValuation = 0;
    let totalMotherGrossIncome = 0;
    let totalProjectExpenses = 0;

    tenantProjects.forEach(proj => {
      totalInitialCapital += proj.initialCapital || 0;
      totalCurrentValuation += proj.currentValuation || 0;

      proj.financialLogs?.forEach(log => {
        if (log.type === 'Income') {
          totalMotherGrossIncome += log.amount || 0;
        } else if (log.type === 'Expense') {
          totalProjectExpenses += log.amount || 0;
        } else if (log.type === 'CapitalAdd') {
          totalCurrentValuation += log.amount || 0;
        } else if (log.type === 'CapitalWithdraw') {
          totalCurrentValuation -= log.amount || 0;
        }
      });
    });

    const netIncome = totalMotherGrossIncome - totalProjectExpenses;
    const totalCurrentAssets = totalCurrentValuation + netIncome;
    const capitalGrowthAmount = totalCurrentAssets - totalInitialCapital;
    const growthPercentage = totalInitialCapital > 0 ? (capitalGrowthAmount / totalInitialCapital) * 100 : 0;

    return {
      totalProjectsCount: tenantProjects.length,
      activeProjectsCount: tenantProjects.filter(p => p.status === 'Inayojiendesha').length,
      totalInitialCapital,
      totalCurrentValuation,
      totalMotherGrossIncome,
      totalProjectExpenses,
      netIncome,
      totalCurrentAssets,
      capitalGrowthAmount,
      growthPercentage
    };
  }, [tenantProjects]);

  // Individual project calculations
  const calculateProjectFinancials = (p: InstitutionProject) => {
    let grossIncome = 0;
    let totalExpenses = 0;
    let capitalAdjustments = 0;

    p.financialLogs?.forEach(log => {
      if (log.type === 'Income') grossIncome += log.amount || 0;
      if (log.type === 'Expense') totalExpenses += log.amount || 0;
      if (log.type === 'CapitalAdd') capitalAdjustments += log.amount || 0;
      if (log.type === 'CapitalWithdraw') capitalAdjustments -= log.amount || 0;
    });

    const netProfit = grossIncome - totalExpenses;
    const effectiveCapital = p.initialCapital + capitalAdjustments;
    const currentValuationWithProfit = p.currentValuation + netProfit;
    const growth = currentValuationWithProfit - p.initialCapital;
    const roiPercentage = p.initialCapital > 0 ? (growth / p.initialCapital) * 100 : 0;

    return {
      grossIncome,
      totalExpenses,
      netProfit,
      effectiveCapital,
      currentValuationWithProfit,
      growth,
      roiPercentage
    };
  };

  // Performance scoring & badges
  const getPerformanceMetrics = (p: InstitutionProject) => {
    const fin = calculateProjectFinancials(p);
    const roi = fin.roiPercentage;
    const margin = fin.grossIncome > 0 ? (fin.netProfit / fin.grossIncome) * 100 : 0;

    let score = 50;
    if (roi > 0) score += Math.min(30, roi * 0.5);
    else score -= Math.min(30, Math.abs(roi) * 0.5);

    if (margin > 0) score += Math.min(20, margin * 0.3);
    else score -= Math.min(20, Math.abs(margin) * 0.3);

    score = Math.max(10, Math.min(99, Math.round(score)));

    let badge = { label: 'Wastani', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
    if (score >= 80) {
      badge = { label: 'Top Performer (Kipato cha Juu)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    } else if (score >= 65) {
      badge = { label: 'Ukuaji wa Kasi', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' };
    } else if (score < 40) {
      badge = { label: 'Inahitaji Usimamizi', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    }

    return { roi, margin, score, badge };
  };

  // Chart Data for Recharts comparison
  const chartData = useMemo(() => {
    return filteredProjects.map((p) => {
      const fin = calculateProjectFinancials(p);
      return {
        id: p.id,
        name: p.name,
        shortName: p.name.length > 14 ? p.name.substring(0, 14) + '...' : p.name,
        category: p.category,
        TotalIncome: fin.grossIncome,
        NetIncome: fin.netProfit,
        Expenses: fin.totalExpenses,
        InitialCapital: p.initialCapital,
        CurrentValuation: p.currentValuation
      };
    });
  }, [filteredProjects]);

  // Category Distribution Pie Chart Data
  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
    tenantProjects.forEach(p => {
      map[p.category] = (map[p.category] || 0) + p.currentValuation;
    });
    return Object.keys(map).map(cat => ({
      name: cat,
      value: map[cat]
    }));
  }, [tenantProjects]);

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

  // CSV Export functions
  const exportAllProjectsCSV = () => {
    if (tenantProjects.length === 0) return;

    const headers = [
      'Jina la Mradi',
      'Aina ya Mradi',
      'Hali',
      'Tarehe ya Kuanza',
      'Mtaji wa Mwanzo (TZS)',
      'Mtaji wa Sasa (TZS)',
      'Mapato Kamili / Total Income (TZS)',
      'Gharama Zote (TZS)',
      'Faida Halisi / Net Income (TZS)',
      'ROI (%)',
      'Profit Margin (%)',
      'Performance Score',
      'Msimamizi',
      'Mahali'
    ];

    const rows = tenantProjects.map(p => {
      const fin = calculateProjectFinancials(p);
      const perf = getPerformanceMetrics(p);
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.status}"`,
        `"${p.startDate}"`,
        p.initialCapital,
        p.currentValuation,
        fin.grossIncome,
        fin.totalExpenses,
        fin.netProfit,
        perf.roi.toFixed(2),
        perf.margin.toFixed(2),
        perf.score,
        `"${(p.managerName || '').replace(/"/g, '""')}"`,
        `"${(p.location || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ripoti_ya_Miradi_${currentInstitution.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSingleProjectLogCSV = (proj: InstitutionProject) => {
    if (!proj.financialLogs || proj.financialLogs.length === 0) return;

    const headers = ['Tarehe', 'Aina ya Muamala', 'Kipengele', 'Maelezo', 'Kiasi (TZS)'];
    const rows = proj.financialLogs.map(l => [
      `"${l.date}"`,
      `"${l.type}"`,
      `"${l.category.replace(/"/g, '""')}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
      l.amount
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Miamala_${proj.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    addProject({
      tenantId: currentInstitution.id,
      name: newProject.name.trim(),
      category: newProject.category,
      status: newProject.status,
      startDate: newProject.startDate,
      initialCapital: Number(newProject.initialCapital) || 0,
      currentValuation: Number(newProject.currentValuation) || Number(newProject.initialCapital) || 0,
      location: newProject.location.trim(),
      managerName: newProject.managerName.trim(),
      description: newProject.description.trim()
    });

    setNewProject({
      name: '',
      category: 'Kilimo',
      status: 'Inayojiendesha',
      startDate: new Date().toISOString().split('T')[0],
      initialCapital: 10000000,
      currentValuation: 10000000,
      location: '',
      managerName: '',
      description: ''
    });

    setIsAddModalOpen(false);
  };

  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logModalProjectId || newLog.amount <= 0) return;

    addProjectFinancialLog(logModalProjectId, {
      projectId: logModalProjectId,
      type: newLog.type,
      category: newLog.category.trim() || (newLog.type === 'Income' ? 'Mapato' : 'Gharama'),
      amount: Number(newLog.amount) || 0,
      date: newLog.date,
      description: newLog.description.trim()
    });

    if (selectedProjectForView && selectedProjectForView.id === logModalProjectId) {
      const updated = projects.find(p => p.id === logModalProjectId);
      if (updated) setSelectedProjectForView(updated);
    }

    setIsLogModalOpen(false);
    setNewLog({
      type: 'Income',
      category: 'Mauzo / Mapato',
      amount: 1000000,
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const getCategoryIcon = (category: ProjectCategory) => {
    switch (category) {
      case 'Kilimo': return <Sprout className="w-5 h-5 text-emerald-500" />;
      case 'Majengo & Nyumba': return <Building2 className="w-5 h-5 text-indigo-500" />;
      case 'Usafirishaji': return <Truck className="w-5 h-5 text-amber-500" />;
      case 'Ufugaji': return <Coins className="w-5 h-5 text-teal-500" />;
      case 'Uwekezaji wa Hisa': return <PieChart className="w-5 h-5 text-purple-500" />;
      default: return <Briefcase className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Inayojiendesha':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Inayojiendesha</span>;
      case 'Inayopangwa':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Inayopangwa</span>;
      case 'Inayorekebishwa':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Inayorekebishwa</span>;
      case 'Imekamilika':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Imekamilika</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1"><X className="w-3 h-3" /> Imesitishwa</span>;
    }
  };

  return (
    <div className="space-y-6 text-xs animate-fadeIn">
      {/* Header & Title Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Briefcase className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Miradi na Uwekezaji wa {currentInstitution.name}</h2>
              <p className="text-slate-300 text-xs mt-0.5">
                Uchambuzi wa Recharts, ulinganifu wa Total Income vs Net Income, na ripoti za utendaji kwa miradi yote.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={exportAllProjectsCSV}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-extrabold rounded-2xl border border-emerald-500/30 shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs"
            title="Pakua Takwimu zote za Miradi kwenye CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Pakua Takwimu (CSV)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Sajili Mradi Mpya</span>
          </button>
        </div>
      </div>

      {/* Target Progress Widget */}
      <TargetProgressWidget />

      {/* Summary Financial Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Initial Capital */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Jumla ya Mtaji wa Mwanzo</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {formatTZS(summaryMetrics.totalInitialCapital)}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Miradi {summaryMetrics.totalProjectsCount} ({summaryMetrics.activeProjectsCount} hai)</span>
          </div>
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-2xl shrink-0">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Mother Gross Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Mapato Kamili (Total Income)</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {formatTZS(summaryMetrics.totalMotherGrossIncome)}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Yote yaliyokusanywa
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded-2xl shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Total Project Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Gharama za Miradi (Expenses)</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
              {formatTZS(summaryMetrics.totalProjectExpenses)}
            </span>
            <span className="text-[10px] text-rose-500 font-bold mt-1 block flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> Gharama za uendeshaji
            </span>
          </div>
          <div className="p-3.5 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 rounded-2xl shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* RECHARTS COMPARISON BAR CHART SECTION */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">Ulinganisho wa Recharts: Mapato Kamili vs Gharama</h3>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Chati ya Recharts inayoonyesha uwiano kati ya mapato kamili (Total Income) na gharama (Expenses) kwa kila mradi.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 w-fit">
            {chartData.length} Miradi Inayochanganuliwa
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            Hakuna miradi iliyochaguliwa kwa ajili ya chati.
          </div>
        ) : (
          <div className="w-full h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                    return val;
                  }}
                />
                <Tooltip
                  formatter={(val: any) => [formatTZS(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="TotalIncome" name="Mapato Kamili (Total Income)" fill="#0d9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" name="Gharama (Expenses)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Filter & Control Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tafuta mradi, mahali au msimamizi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Filters & View Modes */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none font-medium cursor-pointer"
          >
            <option value="Zote">Kipengele: Zote</option>
            <option value="Kilimo">Kilimo</option>
            <option value="Ufugaji">Ufugaji</option>
            <option value="Majengo & Nyumba">Majengo & Nyumba</option>
            <option value="Usafirishaji">Usafirishaji</option>
            <option value="Biashara & Bidhaa">Biashara & Bidhaa</option>
            <option value="Uwekezaji wa Hisa">Uwekezaji wa Hisa</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none font-medium cursor-pointer"
          >
            <option value="Zote">Hali: Zote</option>
            <option value="Inayojiendesha">Inayojiendesha</option>
            <option value="Inayopangwa">Inayopangwa</option>
            <option value="Inayorekebishwa">Inayorekebishwa</option>
            <option value="Imekamilika">Imekamilika</option>
            <option value="Imesitishwa">Imesitishwa</option>
          </select>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Kadi (Grid)
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Orodha (Table)
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                viewMode === 'analytics' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Uchambuzi (Performance)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PROJECT ANALYSIS & PERFORMANCE DETAILED VIEW MODE */}
      {viewMode === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Allocation Pie Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-500" />
                  <span>Mgawanyo wa Mtaji kwa Aina</span>
                </h3>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => formatTZS(Number(val))} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                {categoryChartData.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatTZS(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Projects Leaderboard */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Uchambuzi wa Utendaji wa Miradi (Performance Scorecard)</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-bold">Inayotathmini ROI & Profit Margin</span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {filteredProjects.map((p) => {
                  const fin = calculateProjectFinancials(p);
                  const perf = getPerformanceMetrics(p);
                  return (
                    <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700">
                          {getCategoryIcon(p.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 dark:text-white text-xs">{p.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${perf.badge.color}`}>
                              {perf.badge.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Mtaji: {formatTZS(p.initialCapital)} • Mapato: {formatTZS(fin.grossIncome)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-semibold block">ROI %</span>
                          <span className={`font-black text-xs ${perf.roi >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {perf.roi >= 0 ? '+' : ''}{perf.roi.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-semibold block">Profit Margin</span>
                          <span className="font-black text-teal-600 text-xs">
                            {perf.margin.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-right pl-2 border-l border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-semibold block">Score</span>
                          <span className="font-black text-slate-900 dark:text-white text-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            {perf.score}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Display Area (GRID or TABLE) */}
      {viewMode !== 'analytics' && (
        filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Hakuna Mradi Uliopatikana</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Hujasajili mradi katika kipengele hiki au utafutaji haukutoa matokeo. Bonyeza button hapa chini kusajili mradi mpya.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
            >
              Sajili Mradi Mpya
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
              const fin = calculateProjectFinancials(p);
              const perf = getPerformanceMetrics(p);
              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Project Card Header */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-700">
                        {getCategoryIcon(p.category)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">{p.name}</h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{p.category}</span>
                      </div>
                    </div>
                    {getStatusBadge(p.status)}
                  </div>

                  {/* Project Metrics Body */}
                  <div className="p-5 space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${perf.badge.color}`}>
                        {perf.badge.label}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400">
                        Score: {perf.score}/100
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed">
                      {p.description || 'Hakuna maelezo yaliyowekwa kwa mradi hii.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Mtaji wa Mwanzo</span>
                        <span className="font-bold text-slate-800 dark:text-white text-xs block">{formatTZS(p.initialCapital)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Mtaji / Thamani Sasa</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block">{formatTZS(p.currentValuation)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Mapato Kamili (Total)</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400 text-xs block">{formatTZS(fin.grossIncome)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Gharama za Mradi</span>
                        <span className="font-bold text-rose-500 text-xs block">
                          {formatTZS(fin.totalExpenses)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {p.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{p.location}</span>
                        </div>
                      )}
                      {p.managerName && (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{p.managerName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Ilianza: {p.startDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Card Footer */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setLogModalProjectId(p.id);
                        setIsLogModalOpen(true);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Weka Mapato/Gharama</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedProjectForView(p)}
                        className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        Miamala
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Je, una uhakika unataka kufuta mradi wa "${p.name}"?`)) {
                            deleteProject(p.id);
                          }
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl cursor-pointer"
                        title="Futa Mradi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4">Jina la Mradi</th>
                    <th className="p-4">Kipengele</th>
                    <th className="p-4">Hali</th>
                    <th className="p-4">Mtaji wa Mwanzo</th>
                    <th className="p-4">Mapato Kamili (Total Income)</th>
                    <th className="p-4">Gharama</th>
                    <th className="p-4">ROI %</th>
                    <th className="p-4 text-center">Hatua</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                  {filteredProjects.map((p) => {
                    const fin = calculateProjectFinancials(p);
                    const perf = getPerformanceMetrics(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="p-4 font-bold">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
                              {getCategoryIcon(p.category)}
                            </div>
                            <div>
                              <span className="block font-black text-slate-900 dark:text-white text-xs">{p.name}</span>
                              <span className="text-[10px] text-slate-400">{p.location || 'Haikuwekwa'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-slate-600 dark:text-slate-300">{p.category}</td>
                        <td className="p-4">{getStatusBadge(p.status)}</td>
                        <td className="p-4 font-bold">{formatTZS(p.initialCapital)}</td>
                        <td className="p-4 font-bold text-teal-600">{formatTZS(fin.grossIncome)}</td>
                        <td className="p-4 font-bold text-rose-500">{formatTZS(fin.totalExpenses)}</td>
                        <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                          {perf.roi.toFixed(1)}%
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setLogModalProjectId(p.id);
                                setIsLogModalOpen(true);
                              }}
                              className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-lg font-bold text-[10px]"
                              title="Weka Mapato / Gharama"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedProjectForView(p)}
                              className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-bold text-[10px]"
                            >
                              Miamala
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* MODAL 1: REGISTER NEW PROJECT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-2xl">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Sajili Mradi Mpya wa SACCOS</h3>
                  <p className="text-slate-400 text-xs">Jaza taarifa za mradi au uwekezaji mpya</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jina la Mradi *</label>
                <input
                  type="text"
                  required
                  placeholder="mf. Shamba la Mpunga Kilombero, Basi la Coaster..."
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Aina ya Mradi *</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value as ProjectCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                  >
                    <option value="Kilimo">Kilimo</option>
                    <option value="Ufugaji">Ufugaji</option>
                    <option value="Majengo & Nyumba">Majengo & Nyumba</option>
                    <option value="Usafirishaji">Usafirishaji</option>
                    <option value="Biashara & Bidhaa">Biashara & Bidhaa</option>
                    <option value="Uwekezaji wa Hisa">Uwekezaji wa Hisa & Hatifungani</option>
                    <option value="Nyingine">Nyingine</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hali ya Mradi *</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as ProjectStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                  >
                    <option value="Inayojiendesha">Inayojiendesha (Active)</option>
                    <option value="Inayopangwa">Inayopangwa (Planned)</option>
                    <option value="Inayorekebishwa">Inayorekebishwa (Maintenance)</option>
                    <option value="Imekamilika">Imekamilika (Completed)</option>
                    <option value="Imesitishwa">Imesitishwa (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mtaji wa Mwanzo (TZS) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProject.initialCapital}
                    onChange={(e) => setNewProject({ ...newProject, initialCapital: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thamani / Mtaji wa Sasa (TZS)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProject.currentValuation}
                    onChange={(e) => setNewProject({ ...newProject, currentValuation: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Eneo / Mahali au Tawi</label>
                  <input
                    type="text"
                    placeholder="mf. Morogoro, Mwenge Dar..."
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Msimamizi wa Mradi</label>
                  <input
                    type="text"
                    placeholder="Jina la Mkurugenzi/Msimamizi"
                    value={newProject.managerName}
                    onChange={(e) => setNewProject({ ...newProject, managerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tarehe ya Kuanza</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Maelezo ya Mradi</label>
                <textarea
                  rows={3}
                  placeholder="Maelezo kuhusu lengo la mradi, matarajio ya faida..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Hifadhi Mradi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WEKA MAPATO / GHARAMA (ADD FINANCIAL LOG) */}
      {isLogModalOpen && logModalProjectId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-xl">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">Weka Muamala wa Mradi</h3>
                  <p className="text-slate-400 text-xs">Ingiza Mapato, Gharama au Mabadiliko ya Mtaji</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLogSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Aina ya Muamala *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewLog({ ...newLog, type: 'Income', category: 'Mauzo / Mapato' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border cursor-pointer ${
                      newLog.type === 'Income'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    + Mapato
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewLog({ ...newLog, type: 'Expense', category: 'Gharama za Uendeshaji' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border cursor-pointer ${
                      newLog.type === 'Expense'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    - Gharama
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewLog({ ...newLog, type: 'CapitalAdd', category: 'Ongezeko la Mtaji' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border cursor-pointer ${
                      newLog.type === 'CapitalAdd'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    + Mtaji
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewLog({ ...newLog, type: 'CapitalWithdraw', category: 'Kutoa Mtaji' })}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border cursor-pointer ${
                      newLog.type === 'CapitalWithdraw'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    - Mtaji
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kipengele / Aina ya Mapato au Gharama</label>
                <input
                  type="text"
                  placeholder="mf. Mauzo ya Mazao, Kodi ya Wapangaji, Mbolea, Servicing..."
                  value={newLog.category}
                  onChange={(e) => setNewLog({ ...newLog, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kiasi (TZS) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newLog.amount}
                    onChange={(e) => setNewLog({ ...newLog, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tarehe ya Muamala</label>
                  <input
                    type="date"
                    required
                    value={newLog.date}
                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Maelezo ya Muamala</label>
                <textarea
                  rows={2}
                  placeholder="Maelezo zaidi kuhusu muamala huu..."
                  value={newLog.description}
                  onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Hifadhi Muamala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TAZAMA HISTORIA YA MIAMALA YA MRADI */}
      {selectedProjectForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-2xl">
                  {getCategoryIcon(selectedProjectForView.category)}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">{selectedProjectForView.name}</h3>
                  <span className="text-xs text-slate-500 font-semibold">{selectedProjectForView.category} • {selectedProjectForView.location || 'Mahali hakijawekwa'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedProjectForView.financialLogs && selectedProjectForView.financialLogs.length > 0 && (
                  <button
                    onClick={() => exportSingleProjectLogCSV(selectedProjectForView)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pakua Logs (CSV)</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedProjectForView(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Financial Summary Cards for this project */}
            {(() => {
              const fin = calculateProjectFinancials(selectedProjectForView);
              const perf = getPerformanceMetrics(selectedProjectForView);
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Mtaji wa Mwanzo</span>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">{formatTZS(selectedProjectForView.initialCapital)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Thamani ya Sasa</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatTZS(selectedProjectForView.currentValuation)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Mapato Kamili (Gross)</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">{formatTZS(fin.grossIncome)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Gharama Zote (Expenses)</span>
                      <span className="font-bold text-rose-500 text-sm">{formatTZS(fin.totalExpenses)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800/50">
                    <span className="font-bold text-teal-900 dark:text-teal-200 text-xs">Uchambuzi wa Utendaji:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-extrabold text-teal-700 dark:text-teal-300">
                        ROI: {perf.roi.toFixed(1)}%
                      </span>
                      <span className="text-[11px] font-extrabold text-teal-700 dark:text-teal-300">
                        Margin: {perf.margin.toFixed(1)}%
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${perf.badge.color}`}>
                        Score: {perf.score}/100 • {perf.badge.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">Orodha ya Miamala ({selectedProjectForView.financialLogs?.length || 0})</h4>
              <button
                onClick={() => {
                  setLogModalProjectId(selectedProjectForView.id);
                  setIsLogModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Weka Muamala</span>
              </button>
            </div>

            {/* Log Table */}
            {!selectedProjectForView.financialLogs || selectedProjectForView.financialLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500">
                Hakuna miamala iliyowekwa katika mradi huu bado. Bonyeza "+ Weka Muamala" hapo juu.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      <th className="p-3">Tarehe</th>
                      <th className="p-3">Aina</th>
                      <th className="p-3">Kipengele</th>
                      <th className="p-3">Maelezo</th>
                      <th className="p-3 text-right">Kiasi</th>
                      <th className="p-3 text-center">Futa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {selectedProjectForView.financialLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="p-3 text-slate-500">{log.date}</td>
                        <td className="p-3 font-bold">
                          {log.type === 'Income' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-[10px]">+ Mapato</span>
                          ) : log.type === 'Expense' ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-[10px]">- Gharama</span>
                          ) : log.type === 'CapitalAdd' ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px]">+ Mtaji</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[10px]">- Mtaji</span>
                          )}
                        </td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{log.category}</td>
                        <td className="p-3 text-slate-500">{log.description || '-'}</td>
                        <td className={`p-3 text-right font-black ${
                          log.type === 'Income' || log.type === 'CapitalAdd' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {log.type === 'Income' || log.type === 'CapitalAdd' ? '+' : '-'}{formatTZS(log.amount)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              if (confirm('Je, una uhakika unataka kufuta muamala huu?')) {
                                deleteProjectFinancialLog(selectedProjectForView.id, log.id);
                                const updatedLogs = selectedProjectForView.financialLogs.filter(l => l.id !== log.id);
                                setSelectedProjectForView({ ...selectedProjectForView, financialLogs: updatedLogs });
                              }
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
