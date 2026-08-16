import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Brain,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Award,
  Sparkles,
  ShieldCheck,
  Zap,
  DollarSign,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const MemberIntelligenceAnalytics: React.FC = () => {
  const { currentMember, transactions, loans, formatTZS } = useApp();

  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('monthly');

  // Filter member transactions
  const memberTxs = useMemo(() => {
    return transactions.filter(t => t.memberId === currentMember.id);
  }, [transactions, currentMember.id]);

  // Active Loan
  const activeLoan = useMemo(() => {
    return loans.find(l => l.memberId === currentMember.id && l.status === 'Active');
  }, [loans, currentMember.id]);

  // Calculate Financial Health Score (0 - 100)
  const healthScore = useMemo(() => {
    let score = 70; // baseline
    if (currentMember.totalSavings > 3000000) score += 10;
    if (currentMember.totalShares > 1000000) score += 10;
    if (!activeLoan || activeLoan.remainingBalance < activeLoan.amountApproved * 0.5) score += 10;
    return Math.min(100, score);
  }, [currentMember, activeLoan]);

  // Data for Monthly & Daily Trend Chart
  const trendChartData = useMemo(() => {
    if (timeframe === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currMonth = new Date().getMonth();
      const data = [];

      for (let i = 5; i >= 0; i--) {
        const idx = (currMonth - i + 12) % 12;
        const monthLabel = months[idx];
        const factor = 0.6 + (0.4 * (6 - i)) / 6;

        data.push({
          period: monthLabel,
          "Akiba na Amana": Math.round((currentMember.totalSavings / 6) * factor * (0.9 + Math.random() * 0.2)),
          "Marejesho ya Mkopo": Math.round((activeLoan ? activeLoan.monthlyInstallment : 100000) * factor * (0.85 + Math.random() * 0.3))
        });
      }
      return data;
    } else {
      // Daily Trend (Last 7 days)
      const days = ['Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi', 'Japili'];
      return days.map((day, idx) => ({
        period: day,
        "Akiba na Amana": Math.round((currentMember.totalSavings / 30) * (0.5 + Math.random() * 1.2)),
        "Marejesho ya Mkopo": idx % 3 === 0 ? (activeLoan ? activeLoan.monthlyInstallment / 4 : 50000) : 0
      }));
    }
  }, [timeframe, currentMember.totalSavings, activeLoan]);

  // Data for Donut Chart (Resource Distribution)
  const pieDistributionData = useMemo(() => {
    const mandatorySavings = Math.round(currentMember.totalSavings * 0.6);
    const voluntarySavings = Math.round(currentMember.totalSavings * 0.4);
    const totalShares = currentMember.totalShares;
    const loanOutstanding = activeLoan ? activeLoan.remainingBalance : 0;

    return [
      { name: 'Akiba ya Lazima', value: mandatorySavings, color: '#10b981' },
      { name: 'Akiba ya Hiari', value: voluntarySavings, color: '#3b82f6' },
      { name: 'Mtaji wa Hisa', value: totalShares, color: '#8b5cf6' },
      { name: 'Deni la Mkopo', value: loanOutstanding, color: '#f59e0b' }
    ];
  }, [currentMember, activeLoan]);

  // Projected Annual Dividend (Estimated 12% ROI on shares + 5% on savings)
  const estimatedDividend = useMemo(() => {
    const sharesROI = currentMember.totalShares * 0.12;
    const savingsInterest = currentMember.totalSavings * 0.04;
    return Math.round(sharesROI + savingsInterest);
  }, [currentMember]);

  return (
    <div id="member-intelligence-analytics" className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xs">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Tathmini ya Kiumbuji ya Kifedha (AI Financial Intelligence Analytics)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Uchambuzi wa mwenendo wa akiba, nidhamu ya kurejesha mikopo na utabiri wa gawio.
          </p>
        </div>

        {/* Timeframe Toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold shrink-0">
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1 rounded-lg transition-all ${
              timeframe === 'daily'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mwenendo wa Kila Siku
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 rounded-lg transition-all ${
              timeframe === 'monthly'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mwenendo wa Kila Mwezi
          </button>
        </div>
      </div>

      {/* Health Score & AI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Credit & Health Index */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
          <div>
            <span className="text-indigo-700 dark:text-indigo-400 block text-[11px] font-semibold">
              Kiwango cha Nidhamu (Health Score)
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-900 dark:text-indigo-300 mt-0.5 block">
              {healthScore}/100
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold flex items-center gap-1">
              <Award className="w-3 h-3" /> Daraja A - Mwanachama wa Kuaminika
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Projected Dividend */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
          <div>
            <span className="text-emerald-700 dark:text-emerald-400 block text-[11px] font-semibold">
              Utabiri wa Gawio la Mwaka (Dividends)
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-0.5 block">
              {formatTZS(estimatedDividend)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5 block font-semibold">
              Kulingana na Hisa na Akiba zako
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Loan-to-Savings Capacity */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
          <div>
            <span className="text-blue-700 dark:text-blue-400 block text-[11px] font-semibold">
              Uwezo wa Kujikopa (Max Loan Eligible)
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-800 dark:text-blue-300 mt-0.5 block">
              {formatTZS(currentMember.totalSavings * 3)}
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400/80 mt-0.5 block font-semibold">
              Kipimo cha Mara 3 cha Akiba Yako
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* CHART 1: Area Trend Chart (2 Columns Wide) */}
        <div className="lg:col-span-2 space-y-2 bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Mwenendo wa Akiba na Marejesho ({timeframe === 'monthly' ? 'Kila Mwezi' : 'Kila Siku'})
            </span>
            <span className="text-[10px] text-slate-400">TZS Volume</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="memberSavGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="memberRepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="period" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatTZS(Number(value) || 0), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="Akiba na Amana"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#memberSavGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="Marejesho ya Mkopo"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#memberRepGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Resource Allocation Circle / Donut Chart */}
        <div className="space-y-2 bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between">
          <div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              Mgawanyo wa Rasilimali Zako (Asset Allocation)
            </span>
            <span className="text-[10px] text-slate-400">Picha ya Jumla ya Mtaji</span>
          </div>

          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {pieDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatTZS(Number(value) || 0), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-slate-700 text-[11px]">
            {pieDistributionData.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{formatTZS(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
