import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { downloadCSV, printFormattedReport } from '../../lib/exportUtils';
import { sanitizeInput, containsInjectionPattern, logSecurityEvent, getSecurityLogs } from '../../lib/security';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import {
  Building2,
  FileSpreadsheet,
  BarChart2,
  Plus,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  UserCheck,
  CheckCircle2,
  FileText,
  Download,
  Printer,
  Calculator,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Search,
  Lock,
  Activity,
  Zap,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface AnalysisEntry {
  id: string;
  type: 'daily' | 'quarterly';
  datePeriod: string;
  totalIncome: number;
  totalExpense: number;
  bankBalance: number;
  loanRepayments: number;
  newLoansIssued: number;
  liquidityRatio: number;
  accountantName: string;
  notes: string;
  status: 'Approved' | 'Draft';
  createdAt: string;
}

export const AccountingModule: React.FC = () => {
  const { coa, formatTZS, currentInstitution } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'coa' | 'trial' | 'pnl' | 'balance' | 'analysis'>('analysis');
  const [analysisFilter, setAnalysisFilter] = useState<'all' | 'daily' | 'quarterly'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Accountant Entry Form state
  const [entryType, setEntryType] = useState<'daily' | 'quarterly'>('daily');
  const [datePeriod, setDatePeriod] = useState<string>(new Date().toISOString().split('T')[0]);
  const [income, setIncome] = useState<number>(3500000);
  const [expense, setExpense] = useState<number>(1200000);
  const [bankBal, setBankBal] = useState<number>(355000000);
  const [loanRepay, setLoanRepay] = useState<number>(2800000);
  const [newLoans, setNewLoans] = useState<number>(1500000);
  const [accountantName, setAccountantName] = useState<string>('Muhasibu Mkuu (CPA Juma)');
  const [notes, setNotes] = useState<string>('Mwenendo wa kifedha uko imara. Ukwasi wa benki unatolesha mahitaji ya mikopo na utoaji wa akiba.');

  // Pre-populated Analysis Book entries
  const [analysisEntries, setAnalysisEntries] = useState<AnalysisEntry[]>([
    {
      id: 'an_001',
      type: 'daily',
      datePeriod: '2026-08-14 (Leo)',
      totalIncome: 4200000,
      totalExpense: 850000,
      bankBalance: 355000000,
      loanRepayments: 3100000,
      newLoansIssued: 2000000,
      liquidityRatio: 28.5,
      accountantName: 'CPA Juma Hassan',
      notes: 'Ukwasi wa siku uko katika hali nzuri. Marejesho ya mikopo yamevuka lengo la siku kwa 12%.',
      status: 'Approved',
      createdAt: '2026-08-14 08:30'
    },
    {
      id: 'an_002',
      type: 'daily',
      datePeriod: '2026-08-13',
      totalIncome: 3800000,
      totalExpense: 1100000,
      bankBalance: 351650000,
      loanRepayments: 2900000,
      newLoansIssued: 1500000,
      liquidityRatio: 27.8,
      accountantName: 'CPA Juma Hassan',
      notes: 'Mapato ya akiba na ada za uanachama zimekusanywa kikamilifu kupitia M-Pesa Paybill.',
      status: 'Approved',
      createdAt: '2026-08-13 17:00'
    },
    {
      id: 'an_003',
      type: 'quarterly',
      datePeriod: 'Robo ya 2 (Aprili - Juni 2026)',
      totalIncome: 145000000,
      totalExpense: 38000000,
      bankBalance: 348000000,
      loanRepayments: 98000000,
      newLoansIssued: 65000000,
      liquidityRatio: 29.2,
      accountantName: 'CPA Salma Bakari',
      notes: 'Uchanganuzi wa miezi 3 unaonyesha ukuaji wa faida wa 18.4%. Akiba na amana zimeongezeka sana.',
      status: 'Approved',
      createdAt: '2026-07-02'
    },
    {
      id: 'an_004',
      type: 'quarterly',
      datePeriod: 'Robo ya 1 (Januari - Machi 2026)',
      totalIncome: 128000000,
      totalExpense: 34000000,
      bankBalance: 310000000,
      loanRepayments: 85000000,
      newLoansIssued: 58000000,
      liquidityRatio: 26.5,
      accountantName: 'CPA Salma Bakari',
      notes: 'Uchanganuzi wa miezi 3 wa Robo ya 1 ulikamilika vizuri na kufanyiwa ukaguzi wa ndani.',
      status: 'Approved',
      createdAt: '2026-04-05'
    }
  ]);

  const handleAddAnalysisSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Security Check
    if (containsInjectionPattern(notes) || containsInjectionPattern(accountantName) || containsInjectionPattern(datePeriod)) {
      logSecurityEvent('INJECTION_BLOCKED', 'HIGH', accountantName || 'Unknown', 'Attack pattern detected in analysis form.');
      alert('⚠️ Onyo la Usalama: Mfumo umegundua herufi au muundo usio salama (Cyber Attack Security Block). Tafadhali rekebisha pembejeo yako.');
      return;
    }

    const calcLiquidity = Number(((bankBal / (bankBal + newLoans)) * 30).toFixed(1));

    const newRecord: AnalysisEntry = {
      id: `an_${Date.now()}`,
      type: entryType,
      datePeriod: sanitizeInput(datePeriod),
      totalIncome: Number(income),
      totalExpense: Number(expense),
      bankBalance: Number(bankBal),
      loanRepayments: Number(loanRepay),
      newLoansIssued: Number(newLoans),
      liquidityRatio: calcLiquidity,
      accountantName: sanitizeInput(accountantName) || 'Muhasibu Mkuu',
      notes: sanitizeInput(notes) || 'Uchanganuzi umerekodiwa kikamilifu.',
      status: 'Approved',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    logSecurityEvent('FINANCIAL_OVERRIDE', 'LOW', accountantName, `Analysis Entry added for ${datePeriod}`);
    setAnalysisEntries([newRecord, ...analysisEntries]);
    setShowEntryModal(false);
    alert('Uchanganuzi wa kifedha umeingizwa kikamilifu na kulindwa katika Analysis Book!');
  };

  const filteredEntries = analysisEntries.filter(item => {
    const matchesType =
      analysisFilter === 'all'
        ? true
        : analysisFilter === 'daily'
        ? item.type === 'daily'
        : item.type === 'quarterly';

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      item.datePeriod.toLowerCase().includes(query) ||
      item.accountantName.toLowerCase().includes(query) ||
      item.notes.toLowerCase().includes(query);

    return matchesType && matchesQuery;
  });

  // Chart dataset for visual trend analysis
  const chartData = analysisEntries.map(e => ({
    name: e.datePeriod.length > 15 ? e.datePeriod.substring(0, 15) + '...' : e.datePeriod,
    Mapato: e.totalIncome / 1000000, // in Millions
    Matumizi: e.totalExpense / 1000000,
    Faida: (e.totalIncome - e.totalExpense) / 1000000,
    Ukwasi: e.liquidityRatio
  }));

  const assets = coa.filter(c => c.category === 'Asset');
  const liabilities = coa.filter(c => c.category === 'Liability');
  const equity = coa.filter(c => c.category === 'Equity');
  const revenues = coa.filter(c => c.category === 'Revenue');
  const expenses = coa.filter(c => c.category === 'Expense');

  const totalAssets = assets.reduce((a, b) => a + b.balance, 0);
  const totalLiabilities = liabilities.reduce((a, b) => a + b.balance, 0);
  const totalEquity = equity.reduce((a, b) => a + b.balance, 0);
  const totalRevenue = revenues.reduce((a, b) => a + b.balance, 0);
  const totalExpense = expenses.reduce((a, b) => a + b.balance, 0);
  const netProfit = totalRevenue - totalExpense;

  return (
    <div id="accounting-module-view" className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Uhasibu na Analysis Book (Accounting & Financial Analysis)
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Daftari la Uchanganuzi wa Kifedha (Every Day & 3-Month Analysis) linaloingizwa na Muhasibu na Mfumo.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveSubTab('analysis');
            setShowEntryModal(true);
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2 text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ingiza Uchanganuzi (Muhasibu)</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 text-[10px] block">Jumla ya Rasilimali (Assets)</span>
          <span className="text-lg font-bold text-emerald-600">{formatTZS(totalAssets)}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 text-[10px] block">Jumla ya Madeni (Liabilities)</span>
          <span className="text-lg font-bold text-amber-600">{formatTZS(totalLiabilities)}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 text-[10px] block">Jumla ya Mapato (Revenue)</span>
          <span className="text-lg font-bold text-blue-600">{formatTZS(totalRevenue)}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-slate-500 text-[10px] block">Faida Safi (Net Profit)</span>
          <span className="text-lg font-bold text-purple-600">{formatTZS(netProfit)}</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 font-semibold text-xs pb-1">
        <button
          onClick={() => setActiveSubTab('analysis')}
          className={`pb-2 border-b-2 flex items-center gap-1.5 ${activeSubTab === 'analysis' ? 'border-purple-600 text-purple-600 font-bold' : 'text-slate-500'}`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analysis Book (Daftari la Uchanganuzi)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('coa')}
          className={`pb-2 border-b-2 ${activeSubTab === 'coa' ? 'border-purple-600 text-purple-600 font-bold' : 'text-slate-500'}`}
        >
          Chart of Accounts (COA)
        </button>
        <button
          onClick={() => setActiveSubTab('trial')}
          className={`pb-2 border-b-2 ${activeSubTab === 'trial' ? 'border-purple-600 text-purple-600 font-bold' : 'text-slate-500'}`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setActiveSubTab('pnl')}
          className={`pb-2 border-b-2 ${activeSubTab === 'pnl' ? 'border-purple-600 text-purple-600 font-bold' : 'text-slate-500'}`}
        >
          Income Statement (P&L)
        </button>
        <button
          onClick={() => setActiveSubTab('balance')}
          className={`pb-2 border-b-2 ${activeSubTab === 'balance' ? 'border-purple-600 text-purple-600 font-bold' : 'text-slate-500'}`}
        >
          Balance Sheet
        </button>
      </div>

      {/* Sub Tab: Analysis Book */}
      {activeSubTab === 'analysis' && (
        <div className="space-y-6">
          
          {/* Top Controls: Filter + Search + Security Audit */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 font-bold">
              <span className="text-slate-500 text-[11px] mr-1">Aina:</span>
              <button
                onClick={() => setAnalysisFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${analysisFilter === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'}`}
              >
                Vyote ({analysisEntries.length})
              </button>
              <button
                onClick={() => setAnalysisFilter('daily')}
                className={`px-3 py-1.5 rounded-xl transition-all ${analysisFilter === 'daily' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'}`}
              >
                Everyday Analysis
              </button>
              <button
                onClick={() => setAnalysisFilter('quarterly')}
                className={`px-3 py-1.5 rounded-xl transition-all ${analysisFilter === 'quarterly' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'}`}
              >
                3-Month Analysis
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tafuta kwa tarehe, muhasibu au maoni..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => setShowSecurityModal(true)}
                className="px-3 py-1.5 bg-slate-900 dark:bg-slate-950 text-emerald-400 border border-slate-700 hover:border-emerald-500 rounded-xl flex items-center gap-1.5 font-bold shadow-xs transition-all shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Usalama (Cyber Security)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const headers = ['Kipindi', 'Aina', 'Mapato (TZS)', 'Matumizi (TZS)', 'Faida Safi (TZS)', 'Salio Benki (TZS)', 'Ukwasi (%)', 'Muhasibu', 'Maoni'];
                  const rows = filteredEntries.map(e => [
                    e.datePeriod,
                    e.type === 'daily' ? 'Everyday Analysis' : '3-Month Analysis',
                    e.totalIncome,
                    e.totalExpense,
                    e.totalIncome - e.totalExpense,
                    e.bankBalance,
                    `${e.liquidityRatio}%`,
                    e.accountantName,
                    e.notes
                  ]);
                  downloadCSV(`Analysis_Book_${currentInstitution.name.replace(/\s+/g, '_')}`, headers, rows);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pakua CSV</span>
              </button>
              <button
                onClick={() => {
                  const headers = ['Kipindi', 'Aina', 'Mapato (TZS)', 'Matumizi (TZS)', 'Faida (TZS)', 'Muhasibu'];
                  const rows = filteredEntries.map(e => [
                    e.datePeriod,
                    e.type === 'daily' ? 'Everyday Analysis' : '3-Month Analysis',
                    e.totalIncome,
                    e.totalExpense,
                    e.totalIncome - e.totalExpense,
                    e.accountantName
                  ]);
                  printFormattedReport(`Daftari la Uchanganuzi wa Kifedha (Analysis Book)`, `Taasisi: ${currentInstitution.name}`, headers, rows);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center gap-1 shadow-xs text-[11px] border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chapa</span>
              </button>
            </div>
          </div>

          {/* Visual Interactive Dashboard: Recharts Financial Trend & Health Score Meter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Financial Health Scorecard */}
            <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl space-y-4 shadow-xl border border-purple-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32 text-purple-300" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-800">
                  ⚡ Modern Financial Health Meter
                </span>
                <span className="text-emerald-400 font-extrabold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified CPA
                </span>
              </div>

              <div className="text-center py-2 space-y-2">
                <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-purple-300">
                    94.8%
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-100">
                  Afya ya Kifedha ni Imara Sana (Excellent)
                </h4>
                <p className="text-[10px] text-purple-200/80 max-w-xs mx-auto">
                  Vipimo vya Ukwasi wa Benki (Liquidity Ratio) na Marejesho ya Mikopo viko katika kiwango bora cha usalama kwa IFRS/SACCOS.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-purple-800/60">
                <div className="p-2 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-purple-300 block">Kiwango cha Ukwasi</span>
                  <span className="font-bold text-emerald-400 text-xs">28.5% (Target &gt; 20%)</span>
                </div>
                <div className="p-2 bg-white/5 rounded-xl">
                  <span className="text-[10px] text-purple-300 block">Usalama wa Cyber</span>
                  <span className="font-bold text-teal-300 text-xs">Protected (Active)</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart Visual Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                  Mwenendo wa Mapato vs Matumizi na Faida (Milioni TZS)
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Uchanganuzi wa Kila Siku na Miezi 3</span>
              </div>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: any) => [`${value}M TZS`, '']} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Mapato" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Matumizi" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Faida" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Analysis Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEntries.map((item) => {
              const surplus = item.totalIncome - item.totalExpense;
              const isPositive = surplus >= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700/80 pb-3">
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1 ${
                        item.type === 'daily'
                          ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                          : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                      }`}>
                        {item.type === 'daily' ? '📅 Everyday Analysis' : '📊 3-Month Analysis'}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2 flex items-center gap-2">
                        <span>{item.datePeriod}</span>
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Muhasibu Aliyeingiza</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-end gap-1 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {item.accountantName}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Mapato</span>
                      <span className="font-bold text-emerald-600 block text-xs">{formatTZS(item.totalIncome)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Matumizi</span>
                      <span className="font-bold text-rose-600 block text-xs">{formatTZS(item.totalExpense)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Faida / Ziada</span>
                      <span className={`font-black block text-xs ${isPositive ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600'}`}>
                        {formatTZS(surplus)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Salio la Benki</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatTZS(item.bankBalance)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Rejesho la Mikopo</span>
                      <span className="font-bold text-emerald-600">{formatTZS(item.loanRepayments)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Ukwasi (Ratio)</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400">{item.liquidityRatio}%</span>
                    </div>
                  </div>

                  {/* Accountant Notes */}
                  <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/60 text-slate-700 dark:text-slate-300 text-[11px] space-y-1">
                    <span className="font-extrabold text-purple-900 dark:text-purple-300 block flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-purple-600" />
                        Tathmini na Maoni ya Muhasibu:
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Integrity Secured
                      </span>
                    </span>
                    <p className="italic text-slate-600 dark:text-slate-300">"{item.notes}"</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Modal: Accountant Entry Form */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                Ingiza Uchanganuzi Mpya (Analysis Book)
              </h3>
              <button
                onClick={() => setShowEntryModal(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAnalysisSubmit} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Aina ya Uchanganuzi</label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold"
                  >
                    <option value="daily">Everyday Analysis (Kila Siku)</option>
                    <option value="quarterly">3-Month Analysis (Miezi 3)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    {entryType === 'daily' ? 'Tarehe ya Siku' : 'Kipindi cha Miezi 3'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={entryType === 'daily' ? '2026-08-14' : 'Robo ya 3 (Julai - Septemba 2026)'}
                    value={datePeriod}
                    onChange={(e) => setDatePeriod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Jumla ya Mapato (TZS)</label>
                  <input
                    type="number"
                    required
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Jumla ya Matumizi (TZS)</label>
                  <input
                    type="number"
                    required
                    value={expense}
                    onChange={(e) => setExpense(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Salio la Benki/Cash (TZS)</label>
                  <input
                    type="number"
                    required
                    value={bankBal}
                    onChange={(e) => setBankBal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold text-purple-600"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Rejesho la Mikopo (TZS)</label>
                  <input
                    type="number"
                    required
                    value={loanRepay}
                    onChange={(e) => setLoanRepay(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Jina la Muhasibu (Accountant)</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: CPA Salma Bakari"
                  value={accountantName}
                  onChange={(e) => setAccountantName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Maoni na Tathmini ya Kifedha ya Muhasibu</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Andika uchanganuzi wa kina kuhusu hali ya ukwasi, faida na mikopo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 font-medium text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition-all mt-2"
              >
                Hifadhi Katika Analysis Book
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chart of Accounts */}
      {activeSubTab === 'coa' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b text-slate-500 uppercase text-[10px]">
                <th className="p-3">Kodi (Code)</th>
                <th className="p-3">Jina la Akaunti</th>
                <th className="p-3">Kundi (Category)</th>
                <th className="p-3 text-right">Salio (Balance TZS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {coa.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{item.code}</td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md font-semibold text-[10px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                    {formatTZS(item.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Income Statement */}
      {activeSubTab === 'pnl' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border space-y-4 max-w-2xl mx-auto">
          <h3 className="font-bold text-base text-center border-b pb-3">Taarifa ya Faida na Hasara (Income Statement)</h3>
          
          <div className="space-y-2">
            <h4 className="font-bold text-blue-600 text-xs uppercase">MAPATO (REVENUES)</h4>
            {revenues.map(r => (
              <div key={r.code} className="flex justify-between border-b pb-1">
                <span>{r.name}</span>
                <span className="font-bold">{formatTZS(r.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-blue-700 pt-1 border-t">
              <span>Jumla ya Mapato</span>
              <span>{formatTZS(totalRevenue)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <h4 className="font-bold text-rose-600 text-xs uppercase">MATUMIZI (EXPENSES)</h4>
            {expenses.map(e => (
              <div key={e.code} className="flex justify-between border-b pb-1">
                <span>{e.name}</span>
                <span className="font-bold">{formatTZS(e.balance)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-rose-700 pt-1 border-t">
              <span>Jumla ya Matumizi</span>
              <span>{formatTZS(totalExpense)}</span>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex justify-between font-extrabold text-purple-700 dark:text-purple-300 text-sm mt-4">
            <span>FAIDA SAFI (NET PROFIT)</span>
            <span>{formatTZS(netProfit)}</span>
          </div>
        </div>
      )}

      {/* Balance Sheet */}
      {activeSubTab === 'balance' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border space-y-4 max-w-2xl mx-auto">
          <h3 className="font-bold text-base text-center border-b pb-3">Mizania (Balance Sheet)</h3>
          <div className="flex justify-between font-bold text-emerald-600 text-xs border-b pb-2">
            <span>RASILIMALI (TOTAL ASSETS)</span>
            <span>{formatTZS(totalAssets)}</span>
          </div>
          <div className="flex justify-between font-bold text-amber-600 text-xs border-b pb-2">
            <span>MADENI (TOTAL LIABILITIES)</span>
            <span>{formatTZS(totalLiabilities)}</span>
          </div>
          <div className="flex justify-between font-bold text-blue-600 text-xs border-b pb-2">
            <span>MTAJI (TOTAL EQUITY)</span>
            <span>{formatTZS(totalEquity)}</span>
          </div>
        </div>
      )}

      {/* Modal: Cyber Security Status & Audit Log */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Mfumo wa Ulinzi wa Cyber Attack & Usalama (Cyber Security Shield)
              </h3>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-slate-500 block font-bold">XSS & Injection Shield</span>
                <span className="text-xs font-black text-emerald-600 flex items-center justify-center gap-1 mt-1">
                  <Lock className="w-3.5 h-3.5" /> ACTIVE
                </span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] text-slate-500 block font-bold">CSRF Token Guard</span>
                <span className="text-xs font-black text-blue-600 flex items-center justify-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> PROTECTED
                </span>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800">
                <span className="text-[10px] text-slate-500 block font-bold">Rate Limiter</span>
                <span className="text-xs font-black text-purple-600 flex items-center justify-center gap-1 mt-1">
                  <Zap className="w-3.5 h-3.5" /> 5 Req/Min
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                Security Audit Logs (Matukio ya Usalama):
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {getSecurityLogs().map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] flex items-start justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{log.eventType}</span>
                      <span className="text-slate-500 text-[10px]">{log.details}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        log.severity === 'CRITICAL' || log.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {log.severity}
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{log.timestamp.substring(11, 16)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSecurityModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Funga Mfumo wa Usalama
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
